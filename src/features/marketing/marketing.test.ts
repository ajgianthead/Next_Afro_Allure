import { describe, expect, it } from 'vitest'
import { FEATURES } from './features'
import { SPECIALTIES } from './specialties'
import { FEATURE_LINKS, SPECIALTY_LINKS, SWITCH_LINKS } from './menu'
import { STYLIST_MEDIA } from './media'

const pages = [...Object.values(SPECIALTIES), ...Object.values(FEATURES)]
const allHrefs = new Set([...SPECIALTY_LINKS, ...FEATURE_LINKS, ...SWITCH_LINKS].map(l => l.href))

describe('marketing pages', () => {
    it('every menu link has a page', () => {
        for (const l of SPECIALTY_LINKS) expect(SPECIALTIES).toHaveProperty(l.href.replace('/for/', ''))
        for (const l of FEATURE_LINKS) expect(FEATURES).toHaveProperty(l.href.replace('/features/', ''))
    })

    it('every page is in the menu', () => {
        for (const slug of Object.keys(SPECIALTIES)) expect(allHrefs.has(`/for/${slug}`)).toBe(true)
        for (const slug of Object.keys(FEATURES)) expect(allHrefs.has(`/features/${slug}`)).toBe(true)
    })

    it.each(pages.map(p => [p.slug, p] as const))('%s links only to real pages and has its parts', (_slug, p) => {
        for (const href of p.related) expect(allHrefs.has(href)).toBe(true)
        expect(p.pains).toHaveLength(3)
        expect(p.benefits).toHaveLength(6)
        expect(p.faq.length).toBeGreaterThanOrEqual(4)
        expect(p.metaDescription.length).toBeLessThanOrEqual(220)
        expect(p.kind === 'specialty' ? p.sampleMenus : p.steps).toBeTruthy()
    })

    it('sample menus have a cell for every column', () => {
        for (const p of pages) for (const m of p.sampleMenus?.menus ?? []) {
            for (const row of m.rows) expect(row.cells).toHaveLength(m.columns.length)
        }
    })

    it('every stylist photo or reel records when permission was given', () => {
        for (const m of STYLIST_MEDIA) {
            expect(m.permissionGiven).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            expect(m.credit.name.trim()).not.toBe('')
        }
    })
})
