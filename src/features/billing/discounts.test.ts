import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { describeDiscount, discountsDroppedOnYearly } from './discounts'

const discount = (id: string, coupon: Partial<Stripe.Coupon>) => ({ id, coupon }) as Stripe.Discount

describe('discountsDroppedOnYearly', () => {
    it('drops every promo, including a beta tester\'s free months', () => {
        const promo = discount('di_promo', { duration: 'repeating', duration_in_months: 3, amount_off: 2500 })
        const beta = discount('di_beta', { duration: 'repeating', duration_in_months: 3, percent_off: 100 })
        const legacy = discount('di_legacy', { duration: 'forever', percent_off: 100 })
        expect(discountsDroppedOnYearly([promo, beta, legacy])).toEqual([promo, beta, legacy])
    })

    it('handles a subscription with no discounts', () => {
        expect(discountsDroppedOnYearly([])).toEqual([])
        expect(discountsDroppedOnYearly(undefined)).toEqual([])
    })
})

describe('describeDiscount', () => {
    it('says what the discount is', () => {
        expect(describeDiscount(discount('a', { amount_off: 2500 }))).toBe('$25 off')
        expect(describeDiscount(discount('b', { amount_off: 1250 }))).toBe('$12.50 off')
        expect(describeDiscount(discount('c', { percent_off: 100 }))).toBe('100% off')
    })
})
