// Colors for one section: the site theme, or the section's own colors, with
// "invert" applied. Returned as the same CSS variables the template parts use
// (--s-bg, --s-fg…), so every layout reads one set of names.

import { contrastRatio, isHexColor, luminance, mix, textOn, type SiteTheme } from '@/features/siteBuilder/themes'
import type { SectionStyle } from './types'

export interface SectionPalette {
    bg: string
    fg: string
    accent: string
    accentFg: string
    muted: string
    border: string
    surface: string
    card: string
    dark: boolean
}

const pick = (value: string | undefined, fallback: string) => (isHexColor(value) ? value : fallback)

export function sectionPalette(theme: SiteTheme, style: Pick<SectionStyle, 'useTheme' | 'invert' | 'colors' | 'tint' | 'accentBg'>): SectionPalette {
    const own = style.useTheme ? {} : style.colors
    let bg = pick(own.bg, theme.bg)
    let fg = pick(own.fg, theme.fg)
    if (style.invert) [bg, fg] = [fg, bg]
    if (style.tint) bg = mix(fg, bg, luminance(bg) < 0.25 ? 0.08 : 0.05)
    let accent = pick(own.accent ?? own.button, theme.accent)
    let accentFg = pick(own.buttonText, textOn(accent))
    // Accent background: the accent fills the section; buttons take the page's colors.
    if (style.accentBg) [bg, fg, accent, accentFg] = [accent, accentFg, bg, fg]
    return {
        bg,
        fg,
        accent,
        accentFg,
        muted: mix(fg, bg, 0.66),
        border: pick(own.border, mix(fg, bg, 0.16)),
        surface: mix(fg, bg, 0.05),
        card: pick(own.card, luminance(bg) < 0.25 ? mix(fg, bg, 0.07) : mix('#ffffff', bg, 0.6)),
        dark: luminance(bg) < 0.25,
    }
}

export function paletteVars(p: SectionPalette): Record<string, string> {
    return {
        '--s-bg': p.bg,
        '--s-fg': p.fg,
        '--s-accent': p.accent,
        '--s-accent-fg': p.accentFg,
        '--s-muted': p.muted,
        '--s-border': p.border,
        '--s-surface': p.surface,
        '--s-card': p.card,
    }
}

/** For the Colors group's warning: body text under WCAG AA (4.5:1) is hard to read. */
export function lowContrast(p: SectionPalette): string | null {
    if (contrastRatio(p.fg, p.bg) < 4.5) return 'Text is hard to read on this background.'
    if (contrastRatio(p.accentFg, p.accent) < 3) return 'Button text is hard to read on the button color.'
    return null
}
