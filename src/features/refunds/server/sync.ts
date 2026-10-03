import Stripe from "stripe";
import { createAdminClient } from "@/app/utils/supabase/admin";
import { RefundChargeType, RefundRowStatus } from "../types";

/** Marks refunds created by issueRefund, so the webhook can tell them apart. */
export const APP_REFUND_SOURCE = 'afroallure_app'

const FAILED_STATUSES: RefundRowStatus[] = ['failed', 'canceled']

export interface RefundOwnership {
    appointmentId: string
    businessId: string
    chargeType: RefundChargeType
}

export interface SyncedRefund extends RefundOwnership {
    stripeRefundId: string
    amount: number
    status: RefundRowStatus
    previousStatus: RefundRowStatus | null
    /** Transitioned into failed/canceled with this sync. */
    newlyFailed: boolean
}

function normalizeStatus(status: string | null): RefundRowStatus {
    switch (status) {
        case 'succeeded':
        case 'failed':
        case 'canceled':
        case 'requires_action':
            return status
        default:
            return 'pending'
    }
}

/**
 * Works out which appointment a refund belongs to: app-issued refunds carry
 * it in metadata; anything else is matched by the payment intent it refunds.
 */
async function resolveOwnership(refund: Stripe.Refund, paymentIntentId: string): Promise<RefundOwnership | null> {
    const { appointment_id, business_id, charge_type } = refund.metadata ?? {}
    if (appointment_id && business_id && (charge_type === 'DEPOSIT' || charge_type === 'SERVICE')) {
        return { appointmentId: appointment_id, businessId: business_id, chargeType: charge_type }
    }

    const admin = createAdminClient()
    const { data } = await admin
        .from('appointments')
        .select('id, business, deposit_charge_id, service_charge_id')
        .or(`deposit_charge_id.eq.${paymentIntentId},service_charge_id.eq.${paymentIntentId}`)
        .limit(1)
        .maybeSingle()
    if (!data) return null

    return {
        appointmentId: data.id,
        businessId: data.business,
        chargeType: data.deposit_charge_id === paymentIntentId ? 'DEPOSIT' : 'SERVICE',
    }
}

/**
 * Records a Stripe refund in the `refunds` table (insert or status update)
 * and recomputes the appointment's refund totals. Safe to call any number of
 * times for the same refund, in any order — from issueRefund right after
 * creating it, and from every refund webhook event.
 */
export async function syncStripeRefund(refund: Stripe.Refund, ownership?: RefundOwnership): Promise<SyncedRefund | null> {
    const paymentIntentId = typeof refund.payment_intent === 'string' ? refund.payment_intent : refund.payment_intent?.id
    if (!paymentIntentId) return null

    const owner = ownership ?? await resolveOwnership(refund, paymentIntentId)
    if (!owner) {
        console.warn(`syncStripeRefund: no appointment found for refund ${refund.id} (payment intent ${paymentIntentId})`)
        return null
    }

    const admin = createAdminClient()
    const status = normalizeStatus(refund.status)
    const metadata = refund.metadata ?? {}

    const { data: existing } = await admin
        .from('refunds')
        .select('status')
        .eq('stripe_refund_id', refund.id)
        .maybeSingle()
    const previousStatus = (existing?.status ?? null) as RefundRowStatus | null

    if (!existing && metadata.source !== APP_REFUND_SOURCE) {
        // Businesses can only refund from the appointment modal, so this
        // came from somewhere else (e.g. the platform's own Stripe
        // dashboard). Still recorded so the appointment's totals stay right.
        console.warn(`syncStripeRefund: refund ${refund.id} on appointment ${owner.appointmentId} was not issued from the app`)
    }

    // Insert-if-missing, then update the fields Stripe owns. Two steps so a
    // webhook racing issueRefund can't clobber the app's reason/note, and the
    // unique stripe_refund_id makes the insert idempotent.
    const { error: insertError } = await admin.from('refunds').upsert({
        appointment_id: owner.appointmentId,
        business_id: owner.businessId,
        stripe_refund_id: refund.id,
        payment_intent_id: paymentIntentId,
        charge_type: owner.chargeType,
        amount: refund.amount,
        status,
        reason: metadata.reason || refund.reason || null,
        note: metadata.note || null,
        initiated_by: metadata.initiated_by || null,
        failure_reason: refund.failure_reason ?? null,
    }, { onConflict: 'stripe_refund_id', ignoreDuplicates: true })
    if (insertError) throw new Error(insertError.message)

    const { error: updateError } = await admin
        .from('refunds')
        .update({
            amount: refund.amount,
            status,
            failure_reason: refund.failure_reason ?? null,
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_refund_id', refund.id)
    if (updateError) throw new Error(updateError.message)

    const { error: rpcError } = await admin.rpc('refresh_appointment_refund_totals', { p_appointment_id: owner.appointmentId })
    if (rpcError) throw new Error(rpcError.message)

    return {
        ...owner,
        stripeRefundId: refund.id,
        amount: refund.amount,
        status,
        previousStatus,
        newlyFailed: FAILED_STATUSES.includes(status) && !(previousStatus && FAILED_STATUSES.includes(previousStatus)),
    }
}
