'use client'

// The six templates as starter pages for the builder, and the conversion of a
// template site (web_editors.site_data) into a builder page. Built in the
// browser: section definitions are client modules.

import type { SiteData, SiteInfo, SiteMedia } from '@/features/siteBuilder/siteData'
import { contactLinks } from '@/features/siteBuilder/siteData'
import { resolveTheme, templateMeta, type SiteTheme, type TemplateId } from '@/features/siteBuilder/themes'
import { DEFAULT_THEME, newSectionProps, type BuilderData } from './config'
import { SECTION_BY_TYPE } from './sections'
import type { SectionStyle, SectionType, SiteThemeProps, TextStyle } from './types'

interface PresetSection {
    type: SectionType
    layout: number
    content?: Record<string, unknown>
    /** Style tweaks; gets the resolved theme for color choices. */
    style?: (theme: SiteTheme) => Partial<SectionStyle>
}

/** Everything a preset can fill in from the business and its old template site. */
interface Fill {
    info: SiteInfo | null
    site: SiteData | null
}

const firstSentence = (text: string) => text.split(/(?<=[.!?])\s/)[0] ?? ''
const inverted = (): Partial<SectionStyle> => ({ invert: true })
const tinted = (): Partial<SectionStyle> => ({ tint: true })
/** The old templates' Book band: the accent color, or the text color for the dark ones. */
const accentBand = (): Partial<SectionStyle> => ({ accentBg: true, tint: false })
const darkBand = (): Partial<SectionStyle> => ({ invert: true, tint: false })
/** The template's headline look on the hero. */
const headline = (heading: TextStyle, more?: (t: SiteTheme) => Partial<SectionStyle>) => (t: SiteTheme): Partial<SectionStyle> => {
    const extra = more?.(t) ?? {}
    return { ...extra, text: { ...(extra.text ?? {}), heading } }
}
/** The template's accent block (Rouge Maison's cover); follows the theme's colors. */
const accentBlock = (): Partial<SectionStyle> => ({ accentBg: true })

function hero(f: Fill, eyebrow: (place: string | null) => string, primary: string, secondary: string, layout: number, extra?: Partial<PresetSection>): PresetSection {
    const bio = f.site?.content.bio || ''
    return {
        type: 'Hero',
        layout,
        content: {
            eyebrow: eyebrow(f.info?.place ?? null),
            heading: f.site?.content.tagline || '',
            subheading: bio ? firstSentence(bio) : '',
            primary: { label: primary, href: 'book' },
            secondary: { label: f.info && !f.info.services.length ? '' : secondary, href: '#services' },
            media: f.site?.media.cover ?? null,
            media2: f.site?.media.gallery[0] ?? null,
            media3: f.site?.media.gallery[1] ?? null,
            slides: f.site?.media.gallery.slice(0, 4) ?? [],
        },
        ...extra,
    }
}

const services = (layout: number, eyebrow: string, heading: string, extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'Services', layout, content: { eyebrow, heading }, ...extra })
const gallery = (f: Fill, layout: number, eyebrow: string, heading: string, extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'Gallery', layout, content: { eyebrow, heading, photos: f.site?.media.gallery ?? [] }, ...extra })
const about = (f: Fill, layout: number, eyebrow: string, extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'About', layout, content: { eyebrow, heading: '', body: f.site?.content.bio ?? '', media: f.site?.media.about ?? f.site?.media.cover ?? null }, ...extra })
const reviews = (layout: number, eyebrow: string, heading = 'What clients say', extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'Reviews', layout, content: { eyebrow, heading }, ...extra })
const hours = (eyebrow: string, heading = 'Hours & policies', extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'Hours', layout: 1, content: { eyebrow, heading }, ...extra })
const bookBand = (heading: string, extra?: Partial<PresetSection>): PresetSection =>
    ({ type: 'BookNow', layout: 1, content: { heading }, ...extra })

function socials(f: Fill) {
    const links = f.site ? contactLinks(f.site.content) : []
    return links.filter(l => l.label === 'Instagram' || l.label === 'TikTok').map(l => ({ kind: l.label === 'Instagram' ? 'instagram' : 'tiktok', url: l.href }))
}
const navbar = (f: Fill, layout: number): PresetSection => ({ type: 'Navbar', layout, content: { socials: socials(f) } })
const footer = (f: Fill, layout: number, extra?: Partial<PresetSection>): PresetSection => ({
    type: 'Footer',
    layout,
    content: { phone: f.site?.content.phone ?? '', email: f.site?.content.email ?? '', socials: socials(f), photos: (f.site?.media.gallery ?? []).slice(0, 6) },
    ...extra,
})

/** Each template as a list of sections and layouts, matching the old template's order and look. */
const PRESETS: Record<TemplateId, (f: Fill) => PresetSection[]> = {
    'maison-tresse': f => [
        navbar(f, 2),
        hero(f, p => (p ? `Atelier · ${p}` : 'By appointment'), 'Reserve a chair', 'View services', 2, { style: headline({ size: 84, weight: 400, leading: 1.02 }) }),
        services(1, 'The menu', 'Services'),
        gallery(f, 9, 'Portfolio', 'Recent work', { style: tinted }),
        about(f, 2, 'The artist'),
        reviews(1, 'Kind words', undefined, { style: tinted }),
        hours('Visit'),
        bookBand('Your chair is waiting.', { style: darkBand }),
        footer(f, 1),
    ],
    'fade-house': f => [
        navbar(f, 9),
        hero(f, p => p ?? 'Book your cut', 'Book now', 'Prices', 5, { style: headline({ size: 96, weight: 400, case: 'upper', leading: 0.92, tracking: 0.01 }) }),
        services(14, 'The menu', 'Cuts & prices'),
        gallery(f, 1, 'Fresh', 'Recent cuts', { style: tinted }),
        about(f, 2, 'The barber'),
        reviews(2, 'Word on the street', 'Reviews'),
        hours('Pull up', 'Hours & shop rules', { style: tinted }),
        bookBand('Next chair’s open.', { style: accentBand }),
        footer(f, 17),
    ],
    'atelier-clair': f => [
        navbar(f, 1),
        hero(f, p => p ?? 'Welcome', 'Book an appointment', 'Explore services', 6, { style: headline({ size: 68, weight: 500, leading: 1.05 }) }),
        services(4, 'Services', 'What we offer'),
        gallery(f, 1, 'Portfolio', 'Recent work'),
        about(f, 2, 'About', { style: tinted }),
        reviews(2, 'Reviews'),
        hours('Visit'),
        bookBand('Take a little time for you.', { style: accentBand }),
        footer(f, 2),
    ],
    'rouge-maison': f => [
        navbar(f, 1),
        hero(f, () => '', 'Book a session', 'View services', 2, { style: headline({ size: 96, weight: 700, italic: true, leading: 0.95 }, accentBlock) }),
        services(14, 'The edit', 'Services'),
        gallery(f, 11, 'Lookbook', 'The looks', { style: tinted }),
        about(f, 3, 'Behind the brush'),
        reviews(1, 'In their words', undefined, { style: tinted }),
        hours('Details', 'Hours & policies'),
        bookBand('Your close-up awaits.', { style: darkBand }),
        footer(f, 1),
    ],
    'coil-crown': f => [
        navbar(f, 1),
        hero(f, p => p ?? 'Crowns by appointment', 'Book your crown', 'See services', 11, { style: headline({ size: 84, weight: 400, leading: 1 }) }),
        services(4, 'Services', 'The menu', { style: tinted }),
        gallery(f, 9, 'Portfolio', 'Crowns we love'),
        about(f, 2, 'Your loctician', { style: tinted }),
        reviews(2, 'Love notes', 'From the chair'),
        hours('Visit'),
        bookBand('Let’s grow something beautiful.', { style: accentBand }),
        footer(f, 2),
    ],
    quickstart: f => [
        navbar(f, 1),
        hero(f, p => p ?? 'Book online', 'Book an appointment', 'Services', 6, { style: headline({ size: 60, weight: 700 }) }),
        services(4, 'Services', 'Services & prices', { style: tinted }),
        gallery(f, 1, 'Gallery', 'My work'),
        about(f, 2, 'About me', { style: tinted }),
        reviews(2, 'Reviews'),
        hours('Visit', 'Hours, location & policies', { style: tinted }),
        bookBand('Ready when you are.', { style: accentBand }),
        footer(f, 1),
    ],
}

/** Text looks a whole template shares (Fade House's capitals). */
const TEMPLATE_TEXT: Partial<Record<TemplateId, Record<string, TextStyle>>> = {
    'fade-house': { heading: { case: 'upper' } },
}

/** Sections whose builder isn't available yet are left out; they appear once added. */
function build(list: PresetSection[], theme: SiteTheme, idPrefix: string, shared: Record<string, TextStyle> = {}): BuilderData['content'] {
    return list.flatMap((s, i) => {
        const def = SECTION_BY_TYPE[s.type]
        if (!def) return []
        const base = newSectionProps(def)
        // Empty strings/arrays leave the section's own default (and its fallbacks to the business's details).
        const content = Object.fromEntries(Object.entries(s.content ?? {}).filter(([, v]) => v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)))
        return [{
            type: s.type,
            props: {
                id: `${s.type}-${idPrefix}-${i}`,
                ...base,
                layout: s.layout,
                content: { ...(base.content as object), ...content },
                style: (() => {
                    const own = s.style?.(theme) ?? {}
                    const text = { ...shared, ...(own.text ?? {}) }
                    for (const role of Object.keys(shared)) if (own.text?.[role]) text[role] = { ...shared[role], ...own.text[role] }
                    return { ...base.style, ...own, text: { ...base.style.text, ...text } }
                })(),
            },
        }]
    }) as unknown as BuilderData['content']
}

function themeProps(templateId: TemplateId, site: SiteData | null): SiteThemeProps {
    return {
        ...DEFAULT_THEME,
        templateId,
        scheme: site?.templateId === templateId ? site.scheme : '',
        customColors: site?.templateId === templateId ? site.customColors : null,
        fontPairing: site?.templateId === templateId ? site.fontPairing : '',
        logo: (site?.media.logo ?? null) as SiteMedia | null,
        bookingMatchesSite: site?.bookingMatchesSite ?? true,
    }
}

/** A template's starter page, filled with the business's details (and its template site's text and photos, if any). */
export function presetPage(templateId: TemplateId, info: SiteInfo | null = null, site: SiteData | null = null): BuilderData {
    const root = themeProps(templateId, site)
    const theme = resolveTheme(root.templateId, root.scheme, root.customColors, root.fontPairing)
    return {
        root: { props: root },
        content: build(PRESETS[templateId]?.(({ info, site })) ?? PRESETS.quickstart({ info, site }), theme, templateId, TEMPLATE_TEXT[templateId]),
        zones: {},
    } as unknown as BuilderData
}

/** A template site (site_data) as a builder page: the same template's starter page with its colors, fonts, text and photos. */
export function templateToBuilder(site: SiteData, info: SiteInfo | null = null): BuilderData {
    return presetPage(templateMeta(site.templateId).id, info, site)
}

export const PRESET_IDS = Object.keys(PRESETS) as TemplateId[]
