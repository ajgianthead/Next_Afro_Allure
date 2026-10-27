'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { effectivePlanType } from '@/lib/beta'
import { describeReferralReward, friendGetsReward, normalizeReferralCode, referralProgramFromRow } from '../referrals'

export interface ReferralOffer {
    code: string
    /** First name only, e.g. "Brianna". */
    referrerFirstName: string
    /** "$10 off" — what the friend gets on their first visit, or null when only the referrer is rewarded. */
    friendReward: string | null
}

/**
 * What a referral link offers, for the banner on the booking page. Public
 * (anyone with the link may call it), so it only returns the referrer's first
 * name and the reward. The discount itself is decided when the booking is made.
 */
export async function getReferralOfferAction(businessId: string, code: string): Promise<ReferralOffer | null> {
    const normalized = normalizeReferralCode(code)
    if (!normalized || !/^[0-9a-f-]{36}$/i.test(businessId)) return null
    const db = createAdminClient()
    const [{ data: business }, { data: program }, { data: codeRow }] = await Promise.all([
        db.from('business_users').select('plan_type').eq('business_id', businessId).maybeSingle(),
        db.from('referral_programs').select('*').eq('business_id', businessId).maybeSingle(),
        db.from('referral_codes').select('client_id').eq('business_id', businessId).eq('code', normalized).maybeSingle(),
    ])
    const p = referralProgramFromRow(program)
    if (!business || effectivePlanType(business.plan_type) !== 'GROWTH' || !p.enabled || !codeRow) return null
    const { data: client } = await db.from('client_users').select('first_name').eq('client_id', codeRow.client_id).maybeSingle()
    return {
        code: normalized,
        referrerFirstName: (client?.first_name ?? '').trim().split(/\s+/)[0] || 'A friend',
        friendReward: friendGetsReward(p) ? describeReferralReward(p) : null,
    }
}
