import { describe, expect, it } from 'vitest'
import { gridKey } from '@/features/services/pricing'
import { quoteForBooking, selectedServiceText } from './useBookingQuote'

const plain = { id: 'silk', name: 'Silk press', price: 17000, length: 120, addons: [{ id: 'trim', name: 'Trim', price: 2500 }], style_options: null } as any
const knotless = {
    id: 'knot', name: 'Knotless', price: 0, length: 240, addons: [],
    style_options: {
        enabled: true,
        sizes: [{ id: 's', label: 'Small' }, { id: 'm', label: 'Medium' }],
        lengths: [{ id: 'w', label: 'Waist' }],
        grid: {
            [gridKey('s', 'w')]: { price: 30000, extraMinutes: 120, available: true },
            [gridKey('m', 'w')]: { price: 16000, extraMinutes: 0, available: true },
        },
        hair: { mode: 'optional', price: 3000, note: '' },
    },
} as any
const data = (patch: Record<string, unknown>) => ({ services: [plain, knotless], selectedService: '', selectedAddons: [] as string[], styleSelection: null, ...patch })

describe('selectedServiceText (the bar shown after picking a service on the website)', () => {
    it('shows a $170 service as $170, not cents', () => {
        expect(selectedServiceText(data({ selectedService: 'silk' }))).toEqual({ price: '$170', options: '' })
    })

    it('adds add-ons to the total', () => {
        expect(selectedServiceText(data({ selectedService: 'silk', selectedAddons: ['trim'] }))?.price).toBe('$195')
    })

    it('shows "from" the lowest price until a size and length are picked', () => {
        expect(selectedServiceText(data({ selectedService: 'knot' }))).toEqual({ price: 'from $160', options: '' })
    })

    it('uses the size × length price and braiding hair once chosen', () => {
        const text = selectedServiceText(data({ selectedService: 'knot', styleSelection: { sizeId: 's', lengthId: 'w', addHair: true } }))
        expect(text?.price).toBe('$330')
        expect(text?.options).toMatch(/Small/)
        expect(text?.options).toMatch(/Waist/)
    })

    it('is empty when no service is selected', () => {
        expect(selectedServiceText(data({}))).toBeNull()
    })
})

describe('quoteForBooking', () => {
    it('needs a size and length before a size/length-priced service can be booked', () => {
        expect(quoteForBooking(data({ selectedService: 'knot' })).quote).toBeNull()
        expect(quoteForBooking(data({ selectedService: 'knot', styleSelection: { sizeId: 'm', lengthId: 'w' } })).quote?.durationMinutes).toBe(240)
    })
})
