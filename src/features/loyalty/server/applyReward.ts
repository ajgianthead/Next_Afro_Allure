import { createAdminClient } from '@/app/utils/supabase/admin'
import { remainingBalance } from '@/features/services/pricing'
import { isRewardUsable, normalizeRewardCode, rewardDiscountCents, rewardFromRow } from '../loyalty'

/** Appointments that can't take a reward any more. */
export const CLOSED_STATUSES = ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'DENIED', 'REFUNDED']

type Admin = ReturnType<typeof createAdminClient>
export type ApplyRewardResult = { ok: true; discountCents: number } | { ok: false; error: string }

/** The client_users row for an email (then phone), matched the way the database does. */
export async function clientIdForContact(db: Admin, email: string, phone: string): Promise<string | null> {
    const e = email.trim().toLowerCase()
    if (e) {
        const pattern = e.replace(/[\\%_]/g, c => `\\${c}`)
        const { data } = await db.from('client_users').select('client_id').ilike('email', pattern).limit(1)
        if (data?.[0]) return data[0].client_id
    }
    const p = phone.trim()
    if (p) {
        const { data } = await db.from('client_users').select('client_id').eq('phone_number', p).limit(1)
        if (data?.[0]) return data[0].client_id
    }
    return null
}

/**
 * Takes a reward off an appointment's balance: claims the reward first so it
 * can't be used twice, then lowers amount_due. Shared by the business's
 * "apply reward" button and online booking. Not a server action.
 *
 * `ownerContact` (online booking): the code must belong to the person
 * booking, so a code passed around can't be used by someone else.
 */
export async function applyRewardCore(
    db: Admin,
    businessId: string,
    appointmentId: string,
    reward: { id?: string; code?: string },
    ownerContact?: { email: string; phone: string },
): Promise<ApplyRewardResult> {
    const { data: appt } = await db
        .from('appointments')
        .select('id, status, amount_due, deposit_price, paid_deposit, substraction, service_paid, loyalty_reward_id, discount_cents')
        .eq('id', appointmentId)
        .eq('business', businessId)
        .maybeSingle()
    if (!appt) return { ok: false, error: 'Appointment not found.' }
    if (appt.loyalty_reward_id) return { ok: false, error: 'A reward is already applied to this appointment.' }
    // A referred friend's first-visit discount is already taken off; rewards don't stack.
    if (Number(appt.discount_cents ?? 0) > 0) return { ok: false, error: 'This appointment already has a referral discount.' }
    if (appt.service_paid || CLOSED_STATUSES.includes(appt.status as string))
        return { ok: false, error: 'Rewards can only be applied before the appointment is paid.' }

    let query = db.from('loyalty_rewards').select('*').eq('business_id', businessId)
    if (reward.id) query = query.eq('id', reward.id)
    else if (reward.code?.trim()) query = query.eq('code', normalizeRewardCode(reward.code))
    else return { ok: false, error: 'Choose a reward or enter a code.' }
    const { data: row } = await query.maybeSingle()
    if (!row) return { ok: false, error: "That code doesn't match a reward for this business." }
    const found = rewardFromRow(row)
    if (!isRewardUsable(found)) return { ok: false, error: found.status === 'used' ? 'That reward was already used.' : 'That reward has expired.' }
    if (ownerContact) {
        const owner = await clientIdForContact(db, ownerContact.email, ownerContact.phone)
        if (!owner || owner !== row.client_id) return { ok: false, error: 'That code belongs to someone else. Use the email or phone it was sent to.' }
    }

    // Percent rewards are taken off the full price; never more than what's left to pay.
    const balance = remainingBalance(appt as any)
    const fullPrice = Number(appt.amount_due ?? 0) + (appt.paid_deposit && appt.substraction ? Number(appt.deposit_price ?? 0) : 0)
    const discount = Math.min(balance, rewardDiscountCents(found, fullPrice))
    if (discount <= 0) return { ok: false, error: 'There is no balance left to discount.' }

    const now = new Date().toISOString()
    const { data: claimed } = await db
        .from('loyalty_rewards')
        .update({ status: 'used', used_at: now, used_appointment_id: appointmentId, used_amount_cents: discount })
        .eq('id', found.id)
        .eq('status', 'available')
        .select('id')
    if (!claimed?.length) return { ok: false, error: 'That reward was just used.' }

    const { data: updated, error } = await db
        .from('appointments')
        .update({ amount_due: Number(appt.amount_due) - discount, loyalty_reward_id: found.id, discount_cents: discount })
        .eq('id', appointmentId)
        .is('loyalty_reward_id', null)
        .eq('amount_due', appt.amount_due)
        .select('id')
    if (error || !updated?.length) {
        await db.from('loyalty_rewards')
            .update({ status: 'available', used_at: null, used_appointment_id: null, used_amount_cents: null })
            .eq('id', found.id)
        return { ok: false, error: 'The appointment changed. Please try again.' }
    }

    await db.from('loyalty_ledger').insert({
        business_id: businessId, client_id: row.client_id, appointment_id: appointmentId,
        kind: 'redeem', reward_id: found.id, note: `Used ${found.code}`,
    })
    return { ok: true, discountCents: discount }
}
