'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { describeReward, isRewardUsable, normalizeRewardCode, rewardFromRow } from '../loyalty'
import { clientIdForContact } from './applyReward'

export type RewardCodeCheck = { ok: true; text: string } | { ok: false; error: string }

/**
 * Checks a reward code a client typed while booking online, so they know
 * before paying. Public endpoint: it only says whether the code works for the
 * person booking. The discount itself is applied (and re-checked) when the
 * booking is made.
 */
export async function checkRewardCodeAction(businessId: string, code: string, email: string, phone: string): Promise<RewardCodeCheck> {
    const normalized = normalizeRewardCode(code)
    if (!normalized) return { ok: false, error: 'Enter your reward code.' }
    if (!/^[0-9a-f-]{36}$/i.test(businessId)) return { ok: false, error: "That code doesn't work here." }
    if (!email.trim() && !phone.trim()) return { ok: false, error: 'Add your email and phone first.' }

    const db = createAdminClient()
    const { data: row } = await db.from('loyalty_rewards').select('*').eq('business_id', businessId).eq('code', normalized).maybeSingle()
    if (!row) return { ok: false, error: "That code doesn't work here." }
    const reward = rewardFromRow(row)
    if (!isRewardUsable(reward)) return { ok: false, error: reward.status === 'used' ? 'That code was already used.' : 'That code has expired.' }
    const owner = await clientIdForContact(db, email, phone)
    if (!owner || owner !== row.client_id) return { ok: false, error: 'Use the email or phone your code was sent to.' }
    return { ok: true, text: describeReward(reward) }
}
