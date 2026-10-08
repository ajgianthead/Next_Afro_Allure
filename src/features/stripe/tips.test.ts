import { describe, expect, it } from 'vitest'
import {
    balanceIntentAmount,
    canEditTip,
    maxTipCents,
    parseTipDollars,
    presetTipCents,
    splitBalancePayment,
    tipBaseCents,
    tipFromMetadata,
    validateTip,
} from './tips'

const appt = (over: Partial<{ amount_due: number; deposit_price: number | null; paid_deposit: boolean | null; substraction: boolean | null }> = {}) => ({
    amount_due: 10000,
    deposit_price: 2000,
    paid_deposit: true,
    substraction: false,
    ...over,
})

describe('tipBaseCents (tips are worked out on the full appointment price)', () => {
    it('adds a paid deposit back onto the balance (deposit not yet subtracted from amount_due)', () => {
        // $100 total, $20 deposit paid → $80 balance, tip base $100.
        expect(tipBaseCents(appt())).toBe(10000)
    })
    it('adds a paid deposit back when amount_due was already reduced by it', () => {
        // substraction: amount_due already lowered to $80 when the deposit was paid.
        expect(tipBaseCents(appt({ amount_due: 8000, substraction: true }))).toBe(10000)
    })
    it('ignores an unpaid deposit', () => {
        expect(tipBaseCents(appt({ paid_deposit: false }))).toBe(10000)
        expect(tipBaseCents(appt({ paid_deposit: false, amount_due: 5000 }))).toBe(5000)
    })
    it('handles no deposit at all', () => {
        expect(tipBaseCents(appt({ deposit_price: null, paid_deposit: false }))).toBe(10000)
    })
})

describe('presetTipCents', () => {
    it('works out percentages to the cent', () => {
        expect(presetTipCents(10000, 15)).toBe(1500)
        expect(presetTipCents(10000, 20)).toBe(2000)
        expect(presetTipCents(12345, 20)).toBe(2469)
        expect(presetTipCents(333, 15)).toBe(50) // 49.95 → 50
    })
    it('never goes negative', () => {
        expect(presetTipCents(0, 20)).toBe(0)
        expect(presetTipCents(-500, 20)).toBe(0)
    })
})

describe('validateTip', () => {
    it('accepts zero and normal tips', () => {
        expect(validateTip(0, 10000)).toBeNull()
        expect(validateTip(2000, 10000)).toBeNull()
    })
    it('rejects negatives, fractions and non-numbers', () => {
        expect(validateTip(-1, 10000)).toMatch(/negative/)
        expect(validateTip(12.5, 10000)).toMatch(/valid/)
        expect(validateTip(NaN, 10000)).toMatch(/valid/)
        expect(validateTip(Infinity, 10000)).toMatch(/valid/)
        expect(validateTip('2000' as any, 10000)).toMatch(/valid/)
        expect(validateTip(null as any, 10000)).toMatch(/valid/)
        expect(validateTip(undefined as any, 10000)).toMatch(/valid/)
    })
    it('caps tips at the larger of the appointment total or $100', () => {
        expect(maxTipCents(5000)).toBe(10000)
        expect(maxTipCents(25000)).toBe(25000)
        expect(validateTip(10000, 5000)).toBeNull()
        expect(validateTip(10001, 5000)).toMatch(/limited to \$100\.00/)
        expect(validateTip(25000, 25000)).toBeNull()
        expect(validateTip(25001, 25000)).toMatch(/limited to \$250\.00/)
    })
})

describe('tipFromMetadata', () => {
    it('reads the tip in cents', () => {
        expect(tipFromMetadata({ tip_cents: '1500' })).toBe(1500)
        expect(tipFromMetadata({ tip_cents: '0' })).toBe(0)
    })
    it('treats missing or malformed values as no tip', () => {
        expect(tipFromMetadata(undefined)).toBe(0)
        expect(tipFromMetadata(null)).toBe(0)
        expect(tipFromMetadata({})).toBe(0)
        expect(tipFromMetadata({ tip_cents: '' })).toBe(0)
        expect(tipFromMetadata({ tip_cents: '-500' })).toBe(0)
        expect(tipFromMetadata({ tip_cents: '12.5' })).toBe(0)
        expect(tipFromMetadata({ tip_cents: 'abc' })).toBe(0)
    })
})

describe('splitBalancePayment (what the webhook records)', () => {
    it('separates the tip from the payment toward the appointment', () => {
        expect(splitBalancePayment(10000, { tip_cents: '2000' })).toEqual({ serviceCents: 8000, tipCents: 2000 })
    })
    it('treats payments without a tip (including ones made before tips existed) as all balance', () => {
        expect(splitBalancePayment(8000, {})).toEqual({ serviceCents: 8000, tipCents: 0 })
        expect(splitBalancePayment(8000, undefined)).toEqual({ serviceCents: 8000, tipCents: 0 })
    })
    it('never records a tip larger than the charge', () => {
        expect(splitBalancePayment(5000, { tip_cents: '9000' })).toEqual({ serviceCents: 0, tipCents: 5000 })
    })
})

describe('balanceIntentAmount (re-pricing an unpaid balance payment)', () => {
    const pi = (over: Partial<{ status: string; amount: number; metadata: Record<string, string> }> = {}) => ({
        status: 'requires_payment_method',
        amount: 8000,
        metadata: {} as Record<string, string>,
        ...over,
    })

    it('leaves a correct payment alone', () => {
        expect(balanceIntentAmount(pi(), 8000)).toBeNull()
        expect(balanceIntentAmount(pi({ amount: 10000, metadata: { tip_cents: '2000' } }), 8000)).toBeNull()
    })
    it('keeps the chosen tip when the page reloads (regression: it used to reset to the bare balance)', () => {
        const withTip = pi({ amount: 10000, metadata: { tip_cents: '2000' } })
        expect(balanceIntentAmount(withTip, 8000)).toBeNull()
    })
    it('re-prices when the balance changes, keeping the tip', () => {
        // A $15 late fee was added after the client picked a $20 tip.
        const withTip = pi({ amount: 10000, metadata: { tip_cents: '2000' } })
        expect(balanceIntentAmount(withTip, 9500)).toEqual({ amount: 11500, tipCents: 2000 })
    })
    it('re-prices a payment with no tip as before', () => {
        expect(balanceIntentAmount(pi(), 9500)).toEqual({ amount: 9500, tipCents: 0 })
    })
    it("doesn't touch a payment that's processing, paid or canceled", () => {
        for (const status of ['processing', 'succeeded', 'canceled', 'requires_capture']) {
            expect(balanceIntentAmount(pi({ status }), 9500)).toBeNull()
        }
    })
    it('only allows tip changes while the payment is unpaid', () => {
        expect(canEditTip('requires_payment_method')).toBe(true)
        expect(canEditTip('requires_confirmation')).toBe(true)
        expect(canEditTip('requires_action')).toBe(true)
        expect(canEditTip('processing')).toBe(false)
        expect(canEditTip('succeeded')).toBe(false)
        expect(canEditTip('canceled')).toBe(false)
    })
})

describe('parseTipDollars (custom tip field)', () => {
    it('parses dollar amounts into cents without float errors', () => {
        expect(parseTipDollars('10')).toBe(1000)
        expect(parseTipDollars('12.5')).toBe(1250)
        expect(parseTipDollars('12.50')).toBe(1250)
        expect(parseTipDollars('0.29')).toBe(29)
        expect(parseTipDollars('1.10')).toBe(110)
        expect(parseTipDollars('$15')).toBe(1500)
        expect(parseTipDollars(' 7.05 ')).toBe(705)
        expect(parseTipDollars('1,000')).toBe(100000)
        expect(parseTipDollars('5.')).toBe(500)
        expect(parseTipDollars('.5')).toBe(50)
        expect(parseTipDollars('.05')).toBe(5)
    })
    it('treats an empty field as no tip', () => {
        expect(parseTipDollars('')).toBe(0)
        expect(parseTipDollars('   ')).toBe(0)
    })
    it('rejects anything that is not a plain amount', () => {
        expect(parseTipDollars('-5')).toBeNull()
        expect(parseTipDollars('1.234')).toBeNull()
        expect(parseTipDollars('abc')).toBeNull()
        expect(parseTipDollars('1e3')).toBeNull()
        expect(parseTipDollars('.')).toBeNull()
        expect(parseTipDollars('5 dollars')).toBeNull()
    })
})
