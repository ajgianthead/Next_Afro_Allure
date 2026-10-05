import { describe, expect, it } from 'vitest'
import { gridKey } from './pricing'
import { hourlyRateCents, priceForTarget, rateCheckRows, verdictFor } from './rateCheck'

describe('hourlyRateCents', () => {
    it('divides what you keep by the hours worked', () => {
        // $300 for 6 hours with $30 of supplies → $45/hr
        expect(hourlyRateCents(30000, 360, 3000)).toBe(4500)
    })
    it('is 0 with no time', () => {
        expect(hourlyRateCents(30000, 0)).toBe(0)
    })
})

describe('priceForTarget', () => {
    it('rounds up to the next $5', () => {
        // $40/hr × 6h + $30 = $270
        expect(priceForTarget(4000, 360, 3000)).toBe(27000)
        // $40/hr × 5.5h = $220 + $12 = $232 → $235
        expect(priceForTarget(4000, 330, 1200)).toBe(23500)
    })
})

describe('verdictFor', () => {
    it('flags rates under the target', () => {
        expect(verdictFor(3000, 4000)).toBe('low')
        expect(verdictFor(3900, 4000)).toBe('ok')
        expect(verdictFor(5000, 4000)).toBe('good')
    })
})

describe('rateCheckRows', () => {
    const service = {
        price: 20000,
        length: 300,
        style_options: {
            enabled: true,
            sizes: [{ id: 's', label: 'Small' }, { id: 'm', label: 'Medium' }],
            lengths: [{ id: 'w', label: 'Waist' }],
            grid: {
                [gridKey('s', 'w')]: { price: 25000, extraMinutes: 180, available: true }, // 8h
                [gridKey('m', 'w')]: { price: 0, extraMinutes: 0, available: true }, // no price → not bookable
            },
            hair: { mode: 'included', price: 0, note: '' },
        },
    }

    it('lists each bookable combination with its hourly rate', () => {
        const rows = rateCheckRows(service, 4000, { suppliesCents: 1000, hairCents: 4000 })
        expect(rows).toHaveLength(1)
        // ($250 − $10 − $40 hair) / 8h = $25/hr
        expect(rows[0]).toMatchObject({ label: 'Small · Waist', minutes: 480, hourlyCents: 2500, verdict: 'low' })
        // $40 × 8 + $50 = $370
        expect(rows[0].suggestedCents).toBe(37000)
    })

    it('handles a plain service', () => {
        const rows = rateCheckRows({ price: 8000, length: 60 }, 4000, { suppliesCents: 0, hairCents: 0 })
        expect(rows).toEqual([expect.objectContaining({ label: 'This service', hourlyCents: 8000, verdict: 'good', suggestedCents: null })])
    })
})
