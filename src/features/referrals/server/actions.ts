'use server'

import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { effectivePlanType } from '@/lib/beta'
import { bookingUrl } from '@/lib/bookingUrl'
import ReferralInviteEmail from '../../../../emails/referral-invite'
import {
    describeOffer, referralProgramFromRow, referralProgramProblems, referralProgramToRow, referralStats,
    type ReferralProgram, type ReferralRecord, type ReferralStats, type RewardRecord,
} from '../referrals'

// Every action is a public endpoint: each works out the caller's own business
// from their session and only touches its rows. Writes use the service role
// because referral codes, referrals and rewards aren't writable by
// businesses directly (nobody can mint rewards from a browser).

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }
type Admin = ReturnType<typeof createAdminClient>

const FROM = 'notifications <noreply@reminder.afroallure.co>'
const GROWTH_ONLY = 'Referrals are part of Growth.'

async function ownBusiness(): Promise<string | null> {
    try { return await requireOwnBusinessId() } catch { return null }
}

async function businessRow(db: Admin, businessId: string) {
    const { data } = await db.from('business_users').select('business_name, url_name, plan_type').eq('business_id', businessId).maybeSingle()
    return data
}

const isGrowth = (planType: unknown) => effectivePlanType(planType as any) === 'GROWTH'

const clientName = (c: { first_name?: string | null; last_name?: string | null; email?: string | null } | undefined) =>
    c ? `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || c.email || 'Client' : 'Client'

async function clientsById(db: Admin, ids: string[]) {
    const map = new Map<string, { client_id: string; first_name: string; last_name: string; email: string; phone_number: string }>()
    const unique = [...new Set(ids)]
    for (let i = 0; i < unique.length; i += 200) {
        const { data } = await db.from('client_users').select('client_id, first_name, last_name, email, phone_number').in('client_id', unique.slice(i, i + 200))
        for (const c of data ?? []) map.set(c.client_id, c)
    }
    return map
}

/** True when the client belongs to this business (in its clientele). */
async function isOwnClient(db: Admin, businessId: string, clientId: string): Promise<boolean> {
    const { data } = await db.from('business_clients').select('id').eq('business', businessId).eq('client', clientId).limit(1)
    return !!data?.length
}

// ─── Overview ────────────────────────────────────────────────────────────────

export interface ReferralRow {
    id: string
    referrerName: string
    referredName: string
    status: 'booked' | 'completed' | 'void'
    voidReason: string | null
    appointmentStart: string | null
    friendDiscountCents: number
    createdAt: string
}

export interface ReferralClient {
    clientId: string
    name: string
    email: string
    code: string | null
    completedReferrals: number
}

export interface ReferralOverview {
    allowed: boolean
    program: ReferralProgram
    stats: ReferralStats
    referrals: ReferralRow[]
    clients: ReferralClient[]
    urlName: string
}

export async function getReferralOverview(): Promise<Result<{ overview: ReferralOverview }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const db = createAdminClient()

    const [business, programRes, referralsRes, rewardsRes, codesRes, clienteleRes] = await Promise.all([
        businessRow(db, businessId),
        db.from('referral_programs').select('*').eq('business_id', businessId).maybeSingle(),
        db.from('referrals').select('id, status, void_reason, referrer_client_id, referred_email, referred_phone, appointment_id, created_at').eq('business_id', businessId).order('created_at', { ascending: false }),
        db.from('referral_rewards').select('referral_id, recipient, status, redeemed_amount_cents').eq('business_id', businessId),
        db.from('referral_codes').select('client_id, code').eq('business_id', businessId),
        db.from('business_clients').select('client').eq('business', businessId),
    ])
    if (referralsRes.error || rewardsRes.error) return { ok: false, error: 'Could not load referrals. Please refresh.' }

    const referrals = referralsRes.data ?? []
    const apptIds = referrals.map(r => r.appointment_id)
    const appts = new Map<string, any>()
    for (let i = 0; i < apptIds.length; i += 200) {
        const { data } = await db.from('appointments')
            .select('id, status, start, paid_amount, refunded_amount, discount_cents, client_metadata')
            .in('id', apptIds.slice(i, i + 200))
        for (const a of data ?? []) appts.set(a.id, a)
    }
    const clientIds = [...referrals.map(r => r.referrer_client_id), ...(clienteleRes.data ?? []).map(c => c.client)]
    const clients = await clientsById(db, clientIds)

    const records: ReferralRecord[] = referrals.map(r => {
        const a = appts.get(r.appointment_id)
        return {
            id: r.id,
            status: r.status as ReferralRecord['status'],
            referrerClientId: r.referrer_client_id,
            referrerName: clientName(clients.get(r.referrer_client_id)),
            referredKey: r.referred_email || r.referred_phone,
            appointment: a ? { status: a.status, paidCents: Number(a.paid_amount ?? 0), refundedCents: Number(a.refunded_amount ?? 0) } : null,
        }
    })
    const rewards: RewardRecord[] = (rewardsRes.data ?? []).map(w => ({
        recipient: w.recipient as RewardRecord['recipient'],
        status: w.status as RewardRecord['status'],
        redeemedAmountCents: w.redeemed_amount_cents,
    }))
    const stats = referralStats(records, rewards)

    const completedByReferrer = new Map<string, number>()
    for (const r of records) if (r.status === 'completed') completedByReferrer.set(r.referrerClientId, (completedByReferrer.get(r.referrerClientId) ?? 0) + 1)
    const codes = new Map((codesRes.data ?? []).map(c => [c.client_id, c.code]))

    return {
        ok: true,
        overview: {
            allowed: isGrowth(business?.plan_type),
            program: referralProgramFromRow(programRes.data),
            stats,
            urlName: business?.url_name ?? '',
            referrals: referrals.slice(0, 50).map(r => {
                const a = appts.get(r.appointment_id)
                const cm = (a?.client_metadata ?? {}) as Record<string, string>
                return {
                    id: r.id,
                    referrerName: clientName(clients.get(r.referrer_client_id)),
                    referredName: `${cm.firstName ?? ''} ${cm.lastName ?? ''}`.trim() || 'New client',
                    status: r.status as ReferralRow['status'],
                    voidReason: r.void_reason,
                    appointmentStart: a?.start ?? null,
                    friendDiscountCents: Number(a?.discount_cents ?? 0),
                    createdAt: r.created_at,
                }
            }),
            clients: [...new Set((clienteleRes.data ?? []).map(c => c.client))]
                .map(id => ({ id, c: clients.get(id) }))
                .filter(({ c }) => !!c)
                .map(({ id, c }) => ({
                    clientId: id,
                    name: clientName(c),
                    email: c!.email ?? '',
                    code: codes.get(id) ?? null,
                    completedReferrals: completedByReferrer.get(id) ?? 0,
                }))
                .sort((a, b) => b.completedReferrals - a.completedReferrals || a.name.localeCompare(b.name)),
        },
    }
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveReferralProgram(input: ReferralProgram): Promise<Result<{ program: ReferralProgram }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const db = createAdminClient()
    const business = await businessRow(db, businessId)
    if (!isGrowth(business?.plan_type)) return { ok: false, error: GROWTH_ONLY }

    // Rebuilt from known fields so nothing else from the browser is stored.
    const program: ReferralProgram = {
        enabled: !!input.enabled,
        rewardType: input.rewardType === 'percent_off' ? 'percent_off' : 'amount_off',
        rewardValue: Math.round(Number(input.rewardValue)),
        recipients: input.recipients === 'referrer' || input.recipients === 'friend' ? input.recipients : 'both',
        rewardExpiryDays: input.rewardExpiryDays == null ? null : Math.round(Number(input.rewardExpiryDays)),
        maxRewardsPerReferrer: input.maxRewardsPerReferrer == null ? null : Math.round(Number(input.maxRewardsPerReferrer)),
    }
    const problems = referralProgramProblems(program)
    if (problems.length) return { ok: false, error: problems[0] }

    const { error } = await db.from('referral_programs')
        .upsert({ business_id: businessId, ...referralProgramToRow(program), updated_at: new Date().toISOString() })
    if (error) {
        console.error('Referral program save failed:', error)
        return { ok: false, error: 'Could not save. Please try again.' }
    }
    revalidatePath('/dashboard/referrals')
    return { ok: true, program }
}

// ─── Links ───────────────────────────────────────────────────────────────────

export interface ReferralLink {
    code: string
    /** The link the client shares: their booking page with ?ref=CODE. */
    shareUrl: string
    /** The client's private "My rewards" page. */
    rewardsUrl: string
}

async function linkFor(db: Admin, businessId: string, urlName: string, clientId: string): Promise<ReferralLink | null> {
    const { data, error } = await db.rpc('referral_code_for', { p_business: businessId, p_client: clientId })
    if (error || !data) {
        console.error('Referral code failed:', error?.message)
        return null
    }
    return {
        code: data.code,
        shareUrl: `${bookingUrl(urlName, '/book')}?ref=${encodeURIComponent(data.code)}`,
        rewardsUrl: bookingUrl(urlName, `/refer/${data.access_token}`),
    }
}

/** A client's referral link (their code is made the first time). */
export async function getReferralLinkAction(clientId: string): Promise<Result<{ link: ReferralLink }>> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const db = createAdminClient()
    const business = await businessRow(db, businessId)
    if (!isGrowth(business?.plan_type)) return { ok: false, error: GROWTH_ONLY }
    if (!(await isOwnClient(db, businessId, clientId))) return { ok: false, error: 'Client not found.' }
    const link = await linkFor(db, businessId, business!.url_name, clientId)
    if (!link) return { ok: false, error: 'Could not make a link. Please try again.' }
    revalidatePath('/dashboard/referrals')
    return { ok: true, link }
}

/** Emails a client their referral link and rewards page. */
export async function emailReferralLinkAction(clientId: string): Promise<Result> {
    const businessId = await ownBusiness()
    if (!businessId) return { ok: false, error: 'Please sign in again.' }
    const db = createAdminClient()
    const [business, programRes] = await Promise.all([
        businessRow(db, businessId),
        db.from('referral_programs').select('*').eq('business_id', businessId).maybeSingle(),
    ])
    if (!isGrowth(business?.plan_type)) return { ok: false, error: GROWTH_ONLY }
    const program = referralProgramFromRow(programRes.data)
    if (!program.enabled) return { ok: false, error: 'Turn on your referral program first.' }
    if (!(await isOwnClient(db, businessId, clientId))) return { ok: false, error: 'Client not found.' }
    const { data: client } = await db.from('client_users').select('first_name, email').eq('client_id', clientId).maybeSingle()
    const email = client?.email?.trim()
    if (!email) return { ok: false, error: 'This client has no email address.' }

    const link = await linkFor(db, businessId, business!.url_name, clientId)
    if (!link) return { ok: false, error: 'Could not make a link. Please try again.' }
    const businessName = business!.business_name ?? 'your stylist'
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
        from: FROM,
        to: email,
        subject: `${describeOffer(program)} at ${businessName}`,
        react: ReferralInviteEmail({
            clientFirstName: client?.first_name || 'there',
            businessName,
            offer: describeOffer(program),
            shareUrl: link.shareUrl,
            rewardsUrl: link.rewardsUrl,
            newReward: null,
        }),
    })
    if (error) return { ok: false, error: 'Could not send the email. Please try again.' }
    return { ok: true }
}
