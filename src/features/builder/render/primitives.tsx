'use client'

// The pieces every layout is built from. Each applies the section's settings
// (text styles per role, button style) and marks itself for animation, so
// layouts stay short and every layout responds to the same controls.

import { ArrowRight, CalendarDays } from 'lucide-react'
import { MediaView } from '@/features/siteBuilder/templates/parts'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder, useOptionalBuilder, useSection } from './context'
import type { TextStyle } from '../types'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/**
 * A Google Fonts stylesheet. On the live site it uses React's `precedence`, so
 * the fonts come with the page. In the editor and in thumbnails it's a plain
 * <link>: a new `precedence` stylesheet suspends rendering until it loads,
 * which swapped the whole editor for the dashboard's loading screen.
 */
export function FontLink({ href, live }: { href: string; live?: boolean }) {
    const ctx = useOptionalBuilder()
    const isLive = live ?? (!!ctx && !ctx.editing && !ctx.still)
    return isLive ? <link rel="stylesheet" href={href} precedence="default" /> : <link rel="stylesheet" href={href} />
}

/** Roles that animate as headings (split into words for the "lines"/"words" entrances). */
const HEADING_ROLES = new Set(['heading', 'title', 'name', 'wordmark', 'big'])

const CASE: Record<NonNullable<TextStyle['case']>, React.CSSProperties['textTransform']> = { none: 'none', upper: 'uppercase', title: 'capitalize' }

function fontFamily(font: string | undefined): string | undefined {
    if (!font) return undefined
    if (font === 'heading') return 'var(--s-heading)'
    if (font === 'body') return 'var(--s-body)'
    return `"${font}", var(--s-body)`
}

/** Text style for a role: the layout's defaults with the business's choices on top. */
export function useTextStyle(role: string, defaults: TextStyle = {}): React.CSSProperties & Record<string, string | number | undefined> {
    const { style } = useSection()
    const t: TextStyle = { ...defaults, ...(style.text[role] ?? {}) }
    const desktop = t.size
    // Phones: big display type shrinks more (a 96px headline would break mid-word at 390px).
    const mobile = t.sizeMobile ?? (desktop ? Math.max(12, Math.round(desktop > 72 ? 52 + (desktop - 72) * 0.12 : desktop * (desktop > 28 ? 0.72 : 0.92))) : undefined)
    return {
        fontFamily: fontFamily(t.font),
        fontWeight: t.weight,
        fontStyle: t.italic ? 'italic' : undefined,
        textTransform: t.case ? CASE[t.case] : undefined,
        letterSpacing: t.tracking !== undefined ? `${t.tracking}em` : undefined,
        lineHeight: t.leading,
        textAlign: t.align,
        color: t.color,
        '--fs-d': desktop ? `${desktop}px` : undefined,
        '--fs-m': mobile ? `${mobile}px` : undefined,
    }
}

/** A piece of text in a role ("heading", "body", "price"…). Renders nothing when empty, except while editing. */
export function Txt({ role, as: Tag = 'p', defaults, className, children, enter = true, count }: {
    role: string
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'li'
    defaults?: TextStyle
    className?: string
    children: React.ReactNode
    /** Mark for entrance animation (default on). */
    enter?: boolean
    /** Numbers in this text count up when the section's "count up" is on. */
    count?: boolean
}) {
    const style = useTextStyle(role, defaults)
    const { editing } = useBuilder()
    if ((children === '' || children == null) && !editing) return null
    return (
        <Tag
            className={cx('aa-txt [overflow-wrap:anywhere]', HEADING_ROLES.has(role) && 'text-balance', className)}
            style={style as React.CSSProperties}
            data-enter={enter ? (HEADING_ROLES.has(role) ? 'heading' : 'text') : undefined}
            data-count={count ? '' : undefined}
            data-role={role}
        >
            {children}
        </Tag>
    )
}

/** A link styled as the section's button. */
export function Btn({ href, children, variant = 'primary', className, role = 'button' }: {
    href: string
    children: React.ReactNode
    /** primary follows the section's button style; secondary is the outline/quiet version. */
    variant?: 'primary' | 'secondary'
    className?: string
    role?: string
}) {
    const { style } = useSection()
    const { theme } = useBuilder()
    const text = useTextStyle(role)
    const b = style.buttons
    const kind = variant === 'secondary' ? (b.style === 'outline' ? 'text' : 'outline') : b.style
    const radius = b.radius !== undefined ? `${b.radius}px` : kind === 'pill' ? '999px' : 'var(--s-button-radius)'
    const look: Record<string, React.CSSProperties> = {
        solid: { background: 'var(--s-accent)', color: 'var(--s-accent-fg)', border: '1px solid var(--s-accent)' },
        pill: { background: 'var(--s-accent)', color: 'var(--s-accent-fg)', border: '1px solid var(--s-accent)' },
        outline: { background: 'transparent', color: 'inherit', border: '1px solid currentColor' },
        text: { background: 'transparent', color: 'inherit', border: '1px solid transparent', paddingInline: 0, textDecoration: 'underline', textUnderlineOffset: '4px' },
    }
    const size = b.size === 'lg' ? 'min-h-12 px-7 text-[15px]' : b.size === 'sm' ? 'min-h-9 px-4 text-[13px]' : 'min-h-11 px-5 text-sm'
    return (
        <a
            href={href}
            className={cx('aa-txt inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-opacity hover:opacity-85 active:opacity-75', size,
                theme.buttonCase === 'uppercase' && 'uppercase tracking-[0.12em] text-[13px]', className)}
            // Only the text settings the business set: an unset one (color: undefined) must not wipe out the button's colors.
            style={{ ...look[kind], borderRadius: radius, ...(Object.fromEntries(Object.entries(text).filter(([, v]) => v !== undefined)) as React.CSSProperties) }}
            data-enter="text"
            data-hover=""
        >
            {b.icon === 'calendar' && <CalendarDays size={16} aria-hidden />}
            {children}
            {b.icon === 'arrow' && <ArrowRight size={16} aria-hidden />}
        </a>
    )
}

/** A photo or video. Empty while editing shows an "Add …" placeholder; empty on the live site renders nothing. */
export function Media({ media, label, className, style, eager, kenburns, rounded = true }: {
    media: SiteMedia | null | undefined
    label: string
    className?: string
    style?: React.CSSProperties
    eager?: boolean
    /** This photo gets the "slow zoom" ambient effect. */
    kenburns?: boolean
    rounded?: boolean
}) {
    const { editing, info } = useBuilder()
    const { style: s } = useSection()
    if (!media && !editing) return null
    const radius = !rounded ? 0 : s.spacing.radius !== undefined ? `${s.spacing.radius}px` : 'var(--s-radius)'
    return (
        <div
            className={cx('relative overflow-hidden', className)}
            style={{ borderRadius: radius, ...style }}
            data-enter="media"
            data-hover=""
            data-kenburns={kenburns ? '' : undefined}
        >
            {media ? (
                <MediaView media={media} alt={`${info.businessName}: ${label}`} eager={eager} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs font-medium"
                    style={{ border: '1.5px dashed var(--s-border)', background: 'var(--s-surface)', color: 'var(--s-muted)', borderRadius: 'inherit' }}>
                    Add {label}
                </div>
            )}
        </div>
    )
}

/** A card/list item: animates as one of the section's items and takes the hover effect. */
export function Item({ as: Tag = 'div', className, style, children, card }: {
    as?: 'div' | 'li' | 'article' | 'a'
    className?: string
    style?: React.CSSProperties
    children: React.ReactNode
    /** Card look: background, border, radius, optional shadow from the section's settings. */
    card?: boolean
}) {
    const { style: s } = useSection()
    const radius = s.spacing.radius !== undefined ? `${s.spacing.radius}px` : 'var(--s-radius)'
    const cardStyle: React.CSSProperties = card ? {
        background: 'var(--s-card)',
        border: '1px solid var(--s-border)',
        borderRadius: radius,
        boxShadow: s.spacing.shadow ? '0 12px 30px -18px color-mix(in srgb, var(--s-fg) 40%, transparent)' : undefined,
    } : {}
    return <Tag className={className} style={{ ...cardStyle, ...style }} data-enter="item" data-hover="">{children}</Tag>
}
