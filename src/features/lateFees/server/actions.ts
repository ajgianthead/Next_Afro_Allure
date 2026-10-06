'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { BALANCE_PAYABLE_STATUSES } from '@/features/stripe/balance'
import { lateFeeCents, parseLateFee, type LateFee } from '../lateFee'

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

export interface LateFeeInfo {
    /** The business has a late fee (in the policy the client booked under). */
    enabled: boolean
    terms: LateFee
    /** What adding it would charge (cents). */
    feeCents: number
    /** Already added (cents), 0 if not. */
    addedCents: number
    /** It can be added / removed now (unpaid, still payable). */
    editable: boolean
}

async function load(businessId: string, appointmentId: string) {
    const supabase = createAdminClient()
    const { data: appt } = await supabase
        .from('appointments')
        .select('id, status, amount_due, service_paid, policy_id, service_data, selected_options, late_fee_cents')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt) return { supabase, appt: null, terms: parseLateFee(null) }

    // The policy the client booked under; otherwise the business's current one.
    let policyId = appt.policy_id as string | null
    if (!policyId) {
        const { data: biz } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessId).maybeSingle()
        policyId = biz?.booking_policies ?? null
    }
    const { data: policy } = policyId
        ? await supabase.from('business_policies').select('late_fee').eq('id', policyId).maybeSingle()
        : { data: null }
    return { supabase, appt, terms: parseLateFee(policy?.late_fee) }
}

/** The style price the client booked (what a % late fee is taken of). */
function servicePrice(appt: { selected_options: unknown; service_data: unknown }): number {
    const options = appt.selected_options as { priceCents?: number } | null
    return Math.round(Number(options?.priceCents ?? (appt.service_data as any)?.price ?? 0))
}

const editableStatus = (appt: { status: string; service_paid: boolean | null }) =>
    !appt.service_paid && BALANCE_PAYABLE_STATUSES.includes(appt.status as any)

export async function getLateFeeInfo(appointmentId: string): Promise<Result<{ info: LateFeeInfo }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { appt, terms } = await load(businessId, appointmentId)
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    return {
        ok: true,
        info: {
            enabled: terms.enabled,
            terms,
            feeCents: lateFeeCents(terms, servicePrice(appt)),
            addedCents: Number(appt.late_fee_cents ?? 0),
            editable: editableStatus(appt as any),
        },
    }
}

/**
 * Adds the late fee to an unpaid appointment's balance. If the system had
 * flagged it as a no-show, it goes back to confirmed — the client came.
 */
export async function addLateFee(appointmentId: string): Promise<Result<{ feeCents: number; amountDue: number }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { supabase, appt, terms } = await load(businessId, appointmentId)
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    if (!terms.enabled) return { ok: false, error: 'Turn on a late fee in Booking Settings first.' }
    if (!editableStatus(appt as any)) return { ok: false, error: 'A late fee can only be added before the appointment is paid.' }
    if (Number(appt.late_fee_cents ?? 0) > 0) return { ok: false, error: 'A late fee was already added.' }

    const fee = lateFeeCents(terms, servicePrice(appt))
    if (fee <= 0) return { ok: false, error: 'The late fee works out to $0 for this appointment.' }
    const amountDue = Number(appt.amount_due ?? 0) + fee

    const { data: updated } = await supabase
        .from('appointments')
        .update({
            amount_due: amountDue,
            late_fee_cents: fee,
            late_fee_added_at: new Date().toISOString(),
            ...(appt.status === 'NO_SHOW' ? { status: 'CONFIRMED' as const } : {}),
        })
        .eq('id', appt.id)
        .eq('late_fee_cents', 0)
        .eq('amount_due', appt.amount_due)
        .not('service_paid', 'is', true)
        .select('id')
    if (!updated?.length) return { ok: false, error: 'The appointment changed — please try again.' }
    revalidatePath('/dashboard/appointments')
    return { ok: true, feeCents: fee, amountDue }
}

export async function removeLateFee(appointmentId: string): Promise<Result<{ amountDue: number }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { supabase, appt } = await load(businessId, appointmentId)
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    const fee = Number(appt.late_fee_cents ?? 0)
    if (!fee) return { ok: false, error: 'No late fee was added.' }
    if (!editableStatus(appt as any)) return { ok: false, error: 'This appointment is already paid.' }

    const amountDue = Math.max(0, Number(appt.amount_due ?? 0) - fee)
    const { data: updated } = await supabase
        .from('appointments')
        .update({ amount_due: amountDue, late_fee_cents: 0, late_fee_added_at: null })
        .eq('id', appt.id)
        .eq('late_fee_cents', fee)
        .not('service_paid', 'is', true)
        .select('id')
    if (!updated?.length) return { ok: false, error: 'The appointment changed — please try again.' }
    revalidatePath('/dashboard/appointments')
    return { ok: true, amountDue }
}
