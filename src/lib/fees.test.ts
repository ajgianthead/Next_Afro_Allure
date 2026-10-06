import { describe, expect, it } from 'vitest'
import { calculateApplicationFee, calculatePlatformFee, estimateStripeProcessingFee, platformFeePercent } from './fees'

describe('fees (0% on Growth, 1% on Starter, Stripe processing at cost)', () => {
    it('charges no platform fee on Growth and 1% on Starter', () => {
        expect(platformFeePercent('GROWTH')).toBe(0)
        expect(calculatePlatformFee(8000, 'GROWTH')).toBe(0)
        expect(calculatePlatformFee(8000, 'STARTER')).toBe(80)
    })
    it('passes through Stripe 2.9% + 30¢', () => {
        expect(estimateStripeProcessingFee(8000)).toBe(262)
    })
    it('application fee on an $80 payment is $2.62 on Growth and $3.42 on Starter', () => {
        expect(calculateApplicationFee(8000, 'GROWTH')).toBe(262)
        expect(calculateApplicationFee(8000, 'STARTER')).toBe(342)
    })
    it('never exceeds the charge', () => {
        expect(calculateApplicationFee(25, 'STARTER')).toBe(25)
        expect(calculateApplicationFee(0, 'GROWTH')).toBe(0)
    })
})
