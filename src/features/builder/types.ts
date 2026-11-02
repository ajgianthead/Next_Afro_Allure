// The website builder's data model. A page is Puck data: root props hold the
// site theme; each item in `content` is one section. Pure types + defaults,
// safe on server and client.

import type { SchemeColors, TemplateId } from '@/features/siteBuilder/themes'
import type { SiteMedia } from '@/features/siteBuilder/siteData'

export const SECTION_TYPES = [
    'Navbar', 'Hero', 'About', 'Services', 'Gallery', 'Reviews', 'Offers',
    'BookNow', 'Hours', 'Contact', 'FAQ', 'Policies', 'Footer', 'Spacer',
] as const
export type SectionType = typeof SECTION_TYPES[number]

/** Names people see (server-safe; the section definitions are client modules). */
export const SECTION_LABELS: Record<SectionType, string> = {
    Navbar: 'Menu bar', Hero: 'Hero', About: 'About', Services: 'Services', Gallery: 'Gallery', Reviews: 'Reviews', Offers: 'Offers',
    BookNow: 'Book now banner', Hours: 'Hours and location', Contact: 'Contact', FAQ: 'FAQ', Policies: 'Policies', Footer: 'Footer', Spacer: 'Spacer',
}

/** Layouts 1–8 are on every plan; 9–20 need Growth. */
export type Tier = 'basic' | 'pro'
export const BASIC_LAYOUT_MAX = 8
export const layoutTier = (layout: number): Tier => (layout <= BASIC_LAYOUT_MAX ? 'basic' : 'pro')

// ─── Properties ──────────────────────────────────────────────────────────────

export type Size = 'none' | 's' | 'm' | 'l' | 'xl'
export type Divider = 'none' | 'wave' | 'curve' | 'slant' | 'zigzag'

/** How one piece of text looks (a heading, a price, a button label…). Unset fields follow the theme. */
export interface TextStyle {
    /** 'heading' / 'body' = the site's fonts; anything else is a font family name. */
    font?: string
    size?: number
    sizeMobile?: number
    weight?: number
    italic?: boolean
    case?: 'none' | 'upper' | 'title'
    /** Letter spacing in em. */
    tracking?: number
    /** Line height, unitless. */
    leading?: number
    align?: 'left' | 'center' | 'right'
    color?: string
}

export interface SectionColors {
    bg?: string
    fg?: string
    accent?: string
    button?: string
    buttonText?: string
    card?: string
    border?: string
}

export interface SectionBackground {
    kind: 'solid' | 'gradient' | 'image' | 'video'
    gradient?: { from: string; to: string; angle: number }
    media?: SiteMedia | null
    /** opacity in percent, 0–90 */
    overlay?: { color: string; opacity: number }
    blur?: number
    pattern?: 'none' | 'dots' | 'grain' | 'lines'
}

export interface SectionButtons {
    style: 'solid' | 'outline' | 'text' | 'pill'
    size: 'sm' | 'md' | 'lg'
    /** Corner radius in px; unset follows the theme. */
    radius?: number
    icon: 'none' | 'arrow' | 'calendar'
}

export interface SectionSpacing {
    top: Size
    bottom: Size
    width: 'narrow' | 'normal' | 'wide' | 'full'
    /** Corner radius for cards and photos in px; unset follows the theme. */
    radius?: number
    shadow: boolean
    border: boolean
    dividerTop: Divider
    dividerBottom: Divider
}

export interface SectionStyle {
    /** Follow the site theme's colors (the color fields below are ignored when on). */
    useTheme: boolean
    /** Swap background and text colors (keeps the accent). */
    invert: boolean
    /** A slightly tinted version of the background, to set a section apart (follows the theme). */
    tint?: boolean
    colors: SectionColors
    background: SectionBackground
    buttons: SectionButtons
    spacing: SectionSpacing
    /** Per text role, e.g. { heading: {...}, price: {...} }. */
    text: Record<string, TextStyle>
    visibility: { hideMobile: boolean; hideDesktop: boolean }
    /** What the navbar links to (#services). Defaults to the section type. */
    anchor: string
}

// ─── Animation ───────────────────────────────────────────────────────────────

export const ENTRANCES = [
    // basic
    'none', 'fade', 'fade-up', 'fade-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out',
    // pro
    'blur-in', 'soft-rise', 'reveal-up', 'reveal-sides', 'lines', 'words', 'flip-in',
] as const
export type Entrance = typeof ENTRANCES[number]
export const BASIC_ENTRANCES: readonly Entrance[] = ['none', 'fade', 'fade-up', 'fade-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out']

export type ScrollEffect = 'none' | 'parallax-slow' | 'parallax-medium' | 'zoom' | 'fade-out' | 'sticky'
export type HoverEffect = 'none' | 'lift' | 'zoom' | 'glow' | 'underline' | 'tilt'
export type AmbientEffect = 'none' | 'kenburns' | 'gradient'
/** Basic animations every plan gets; the rest need Growth. */
export const BASIC_SCROLL: readonly ScrollEffect[] = ['none']
export const BASIC_HOVER: readonly HoverEffect[] = ['none', 'lift', 'zoom']
export const BASIC_AMBIENT: readonly AmbientEffect[] = ['none']

export interface SectionAnimation {
    entrance: Entrance
    /** What the entrance applies to. */
    target: 'section' | 'heading' | 'text-then-items' | 'items'
    scroll: ScrollEffect
    hover: HoverEffect
    ambient: AmbientEffect
    /** Numbers (stats, ratings, "$10 off") count up. Pro. */
    countUp: boolean
    /** ms */
    duration: number
    /** ms */
    delay: number
    easing: 'smooth' | 'snappy' | 'soft'
    /** ms between items when target is 'items' / 'text-then-items' */
    stagger: number
    once: boolean
    /** Start when the section first appears, or when half of it is visible. */
    start: 'appear' | 'half'
}

// ─── Sections and the page ───────────────────────────────────────────────────

export interface SectionProps<Content = Record<string, unknown>> {
    /** 1–20 */
    layout: number
    content: Content
    style: SectionStyle
    animation: SectionAnimation
}

/** Site-wide look, in Puck's root props. Sections inherit it. */
export interface SiteThemeProps {
    /** Which starter page's design rules (corner and button styles) the theme follows. */
    templateId: TemplateId
    /** A preset scheme id of that template, or 'custom'. */
    scheme: string
    customColors: SchemeColors | null
    fontPairing: string
    logo: SiteMedia | null
    /** Overrides for the template's corner and button style. */
    radius?: number
    buttonRadius?: number
    buttonCase?: 'uppercase' | 'none'
    /** The booking page (/book) uses the site's colors and fonts. */
    bookingMatchesSite: boolean
    /** A Book button stuck to the bottom of the screen on phones (on unless turned off). */
    mobileBookBar?: boolean
}

export const DEFAULT_STYLE: SectionStyle = {
    useTheme: true,
    invert: false,
    colors: {},
    background: { kind: 'solid', pattern: 'none' },
    buttons: { style: 'solid', size: 'md', icon: 'none' },
    spacing: { top: 'l', bottom: 'l', width: 'normal', shadow: false, border: false, dividerTop: 'none', dividerBottom: 'none' },
    text: {},
    visibility: { hideMobile: false, hideDesktop: false },
    anchor: '',
}

export const DEFAULT_ANIMATION: SectionAnimation = {
    entrance: 'fade-up',
    target: 'text-then-items',
    scroll: 'none',
    hover: 'none',
    ambient: 'none',
    countUp: false,
    duration: 600,
    delay: 0,
    easing: 'smooth',
    stagger: 80,
    once: true,
    start: 'appear',
}

/** Merge saved props over the defaults, so pages saved before a field existed still render. */
export function withDefaults<C>(props: Partial<SectionProps<C>> | undefined, content: C): SectionProps<C> {
    const style = props?.style ?? ({} as Partial<SectionStyle>)
    return {
        layout: Math.min(20, Math.max(1, Math.round(Number(props?.layout) || 1))),
        content: { ...content, ...(props?.content ?? {}) },
        style: {
            ...DEFAULT_STYLE,
            ...style,
            colors: { ...(style.colors ?? {}) },
            background: { ...DEFAULT_STYLE.background, ...(style.background ?? {}) },
            buttons: { ...DEFAULT_STYLE.buttons, ...(style.buttons ?? {}) },
            spacing: { ...DEFAULT_STYLE.spacing, ...(style.spacing ?? {}) },
            text: { ...(style.text ?? {}) },
            visibility: { ...DEFAULT_STYLE.visibility, ...(style.visibility ?? {}) },
        },
        animation: { ...DEFAULT_ANIMATION, ...(props?.animation ?? {}) },
    }
}
