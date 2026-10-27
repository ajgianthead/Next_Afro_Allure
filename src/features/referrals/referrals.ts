// Client-to-client referral rules and math. Pure: used by server actions,
// emails, the dashboard and the booking page. Attribution and the reward
// lifecycle run in the database (supabase/migrations/20261026000000_referrals.sql)
// so every booking and completion path follows the same rules.

import type { RewardType } from '@/features/loyalty/loyalty'

export type Recipients = 'both' | 'referrer' | 'friend'

export interface ReferralProgram {
    enabled: boolean
    rewardType: RewardType
    /** Cents for amount_off, 1-100 for percent_off. */
    rewardValue: number
    recipients: Recipients
    /** Days the referrer's code stays valid; null = never expires. */
    rewardExpiryDays: number | null
    /** Most rewards one client can earn by referring; null = no limit. */
    maxRewardsPerReferrer: number | null
}

export const DEFAULT_REFERRAL_PROGRAM: ReferralProgram = {
    enabled: false,
    rewardType: 'amount_off',
    rewardValue: 1000,
    recipients: 'both',
    rewardExpiryDays: 180,
    maxRewardsPerReferrer: null,
}

export function referralProgramFromRow(row: any): ReferralProgram {
    if (!row) return { ...DEFAULT_REFERRAL_PROGRAM }
    const recipients: Recipients = row.recipients === 'referrer' || row.recipients === 'friend' ? row.recipients : 'both'
    return {
        enabled: !!row.enabled,
        rewardType: row.reward_type === 'percent_off' ? 'percent_off' : 'amount_off',
        rewardValue: Number(row.reward_value ?? DEFAULT_REFERRAL_PROGRAM.rewardValue),
        recipients,
        rewardExpiryDays: row.reward_expiry_days == null ? null : Number(row.reward_expiry_days),
        maxRewardsPerReferrer: row.max_rewards_per_referrer == null ? null : Number(row.max_rewards_per_referrer),
    }
}

export function referralProgramToRow(p: ReferralProgram) {
    return {
        enabled: p.enabled,
        reward_type: p.rewardType,
        reward_value: p.rewardValue,
        recipients: p.recipients,
        reward_expiry_days: p.rewardExpiryDays,
        max_rewards_per_referrer: p.maxRewardsPerReferrer,
    }
}

/** What's wrong with a program before it can be saved (empty = fine). */
export function referralProgramProblems(p: ReferralProgram): string[] {
    const problems: string[] = []
    if (!Number.isInteger(p.rewardValue) || p.rewardValue <= 0) problems.push('Set a reward amount.')
    if (p.rewardType === 'percent_off' && p.rewardValue > 100) problems.push('A percentage reward can be at most 100%.')
    if (p.rewardType === 'amount_off' && p.rewardValue > 100000) problems.push('Keep the reward under $1,000.')
    if (p.rewardExpiryDays !== null && (!Number.isInteger(p.rewardExpiryDays) || p.rewardExpiryDays < 1)) problems.push('Pick how long rewards last.')
    if (p.maxRewardsPerReferrer !== null && (!Number.isInteger(p.maxRewardsPerReferrer) || p.maxRewardsPerReferrer < 1 || p.maxRewardsPerReferrer > 100)) {
        problems.push('The limit per client must be between 1 and 100.')
    }
    return problems
}

const dollars = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/** "$10 off" / "15% off". */
export function describeReferralReward(p: Pick<ReferralProgram, 'rewardType' | 'rewardValue'>): string {
    return p.rewardType === 'percent_off' ? `${p.rewardValue}% off` : `${dollars(p.rewardValue)} off`
}

/** One line for clients: "Give $10 off, get $10 off". */
export function describeOffer(p: ReferralProgram): string {
    const reward = describeReferralReward(p)
    if (p.recipients === 'referrer') return `Get ${reward} for every friend who books`
    if (p.recipients === 'friend') return `Give friends ${reward} their first visit`
    return `Give ${reward}, get ${reward}`
}

export const friendGetsReward = (p: Pick<ReferralProgram, 'recipients'>) => p.recipients !== 'referrer'
export const referrerGetsReward = (p: Pick<ReferralProgram, 'recipients'>) => p.recipients !== 'friend'

/** Referral codes are upper case, letters, digits and one dash (BRI-7F3K). */
export function normalizeReferralCode(code: string | null | undefined): string {
    const c = String(code ?? '').trim().toUpperCase()
    return /^[A-Z0-9]{1,8}-[A-Z0-9]{3,8}$/.test(c) ? c : ''
}

/** The friend's discount on their first booking, as the database works it out (cents). */
export function friendDiscountCents(
    p: Pick<ReferralProgram, 'rewardType' | 'rewardValue'>,
    appt: { amountDueCents: number; requireDeposit: boolean; subtraction: boolean; depositCents: number },
): number {
    const raw = p.rewardType === 'amount_off' ? p.rewardValue : Math.round(appt.amountDueCents * p.rewardValue / 100)
    // The deposit is credited against the balance in both deposit modes.
    const cap = appt.amountDueCents - (appt.requireDeposit ? appt.depositCents : 0)
    return Math.max(0, Math.min(raw, cap))
}

// ─── Remembering the code on the booking page ────────────────────────────────

/** How long a shared link counts after someone opens it. */
export const REFERRAL_TTL_DAYS = 30
export const referralStorageKey = (scope: string) => `aa.ref.${scope}`

export function encodeStoredReferral(code: string, now: Date = new Date()): string {
    return JSON.stringify({ code, savedAt: now.toISOString() })
}

/** The saved code, unless it's missing, malformed or older than REFERRAL_TTL_DAYS. */
export function decodeStoredReferral(raw: string | null, now: Date = new Date()): string {
    if (!raw) return ''
    try {
        const { code, savedAt } = JSON.parse(raw)
        const age = now.getTime() - new Date(savedAt).getTime()
        if (!Number.isFinite(age) || age < 0 || age > REFERRAL_TTL_DAYS * 86400000) return ''
        return normalizeReferralCode(code)
    } catch {
        return ''
    }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

/** A referral with its referred appointment, as read from the database. */
export interface ReferralRecord {
    id: string
    status: 'booked' | 'completed' | 'void'
    referrerClientId: string
    referrerName: string
    referredKey: string
    appointment: { status: string; paidCents: number; refundedCents: number } | null
}

export interface RewardRecord {
    recipient: 'referrer' | 'friend'
    status: 'pending' | 'available' | 'redeemed' | 'expired' | 'void'
    redeemedAmountCents: number | null
}

export interface ReferralStats {
    referredClients: number
    referredBookings: number
    completedReferrals: number
    /** completed / referred bookings, 0-1 (0 when there are no bookings). */
    conversionRate: number
    /** What referred clients paid for their referred visit, minus refunds (cents). */
    revenueCents: number
    rewardsEarned: number
    rewardsRedeemed: number
    /** Discounts actually taken: friends' first-visit discounts and used referrer codes (cents). */
    redeemedValueCents: number
    /** revenue - redeemed discounts (cents). */
    roiCents: number
    topReferrers: { clientId: string; name: string; completed: number; revenueCents: number }[]
}

/**
 * Referral numbers from real records. Revenue only counts completed referred
 * appointments; a friend's discount only counts once their visit is completed
 * (status 'redeemed'); void rewards never count.
 */
export function referralStats(referrals: ReferralRecord[], rewards: RewardRecord[], topN = 5): ReferralStats {
    const referredClients = new Set(referrals.filter(r => r.status !== 'void').map(r => r.referredKey)).size
    const completed = referrals.filter(r => r.status === 'completed')
    const revenueOf = (r: ReferralRecord) => r.appointment && r.appointment.status === 'COMPLETED'
        ? Math.max(0, r.appointment.paidCents - r.appointment.refundedCents)
        : 0
    const revenueCents = completed.reduce((sum, r) => sum + revenueOf(r), 0)

    const earned = rewards.filter(w => w.status === 'available' || w.status === 'redeemed' || w.status === 'expired')
    const redeemed = rewards.filter(w => w.status === 'redeemed')
    const redeemedValueCents = redeemed.reduce((sum, w) => sum + Math.max(0, w.redeemedAmountCents ?? 0), 0)

    const byReferrer = new Map<string, { clientId: string; name: string; completed: number; revenueCents: number }>()
    for (const r of completed) {
        const row = byReferrer.get(r.referrerClientId) ?? { clientId: r.referrerClientId, name: r.referrerName, completed: 0, revenueCents: 0 }
        row.completed += 1
        row.revenueCents += revenueOf(r)
        byReferrer.set(r.referrerClientId, row)
    }
    const topReferrers = [...byReferrer.values()]
        .sort((a, b) => b.completed - a.completed || b.revenueCents - a.revenueCents || a.name.localeCompare(b.name))
        .slice(0, topN)

    return {
        referredClients,
        referredBookings: referrals.length,
        completedReferrals: completed.length,
        conversionRate: referrals.length ? completed.length / referrals.length : 0,
        revenueCents,
        rewardsEarned: earned.length,
        rewardsRedeemed: redeemed.length,
        redeemedValueCents,
        roiCents: revenueCents - redeemedValueCents,
        topReferrers,
    }
}
