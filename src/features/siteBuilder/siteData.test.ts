import { describe, expect, it } from 'vitest'
import { gridKey } from '@/features/services/pricing'
import { cleanHandle, contactLinks, fallbackBio, formatHours, importFromSections, monogram, parseSiteData, priceLabel, ratingSummary } from './siteData'
import { contrastRatio, resolveTheme, siteFontWeights, toBookingTheme } from './themes'

const media = (url: string, kind = 'image') => ({ url, path: '', kind })

describe('parseSiteData', () => {
    it('fills defaults for empty or junk input', () => {
        const site = parseSiteData(null)
        expect(site.templateId).toBe('quickstart')
        expect(site.media.gallery).toEqual([])
        expect(site.content.bio).toBe('')
        expect(parseSiteData({ templateId: 'nope' }).templateId).toBe('quickstart')
    })

    it('keeps only https media and caps the gallery at 12', () => {
        const gallery = [
            media('javascript:alert(1)'),
            media('http://insecure.example/a.jpg'),
            ...Array.from({ length: 15 }, (_, i) => media(`https://cdn.example/${i}.jpg`)),
        ]
        const site = parseSiteData({ media: { gallery, logo: media('data:image/png;base64,xx'), cover: media('https://cdn.example/v.mp4', 'video') } })
        expect(site.media.gallery).toHaveLength(12)
        expect(site.media.gallery[0].url).toBe('https://cdn.example/0.jpg')
        expect(site.media.logo).toBeNull()
        expect(site.media.cover).toMatchObject({ kind: 'video' })
    })

    it('only keeps storage paths inside a business folder', () => {
        const ok = '0b7f6d3e-1c2a-4b5c-9d8e-112233445566/abc.jpg'
        expect(parseSiteData({ media: { logo: { url: 'https://x.co/a.jpg', path: ok } } }).media.logo?.path).toBe(ok)
        expect(parseSiteData({ media: { logo: { url: 'https://x.co/a.jpg', path: '../../etc' } } }).media.logo?.path).toBe('')
    })

    it('cleans contact details and drops invalid custom colors', () => {
        const site = parseSiteData({
            customColors: { bg: '#fff', fg: 'red', accent: '#000' },
            content: { instagram: 'https://instagram.com/kayla.braids/', tiktok: '@kay_b', email: 'not-an-email', phone: '(555) 123-4567<script>', bio: 'x'.repeat(2000) },
        })
        expect(site.customColors).toBeNull()
        expect(site.content.instagram).toBe('kayla.braids')
        expect(site.content.tiktok).toBe('kay_b')
        expect(site.content.email).toBe('')
        expect(site.content.phone).toBe('(555) 123-4567')
        expect(site.content.bio).toHaveLength(1200)
    })
})

describe('formatHours', () => {
    const open = (sh: number, eh: number, sm = 0) => ({ isChecked: true, timeRanges: [{ start: { hour: sh, minute: sm }, end: { hour: eh, minute: 0 } }] })
    const closed = { isChecked: false, timeRanges: [] }

    it('groups consecutive days with the same hours', () => {
        expect(formatHours([open(9, 17), open(9, 17), open(9, 17), open(9, 17), open(9, 17), open(10, 15), closed])).toEqual([
            { days: 'Mon–Fri', hours: '9am–5pm' },
            { days: 'Sat', hours: '10am–3pm' },
        ])
    })

    it('shows minutes, noon and split days', () => {
        const split = { isChecked: true, timeRanges: [{ start: { hour: 9, minute: 30 }, end: { hour: 12, minute: 0 } }, { start: { hour: 13, minute: 0 }, end: { hour: 18, minute: 0 } }] }
        expect(formatHours([split])).toEqual([{ days: 'Mon', hours: '9:30am–12pm, 1pm–6pm' }])
    })

    it('handles missing data', () => {
        expect(formatHours(undefined)).toEqual([])
        expect(formatHours([closed, closed])).toEqual([])
    })
})

describe('priceLabel', () => {
    it('shows a flat price and duration', () => {
        expect(priceLabel({ price: 8500, length: 90 })).toEqual({ price: '$85', duration: '1h 30m' })
    })

    it('shows "from" the lowest Smart Pricing price, with + when time varies', () => {
        const style_options = {
            enabled: true,
            sizes: [{ id: 's', label: 'Small' }, { id: 'l', label: 'Large' }],
            lengths: [],
            grid: {
                [gridKey('s', null)]: { price: 30000, extraMinutes: 120, available: true },
                [gridKey('l', null)]: { price: 18000, extraMinutes: 0, available: true },
            },
            hair: { mode: 'none', price: 0, note: '' },
        }
        expect(priceLabel({ price: 0, length: 180, style_options })).toEqual({ price: 'from $180', duration: '3h+' })
    })
})

describe('fallbackBio', () => {
    it('lists up to three services and the city', () => {
        expect(fallbackBio('Kayla Braids', ['Knotless Braids'], 'Atlanta, GA')).toBe('Kayla Braids offers knotless braids in Atlanta, GA. Book online in a few taps.')
        expect(fallbackBio('K', ['A', 'B'], null)).toBe('K offers a and b. Book online in a few taps.')
        expect(fallbackBio('K', ['A', 'B', 'C', 'D'], null)).toBe('K offers a, b, c and more. Book online in a few taps.')
        expect(fallbackBio('K', [], null)).toBe('K offers beauty services. Book online in a few taps.')
    })
})

describe('small helpers', () => {
    it('averages ratings and ignores unrated reviews', () => {
        expect(ratingSummary([{ name: 'a', rating: 5, text: 'x' }, { name: 'b', rating: 4, text: 'y' }, { name: 'c', rating: 0, text: 'z' }])).toEqual({ average: 4.5, count: 2 })
        expect(ratingSummary([])).toBeNull()
    })

    it('builds contact links and monograms', () => {
        expect(contactLinks({ tagline: '', bio: '', phone: '(555) 123-4567', email: '', instagram: 'kay', tiktok: '' }).map(l => l.href))
            .toEqual(['https://instagram.com/kay', 'tel:5551234567'])
        expect(monogram("Kayla's Braids")).toBe('KB')
        expect(monogram('Locs')).toBe('LO')
        expect(cleanHandle('@bad handle!')).toBe('')
    })
})

describe('importFromSections', () => {
    it('brings over headline, bio, contact and images from the old editor', () => {
        const result = importFromSections([
            { type: 'hero', data: { headline: 'Braids that last', image_url: 'https://cdn.example/hero.jpg' } },
            { type: 'about', data: { bio: '<p>Ten years of <b>braiding</b>&nbsp;in Atlanta.</p>', image_url: 'https://cdn.example/me.jpg' } },
            { type: 'contact', data: { phone: '555-0100', instagram: '@kay' } },
            { type: 'image', url: 'https://cdn.example/1.jpg' },
            { type: 'image', url: 'https://cdn.example/1.jpg' },
        ])
        expect(result.content).toMatchObject({ tagline: 'Braids that last', bio: 'Ten years of braiding in Atlanta.', phone: '555-0100', instagram: 'kay' })
        expect(result.images).toEqual(['https://cdn.example/hero.jpg', 'https://cdn.example/me.jpg', 'https://cdn.example/1.jpg'])
    })

    it('ignores junk', () => {
        expect(importFromSections(null)).toEqual({ content: {}, images: [] })
    })
})

describe('themes', () => {
    it('falls back to the template default scheme and font', () => {
        const theme = resolveTheme('maison-tresse', 'unknown', null, undefined)
        expect(theme.bg).toBe('#f4ede2')
        expect(theme.headingFont).toContain('Fraunces')
    })

    it('uses valid custom colors and picks readable button text', () => {
        const theme = resolveTheme('quickstart', 'custom', { bg: '#000000', fg: '#ffffff', accent: '#ffd400' }, 'poppins')
        expect(theme.accent).toBe('#ffd400')
        expect(theme.accentFg).toBe('#111111')
        expect(theme.dark).toBe(true)
    })

    it('keeps every preset readable', async () => {
        const { TEMPLATES } = await import('./themes')
        for (const t of TEMPLATES) for (const s of t.schemes) {
            expect(contrastRatio(s.bg, s.fg), `${t.id}/${s.id}`).toBeGreaterThanOrEqual(7)
        }
    })

    it('maps onto the booking page theme', () => {
        const booking = toBookingTheme(resolveTheme('fade-house', 'charcoal-red', null, 'anton-inter'))
        expect(booking).toMatchObject({ primaryColor: '#d6332a', backgroundColor: '#141414', fontFamily: 'Anton', bodyFontFamily: 'Inter', buttonRadius: '2px' })
    })

    it('knows which weights single-weight fonts have', () => {
        expect(siteFontWeights('Anton')).toEqual([400])
        expect(siteFontWeights('Comic Sans')).toBeUndefined()
    })
})
