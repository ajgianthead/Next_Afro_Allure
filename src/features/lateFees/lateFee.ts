// Late fee rules. Pure.
//
// The business sets the fee (and, for clients' benefit, how late counts as
// late). Whether a client was late is the business's call: they add the fee
// from the appointment, and it's added to the balance the client pays at the
// end (payment link / QR code) or in cash. Nothing is charged automatically.

export interface LateFee {
    enabled: boolean
    /** 'flat': value in dollars. 'percent': % of the service price. */
    type: 'flat' | 'percent'
    value: number
    /** Shown to clients ("more than 15 minutes late"). 0 = not stated. */
    graceMinutes: number
}

export const LATE_FEE_OFF: LateFee = { enabled: false, type: 'flat', value: 0, graceMinutes: 15 }

/** Reads the stored policy (also the old `{ enabled, fee }` shape, which had no UI). */
export function parseLateFee(raw: unknown): LateFee {
    if (!raw || typeof raw !== 'object') return { ...LATE_FEE_OFF }
    const r = raw as any
    const type = r.type === 'percent' ? 'percent' : 'flat'
    const value = Number(r.value)
    const valid = Number.isFinite(value) && value > 0 && (type === 'flat' ? value <= 1000 : value <= 100)
    const grace = Number(r.graceMinutes)
    return {
        enabled: !!r.enabled && valid,
        type,
        value: valid ? value : 0,
        graceMinutes: Number.isInteger(grace) && grace >= 0 && grace <= 240 ? grace : LATE_FEE_OFF.graceMinutes,
    }
}

/** The fee in cents for a service of `serviceCents`. 0 when off. */
export function lateFeeCents(fee: LateFee, serviceCents: number): number {
    if (!fee.enabled) return 0
    const cents = fee.type === 'flat'
        ? Math.round(fee.value * 100)
        : Math.round(Math.max(0, serviceCents) * Math.min(100, fee.value) / 100)
    return Math.max(0, cents)
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/** Policy line for clients, e.g. "Arriving more than 15 minutes late adds a $20 late fee." */
export function describeLateFee(fee: LateFee): string {
    if (!fee.enabled) return ''
    const amount = fee.type === 'flat' ? `a ${money(Math.round(fee.value * 100))}` : `a ${fee.value}%`
    const when = fee.graceMinutes > 0 ? `more than ${fee.graceMinutes} minutes late` : 'late'
    return `Arriving ${when} adds ${amount} late fee${fee.type === 'percent' ? ' (of the service price)' : ''}, paid with your balance.`
}
