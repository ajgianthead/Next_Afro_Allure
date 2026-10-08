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
    it('takes no platform fee on tips, but passes processing through on the whole charge', () => {
        // $80 balance + $20 tip = $100 charge. Processing on $100 = $3.20.
        expect(calculateApplicationFee(10000, 'GROWTH', 2000)).toBe(320)
        // Starter: 1% on the $80 balance only (80¢), not on the tip.
        expect(calculateApplicationFee(10000, 'STARTER', 2000)).toBe(400)
        // No tip behaves exactly as before.
        expect(calculateApplicationFee(8000, 'STARTER', 0)).toBe(calculateApplicationFee(8000, 'STARTER'))
    })
    it('ignores a tip that is negative or larger than the charge', () => {
        expect(calculateApplicationFee(8000, 'STARTER', -500)).toBe(342)
        // Whole charge treated as tip: no platform fee at all.
        expect(calculateApplicationFee(8000, 'STARTER', 999999)).toBe(262)
    })
    it('never exceeds the charge', () => {
        expect(calculateApplicationFee(25, 'STARTER')).toBe(25)
        expect(calculateApplicationFee(0, 'GROWTH')).toBe(0)
    })
})
