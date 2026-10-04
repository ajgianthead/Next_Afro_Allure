import { describe, expect, it } from 'vitest'
import { calculateApplicationFee, calculatePlatformFee, estimateStripeProcessingFee } from './fees'

describe('fees (1% + Stripe processing at cost)', () => {
    it('charges 1% platform fee', () => {
        expect(calculatePlatformFee(8000)).toBe(80)
    })
    it('passes through Stripe 2.9% + 30¢', () => {
        expect(estimateStripeProcessingFee(8000)).toBe(262)
    })
    it('application fee on an $80 payment is $3.42', () => {
        expect(calculateApplicationFee(8000)).toBe(342)
    })
    it('never exceeds the charge', () => {
        expect(calculateApplicationFee(25)).toBe(25)
        expect(calculateApplicationFee(0)).toBe(0)
    })
})
