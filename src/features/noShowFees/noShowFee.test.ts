import { describe, expect, it } from 'vitest'
import { feeFromPaymentMetadata, noShowFeeCents, parseNoShowFee } from './noShowFee'

describe('no-show fee', () => {
    it('parses settings safely', () => {
        expect(parseNoShowFee(null).enabled).toBe(false)
        expect(parseNoShowFee({ enabled: true, type: 'flat', value: 50 })).toEqual({ enabled: true, type: 'flat', value: 50 })
        expect(parseNoShowFee({ enabled: true, type: 'percent', value: 150 }).enabled).toBe(false)
        expect(parseNoShowFee({ enabled: true, type: 'flat', value: -5 }).enabled).toBe(false)
    })
    it('computes the fee', () => {
        expect(noShowFeeCents({ enabled: true, type: 'flat', value: 50 }, 30000)).toBe(5000)
        expect(noShowFeeCents({ enabled: true, type: 'percent', value: 25 }, 30000)).toBe(7500)
        expect(noShowFeeCents({ enabled: false, type: 'flat', value: 50 }, 30000)).toBe(0)
        expect(noShowFeeCents({ enabled: true, type: 'percent', value: 1 }, 1000)).toBe(0) // under Stripe's 50¢ minimum
    })
    it('reads the fee agreed at booking from the payment', () => {
        expect(feeFromPaymentMetadata({ no_show_fee_cents: '5000' })).toBe(5000)
        expect(feeFromPaymentMetadata({})).toBe(0)
        expect(feeFromPaymentMetadata({ no_show_fee_cents: 'abc' })).toBe(0)
    })
})
