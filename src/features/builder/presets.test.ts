import { describe, expect, it } from 'vitest'
import { defaultSiteData, type SiteData } from '@/features/siteBuilder/siteData'
import { TEMPLATE_IDS } from '@/features/siteBuilder/themes'
import { presetPage, templateToBuilder } from './presets'
import { sanitizePage } from './page'
import { SAMPLE_INFO } from './sample'

const photo = (n: string) => ({ url: `https://example.com/${n}.jpg`, path: `biz/${n}.jpg`, kind: 'image' as const })

describe('presetPage', () => {
    it('builds every template as a valid page with unique section ids', () => {
        for (const id of TEMPLATE_IDS) {
            const page = presetPage(id, SAMPLE_INFO)
            expect(sanitizePage(page).ok).toBe(true)
            const ids = page.content.map(c => (c.props as { id: string }).id)
            expect(new Set(ids).size).toBe(ids.length)
            expect(page.content[0].type).toBe('Navbar')
            expect(page.content.at(-1)?.type).toBe('Footer')
            expect((page.root.props as { templateId: string }).templateId).toBe(id)
        }
    })

    it('uses each template’s layouts', () => {
        const layouts = (id: (typeof TEMPLATE_IDS)[number]) => Object.fromEntries(presetPage(id).content.map(c => [c.type, (c.props as { layout: number }).layout]))
        expect(layouts('maison-tresse')).toMatchObject({ Navbar: 2, Hero: 2, Services: 1, Gallery: 9 })
        expect(layouts('fade-house')).toMatchObject({ Navbar: 9, Hero: 5, Services: 14, Footer: 17 })
    })
})

describe('templateToBuilder', () => {
    const site: SiteData = {
        ...defaultSiteData('coil-crown'),
        scheme: 'plum-night',
        fontPairing: 'poppins',
        media: { logo: photo('logo'), cover: photo('cover'), about: photo('about'), gallery: [photo('g1'), photo('g2')] },
        content: { tagline: 'Locs that last', bio: 'Ten years of locs. Starter to mature.', phone: '555-0100', email: 'a@b.co', instagram: 'kay', tiktok: '' },
        bookingMatchesSite: false,
    }
    const page = templateToBuilder(site, SAMPLE_INFO)
    const section = (type: string) => page.content.find(c => c.type === type)?.props as any

    it('keeps the template, colors, fonts, logo and booking setting', () => {
        expect(page.root.props).toMatchObject({ templateId: 'coil-crown', scheme: 'plum-night', fontPairing: 'poppins', logo: photo('logo'), bookingMatchesSite: false })
    })
    it('carries the text and photos into the sections', () => {
        expect(section('Hero').content).toMatchObject({ heading: 'Locs that last', subheading: 'Ten years of locs.', media: photo('cover') })
        expect(section('About').content).toMatchObject({ body: 'Ten years of locs. Starter to mature.', media: photo('about') })
        expect(section('Gallery').content.photos).toEqual([photo('g1'), photo('g2')])
        expect(section('Footer').content).toMatchObject({ phone: '555-0100', email: 'a@b.co', socials: [{ kind: 'instagram', url: 'https://instagram.com/kay' }] })
    })
    it('leaves empty text to the section’s defaults', () => {
        const blank = templateToBuilder(defaultSiteData('quickstart'), SAMPLE_INFO)
        const hero = blank.content.find(c => c.type === 'Hero')?.props as any
        expect(hero.content.heading).toBe('')
        expect(hero.content.primary).toEqual({ label: 'Book an appointment', href: 'book' })
    })
})
