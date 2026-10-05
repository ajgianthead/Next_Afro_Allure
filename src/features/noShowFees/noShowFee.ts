// No-show fee rules. Pure — used by booking settings, checkout, the booking
// site and the dashboard.
//
// How it works: when a business has a no-show fee, the card a client pays
// their deposit with is saved (Stripe `setup_future_usage: off_session`) and
// the fee agreed at booking is written onto that payment. If the client
// doesn't show, the business can charge that fee with one click. Nothing is
// ever charged automatically.

export interface NoShowFee {
    enabled: boolean
    /** 'flat': value is dollars (like flat deposits). 'percent': % of the booking total. */
    type: 'flat' | 'percent'
    value: number
}

export const NO_SHOW_FEE_OFF: NoShowFee = { enabled: false, type: 'flat', value: 0 }

export function parseNoShowFee(raw: unknown): NoShowFee {
    if (!raw || typeof raw !== 'object') return { ...NO_SHOW_FEE_OFF }
    const r = raw as any
    const type = r.type === 'percent' ? 'percent' : 'flat'
    const value = Number(r.value)
    const valid = Number.isFinite(value) && value > 0 && (type === 'flat' ? value <= 10000 : value <= 100)
    return { enabled: !!r.enabled && valid, type, value: valid ? value : 0 }
}

/** The fee in cents for a booking of `totalCents`. 0 when off or below Stripe's minimum. */
export function noShowFeeCents(fee: NoShowFee, totalCents: number): number {
    if (!fee.enabled) return 0
    const cents = fee.type === 'flat'
        ? Math.round(fee.value * 100)
        : Math.round(Math.max(0, totalCents) * Math.min(100, fee.value) / 100)
    return cents >= 50 ? cents : 0
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/** "$50" — what's shown to clients before they pay. */
export function describeNoShowFee(cents: number): string {
    return money(cents)
}

/** Disclosure shown with the deposit payment form. */
export function noShowDisclosure(cents: number, businessName?: string): string {
    return `${businessName ? `${businessName} charges a` : 'A'} ${money(cents)} no-show fee ${businessName ? '' : 'applies '}if you miss your appointment without cancelling. ` +
        `The card you pay your deposit with is saved securely by Stripe and is only charged if that happens.`
}

/** Metadata keys written on the deposit payment (Stripe metadata values are strings). */
export const META = {
    feeCents: 'no_show_fee_cents',
} as const

export function feeFromPaymentMetadata(metadata: Record<string, string> | null | undefined): number {
    const cents = Number(metadata?.[META.feeCents] ?? 0)
    return Number.isInteger(cents) && cents >= 50 ? cents : 0
}
