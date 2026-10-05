'use server'

import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { stripe } from '@/lib/stripe/stripeClient'
import { calculateApplicationFee } from '@/lib/fees'
import { feeFromPaymentMetadata } from '../noShowFee'

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

export interface NoShowFeeInfo {
    /** A fee can be charged now. */
    chargeable: boolean
    /** Fee agreed at booking (cents), if any. */
    feeCents: number
    status: 'processing' | 'succeeded' | 'failed' | null
    chargedCents: number | null
    error: string | null
    /** Why it can't be charged, for the dashboard. */
    reason: string | null
}

async function loadDeposit(businessId: string, appointmentId: string) {
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('id, business, status, deposit_charge_id, paid_deposit, paid_amount, client_metadata, service_data, no_show_fee_status, no_show_fee_cents, no_show_fee_error')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt) return { supabase, appt: null, deposit: null, stripeAccount: null }
    const { data: biz } = await supabase.from('business_users').select('stripe_acc_id').eq('business_id', businessId).single()
    const stripeAccount = biz?.stripe_acc_id ?? null
    let deposit: Stripe.PaymentIntent | null = null
    if (appt.deposit_charge_id && stripeAccount) {
        try {
            deposit = await stripe.paymentIntents.retrieve(appt.deposit_charge_id, { stripeAccount })
        } catch {
            deposit = null
        }
    }
    return { supabase, appt, deposit, stripeAccount }
}

function savedCard(deposit: Stripe.PaymentIntent | null) {
    if (!deposit || deposit.status !== 'succeeded') return null
    const customer = typeof deposit.customer === 'string' ? deposit.customer : deposit.customer?.id
    const paymentMethod = typeof deposit.payment_method === 'string' ? deposit.payment_method : deposit.payment_method?.id
    if (deposit.setup_future_usage !== 'off_session' || !customer || !paymentMethod) return null
    return { customer, paymentMethod }
}

export async function getNoShowFeeInfo(appointmentId: string): Promise<Result<{ info: NoShowFeeInfo }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { appt, deposit } = await loadDeposit(businessId, appointmentId)
    if (!appt) return { ok: false, error: 'Appointment not found.' }

    const feeCents = deposit ? feeFromPaymentMetadata(deposit.metadata) : 0
    const card = savedCard(deposit)
    let reason: string | null = null
    if (!feeCents) reason = 'No no-show fee was agreed when this appointment was booked.'
    else if (!card) reason = "The client's card wasn't saved with their deposit."
    else if (appt.status !== 'NO_SHOW') reason = 'Mark the appointment as a no-show first.'
    else if (appt.no_show_fee_status === 'succeeded' || appt.no_show_fee_status === 'processing') reason = 'The fee has already been charged.'

    return {
        ok: true,
        info: {
            chargeable: !reason,
            feeCents,
            status: (appt.no_show_fee_status as NoShowFeeInfo['status']) ?? null,
            chargedCents: appt.no_show_fee_cents ?? null,
            error: appt.no_show_fee_error ?? null,
            reason,
        },
    }
}

/**
 * Charges the no-show fee the client agreed to at booking, to the card they
 * paid their deposit with. Only for appointments marked NO_SHOW, only once.
 */
export async function chargeNoShowFee(appointmentId: string): Promise<Result<{ chargedCents: number }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { supabase, appt, deposit, stripeAccount } = await loadDeposit(businessId, appointmentId)
    if (!appt || !stripeAccount) return { ok: false, error: 'Appointment not found.' }
    if (appt.status !== 'NO_SHOW') return { ok: false, error: 'Mark the appointment as a no-show first.' }

    const feeCents = deposit ? feeFromPaymentMetadata(deposit.metadata) : 0
    const card = savedCard(deposit)
    if (!feeCents || !card) return { ok: false, error: "There's no saved card or agreed fee for this appointment." }

    // Claim first so two clicks (or two tabs) can never charge twice.
    const { data: claimed } = await supabase
        .from('appointments')
        .update({ no_show_fee_status: 'processing', no_show_fee_error: null })
        .eq('id', appt.id)
        .eq('status', 'NO_SHOW')
        .or('no_show_fee_status.is.null,no_show_fee_status.eq.failed')
        .select('id')
    if (!claimed?.length) return { ok: false, error: 'The fee has already been charged.' }

    const cm = (appt.client_metadata ?? {}) as any
    const serviceName = (appt.service_data as any)?.name ?? 'appointment'
    try {
        const charge = await stripe.paymentIntents.create({
            amount: feeCents,
            currency: 'usd',
            customer: card.customer,
            payment_method: card.paymentMethod,
            off_session: true,
            confirm: true,
            receipt_email: cm.email || undefined,
            description: `No-show fee — ${serviceName}`,
            application_fee_amount: calculateApplicationFee(feeCents),
            metadata: { purpose: 'NO_SHOW_FEE', appointment_id: appt.id, businessId },
        }, {
            stripeAccount,
            idempotencyKey: `no-show-fee-${appt.id}-${Date.now()}`,
        })
        if (charge.status !== 'succeeded') throw new Error('The payment needs the client to confirm it, so it could not be charged.')

        await supabase.from('appointments').update({
            no_show_fee_status: 'succeeded',
            no_show_fee_cents: feeCents,
            no_show_fee_charge_id: charge.id,
            no_show_fee_charged_at: new Date().toISOString(),
            paid_amount: Number(appt.paid_amount ?? 0) + feeCents,
        }).eq('id', appt.id)
        revalidatePath('/dashboard/appointments')
        return { ok: true, chargedCents: feeCents }
    } catch (err: any) {
        // Card declined, needs authentication, etc. — record it so the business can retry or follow up.
        const message = err?.code === 'authentication_required'
            ? "The client's bank needs them to approve this charge, so it couldn't be taken automatically."
            : err?.raw?.message ?? err?.message ?? 'The charge failed.'
        await supabase.from('appointments').update({ no_show_fee_status: 'failed', no_show_fee_error: String(message).slice(0, 300) }).eq('id', appt.id)
        return { ok: false, error: message }
    }
}
