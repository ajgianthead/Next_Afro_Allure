import { DateTime } from 'luxon'
import { Resend } from 'resend'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { bookingUrl } from '@/lib/bookingUrl'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import ReferralInviteEmail from '../../../../emails/referral-invite'
import { describeOffer, describeReferralReward, referralProgramFromRow } from '../referrals'

const FROM = 'notifications <noreply@reminder.afroallure.co>'

/**
 * Emails the referrer when a friend's completed visit earned them a reward.
 * The reward itself was issued by the database trigger; this only reads it.
 * Sent at most once (the reward row is claimed first), and never throws:
 * completing an appointment must not fail because an email did.
 */
export async function notifyReferralForAppointment(appointmentId: string): Promise<void> {
    try {
        const db = createAdminClient()
        const { data: referral } = await db.from('referrals')
            .select('id, business_id, code_id, referrer_client_id, appointment_id')
            .eq('appointment_id', appointmentId)
            .eq('status', 'completed')
            .maybeSingle()
        if (!referral) return

        const { data: claimed } = await db.from('referral_rewards')
            .update({ notified_at: new Date().toISOString() })
            .eq('referral_id', referral.id)
            .eq('recipient', 'referrer')
            .eq('status', 'available')
            .is('notified_at', null)
            .select('loyalty_reward_id, reward_type, value')
        const reward = claimed?.[0]
        if (!reward?.loyalty_reward_id) return

        const [codeRes, loyaltyRes, clientRes, businessRes, programRes, apptRes, tz] = await Promise.all([
            db.from('referral_codes').select('code, access_token').eq('id', referral.code_id).maybeSingle(),
            db.from('loyalty_rewards').select('code, expires_at').eq('id', reward.loyalty_reward_id).maybeSingle(),
            db.from('client_users').select('first_name, email').eq('client_id', referral.referrer_client_id).maybeSingle(),
            db.from('business_users').select('business_name, url_name').eq('business_id', referral.business_id).maybeSingle(),
            db.from('referral_programs').select('*').eq('business_id', referral.business_id).maybeSingle(),
            db.from('appointments').select('client_metadata').eq('id', appointmentId).maybeSingle(),
            getBusinessTimezone(referral.business_id),
        ])
        const email = clientRes.data?.email?.trim()
        if (!email || !codeRes.data || !loyaltyRes.data || !businessRes.data) return

        const urlName = businessRes.data.url_name ?? ''
        const businessName = businessRes.data.business_name ?? 'your stylist'
        const friendName = String((apptRes.data?.client_metadata as any)?.firstName ?? '').trim() || 'Your friend'
        const rewardText = describeReferralReward({ rewardType: reward.reward_type as any, rewardValue: reward.value })
        const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
            from: FROM,
            to: email,
            subject: `${friendName} booked with ${businessName}. You earned ${rewardText}!`,
            react: ReferralInviteEmail({
                clientFirstName: clientRes.data?.first_name || 'there',
                businessName,
                offer: describeOffer(referralProgramFromRow(programRes.data)),
                shareUrl: `${bookingUrl(urlName, '/book')}?ref=${encodeURIComponent(codeRes.data.code)}`,
                rewardsUrl: bookingUrl(urlName, `/refer/${codeRes.data.access_token}`),
                newReward: {
                    code: loyaltyRes.data.code,
                    rewardText,
                    friendName,
                    expiresOn: loyaltyRes.data.expires_at ? DateTime.fromISO(loyaltyRes.data.expires_at).setZone(tz).toFormat('LLLL d, yyyy') : null,
                },
            }),
        })
        if (error) console.error('Referral reward email failed:', error.message)
    } catch (err: any) {
        console.error('notifyReferralForAppointment failed:', err?.message)
    }
}
