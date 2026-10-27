import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { effectivePlanType } from '@/lib/beta'
import { bookingUrl } from '@/lib/bookingUrl'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import { describeReward, isRewardUsable, rewardFromRow } from '@/features/loyalty/loyalty'
import { describeOffer, referralProgramFromRow } from '../referrals'

export interface RewardsPageData {
    businessName: string
    clientFirstName: string
    programOn: boolean
    offer: string
    shareUrl: string
    bookUrl: string
    rewards: { code: string; text: string; source: 'referral' | 'loyalty'; expiresOn: string | null }[]
    completedReferrals: number
    pendingReferrals: number
}

/**
 * A client's private rewards page (/refer/<token>). Clients have no logins:
 * the unguessable token in their email link is what lets them see only their
 * own rewards. Not a server action; runs on the server with the service role
 * and returns only this client's data at this business.
 */
export async function loadRewardsPage(urlName: string, token: string): Promise<RewardsPageData | null> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return null
    const db = createAdminClient()
    const { data: business } = await db.from('business_users').select('business_id, business_name, url_name, plan_type').eq('url_name', urlName).maybeSingle()
    if (!business) return null
    const { data: codeRow } = await db.from('referral_codes').select('id, client_id, code').eq('business_id', business.business_id).eq('access_token', token).maybeSingle()
    if (!codeRow) return null

    const [clientRes, programRes, rewardsRes, referralsRes, tz] = await Promise.all([
        db.from('client_users').select('first_name').eq('client_id', codeRow.client_id).maybeSingle(),
        db.from('referral_programs').select('*').eq('business_id', business.business_id).maybeSingle(),
        db.from('loyalty_rewards').select('*').eq('business_id', business.business_id).eq('client_id', codeRow.client_id).eq('status', 'available'),
        db.from('referrals').select('status').eq('business_id', business.business_id).eq('referrer_client_id', codeRow.client_id),
        getBusinessTimezone(business.business_id),
    ])
    const program = referralProgramFromRow(programRes.data)
    const rewards = (rewardsRes.data ?? [])
        .map(row => ({ row, reward: rewardFromRow(row) }))
        .filter(({ reward }) => isRewardUsable(reward))
        .map(({ row, reward }) => ({
            code: reward.code,
            text: describeReward(reward),
            source: (row.source === 'referral' ? 'referral' : 'loyalty') as 'referral' | 'loyalty',
            expiresOn: reward.expiresAt ? DateTime.fromISO(reward.expiresAt).setZone(tz).toFormat('LLL d, yyyy') : null,
        }))
    const referrals = referralsRes.data ?? []

    return {
        businessName: business.business_name,
        clientFirstName: (clientRes.data?.first_name ?? '').trim() || 'there',
        programOn: program.enabled && effectivePlanType(business.plan_type) === 'GROWTH',
        offer: describeOffer(program),
        shareUrl: `${bookingUrl(business.url_name, '/book')}?ref=${encodeURIComponent(codeRow.code)}`,
        bookUrl: bookingUrl(business.url_name, '/book'),
        rewards,
        completedReferrals: referrals.filter(r => r.status === 'completed').length,
        pendingReferrals: referrals.filter(r => r.status === 'booked').length,
    }
}
