// Tips on end-of-appointment (balance) payments. Pure — shared by the payment
// page, the checkout actions and the Stripe webhook.
//
// A tip rides on the same PaymentIntent as the balance: the PaymentIntent's
// amount is balance + tip, and the tip is recorded in its metadata
// (`tip_cents`) by the server. AfroAllure takes no platform fee on tips; only
// Stripe's processing on the tip is passed through (see calculateApplicationFee).

import { remainingBalance } from '@/features/services/pricing'

/** Suggested tip percentages shown on the payment page. */
export const TIP_PRESET_PERCENTS = [15, 20, 25] as const

/** Tips are capped at the larger of the appointment total or $100, to catch typos. */
export const MIN_TIP_CAP_CENTS = 10000

/** Metadata key on the balance PaymentIntent holding the tip, in cents. */
export const TIP_METADATA_KEY = 'tip_cents'

type BalanceRow = Parameters<typeof remainingBalance>[0]

/**
 * What tip percentages are worked out on: the appointment's full price
 * (balance still due plus any deposit already paid), so a client who paid a
 * big deposit isn't nudged toward a tiny tip.
 */
export function tipBaseCents(appt: BalanceRow): number {
    const deposit = appt.paid_deposit ? Math.max(0, Math.round(Number(appt.deposit_price ?? 0))) : 0
    return remainingBalance(appt) + deposit
}

export function presetTipCents(baseCents: number, percent: number): number {
    return Math.max(0, Math.round((baseCents * percent) / 100))
}

export function maxTipCents(baseCents: number): number {
    return Math.max(MIN_TIP_CAP_CENTS, Math.round(baseCents))
}

/** Error message for an invalid tip, or null when it's fine. */
export function validateTip(tipCents: unknown, baseCents: number): string | null {
    if (typeof tipCents !== 'number' || !Number.isInteger(tipCents)) return 'Enter a valid tip amount.'
    if (tipCents < 0) return "A tip can't be negative."
    const max = maxTipCents(baseCents)
    if (tipCents > max) return `Tips are limited to $${(max / 100).toFixed(2)}.`
    return null
}

/** The tip recorded on a PaymentIntent's metadata; 0 when missing or malformed. */
export function tipFromMetadata(metadata: Record<string, string> | null | undefined): number {
    const raw = metadata?.[TIP_METADATA_KEY]
    if (!raw || !/^\d+$/.test(raw)) return 0
    return Number(raw)
}

/**
 * Splits a paid balance PaymentIntent into the part that pays for the
 * appointment and the tip. The tip can never exceed what was actually charged.
 */
export function splitBalancePayment(amountCents: number, metadata: Record<string, string> | null | undefined): { serviceCents: number; tipCents: number } {
    const amount = Math.max(0, Math.round(amountCents))
    const tipCents = Math.min(tipFromMetadata(metadata), amount)
    return { serviceCents: amount - tipCents, tipCents }
}

/**
 * PaymentIntent statuses where the amount (and so the tip) can still change —
 * the same "unpaid" statuses the checkout actions already re-price in.
 */
export const TIP_EDITABLE_STATUSES = ['requires_payment_method', 'requires_confirmation', 'requires_action'] as const

export function canEditTip(status: string): boolean {
    return (TIP_EDITABLE_STATUSES as readonly string[]).includes(status)
}

/**
 * The amount an unpaid balance PaymentIntent should carry: the current
 * balance plus the tip already chosen. Returns null when it's already right
 * or can no longer change. The balance can move after the link was opened (a
 * late fee or reward), and the tip must survive that and page reloads.
 */
export function balanceIntentAmount(
    existing: { status: string; amount: number; metadata: Record<string, string> | null | undefined },
    balanceCents: number,
): { amount: number; tipCents: number } | null {
    if (!canEditTip(existing.status)) return null
    const tipCents = tipFromMetadata(existing.metadata)
    const amount = balanceCents + tipCents
    return existing.amount === amount ? null : { amount, tipCents }
}

/** "12.50" → 1250. Returns null for anything that isn't a plain dollar amount. */
export function parseTipDollars(input: string): number | null {
    const s = input.trim().replace(/^\$/, '').replace(/,/g, '')
    if (s === '') return 0
    if (!/^(\d+(\.\d{0,2})?|\.\d{1,2})$/.test(s)) return null
    const [whole, frac = ''] = s.split('.')
    return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}
