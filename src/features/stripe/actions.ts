'use server'

import { stripe } from "@/lib/stripe/stripeClient"
import { createAdminClient } from '@/app/utils/supabase/admin'
import { calculateApplicationFee } from "@/lib/fees"
import { getEffectivePlanType } from "@/lib/businessPlan"
import { remainingBalance } from "@/features/services/pricing"
import { requireOwnStripeAccount } from "@/lib/auth/requireOwnStripeAccount"
import { canPayBalance } from "@/features/stripe/balance"
import { balanceIntentAmount, canEditTip, tipBaseCents, tipFromMetadata, TIP_METADATA_KEY, validateTip } from "@/features/stripe/tips"
import Stripe from "stripe"

/**
 * PaymentIntent for an appointment's balance (payment links, `purpose: 'EOA'`)
 * or deposit. Public endpoint, so everything that matters — the Stripe
 * account, the amount, the receipt email — is read from the appointment in
 * the database. The browser-supplied price and account are ignored.
 */
export const createCheckoutAction = async (params: {
    connectedAccountId?: string
    price?: number
    appointmentID: string
    purpose: string
    client_email?: string
    paymentIntent?: string
    appointmentType?: string
}) => {
    const { appointmentID, purpose, appointmentType } = params
    const isBalance = purpose === 'EOA'
    const supabase = createAdminClient()

    const { data: appt } = await supabase
        .from('appointments')
        .select('id, business, status, client_metadata, amount_due, deposit_price, paid_deposit, substraction, service_paid, deposit_charge_id, service_charge_id')
        .eq('id', appointmentID)
        .maybeSingle()
    if (!appt) throw new Error('Appointment not found.')

    const { data } = await supabase
        .from('business_users')
        .select('stripe_acc_id, payment_method_config_id, completed_stripe_onboarding')
        .eq('business_id', appt.business)
        .maybeSingle()

    // Without this, a business can publish and accept bookings before Stripe
    // Connect is actually finished, and the client only finds out when the
    // PaymentIntent create call below fails with an opaque Stripe error.
    if (!data?.completed_stripe_onboarding || !data.stripe_acc_id) {
        throw new Error('This business hasn\'t finished setting up payments yet. Please check back soon or contact them directly.')
    }
    const stripeAccount = data.stripe_acc_id
    const planType = await getEffectivePlanType(supabase, appt.business)

    // Reuse this appointment's existing PaymentIntent (never one passed in).
    const existingId = isBalance ? appt.service_charge_id : appt.deposit_charge_id
    const price = isBalance ? remainingBalance(appt) : Math.round(Number(appt.deposit_price ?? 0))
    const result = (pi: Stripe.PaymentIntent) => ({
        clientSecret: pi.client_secret,
        id: pi.id,
        amountDue: pi.amount,
        tipCents: isBalance ? tipFromMetadata(pi.metadata) : 0,
    })
    if (existingId) {
        const existing = await stripe.paymentIntents.retrieve(existingId, { stripeAccount })
        if (existing.status === 'succeeded') return result(existing)
        if (existing.status !== 'canceled') {
            // The balance can change after the link was first opened (a late
            // fee or reward was added) — keep the unpaid payment in step,
            // keeping any tip the client already chose.
            const next = isBalance && canPayBalance(appt) ? balanceIntentAmount(existing, price) : null
            if (next) {
                const updated = await stripe.paymentIntents.update(
                    existing.id,
                    { amount: next.amount, application_fee_amount: calculateApplicationFee(next.amount, planType, next.tipCents) },
                    { stripeAccount }
                )
                return result(updated)
            }
            return result(existing)
        }
    }

    // Payable after the automatic no-show / incomplete flags too (see canPayBalance).
    if (isBalance && !canPayBalance(appt)) throw new Error('This payment link is no longer valid.')
    if (price < 50) throw new Error(isBalance ? 'Nothing is left to pay for this appointment.' : "This appointment doesn't need a deposit.")

    const intent = await stripe.paymentIntents.create({
        amount: price,
        currency: 'usd',
        receipt_email: (appt.client_metadata as any)?.email || undefined,
        metadata: {
            appointment_id: appt.id,
            purpose,
            type: appointmentType ?? '',
            ...(isBalance ? { [TIP_METADATA_KEY]: '0' } : {}),
        },
        payment_method_configuration: data.payment_method_config_id || undefined,
        application_fee_amount: calculateApplicationFee(price, planType),
    }, { stripeAccount })

    if (isBalance) {
        await supabase.from('appointments').update({ service_charge_id: intent.id }).eq('id', appt.id)
    } else {
        await supabase.from('appointments').update({ deposit_charge_id: intent.id }).eq('id', appt.id)
    }

    return result(intent)
}

export type SetBalanceTipResult =
    | { ok: true; amountDue: number; tipCents: number; balanceCents: number }
    | { ok: false; error: string }

/**
 * Sets the client's tip on an appointment's unpaid balance payment. Public
 * like createCheckoutAction: the balance, the cap and the Stripe account all
 * come from the database; only the tip amount comes from the browser. The
 * page must wait for this before confirming, so the charge matches what the
 * client was shown.
 */
export const setBalanceTip = async (appointmentID: string, tipCents: number): Promise<SetBalanceTipResult> => {
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('id, business, status, amount_due, deposit_price, paid_deposit, substraction, service_paid, service_charge_id')
        .eq('id', appointmentID)
        .maybeSingle()
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    if (!canPayBalance(appt) || !appt.service_charge_id) {
        return { ok: false, error: 'This payment link is no longer valid.' }
    }

    const invalid = validateTip(tipCents, tipBaseCents(appt))
    if (invalid) return { ok: false, error: invalid }

    const { data: biz } = await supabase
        .from('business_users')
        .select('stripe_acc_id, completed_stripe_onboarding')
        .eq('business_id', appt.business)
        .maybeSingle()
    if (!biz?.completed_stripe_onboarding || !biz.stripe_acc_id) {
        return { ok: false, error: 'This business hasn\'t finished setting up payments yet.' }
    }
    const stripeAccount = biz.stripe_acc_id

    try {
        const existing = await stripe.paymentIntents.retrieve(appt.service_charge_id, { stripeAccount })
        if (existing.status === 'succeeded') return { ok: false, error: 'This appointment is already paid.' }
        if (!canEditTip(existing.status)) {
            return { ok: false, error: 'Your payment is already being processed, so the tip can\'t be changed.' }
        }

        const balance = remainingBalance(appt)
        const amount = balance + tipCents
        const planType = await getEffectivePlanType(supabase, appt.business)
        const updated = await stripe.paymentIntents.update(existing.id, {
            amount,
            application_fee_amount: calculateApplicationFee(amount, planType, tipCents),
            metadata: { [TIP_METADATA_KEY]: String(tipCents) },
        }, { stripeAccount })
        return { ok: true, amountDue: updated.amount, tipCents: tipFromMetadata(updated.metadata), balanceCents: balance }
    } catch (error: any) {
        console.error(`setBalanceTip failed for appointment ${appointmentID}:`, error?.message)
        return { ok: false, error: 'We couldn\'t update your tip. Please try again.' }
    }
}

export const createAccountLinkAction = async (accountId: string) => {
    await requireOwnStripeAccount(accountId)
    const base = process.env.NEXT_PUBLIC_BASE_URL

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${base}/onboarding/${accountId}`,
        return_url: `${base}/onboarding/${accountId}/return`,
        type: 'account_onboarding',
        collection_options: { fields: 'eventually_due' },
    })

    const supabase = createAdminClient()
    await supabase
        .from('business_users')
        .update({ current_onboarding_link: accountLink.url })
        .eq('stripe_acc_id', accountId)

    return accountLink.url
}

export const createAccountSessionAction = async (accountId: string) => {
    await requireOwnStripeAccount(accountId)
    const accountSession = await stripe.accountSessions.create({
        account: accountId,
        components: {
            account_management: { enabled: true, features: { external_account_collection: true } },
            payments: {
                enabled: true,
                features: {
                    // Refunds are only issued from the appointment detail
                    // modal (src/features/refunds) so they stay tied to the
                    // appointment record, client email and refund history.
                    refund_management: false,
                    dispute_management: true,
                    capture_payments: true,
                    destination_on_behalf_of_charge_management: false,
                },
            },
            balances: {
                enabled: true,
                features: { instant_payouts: true, standard_payouts: true, edit_payout_schedule: true },
            },
            payouts_list: { enabled: true },
            reporting_chart: { enabled: true },
        } as any,
    }, { apiVersion: '2023-10-16; embedded_connect_beta=v2;' })

    return accountSession.client_secret
}
