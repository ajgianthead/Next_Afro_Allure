import type { BookingTheme } from '@/features/automatedBooking/types/theme'

/**
 * The six site templates, their preset color schemes and the font pairings
 * businesses can choose from. Pure module: safe on server and client.
 * Template ids match the Custom Builder's Puck templates
 * (src/features/editor/templates), so a Growth business can carry on there.
 */

export const TEMPLATE_IDS = ['maison-tresse', 'fade-house', 'atelier-clair', 'rouge-maison', 'coil-crown', 'quickstart'] as const
export type TemplateId = typeof TEMPLATE_IDS[number]

export interface SchemeColors {
    bg: string
    fg: string
    accent: string
}

export interface ColorScheme extends SchemeColors {
    id: string
    name: string
}

export interface FontPairing {
    id: string
    name: string
    heading: { family: string; weights: number[]; fallback: string }
    body: { family: string; weights: number[]; fallback: string }
}

export interface TemplateMeta {
    id: TemplateId
    name: string
    tagline: string
    /** Corner radius for cards and photos, and for buttons. */
    radius: number
    buttonRadius: number
    /** Button label style. */
    buttonCase: 'uppercase' | 'none'
    defaultFont: string
    schemes: ColorScheme[]
}

const SERIF_FALLBACK = 'Georgia, "Times New Roman", serif'
const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", sans-serif'

export const FONT_PAIRINGS: FontPairing[] = [
    { id: 'fraunces-inter', name: 'Editorial', heading: { family: 'Fraunces', weights: [400, 600], fallback: SERIF_FALLBACK }, body: { family: 'Inter', weights: [400, 500, 600], fallback: SANS_FALLBACK } },
    { id: 'playfair-dmsans', name: 'Classic', heading: { family: 'Playfair Display', weights: [400, 700], fallback: SERIF_FALLBACK }, body: { family: 'DM Sans', weights: [400, 500, 700], fallback: SANS_FALLBACK } },
    { id: 'dmserif-inter', name: 'Expressive', heading: { family: 'DM Serif Display', weights: [400], fallback: SERIF_FALLBACK }, body: { family: 'Inter', weights: [400, 500, 600], fallback: SANS_FALLBACK } },
    { id: 'cormorant-montserrat', name: 'Luxe', heading: { family: 'Cormorant Garamond', weights: [500, 700], fallback: SERIF_FALLBACK }, body: { family: 'Montserrat', weights: [400, 500, 600], fallback: SANS_FALLBACK } },
    { id: 'anton-inter', name: 'Bold', heading: { family: 'Anton', weights: [400], fallback: 'Impact, "Arial Narrow", sans-serif' }, body: { family: 'Inter', weights: [400, 500, 600], fallback: SANS_FALLBACK } },
    { id: 'bebas-dmsans', name: 'Street', heading: { family: 'Bebas Neue', weights: [400], fallback: 'Impact, "Arial Narrow", sans-serif' }, body: { family: 'DM Sans', weights: [400, 500, 700], fallback: SANS_FALLBACK } },
    { id: 'manrope', name: 'Soft modern', heading: { family: 'Manrope', weights: [500, 700], fallback: SANS_FALLBACK }, body: { family: 'Manrope', weights: [400, 500, 600], fallback: SANS_FALLBACK } },
    { id: 'poppins', name: 'Friendly', heading: { family: 'Poppins', weights: [600, 700], fallback: SANS_FALLBACK }, body: { family: 'Poppins', weights: [400, 500], fallback: SANS_FALLBACK } },
]

export const TEMPLATES: TemplateMeta[] = [
    {
        id: 'maison-tresse', name: 'Maison Tresse', tagline: 'Editorial luxury, for braiders',
        radius: 0, buttonRadius: 0, buttonCase: 'uppercase', defaultFont: 'fraunces-inter',
        schemes: [
            { id: 'cream-gold', name: 'Cream & Gold', bg: '#f4ede2', fg: '#1a1410', accent: '#a8803f' },
            { id: 'ink-gold', name: 'Ink & Gold', bg: '#1a1410', fg: '#f4ede2', accent: '#c9a15a' },
            { id: 'blush-cocoa', name: 'Blush & Cocoa', bg: '#f6e9e4', fg: '#3b2420', accent: '#a8644f' },
            { id: 'sage-ink', name: 'Sage & Ink', bg: '#e9ece4', fg: '#1f2a22', accent: '#6c7d4e' },
        ],
    },
    {
        id: 'fade-house', name: 'Fade House', tagline: 'Bold and loud, for barbers',
        radius: 2, buttonRadius: 2, buttonCase: 'uppercase', defaultFont: 'anton-inter',
        schemes: [
            { id: 'charcoal-red', name: 'Charcoal & Red', bg: '#141414', fg: '#f2f2f2', accent: '#d6332a' },
            { id: 'concrete', name: 'Concrete', bg: '#e9e7e3', fg: '#151515', accent: '#c62a21' },
            { id: 'midnight-gold', name: 'Midnight & Gold', bg: '#0e1726', fg: '#f4f1ea', accent: '#e0b04a' },
            { id: 'forest-lime', name: 'Forest & Lime', bg: '#10201a', fg: '#eef2ee', accent: '#8fd16a' },
        ],
    },
    {
        id: 'atelier-clair', name: 'Atelier Clair', tagline: 'Soft and minimal, for salons',
        radius: 16, buttonRadius: 999, buttonCase: 'none', defaultFont: 'manrope',
        schemes: [
            { id: 'bone-lavender', name: 'Bone & Lavender', bg: '#f7f4ef', fg: '#2b2833', accent: '#7d6bae' },
            { id: 'mist-sage', name: 'Mist & Sage', bg: '#f3f5f2', fg: '#26302a', accent: '#5f7f66' },
            { id: 'shell-peach', name: 'Shell & Peach', bg: '#fbf5f1', fg: '#33282a', accent: '#c4704f' },
            { id: 'cloud-navy', name: 'Cloud & Navy', bg: '#f5f7fa', fg: '#1d2738', accent: '#3f63a0' },
        ],
    },
    {
        id: 'rouge-maison', name: 'Rouge Maison', tagline: 'Magazine-cover, for makeup artists',
        radius: 0, buttonRadius: 0, buttonCase: 'uppercase', defaultFont: 'playfair-dmsans',
        schemes: [
            { id: 'blush-rouge', name: 'Blush & Rouge', bg: '#f7e6e4', fg: '#111111', accent: '#b3122e' },
            { id: 'noir-rouge', name: 'Noir & Rouge', bg: '#0f0f0f', fg: '#f6eeee', accent: '#e0243f' },
            { id: 'nude-plum', name: 'Nude & Plum', bg: '#efe2d6', fg: '#2a1622', accent: '#7b2d5b' },
            { id: 'ivory-black', name: 'Ivory & Black', bg: '#faf8f4', fg: '#111111', accent: '#111111' },
        ],
    },
    {
        id: 'coil-crown', name: 'Coil & Crown', tagline: 'Vibrant and expressive, for locticians',
        radius: 20, buttonRadius: 999, buttonCase: 'none', defaultFont: 'dmserif-inter',
        schemes: [
            { id: 'marigold-aubergine', name: 'Marigold & Aubergine', bg: '#fdf3e3', fg: '#3d1a3d', accent: '#e8a534' },
            { id: 'plum-night', name: 'Plum Night', bg: '#2a0f2a', fg: '#fdf3e3', accent: '#e8a534' },
            { id: 'terracotta', name: 'Terracotta', bg: '#fbeee4', fg: '#3a1d12', accent: '#d0623c' },
            { id: 'emerald', name: 'Emerald', bg: '#eef5ef', fg: '#10301f', accent: '#d99a2b' },
        ],
    },
    {
        id: 'quickstart', name: 'Quickstart', tagline: 'Clean and simple, for anyone',
        radius: 12, buttonRadius: 10, buttonCase: 'none', defaultFont: 'poppins',
        schemes: [
            { id: 'coral', name: 'Coral', bg: '#ffffff', fg: '#171717', accent: '#c4593a' },
            { id: 'ocean', name: 'Ocean', bg: '#ffffff', fg: '#171717', accent: '#2563eb' },
            { id: 'berry', name: 'Berry', bg: '#fffafc', fg: '#1c1418', accent: '#be185d' },
            { id: 'night', name: 'Night', bg: '#111111', fg: '#f5f5f5', accent: '#f97362' },
        ],
    },
]

export const templateMeta = (id: string): TemplateMeta => TEMPLATES.find(t => t.id === id) ?? TEMPLATES[TEMPLATES.length - 1]
export const fontPairing = (id: string | undefined): FontPairing | undefined => FONT_PAIRINGS.find(f => f.id === id)

// ─── Color helpers ───────────────────────────────────────────────────────────

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
export const isHexColor = (v: unknown): v is string => typeof v === 'string' && HEX.test(v)

function rgb(hex: string): [number, number, number] {
    let h = hex.slice(1)
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
    const [r, g, b] = rgb(hex).map(v => {
        const c = v / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (l1 + 0.05) / (l2 + 0.05)
}

/** `hex` at `alpha` over `base`, as an opaque hex color. */
export function mix(hex: string, base: string, alpha: number): string {
    const a = rgb(hex)
    const b = rgb(base)
    return '#' + a.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('')
}

/** Readable text color for a filled button. */
export const textOn = (hex: string) => (contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#111111') ? '#ffffff' : '#111111')

// ─── Resolved theme ──────────────────────────────────────────────────────────

export interface SiteTheme {
    bg: string
    fg: string
    accent: string
    accentFg: string
    muted: string
    border: string
    surface: string
    headingFont: string
    bodyFont: string
    fonts: { family: string; weights: number[] }[]
    radius: number
    buttonRadius: number
    buttonCase: 'uppercase' | 'none'
    /** True when the background is dark. */
    dark: boolean
}

export function resolveTheme(templateId: string, schemeId: string | undefined, custom: SchemeColors | null | undefined, fontId: string | undefined): SiteTheme {
    const meta = templateMeta(templateId)
    const preset = meta.schemes.find(s => s.id === schemeId) ?? meta.schemes[0]
    const colors = schemeId === 'custom' && custom && isHexColor(custom.bg) && isHexColor(custom.fg) && isHexColor(custom.accent) ? custom : preset
    const font = fontPairing(fontId) ?? fontPairing(meta.defaultFont)!
    return {
        bg: colors.bg,
        fg: colors.fg,
        accent: colors.accent,
        accentFg: textOn(colors.accent),
        muted: mix(colors.fg, colors.bg, 0.66),
        border: mix(colors.fg, colors.bg, 0.16),
        surface: mix(colors.fg, colors.bg, 0.05),
        headingFont: `"${font.heading.family}", ${font.heading.fallback}`,
        bodyFont: `"${font.body.family}", ${font.body.fallback}`,
        fonts: font.heading.family === font.body.family
            ? [{ family: font.heading.family, weights: [...new Set([...font.heading.weights, ...font.body.weights])].sort() }]
            : [{ family: font.heading.family, weights: font.heading.weights }, { family: font.body.family, weights: font.body.weights }],
        radius: meta.radius,
        buttonRadius: meta.buttonRadius,
        buttonCase: meta.buttonCase,
        dark: luminance(colors.bg) < 0.25,
    }
}

/** The booking page (/book) uses the same colors and fonts as the site. */
export function toBookingTheme(theme: SiteTheme): BookingTheme {
    const family = (css: string) => css.split(',')[0].replace(/"/g, '').trim()
    const px = (n: number) => `${Math.min(n, 24)}px`
    return {
        primaryColor: theme.accent,
        primaryTextColor: theme.accentFg,
        backgroundColor: theme.bg,
        cardColor: theme.dark ? theme.surface : '#ffffff',
        borderColor: theme.border,
        textColor: theme.fg,
        mutedColor: theme.muted,
        accentColor: theme.accent,
        fontFamily: family(theme.headingFont),
        bodyFontFamily: family(theme.bodyFont),
        buttonRadius: px(theme.buttonRadius),
        inputRadius: px(Math.min(theme.radius, 12)),
        cardRadius: px(theme.radius),
    }
}

/** Weights a site font is available in, or undefined for fonts the site builder doesn't offer. */
export function siteFontWeights(family: string): number[] | undefined {
    for (const pairing of FONT_PAIRINGS) {
        if (pairing.heading.family === family) return pairing.heading.weights
        if (pairing.body.family === family) return pairing.body.weights
    }
    return undefined
}

// ─── Booking page theme (edited on its own) ──────────────────────────────────

/** Fonts offered for the booking page: the site pairings' fonts plus common choices. */
export const BOOKING_FONTS = [...new Set([
    ...FONT_PAIRINGS.flatMap(f => [f.heading.family, f.body.family]),
    'Roboto', 'Lato', 'Montserrat', 'Nunito', 'Open Sans',
])].sort()

export const BOOKING_RADII = [
    { label: 'Sharp', value: '4px' },
    { label: 'Rounded', value: '12px' },
    { label: 'Pill', value: '9999px' },
]

/** The colors and fonts a business picks for its booking page. Everything else is worked out from them. */
export interface BookingThemeChoice {
    primaryColor: string
    backgroundColor: string
    cardColor: string
    textColor: string
    accentColor: string
    fontFamily: string
    bodyFontFamily: string
    buttonRadius: string
}

/** A complete, valid booking theme from a business's choices (unknown values fall back to `base`). */
export function bookingThemeFromChoice(choice: Partial<BookingThemeChoice>, base: BookingTheme): BookingTheme {
    const color = (v: unknown, fallback: string) => (isHexColor(v) ? v : fallback)
    const font = (v: unknown, fallback: string) => (typeof v === 'string' && BOOKING_FONTS.includes(v) ? v : fallback)
    const radius = BOOKING_RADII.some(r => r.value === choice.buttonRadius) ? choice.buttonRadius! : base.buttonRadius
    const bg = color(choice.backgroundColor, base.backgroundColor)
    const text = color(choice.textColor, base.textColor)
    const primary = color(choice.primaryColor, base.primaryColor)
    const card = color(choice.cardColor, base.cardColor)
    const expand = (hex: string) => (hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c + c).join('') : hex)
    return {
        primaryColor: primary,
        primaryTextColor: textOn(expand(primary)),
        backgroundColor: bg,
        cardColor: card,
        borderColor: mix(expand(text), expand(bg), 0.16),
        textColor: text,
        mutedColor: mix(expand(text), expand(bg), 0.66),
        accentColor: color(choice.accentColor, base.accentColor),
        fontFamily: font(choice.fontFamily, base.fontFamily),
        bodyFontFamily: font(choice.bodyFontFamily, base.bodyFontFamily),
        buttonRadius: radius,
        inputRadius: radius === '9999px' ? '12px' : radius,
        cardRadius: radius === '4px' ? '6px' : '16px',
    }
}
