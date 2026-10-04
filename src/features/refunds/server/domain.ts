import Stripe from "stripe";
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { DateTime } from "luxon";
import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/app/utils/supabase/admin";
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails";
import { cancelAppointment } from "@/features/manualBooking/server/domain";
import { Database } from "../../../../lib/database.types";
import {
    IssueRefundInput,
    IssueRefundResult,
    REFUND_NOTE_MAX_LENGTH,
    REFUND_REASONS,
    RefundChargeType,
    RefundRecord,
    RefundSummary,
    toRefundRecord,
} from "../types";
import { APP_REFUND_SOURCE, syncStripeRefund } from "./sync";

type AppointmentRow = Database['public']['Tables']['appointments']['Row']

interface ChargeInfo {
    type: RefundChargeType
    paymentIntentId: string
    refundable: number
    disputed: boolean
}

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const CANCELLABLE_STATUSES: AppointmentRow['status'][] = ['PENDING', 'CONFIRMED']

/** Loads the appointment and its business, after checking the signed-in user owns it. */
async function loadOwnedAppointment(appointmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: appt, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()
    if (error || !appt) throw new Error('Appointment not found')
    if (appt.business !== user.id) throw new Error('Unauthorized')

    const { data: business, error: bizError } = await supabase
        .from('business_users')
        .select('stripe_acc_id, business_name, email, account_settings')
        .eq('business_id', user.id)
        .single()
    if (bizError || !business?.stripe_acc_id) throw new Error('Your Stripe account isn\'t connected, so refunds aren\'t available.')

    return { supabase, user, appt, business, stripeAccountId: business.stripe_acc_id }
}

/**
 * Stripe is the source of truth for how much of each payment is still
 * refundable — charge.amount_refunded already counts pending refunds and
 * anything refunded outside the app.
 */
async function loadCharge(paymentIntentId: string | null, type: RefundChargeType, stripeAccountId: string): Promise<ChargeInfo | null> {
    if (!paymentIntentId) return null
    try {
        const pi = await stripe.paymentIntents.retrieve(
            paymentIntentId,
            { expand: ['latest_charge'] },
            { stripeAccount: stripeAccountId }
        )
        if (pi.status !== 'succeeded') return null
        const charge = pi.latest_charge
        if (!charge || typeof charge === 'string') return null
        return {
            type,
            paymentIntentId: pi.id,
            refundable: charge.disputed ? 0 : Math.max(0, charge.amount_captured - charge.amount_refunded),
            disputed: charge.disputed,
        }
    } catch (error: any) {
        console.error(`loadCharge: could not load ${type} payment ${paymentIntentId}:`, error.message)
        return null
    }
}

async function loadCharges(appt: AppointmentRow, stripeAccountId: string) {
    const [deposit, service] = await Promise.all([
        appt.paid_deposit ? loadCharge(appt.deposit_charge_id, 'DEPOSIT', stripeAccountId) : null,
        appt.service_paid && appt.service_paid_type === 'PLATFORM'
            ? loadCharge(appt.service_charge_id, 'SERVICE', stripeAccountId)
            : null,
    ])
    return { deposit, service }
}

function canCancel(appt: AppointmentRow) {
    return CANCELLABLE_STATUSES.includes(appt.status) && DateTime.fromISO(appt.start) > DateTime.now()
}

export async function getRefundSummary(appointmentId: string): Promise<RefundSummary> {
    const { supabase, appt, stripeAccountId } = await loadOwnedAppointment(appointmentId)
    const { deposit, service } = await loadCharges(appt, stripeAccountId)

    const { data: rows, error } = await supabase
        .from('refunds')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)

    const depositRefundable = deposit?.refundable ?? 0
    const serviceRefundable = service?.refundable ?? 0
    const client = appt.client_metadata as any
    const depositPaidOnline = appt.paid_deposit ? (appt.deposit_price ?? 0) : 0

    return {
        clientName: `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim(),
        depositRefundable,
        serviceRefundable,
        totalRefundable: depositRefundable + serviceRefundable,
        totalRefunded: Number(appt.refunded_amount ?? 0),
        cashPaid: appt.service_paid && appt.service_paid_type === 'CASH'
            ? Math.max(0, appt.paid_amount - depositPaidOnline)
            : 0,
        disputed: !!(deposit?.disputed || service?.disputed),
        canCancel: canCancel(appt),
        refunds: (rows ?? []).map(toRefundRecord),
    }
}

/** Refund history only — reads our records, no Stripe calls. RLS scopes it to the signed-in business. */
export async function listRefunds(appointmentId: string): Promise<RefundRecord[]> {
    // business_id is the business's id, not the auth user id — filtering on
    // user.id meant refund history always came back empty.
    const businessId = await requireOwnBusinessId()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('refunds')
        .select('*')
        .eq('appointment_id', appointmentId)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data ?? []).map(toRefundRecord)
}

/** Splits the requested refund across the appointment's Stripe payments. */
function allocate(input: IssueRefundInput, deposit: ChargeInfo | null, service: ChargeInfo | null): { charge: ChargeInfo; amount: number }[] {
    const depositRefundable = deposit?.refundable ?? 0
    const serviceRefundable = service?.refundable ?? 0

    if (input.scope === 'DEPOSIT') {
        return deposit && depositRefundable > 0 ? [{ charge: deposit, amount: depositRefundable }] : []
    }

    if (input.scope === 'FULL') {
        return [
            ...(deposit && depositRefundable > 0 ? [{ charge: deposit, amount: depositRefundable }] : []),
            ...(service && serviceRefundable > 0 ? [{ charge: service, amount: serviceRefundable }] : []),
        ]
    }

    // CUSTOM: take from the balance payment first, then the deposit.
    let remaining = input.amount ?? 0
    const allocations: { charge: ChargeInfo; amount: number }[] = []
    for (const charge of [service, deposit]) {
        if (!charge || charge.refundable <= 0 || remaining <= 0) continue
        const amount = Math.min(remaining, charge.refundable)
        allocations.push({ charge, amount })
        remaining -= amount
    }
    return allocations
}

function sumUsd(balances: { amount: number; currency: string }[]) {
    return balances.filter(b => b.currency === 'usd').reduce((sum, b) => sum + b.amount, 0)
}

function stripeErrorMessage(error: any): string {
    if (error instanceof Stripe.errors.StripeError) {
        switch (error.code) {
            case 'charge_already_refunded':
                return 'This payment has already been fully refunded.'
            case 'charge_disputed':
                return 'This payment is under dispute and can\'t be refunded. You can respond to the dispute from your Monetization page.'
            case 'balance_insufficient':
            case 'insufficient_funds':
                return 'Your Stripe balance isn\'t enough to cover this refund. Try again once more payments have come in.'
            case 'idempotency_key_in_use':
                return 'This refund is already being processed. Refresh the page in a moment to see it.'
        }
        if (error.type === 'StripeIdempotencyError') {
            return 'This refund request was already submitted with different details. Close the dialog and try again.'
        }
    }
    return error?.message ?? 'The refund could not be processed.'
}

function validateInput(input: IssueRefundInput): string | null {
    if (!input.appointmentId) return 'Missing appointment.'
    if (!['DEPOSIT', 'FULL', 'CUSTOM'].includes(input.scope)) return 'Choose what to refund.'
    if (!REFUND_REASONS.some(r => r.value === input.reason)) return 'Choose a reason for the refund.'
    if ((input.note ?? '').length > REFUND_NOTE_MAX_LENGTH) return `Notes are limited to ${REFUND_NOTE_MAX_LENGTH} characters.`
    if (!/^[A-Za-z0-9-]{8,64}$/.test(input.requestId ?? '')) return 'Invalid refund request. Close the dialog and try again.'
    if (input.scope === 'CUSTOM' && (!Number.isInteger(input.amount) || (input.amount ?? 0) <= 0)) {
        return 'Enter an amount to refund.'
    }
    return null
}

export async function issueRefund(input: IssueRefundInput): Promise<IssueRefundResult> {
    const invalid = validateInput(input)
    if (invalid) return { ok: false, error: invalid }

    const { user, appt, business, stripeAccountId } = await loadOwnedAppointment(input.appointmentId)
    const { deposit, service } = await loadCharges(appt, stripeAccountId)
    const totalRefundable = (deposit?.refundable ?? 0) + (service?.refundable ?? 0)

    if (totalRefundable <= 0) {
        return {
            ok: false,
            error: deposit?.disputed || service?.disputed
                ? 'This payment is under dispute and can\'t be refunded.'
                : 'There\'s nothing left to refund on this appointment.',
        }
    }
    if (input.scope === 'CUSTOM' && (input.amount ?? 0) > totalRefundable) {
        return { ok: false, error: `You can refund at most ${fmt(totalRefundable)} on this appointment.` }
    }

    const allocations = allocate(input, deposit, service)
    const total = allocations.reduce((sum, a) => sum + a.amount, 0)
    if (total <= 0) {
        return { ok: false, error: input.scope === 'DEPOSIT' ? 'There\'s no deposit left to refund.' : 'There\'s nothing left to refund on this appointment.' }
    }

    // Connected accounts are created with losses.payments = "application",
    // so a refund that drives a business's balance negative is ultimately
    // AfroAllure's loss. Block it up front instead.
    const balance = await stripe.balance.retrieve({}, { stripeAccount: stripeAccountId })
    const covered = sumUsd(balance.available) + sumUsd(balance.pending)
    if (covered < total) {
        return {
            ok: false,
            error: `Your Stripe balance (${fmt(Math.max(0, covered))}) isn't enough to cover this ${fmt(total)} refund. Try again once more payments have come in.`,
        }
    }

    const note = input.note?.trim() || ''
    const issued: { amount: number; type: RefundChargeType; pending: boolean }[] = []
    let failure: string | null = null

    for (const { charge, amount } of allocations) {
        let refund: Stripe.Refund
        try {
            refund = await stripe.refunds.create({
                payment_intent: charge.paymentIntentId,
                amount,
                // The 3% platform fee is non-refundable (see /refunds).
                refund_application_fee: false,
                reason: input.reason === 'requested_by_customer' || input.reason === 'duplicate' ? input.reason : undefined,
                metadata: {
                    source: APP_REFUND_SOURCE,
                    appointment_id: appt.id,
                    business_id: appt.business,
                    charge_type: charge.type,
                    initiated_by: user.id,
                    reason: input.reason,
                    note,
                },
            }, {
                stripeAccount: stripeAccountId,
                idempotencyKey: `refund-${input.requestId}-${charge.type}`,
            })
        } catch (error: any) {
            console.error(`issueRefund: ${charge.type} refund failed for appointment ${appt.id}:`, error.message)
            failure = stripeErrorMessage(error)
            break
        }

        // The money has moved at this point, so a DB hiccup must not be
        // reported as a failed refund — the refund webhook re-syncs it.
        try {
            await syncStripeRefund(refund, { appointmentId: appt.id, businessId: appt.business, chargeType: charge.type })
        } catch (error: any) {
            console.error(`issueRefund: refund ${refund.id} issued but not recorded yet:`, error.message)
        }

        if (refund.status === 'failed' || refund.status === 'canceled') {
            failure = refund.failure_reason ?? 'The refund was declined.'
            break
        }
        issued.push({ amount, type: charge.type, pending: refund.status !== 'succeeded' })
    }

    if (issued.length === 0) {
        return { ok: false, error: failure ?? 'The refund could not be processed.' }
    }

    const refundedNow = issued.reduce((sum, r) => sum + r.amount, 0)
    const depositRefunded = issued.filter(r => r.type === 'DEPOSIT').reduce((sum, r) => sum + r.amount, 0)
    const willCancel = input.cancelAppointment && canCancel(appt)
    const admin = createAdminClient()

    // When the deposit was subtracted from the balance due and the
    // appointment is still going ahead, the client now owes that part again
    // — otherwise the end-of-appointment payment link would undercharge.
    if (depositRefunded > 0 && !willCancel && !appt.service_paid && appt.substraction && appt.status !== 'CANCELLED') {
        const { error } = await admin
            .from('appointments')
            .update({ amount_due: appt.amount_due + depositRefunded })
            .eq('id', appt.id)
        if (error) console.error('issueRefund: failed to restore amount_due:', error.message)
    }

    let cancelled = false
    let cancelWarning: string | undefined
    if (willCancel) {
        try {
            await cancelAppointment(appt.id)
            cancelled = true
        } catch (error: any) {
            cancelWarning = `The refund went through, but the appointment couldn't be cancelled: ${error.message}`
        }
    }

    const client = appt.client_metadata as any
    const serviceName = (appt.service_data as any)?.name ?? 'appointment'
    const clientName = `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim()
    const pending = issued.some(r => r.pending)

    try {
        await admin.from('notifications').insert({
            body: `You refunded ${fmt(refundedNow)} to ${clientName} for their ${serviceName} appointment.${pending ? ' The refund is still processing.' : ''}`,
            title: 'Refund Issued',
            read: false,
            business_id: appt.business,
            type: 'refund-issued',
            appointment_id: appt.id,
        })
    } catch (error) {
        console.error('issueRefund: failed to insert notification:', error)
    }

    try {
        if (!client?.email) throw new Error('Client has no email address')
        const accountSettings = business.account_settings as any
        await AppointmentEmails.sendRefundIssued({
            clientMetadata: { firstName: client.firstName ?? '', lastName: client.lastName ?? '', email: client.email },
            businessData: {
                id: appt.business,
                name: business.business_name ?? '',
                email: business.email ?? '',
                address: accountSettings?.business_address ? formatBusinessAddress(accountSettings.business_address) : '',
            },
            appointmentData: { id: appt.id, start: appt.start, end: appt.end },
            serviceName,
            notifyBusiness: false,
            amountRefunded: refundedNow,
            pending,
            cancelled,
        })
    } catch (error) {
        console.error('issueRefund: failed to send refund email:', error)
    }

    const { data: updated } = await admin
        .from('appointments')
        .select('status, amount_due, refund_status, refunded_amount')
        .eq('id', appt.id)
        .single()

    const warnings = [
        failure ? `Only ${fmt(refundedNow)} was refunded — the rest failed: ${failure}` : null,
        cancelWarning,
    ].filter(Boolean)

    return {
        ok: true,
        refundedNow,
        pending,
        refundStatus: updated?.refund_status ?? 'PARTIAL',
        refundedAmount: Number(updated?.refunded_amount ?? refundedNow),
        status: updated?.status ?? appt.status,
        amountDue: updated?.amount_due ?? appt.amount_due,
        cancelled,
        warning: warnings.length ? warnings.join(' ') : undefined,
    }
}
