import { describe, expect, it } from 'vitest'
import { calculateDeposit, fillGrid, gridKey, parsePrep, parseStyleOptions, quoteBooking, QuoteError, startingPrice } from './pricing'

const sizes = [{ id: 's', label: 'Small' }, { id: 'm', label: 'Medium' }]
const lengths = [{ id: 'sh', label: 'Shoulder' }, { id: 'w', label: 'Waist' }]

const knotless = {
    price: 20000,
    length: 300,
    style_options: {
        enabled: true,
        sizes,
        lengths,
        grid: {
            [gridKey('s', 'sh')]: { price: 25000, extraMinutes: 60, available: true },
            [gridKey('s', 'w')]: { price: 30000, extraMinutes: 120, available: true },
            [gridKey('m', 'sh')]: { price: 20000, extraMinutes: 0, available: true },
            [gridKey('m', 'w')]: { price: 24000, extraMinutes: 60, available: false },
        },
        hair: { mode: 'optional', price: 4000, note: '1B pre-stretched' },
    },
}

describe('quoteBooking', () => {
    it('prices a plain service exactly as before', () => {
        const q = quoteBooking({ price: 8000, length: 180 }, null, [{ id: 'a', name: 'Boho curls', price: 2000 }])
        expect(q).toMatchObject({ styleCents: 8000, addonCents: 2000, totalCents: 10000, durationMinutes: 180, selectedOptions: null })
    })

    it('uses the size × length cell price and extra time', () => {
        const q = quoteBooking(knotless, { sizeId: 's', lengthId: 'w' })
        expect(q.totalCents).toBe(30000)
        expect(q.durationMinutes).toBe(420)
        expect(q.selectedOptions?.size?.label).toBe('Small')
        expect(q.selectedOptions?.length?.label).toBe('Waist')
    })

    it('adds optional hair only when chosen', () => {
        expect(quoteBooking(knotless, { sizeId: 'm', lengthId: 'sh', addHair: true }).totalCents).toBe(24000)
        expect(quoteBooking(knotless, { sizeId: 'm', lengthId: 'sh' }).totalCents).toBe(20000)
    })

    it('rejects missing or unavailable choices', () => {
        expect(() => quoteBooking(knotless, { sizeId: 's' })).toThrow(QuoteError)
        expect(() => quoteBooking(knotless, { sizeId: 'm', lengthId: 'w' })).toThrow(/isn't available/)
        expect(() => quoteBooking(knotless, { sizeId: 'x', lengthId: 'w' })).toThrow(/size/)
    })

    it('ignores a disabled options block', () => {
        expect(quoteBooking({ ...knotless, style_options: { ...knotless.style_options, enabled: false } }, null).totalCents).toBe(20000)
    })

    it('shows the lowest available price as "from"', () => {
        expect(startingPrice(knotless)).toBe(20000)
    })
})

describe('calculateDeposit', () => {
    it("handles 'percent' (what settings save) and 'percentage'", () => {
        expect(calculateDeposit({ enabled: true, settings: { type: 'percent', value: 20 } }, 30000)).toBe(6000)
        expect(calculateDeposit({ enabled: true, settings: { type: 'percentage', value: 20 } }, 30000)).toBe(6000)
    })
    it('treats flat deposits as dollars', () => {
        expect(calculateDeposit({ enabled: true, settings: { type: 'flat', value: 25 } }, 30000)).toBe(2500)
    })
    it('never charges more than the total, or anything when disabled', () => {
        expect(calculateDeposit({ enabled: true, settings: { type: 'flat', value: 500 } }, 8000)).toBe(8000)
        expect(calculateDeposit({ enabled: false, settings: { type: 'percent', value: 20 } }, 8000)).toBe(0)
    })
})

describe('editor helpers', () => {
    it('quick-fills the grid with steps (can go down for bigger sizes)', () => {
        const grid = fillGrid(sizes, lengths, { basePrice: 30000, sizeStep: -5000, lengthStep: 4000, lengthMinutesStep: 60 })
        expect(grid[gridKey('s', 'sh')]).toEqual({ price: 30000, extraMinutes: 0, available: true })
        expect(grid[gridKey('m', 'w')]).toEqual({ price: 29000, extraMinutes: 60, available: true })
    })
    it('drops invalid stored options and prep', () => {
        expect(parseStyleOptions({ enabled: true, sizes: [], lengths: [] })).toBeNull()
        expect(parsePrep({ instructions: '  ', checklist: ['', '  '] })).toBeNull()
        expect(parsePrep({ instructions: 'Come washed', checklist: ['Detangled'] })).toEqual({ instructions: 'Come washed', checklist: ['Detangled'], requireAgreement: true })
    })
})

describe('describing a booking', () => {
    it('labels the service with the chosen options', async () => {
        const { serviceLabel, clientPrepFor } = await import('./pricing')
        const q = quoteBooking(knotless, { sizeId: 's', lengthId: 'w' })
        expect(serviceLabel('Knotless', q.selectedOptions)).toBe('Knotless — Small · Waist · bringing own hair')
        expect(serviceLabel('Silk press', null)).toBe('Silk press')
        const prep = clientPrepFor({ prep: { instructions: 'Come washed', checklist: ['Detangled'] } }, q.selectedOptions)
        expect(prep?.checklist).toEqual(['Bring your hair: 1B pre-stretched', 'Detangled'])
    })
})
