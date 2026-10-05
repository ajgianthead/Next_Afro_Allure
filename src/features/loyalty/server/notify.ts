import { Resend } from 'resend'
import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { bookingUrl } from '@/lib/bookingUrl'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import LoyaltyUpdateEmail from '../../../../emails/loyalty-update'
import { describeRemaining, describeReward, programFromRow, progressFor } from '../loyalty'

const FROM = 'notifications <noreply@reminder.afroallure.co>'

/** Banked progress (visits / spend) for one client — the ledger sums to it. */
export async function loyaltyBank(supabase: ReturnType<typeof createAdminClient>, businessId: string, clientId: string) {
    const { data } = await supabase
        .from('loyalty_ledger')
        .select('visits, spend_cents')
        .eq('business_id', businessId)
        .eq('client_id', clientId)
    return (data ?? []).reduce(
        (acc, row: any) => ({ visits: acc.visits + Number(row.visits ?? 0), spendCents: acc.spendCents + Number(row.spend_cents ?? 0) }),
        { visits: 0, spendCents: 0 }
    )
}

/**
 * Emails the client after a completed visit: their progress, or the reward
 * code they just earned. The visit itself is recorded by the database
 * trigger; this only reads what it wrote. Sent at most once per visit (the
 * ledger row is claimed first), and never throws — completion must not fail
 * because an email did.
 */
export async function notifyLoyaltyForAppointment(appointmentId: string): Promise<void> {
    try {
        const supabase = createAdminClient()
        const { data: claimed } = await supabase
            .from('loyalty_ledger')
            .update({ notified_at: new Date().toISOString() })
            .eq('appointment_id', appointmentId)
            .eq('kind', 'visit')
            .is('notified_at', null)
            .select('business_id, client_id')
        const visit = claimed?.[0]
        if (!visit) return

        const [programRes, clientRes, businessRes, rowsRes, tz] = await Promise.all([
            supabase.from('loyalty_programs').select('*').eq('business_id', visit.business_id).maybeSingle(),
            supabase.from('client_users').select('first_name, email').eq('client_id', visit.client_id).maybeSingle(),
            supabase.from('business_users').select('business_name, url_name').eq('business_id', visit.business_id).maybeSingle(),
            supabase.from('loyalty_ledger').select('kind, reward_id').eq('appointment_id', appointmentId),
            getBusinessTimezone(visit.business_id),
        ])
        const program = programFromRow(programRes.data)
        const email = clientRes.data?.email?.trim()
        if (!program.enabled || !email || !businessRes.data) return

        const rows = rowsRes.data ?? []
        const rewardIds = rows.filter(r => r.kind === 'reward' && r.reward_id).map(r => r.reward_id as string)
        const { data: rewards } = rewardIds.length
            ? await supabase.from('loyalty_rewards').select('code, expires_at').in('id', rewardIds)
            : { data: [] as { code: string; expires_at: string | null }[] }

        const bank = await loyaltyBank(supabase, visit.business_id, visit.client_id)
        const progress = progressFor(program, bank)

        const resend = new Resend(process.env.RESEND_API_KEY)
        const businessName = businessRes.data.business_name ?? 'your stylist'
        const newRewards = (rewards ?? []).map(r => ({
            code: r.code,
            expiresOn: r.expires_at ? DateTime.fromISO(r.expires_at).setZone(tz).toFormat('LLLL d, yyyy') : null,
        }))
        const rewardText = describeReward(program)
        const { error } = await resend.emails.send({
            from: FROM,
            to: email,
            subject: newRewards.length
                ? `You earned ${rewardText} at ${businessName}`
                : `You're ${describeRemaining(program, progress)} from ${rewardText}`,
            react: LoyaltyUpdateEmail({
                clientFirstName: clientRes.data?.first_name || 'there',
                businessName,
                bookingUrl: bookingUrl(businessRes.data.url_name ?? '', '/book'),
                rewardText,
                newRewards,
                remainingText: describeRemaining(program, progress),
                stamps: program.earnType === 'visits' && program.visitsRequired <= 12
                    ? { filled: progress.banked, total: program.visitsRequired }
                    : null,
                rebookBonus: rows.some(r => r.kind === 'bonus'),
            }),
        })
        if (error) console.error('Loyalty email failed:', error.message)
    } catch (err: any) {
        console.error('notifyLoyaltyForAppointment failed:', err?.message)
    }
}
