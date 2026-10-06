import { describe, expect, it } from 'vitest'
import { ACUITY, AFROALLURE_GROWTH_MONTHLY, AFROALLURE_GROWTH_YEARLY, GLOSSGENIUS, monthlyCost, STYLESEAT } from './competitors'

// $4,000/month in card payments: 27 appointments at about $150.
const usage = { payments: 27, average: 150, marketplaceClients: 0 }
const round = (n: number) => Math.round(n * 100) / 100

describe('monthlyCost', () => {
    it('matches the worked example on the pricing pages', () => {
        expect(round(monthlyCost(AFROALLURE_GROWTH_MONTHLY, usage))).toBe(150.55)
        expect(round(monthlyCost(AFROALLURE_GROWTH_YEARLY, usage))).toBe(146.38)
        expect(round(monthlyCost(STYLESEAT, usage))).toBe(148.4)
        expect(round(monthlyCost(GLOSSGENIUS, usage))).toBe(133.3)
        expect(round(monthlyCost(ACUITY, usage))).toBe(145.55)
    })
    it("adds StyleSeat's new-client fee (30% of the first visit, capped at $50)", () => {
        expect(round(monthlyCost(STYLESEAT, { ...usage, marketplaceClients: 2 }))).toBe(148.4 + 90)
        expect(STYLESEAT.newClientFee!(300)).toBe(50)
    })
})
