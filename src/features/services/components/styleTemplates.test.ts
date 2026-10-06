import { describe, expect, it } from 'vitest'
import { applyTemplate, STYLE_TEMPLATES } from './styleTemplates'
import { styleOptionProblems } from './StyleOptionsEditor'
import { gridKey, parseStyleOptions, quoteBooking } from '../pricing'

describe('style templates', () => {
    it('every template produces bookable, problem-free options', () => {
        for (const t of STYLE_TEMPLATES) {
            const { styleOptions, baseMinutes } = applyTemplate(t)
            expect(styleOptionProblems(styleOptions), t.name).toEqual([])
            expect(baseMinutes, t.name).toBeGreaterThan(0)
            const parsed = parseStyleOptions(styleOptions)
            expect(parsed, t.name).not.toBeNull()
            for (const cell of Object.values(styleOptions.grid)) {
                expect(cell.price, t.name).toBeGreaterThan(0)
                expect(cell.extraMinutes, t.name).toBeGreaterThanOrEqual(0)
            }
        }
    })

    it('knotless: small/shoulder takes the full time, jumbo/shoulder is fastest', () => {
        const knotless = STYLE_TEMPLATES.find(t => t.id === 'knotless')!
        const { styleOptions, baseMinutes } = applyTemplate(knotless)
        const [small] = styleOptions.sizes
        const jumbo = styleOptions.sizes[styleOptions.sizes.length - 1]
        const [shoulder] = styleOptions.lengths
        const service = { price: 0, length: baseMinutes, style_options: styleOptions }
        expect(quoteBooking(service, { sizeId: small.id, lengthId: shoulder.id }).durationMinutes).toBe(480)
        expect(quoteBooking(service, { sizeId: jumbo.id, lengthId: shoulder.id }).durationMinutes).toBe(240)
        expect(styleOptions.grid[gridKey(small.id, shoulder.id)].price).toBe(30000)
    })
})

describe('styleOptionProblems', () => {
    it('flags missing prices, duplicate names and hair without a fee', () => {
        const sizes = [{ id: 'a', label: 'Small' }, { id: 'b', label: 'small' }]
        const problems = styleOptionProblems({
            enabled: true, sizes, lengths: [], grid: { [gridKey('a', null)]: { price: 1000, extraMinutes: 0, available: true } },
            hair: { mode: 'optional', price: 0, note: '' },
        })
        expect(problems.join(' ')).toMatch(/same name/)
        expect(problems.join(' ')).toMatch(/no price/)
        expect(problems.join(' ')).toMatch(/supplying hair/)
    })
    it('ignores switched-off combinations', () => {
        expect(styleOptionProblems({
            enabled: true, sizes: [{ id: 'a', label: 'S' }, { id: 'b', label: 'M' }], lengths: [],
            grid: { [gridKey('a', null)]: { price: 1000, extraMinutes: 0, available: true }, [gridKey('b', null)]: { price: NaN, extraMinutes: 0, available: false } },
            hair: { mode: 'none', price: 0, note: '' },
        })).toEqual([])
    })
})
