import { describe, expect, it } from 'vitest'
import { describeLateFee, lateFeeCents, parseLateFee } from './lateFee'

describe('late fee', () => {
    it('reads settings, including the old shape', () => {
        expect(parseLateFee({ enabled: false })).toEqual({ enabled: false, type: 'flat', value: 0, graceMinutes: 15 })
        expect(parseLateFee({ enabled: true, fee: 20 }).enabled).toBe(false) // old shape had no amount UI
        expect(parseLateFee({ enabled: true, type: 'flat', value: 20, graceMinutes: 10 })).toEqual({ enabled: true, type: 'flat', value: 20, graceMinutes: 10 })
        expect(parseLateFee({ enabled: true, type: 'percent', value: 500 }).enabled).toBe(false)
    })
    it('computes the fee', () => {
        expect(lateFeeCents({ enabled: true, type: 'flat', value: 20, graceMinutes: 15 }, 30000)).toBe(2000)
        expect(lateFeeCents({ enabled: true, type: 'percent', value: 10, graceMinutes: 15 }, 30000)).toBe(3000)
        expect(lateFeeCents({ enabled: false, type: 'flat', value: 20, graceMinutes: 15 }, 30000)).toBe(0)
    })
    it('describes it for clients', () => {
        expect(describeLateFee({ enabled: true, type: 'flat', value: 20, graceMinutes: 15 }))
            .toBe('Arriving more than 15 minutes late adds a $20 late fee, paid with your balance.')
        expect(describeLateFee({ enabled: true, type: 'percent', value: 10, graceMinutes: 0 }))
            .toBe('Arriving late adds a 10% late fee (of the service price), paid with your balance.')
    })
})
