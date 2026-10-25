import { describe, expect, it } from 'vitest'
import { gridKey, type StyleOptions } from './pricing'
import { serviceFormProblem, toServicePayload } from './serviceForm'
import type { ServiceData } from './types'

const OFF: StyleOptions = { enabled: false, sizes: [], lengths: [], grid: {}, hair: { mode: 'none', price: 0, note: '' } }
const SMART: StyleOptions = {
    enabled: true,
    sizes: [{ id: 's', label: 'Small' }, { id: 'm', label: 'Medium' }],
    lengths: [{ id: 'w', label: 'Waist' }],
    grid: {
        [gridKey('s', 'w')]: { price: 30000, extraMinutes: 120, available: true },
        [gridKey('m', 'w')]: { price: 22000, extraMinutes: 0, available: true },
    },
    hair: { mode: 'optional', price: 3000, note: '' },
}
const PREP = { instructions: 'Come with dry hair', checklist: [], requireAgreement: false }

const form = (patch: Partial<ServiceData> = {}): ServiceData => ({
    id: 'svc', name: 'Knotless', description: '', price: 9900, length: 240, addons: [], categories: [],
    photo_url: null, imagePath: null, business: 'b', availability: 'a', ...patch,
})

describe('toServicePayload', () => {
    it('keeps a flat price and clears style options when Smart Pricing is off', () => {
        const payload = toServicePayload(form(), { ...SMART, enabled: false }, PREP)
        expect(payload).toMatchObject({ price: 9900, style_options: null, prep: PREP })
    })

    it('stores the lowest bookable combination as the price when Smart Pricing is on', () => {
        const payload = toServicePayload(form(), SMART, PREP)
        expect(payload.price).toBe(22000)
        expect(payload.style_options).toBe(SMART)
    })

    it('ignores switched-off combinations for the starting price', () => {
        const grid = { ...SMART.grid, [gridKey('m', 'w')]: { price: 22000, extraMinutes: 0, available: false } }
        expect(toServicePayload(form(), { ...SMART, grid }, PREP).price).toBe(30000)
    })
})

describe('serviceFormProblem', () => {
    it('needs a name', () => {
        expect(serviceFormProblem(form({ name: '  ' }), OFF)).toBe('Give this service a name.')
    })

    it('passes a plain service', () => {
        expect(serviceFormProblem(form(), OFF)).toBeNull()
    })

    it('reports grid problems first', () => {
        expect(serviceFormProblem(form(), { ...SMART, sizes: [], lengths: [] })).toBe('Add at least one size or length.')
    })

    it('needs a base duration with Smart Pricing', () => {
        expect(serviceFormProblem(form({ length: 0 }), SMART)).toBe('Set a base duration for this service.')
    })
})
