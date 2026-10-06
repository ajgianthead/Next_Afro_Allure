// Loyalty program rules and math. Pure — used by server actions, emails and
// the dashboard. Earning itself happens in the database (a trigger on
// appointments), so every way an appointment gets completed counts once.

export type EarnType = 'visits' | 'spend'
export type RewardType = 'amount_off' | 'percent_off'

export interface LoyaltyProgram {
    enabled: boolean
    earnType: EarnType
    visitsRequired: number
    /** Cents. */
    spendThresholdCents: number
    rewardType: RewardType
    /** Cents for amount_off, 1-100 for percent_off. */
    rewardValue: number
    /** null = rewards never expire. */
    rewardExpiryDays: number | null
    rebookBonusEnabled: boolean
    rebookWithinDays: number
}

export const DEFAULT_PROGRAM: LoyaltyProgram = {
    enabled: false,
    earnType: 'visits',
    visitsRequired: 5,
    spendThresholdCents: 50000,
    rewardType: 'amount_off',
    rewardValue: 2000,
    rewardExpiryDays: 180,
    rebookBonusEnabled: false,
    rebookWithinDays: 42,
}

export interface LoyaltyReward {
    id: string
    code: string
    status: 'available' | 'used' | 'expired' | 'void'
    rewardType: RewardType
    value: number
    issuedAt: string
    expiresAt: string | null
    usedAt: string | null
    usedAmountCents: number | null
}

export function programFromRow(row: any): LoyaltyProgram {
    if (!row) return { ...DEFAULT_PROGRAM }
    return {
        enabled: !!row.enabled,
        earnType: row.earn_type === 'spend' ? 'spend' : 'visits',
        visitsRequired: Number(row.visits_required ?? DEFAULT_PROGRAM.visitsRequired),
        spendThresholdCents: Number(row.spend_threshold_cents ?? DEFAULT_PROGRAM.spendThresholdCents),
        rewardType: row.reward_type === 'percent_off' ? 'percent_off' : 'amount_off',
        rewardValue: Number(row.reward_value ?? DEFAULT_PROGRAM.rewardValue),
        rewardExpiryDays: row.reward_expiry_days == null ? null : Number(row.reward_expiry_days),
        rebookBonusEnabled: !!row.rebook_bonus_enabled,
        rebookWithinDays: Number(row.rebook_within_days ?? DEFAULT_PROGRAM.rebookWithinDays),
    }
}

export function programToRow(p: LoyaltyProgram) {
    return {
        enabled: p.enabled,
        earn_type: p.earnType,
        visits_required: p.visitsRequired,
        spend_threshold_cents: p.spendThresholdCents,
        reward_type: p.rewardType,
        reward_value: p.rewardValue,
        reward_expiry_days: p.rewardExpiryDays,
        rebook_bonus_enabled: p.rebookBonusEnabled,
        rebook_within_days: p.rebookWithinDays,
    }
}

export function rewardFromRow(row: any): LoyaltyReward {
    return {
        id: row.id,
        code: row.code,
        status: row.status,
        rewardType: row.reward_type === 'percent_off' ? 'percent_off' : 'amount_off',
        value: Number(row.value),
        issuedAt: row.issued_at,
        expiresAt: row.expires_at ?? null,
        usedAt: row.used_at ?? null,
        usedAmountCents: row.used_amount_cents ?? null,
    }
}

/** Problems with a program's settings, for the editor and the server. */
export function programProblems(p: LoyaltyProgram): string[] {
    const problems: string[] = []
    const int = (n: number) => Number.isInteger(n)
    if (p.earnType === 'visits' && (!int(p.visitsRequired) || p.visitsRequired < 1 || p.visitsRequired > 50))
        problems.push('Visits needed must be between 1 and 50.')
    if (p.earnType === 'spend' && (!int(p.spendThresholdCents) || p.spendThresholdCents < 100))
        problems.push('Spend amount must be at least $1.')
    if (p.rewardType === 'amount_off' && (!int(p.rewardValue) || p.rewardValue < 100))
        problems.push('The reward must be at least $1 off.')
    if (p.rewardType === 'percent_off' && (!int(p.rewardValue) || p.rewardValue < 1 || p.rewardValue > 100))
        problems.push('Percent off must be between 1 and 100.')
    if (p.rewardExpiryDays != null && (!int(p.rewardExpiryDays) || p.rewardExpiryDays < 1 || p.rewardExpiryDays > 3650))
        problems.push('Expiry must be between 1 and 3650 days.')
    if (!int(p.rebookWithinDays) || p.rebookWithinDays < 1 || p.rebookWithinDays > 365)
        problems.push('Rebook window must be between 1 and 365 days.')
    return problems
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/** "$20 off" / "15% off" */
export function describeReward(r: { rewardType: RewardType; rewardValue?: number; value?: number }): string {
    const v = r.rewardValue ?? r.value ?? 0
    return r.rewardType === 'percent_off' ? `${v}% off` : `${money(v)} off`
}

/** "every 5 visits" / "every $500 spent" */
export function describeEarning(p: LoyaltyProgram): string {
    return p.earnType === 'visits'
        ? `every ${p.visitsRequired} visit${p.visitsRequired === 1 ? '' : 's'}`
        : `every ${money(p.spendThresholdCents)} spent`
}

/** Discount (cents) a reward gives on a bill, never more than the bill. */
export function rewardDiscountCents(reward: { rewardType: RewardType; value: number }, billCents: number): number {
    const bill = Math.max(0, Math.round(billCents))
    const off = reward.rewardType === 'percent_off'
        ? Math.round(bill * Math.min(100, Math.max(0, reward.value)) / 100)
        : Math.round(reward.value)
    return Math.min(bill, Math.max(0, off))
}

export interface Progress {
    /** Banked toward the next reward (visits, or cents for spend programs). */
    banked: number
    /** Needed for a reward. */
    target: number
    /** Still to go. */
    remaining: number
    /** 0-1 */
    fraction: number
}

export function progressFor(p: LoyaltyProgram, bank: { visits: number; spendCents: number }): Progress {
    const target = p.earnType === 'visits' ? p.visitsRequired : p.spendThresholdCents
    const raw = p.earnType === 'visits' ? bank.visits : bank.spendCents
    const banked = Math.max(0, Math.min(raw, target))
    return { banked, target, remaining: Math.max(0, target - banked), fraction: target > 0 ? banked / target : 0 }
}

/** "2 more visits" / "$120 more" */
export function describeRemaining(p: LoyaltyProgram, progress: Progress): string {
    if (p.earnType === 'visits') return `${progress.remaining} more visit${progress.remaining === 1 ? '' : 's'}`
    return `${money(progress.remaining)} more`
}

/** A reward that can be used right now. */
export function isRewardUsable(r: Pick<LoyaltyReward, 'status' | 'expiresAt'>, now: Date = new Date()): boolean {
    if (r.status !== 'available') return false
    return !r.expiresAt || new Date(r.expiresAt).getTime() > now.getTime()
}

/** Normalises what a client types: " aa-7f3kq2 " → "AA-7F3KQ2". */
export function normalizeRewardCode(code: string): string {
    const c = code.trim().toUpperCase().replace(/\s+/g, '')
    return c.startsWith('AA-') ? c : c.startsWith('AA') ? `AA-${c.slice(2)}` : `AA-${c}`
}
