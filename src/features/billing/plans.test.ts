import { describe, expect, it } from 'vitest'
import {
    dollars, YEARLY_FREE_MONTHS, YEARLY_FULL_PRICE_CENTS, YEARLY_SAVINGS_CENTS, YEARLY_SAVINGS_PERCENT, yearlyPerMonth,
} from './plans'

describe('Growth plan pricing', () => {
    it('yearly saves $50 against $300 of monthly billing — 16.7%, shown as 17%, two months free', () => {
        expect(YEARLY_FULL_PRICE_CENTS).toBe(30000)
        expect(YEARLY_SAVINGS_CENTS).toBe(5000)
        expect(YEARLY_SAVINGS_PERCENT).toBe(17)
        expect(YEARLY_FREE_MONTHS).toBe(2)
    })
    it('formats prices', () => {
        expect(dollars(2500)).toBe('$25')
        expect(dollars(25000)).toBe('$250')
        expect(yearlyPerMonth()).toBe('$20.83')
    })
})
