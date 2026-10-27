'use client'

/**
 * Building blocks shared by the site templates. Layout is mobile-first and
 * uses container queries (@3xl = 768px+, @5xl = 1024px+ of *site* width), so
 * the same markup is right on a phone, on desktop and in the builder's
 * phone-sized preview. Colors and fonts come from CSS variables set by Root.
 */

import { useEffect, useRef, useState } from 'react'
import { buildGoogleFontsUrl } from '@/lib/extractFonts'
import { contactLinks, monogram, type SiteMedia } from '../siteData'
import { useSite } from './context'

export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')

/** Fluid type: scales with the site's width, between min and max rem. */
export const fluid = (min: number, cqi: number, max: number) => `clamp(${min}rem, ${cqi}cqi, ${max}rem)`

export const PAD_X = 'px-5 @3xl:px-12 @5xl:px-20'
export const SECTION = `${PAD_X} py-14 @3xl:py-20`
export const INNER = 'mx-auto w-full max-w-6xl'

// ─── Root ────────────────────────────────────────────────────────────────────

export function Root({ children }: { children: React.ReactNode }) {
    const { theme } = useSite()
    const vars = {
        '--s-bg': theme.bg,
        '--s-fg': theme.fg,
        '--s-accent': theme.accent,
        '--s-accent-fg': theme.accentFg,
        '--s-muted': theme.muted,
        '--s-border': theme.border,
        '--s-surface': theme.surface,
        '--s-heading': theme.headingFont,
        '--s-body': theme.bodyFont,
        '--s-radius': `${theme.radius}px`,
        '--s-button-radius': `${theme.buttonRadius}px`,
    } as React.CSSProperties
    return (
        <div
            className="@container relative w-full min-h-full overflow-x-clip text-base antialiased"
            // No faux bold: display fonts like Anton only come in one weight.
            style={{ ...vars, background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: 'var(--s-body)', fontSynthesis: 'none' }}
        >
            {/* React hoists this into <head>; fonts are shared with the booking page. */}
            <link rel="stylesheet" href={buildGoogleFontsUrl(theme.fonts)} precedence="default" />
            {children}
        </div>
    )
}

// ─── Type & buttons ──────────────────────────────────────────────────────────

export function Heading({ as: Tag = 'h2', className, style, children }: {
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
    className?: string
    style?: React.CSSProperties
    children: React.ReactNode
}) {
    return <Tag className={cx('font-semibold leading-[1.08] tracking-[-0.01em] text-balance [overflow-wrap:anywhere]', className)} style={{ fontFamily: 'var(--s-heading)', ...style }}>{children}</Tag>
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
    return <p className={cx('text-xs font-semibold uppercase tracking-[0.16em]', className)} style={{ color: 'var(--s-accent)' }}>{children}</p>
}

export function Button({ href, variant = 'solid', size = 'md', className, children, onClick }: {
    href: string
    variant?: 'solid' | 'outline' | 'inverse'
    size?: 'md' | 'lg'
    className?: string
    children: React.ReactNode
    onClick?: () => void
}) {
    const { theme } = useSite()
    const styles: Record<string, React.CSSProperties> = {
        solid: { background: 'var(--s-accent)', color: 'var(--s-accent-fg)', border: '1px solid var(--s-accent)' },
        outline: { background: 'transparent', color: 'inherit', border: '1px solid currentColor' },
        inverse: { background: 'var(--s-bg)', color: 'var(--s-fg)', border: '1px solid var(--s-bg)' },
    }
    return (
        <a
            href={href}
            onClick={onClick}
            className={cx(
                'inline-flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-85 active:opacity-75 whitespace-nowrap',
                size === 'lg' ? 'min-h-12 px-7 text-[15px]' : 'min-h-11 px-5 text-sm',
                theme.buttonCase === 'uppercase' && 'uppercase tracking-[0.12em] text-[13px]',
                className,
            )}
            style={{ ...styles[variant], borderRadius: 'var(--s-button-radius)' }}
        >
            {children}
        </a>
    )
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 12 12" aria-hidden>
                    <path
                        d="M6 1l1.5 3.2 3.5.5-2.5 2.4.6 3.4L6 8.9 2.9 10.5l.6-3.4L1 4.7l3.5-.5L6 1z"
                        fill={i < Math.round(rating) ? 'currentColor' : 'transparent'}
                        stroke="currentColor"
                        strokeWidth=".7"
                    />
                </svg>
            ))}
        </span>
    )
}

// ─── Media ───────────────────────────────────────────────────────────────────

export function MediaView({ media, alt, className, eager }: { media: SiteMedia; alt: string; className?: string; eager?: boolean }) {
    if (media.kind === 'video') {
        return (
            <video
                src={media.url}
                className={cx('h-full w-full object-cover', className)}
                autoPlay
                muted
                loop
                playsInline
                preload={eager ? 'auto' : 'metadata'}
                aria-label={alt}
            />
        )
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.url} alt={alt} className={cx('h-full w-full object-cover', className)} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

/**
 * A photo/video area. Shows the media, an "Add …" placeholder while editing,
 * or nothing on the live site, so empty slots never look unfinished.
 */
export function Slot({ media, label, className, style, eager }: {
    media: SiteMedia | null | undefined
    label: string
    className?: string
    style?: React.CSSProperties
    eager?: boolean
}) {
    const { editing, info } = useSite()
    if (!media && !editing) return null
    return (
        <div className={cx('relative overflow-hidden', className)} style={{ borderRadius: 'var(--s-radius)', ...style }}>
            {media ? (
                <MediaView media={media} alt={`${info.businessName}: ${label}`} eager={eager} />
            ) : (
                <div
                    className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs font-medium"
                    style={{ border: '1.5px dashed var(--s-border)', background: 'var(--s-surface)', color: 'var(--s-muted)', borderRadius: 'inherit' }}
                >
                    Add {label}
                </div>
            )}
        </div>
    )
}

export function Logo({ size = 40, square }: { size?: number; square?: boolean }) {
    const { site, info } = useSite()
    if (site.media.logo) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.media.logo.url} alt={`${info.businessName} logo`} className="shrink-0 object-contain" style={{ height: size, width: 'auto', maxWidth: size * 3 }} />
        )
    }
    return (
        <span
            aria-hidden
            className="inline-flex shrink-0 items-center justify-center font-bold"
            style={{ width: size, height: size, borderRadius: square ? 'var(--s-radius)' : 999, background: 'var(--s-accent)', color: 'var(--s-accent-fg)', fontSize: size * 0.36, fontFamily: 'var(--s-heading)' }}
        >
            {monogram(info.businessName)}
        </span>
    )
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function useNavLinks() {
    const { site, info, editing } = useSite()
    return [
        { href: '#services', label: 'Services', show: info.services.length > 0 },
        { href: '#work', label: 'Work', show: site.media.gallery.length > 0 || !!editing },
        { href: '#about', label: 'About', show: true },
        { href: '#reviews', label: 'Reviews', show: info.reviews.length > 0 },
        { href: '#visit', label: 'Visit', show: true },
    ].filter(l => l.show)
}

export function Header({ centered, transparent }: { centered?: boolean; transparent?: boolean }) {
    const { info, bookHref, theme } = useSite()
    const links = useNavLinks()
    const [open, setOpen] = useState(false)
    return (
        <header
            className={cx('z-30 w-full', transparent ? 'absolute inset-x-0 top-0' : 'sticky top-0')}
            // Over a hero, take the hero's text color (white on a cover photo, the scheme's color without one).
            style={transparent ? { color: 'inherit' } : { background: 'var(--s-bg)', borderBottom: '1px solid var(--s-border)' }}
        >
            <div className={cx(PAD_X, INNER, 'flex h-16 items-center justify-between gap-3 @3xl:h-20')}>
                <a href="#top" className={cx('flex min-h-11 min-w-0 items-center gap-2.5', centered && '@3xl:order-2')} onClick={() => setOpen(false)}>
                    <Logo size={36} />
                    <span className="truncate text-[15px] font-semibold @3xl:text-base" style={{ fontFamily: 'var(--s-heading)', textTransform: theme.buttonCase === 'uppercase' ? 'uppercase' : undefined, letterSpacing: theme.buttonCase === 'uppercase' ? '0.08em' : undefined }}>
                        {info.businessName}
                    </span>
                </a>
                <nav className={cx('hidden items-center gap-7 text-sm @3xl:flex', centered && '@3xl:order-1')} aria-label="Site">
                    {links.map(l => <a key={l.href} href={l.href} className="opacity-80 transition-opacity hover:opacity-100">{l.label}</a>)}
                </nav>
                <div className={cx('flex shrink-0 items-center gap-1', centered && '@3xl:order-3')}>
                    <Button href={bookHref()} className="!min-h-10 !px-4">Book</Button>
                    <button
                        type="button"
                        className="-mr-2 inline-flex h-11 w-11 items-center justify-center @3xl:hidden"
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        onClick={() => setOpen(o => !o)}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>
            {open && (
                <nav
                    className="flex flex-col px-5 pb-4 @3xl:hidden"
                    style={{ background: 'var(--s-bg)', color: 'var(--s-fg)', borderBottom: '1px solid var(--s-border)' }}
                    aria-label="Site"
                >
                    {links.map(l => (
                        <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center text-lg" style={{ borderTop: '1px solid var(--s-border)' }}>
                            {l.label}
                        </a>
                    ))}
                </nav>
            )}
        </header>
    )
}

/** Sticky "Book" bar along the bottom of the screen on phones. */
export function MobileBookBar() {
    const { bookHref, info } = useSite()
    return (
        <div data-book-bar className="sticky bottom-0 z-20 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 @3xl:hidden" style={{ background: 'linear-gradient(to top, var(--s-bg) 65%, transparent)' }}>
            <Button href={bookHref()} size="lg" className="w-full">Book with {info.businessName}</Button>
        </div>
    )
}

// ─── Sections ────────────────────────────────────────────────────────────────

export function SectionTitle({ eyebrow, title, align = 'left', className }: { eyebrow?: string; title: string; align?: 'left' | 'center'; className?: string }) {
    return (
        <div className={cx('mb-8 @3xl:mb-12', align === 'center' && 'text-center', className)}>
            {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
            <Heading style={{ fontSize: fluid(1.9, 5.2, 3.25) }}>{title}</Heading>
        </div>
    )
}

export function ServicesSection({ variant = 'list', eyebrow = 'Services', title = 'Services & pricing', align, className, style }: {
    variant?: 'list' | 'cards' | 'numbered'
    eyebrow?: string
    title?: string
    align?: 'left' | 'center'
    className?: string
    style?: React.CSSProperties
}) {
    const { info, bookHref } = useSite()
    if (!info.services.length) return null
    return (
        <section id="services" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
            <div className={INNER}>
                <SectionTitle eyebrow={eyebrow} title={title} align={align} />
                {variant === 'cards' ? (
                    <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3 @3xl:gap-4">
                        {info.services.map(s => (
                            <a key={s.id} href={bookHref(s.id)} className="group flex flex-col gap-3 p-5 transition-transform active:scale-[0.99] @3xl:p-6" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                                <div className="flex items-start justify-between gap-3">
                                    <Heading as="h3" className="text-lg @3xl:text-xl">{s.name}</Heading>
                                    {s.price && <span className="shrink-0 font-semibold">{s.price}</span>}
                                </div>
                                {s.description && <p className="line-clamp-3 text-[15px] leading-relaxed" style={{ color: 'var(--s-muted)' }}>{s.description}</p>}
                                <div className="mt-auto flex items-center justify-between pt-1 text-sm">
                                    <span style={{ color: 'var(--s-muted)' }}>{s.duration}</span>
                                    <span className="font-semibold" style={{ color: 'var(--s-accent)' }}>Book →</span>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <ul className="flex flex-col" style={{ borderTop: '1px solid var(--s-border)' }}>
                        {info.services.map((s, i) => (
                            <li key={s.id} style={{ borderBottom: '1px solid var(--s-border)' }}>
                                <a href={bookHref(s.id)} className="group flex items-center gap-4 py-5 @3xl:gap-6 @3xl:py-6">
                                    {variant === 'numbered' && (
                                        <span className="w-10 shrink-0 tabular-nums @3xl:w-16" style={{ fontFamily: 'var(--s-heading)', fontSize: fluid(1.4, 3.6, 2.5), color: 'var(--s-accent)' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <Heading as="h3" className="text-lg @3xl:text-2xl">{s.name}</Heading>
                                        {s.description && <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed" style={{ color: 'var(--s-muted)' }}>{s.description}</p>}
                                        {s.duration && <p className="mt-1 text-sm @3xl:hidden" style={{ color: 'var(--s-muted)' }}>{s.duration}</p>}
                                    </div>
                                    <span className="hidden text-sm @3xl:block" style={{ color: 'var(--s-muted)' }}>{s.duration}</span>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        {s.price && <span className="font-semibold @3xl:text-lg">{s.price}</span>}
                                        <span className="text-xs font-semibold uppercase tracking-wider opacity-70 transition-opacity group-hover:opacity-100" style={{ color: 'var(--s-accent)' }}>Book</span>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}

export function Lightbox({ items, index, onClose, onIndex }: { items: SiteMedia[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
    const startX = useRef<number | null>(null)
    const go = (delta: number) => onIndex((index + delta + items.length) % items.length)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') go(1)
            if (e.key === 'ArrowLeft') go(-1)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    })
    const item = items[index]
    if (!item) return null
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
            onClick={onClose}
            onTouchStart={e => { startX.current = e.touches[0].clientX }}
            onTouchEnd={e => {
                if (startX.current === null) return
                const dx = e.changedTouches[0].clientX - startX.current
                startX.current = null
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
            }}
        >
            <div className="max-h-[85dvh] max-w-[92vw]" onClick={e => e.stopPropagation()}>
                {item.kind === 'video' ? (
                    <video src={item.url} className="max-h-[85dvh] max-w-[92vw]" controls autoPlay playsInline />
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt="" className="max-h-[85dvh] max-w-[92vw] object-contain" />
                )}
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white">×</button>
            {items.length > 1 && (
                <>
                    <button type="button" aria-label="Previous" onClick={e => { e.stopPropagation(); go(-1) }} className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white sm:flex">‹</button>
                    <button type="button" aria-label="Next" onClick={e => { e.stopPropagation(); go(1) }} className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white sm:flex">›</button>
                    <p className="absolute bottom-[max(16px,env(safe-area-inset-bottom))] left-0 right-0 text-center text-sm text-white/70">{index + 1} / {items.length}</p>
                </>
            )}
        </div>
    )
}

export function GallerySection({ variant = 'grid', eyebrow = 'Portfolio', title = 'Recent work', className, style }: {
    variant?: 'grid' | 'mosaic' | 'strip'
    eyebrow?: string
    title?: string
    className?: string
    style?: React.CSSProperties
}) {
    const { site, editing, info } = useSite()
    const [open, setOpen] = useState<number | null>(null)
    const items = site.media.gallery
    if (!items.length && !editing) return null
    const slots: (SiteMedia | null)[] = items.length ? items : [null, null, null]

    const tile = (m: SiteMedia | null, i: number, cls: string) => (
        <button
            key={m?.url ?? `empty-${i}`}
            type="button"
            disabled={!m}
            onClick={() => m && !editing && setOpen(i)}
            className={cx('relative block overflow-hidden', cls)}
            style={{ borderRadius: 'var(--s-radius)' }}
            aria-label={m ? `Open ${m.kind === 'video' ? 'video' : 'photo'} ${i + 1}` : undefined}
        >
            <span className="absolute inset-0">
                {m ? <MediaView media={m} alt={`${info.businessName}: work ${i + 1}`} /> : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-medium" style={{ border: '1.5px dashed var(--s-border)', background: 'var(--s-surface)', color: 'var(--s-muted)', borderRadius: 'var(--s-radius)' }}>
                        Add photos
                    </span>
                )}
            </span>
            {m?.kind === 'video' && <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">▶ Video</span>}
        </button>
    )

    return (
        <section id="work" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
            <div className={INNER}>
                <SectionTitle eyebrow={eyebrow} title={title} />
                {variant === 'strip' ? (
                    <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 @3xl:-mx-12 @3xl:px-12 [scrollbar-width:none]">
                        {slots.map((m, i) => tile(m, i, 'aspect-[4/5] w-[72%] shrink-0 snap-start @3xl:w-[32%]'))}
                    </div>
                ) : variant === 'mosaic' ? (
                    <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-3 @3xl:gap-3">
                        {/* One large lead photo; the rest fill in around it with no gaps for typical counts. */}
                        {slots.map((m, i) => tile(m, i, cx('aspect-square', i === 0 && 'col-span-2 row-span-2')))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 @3xl:grid-cols-3 @3xl:gap-4">
                        {slots.map((m, i) => tile(m, i, 'aspect-[4/5]'))}
                    </div>
                )}
            </div>
            {open !== null && <Lightbox items={items} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
            <span className="sr-only">{info.businessName} portfolio</span>
        </section>
    )
}

export function AboutSection({ eyebrow = 'About', title, reverse, className, style }: {
    eyebrow?: string
    title?: string
    reverse?: boolean
    className?: string
    style?: React.CSSProperties
}) {
    const { site, info, bio, editing } = useSite()
    const hasPhoto = !!site.media.about || !!editing
    return (
        <section id="about" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
            <div className={cx(INNER, 'grid items-center gap-8 @3xl:gap-16', hasPhoto && '@3xl:grid-cols-2')}>
                <Slot media={site.media.about} label="a photo of you" className={cx('aspect-[4/5] w-full @3xl:max-w-md', reverse && '@3xl:order-2 @3xl:justify-self-end')} />
                <div className={cx(!hasPhoto && 'max-w-2xl')}>
                    <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
                    <Heading className="mb-5" style={{ fontSize: fluid(1.9, 5, 3) }}>{title ?? `Meet ${info.businessName}`}</Heading>
                    <p className="whitespace-pre-line text-[17px] leading-relaxed @3xl:text-lg" style={{ color: 'var(--s-muted)' }}>{bio}</p>
                    {(info.place || info.travels) && (
                        <p className="mt-5 text-sm font-medium">{info.travels ? 'I travel to you' : `Based in ${info.place}`}</p>
                    )}
                </div>
            </div>
        </section>
    )
}

export function ReviewsSection({ variant = 'cards', eyebrow = 'Reviews', title = 'What clients say', className, style }: {
    variant?: 'cards' | 'quote'
    eyebrow?: string
    title?: string
    className?: string
    style?: React.CSSProperties
}) {
    const { info } = useSite()
    const [i, setI] = useState(0)
    if (!info.reviews.length) return null
    const summary = info.rating && (
        <p className="mb-8 flex items-center gap-2 text-sm" style={{ color: 'var(--s-muted)' }}>
            <span style={{ color: 'var(--s-accent)' }}><Stars rating={info.rating.average} /></span>
            {info.rating.average.toFixed(1)} · {info.rating.count} review{info.rating.count === 1 ? '' : 's'}
        </p>
    )

    if (variant === 'quote') {
        const r = info.reviews[i % info.reviews.length]
        return (
            <section id="reviews" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
                <div className={cx(INNER, 'max-w-3xl text-center')}>
                    <Eyebrow className="mb-6">{eyebrow}</Eyebrow>
                    <blockquote>
                        <p className="text-balance leading-snug" style={{ fontFamily: 'var(--s-heading)', fontSize: fluid(1.5, 4.4, 2.6) }}>“{r.text}”</p>
                        <footer className="mt-6 flex flex-col items-center gap-2 text-sm">
                            {r.rating > 0 && <span style={{ color: 'var(--s-accent)' }}><Stars rating={r.rating} /></span>}
                            <span className="font-semibold">{r.name}</span>
                        </footer>
                    </blockquote>
                    {info.reviews.length > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            {info.reviews.map((_, j) => (
                                <button key={j} type="button" aria-label={`Review ${j + 1}`} onClick={() => setI(j)} className="flex h-11 w-8 items-center justify-center">
                                    <span className="h-1.5 rounded-full transition-all" style={{ width: j === i ? 20 : 6, background: j === i ? 'var(--s-fg)' : 'var(--s-border)' }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section id="reviews" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
            <div className={INNER}>
                <SectionTitle eyebrow={eyebrow} title={title} className="!mb-3" />
                {summary}
                <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 @3xl:mx-0 @3xl:grid @3xl:grid-cols-3 @3xl:overflow-visible @3xl:px-0 [scrollbar-width:none]">
                    {info.reviews.slice(0, 6).map((r, j) => (
                        <figure key={j} className="flex w-[82%] shrink-0 snap-start flex-col gap-4 p-6 @3xl:w-auto" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            {r.rating > 0 && <span style={{ color: 'var(--s-accent)' }}><Stars rating={r.rating} /></span>}
                            <blockquote className="text-[16px] leading-relaxed">“{r.text}”</blockquote>
                            <figcaption className="mt-auto text-sm font-semibold">{r.name}</figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
}

export function VisitSection({ eyebrow = 'Visit', title = 'Hours & policies', className, style }: {
    eyebrow?: string
    title?: string
    className?: string
    style?: React.CSSProperties
}) {
    const { info, site } = useSite()
    const links = contactLinks(site.content)
    const { cancelDays, rescheduleDays, readBeforeBooking } = info.policies
    const policyLines = [
        cancelDays > 0 && `Cancel at least ${cancelDays} day${cancelDays === 1 ? '' : 's'} before your appointment.`,
        rescheduleDays > 0 && `Reschedule at least ${rescheduleDays} day${rescheduleDays === 1 ? '' : 's'} before your appointment.`,
    ].filter(Boolean) as string[]
    const card = 'flex flex-col gap-3 p-6'
    const cardStyle = { background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }
    const label = 'text-xs font-semibold uppercase tracking-[0.14em]'

    return (
        <section id="visit" className={cx(SECTION, 'scroll-mt-16', className)} style={style}>
            <div className={INNER}>
                <SectionTitle eyebrow={eyebrow} title={title} />
                <div className="grid gap-3 @3xl:grid-cols-3 @3xl:gap-4">
                    <div className={card} style={cardStyle}>
                        <p className={label} style={{ color: 'var(--s-muted)' }}>Hours</p>
                        {info.hours.length ? (
                            <dl className="flex flex-col gap-2 text-[15px]">
                                {info.hours.map(h => (
                                    <div key={h.days} className="flex justify-between gap-4">
                                        <dt className="font-medium">{h.days}</dt>
                                        <dd className="text-right" style={{ color: 'var(--s-muted)' }}>{h.hours}</dd>
                                    </div>
                                ))}
                            </dl>
                        ) : <p className="text-[15px]" style={{ color: 'var(--s-muted)' }}>By appointment</p>}
                    </div>
                    <div className={card} style={cardStyle}>
                        <p className={label} style={{ color: 'var(--s-muted)' }}>Location & contact</p>
                        <p className="text-[15px] font-medium">{info.travels ? 'I travel to you' : info.place ?? 'Address shared when you book'}</p>
                        {!info.travels && info.place && <p className="text-sm" style={{ color: 'var(--s-muted)' }}>Exact address is sent with your booking confirmation.</p>}
                        {links.length > 0 && (
                            <ul className="mt-1 flex flex-col">
                                {links.map(l => (
                                    <li key={l.label}>
                                        <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 text-[15px]" style={{ borderTop: '1px solid var(--s-border)' }}>
                                            <span style={{ color: 'var(--s-muted)' }}>{l.label}</span>
                                            <span className="truncate font-medium underline-offset-4 hover:underline">{l.display}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className={card} style={cardStyle}>
                        <p className={label} style={{ color: 'var(--s-muted)' }}>Policies</p>
                        {policyLines.length === 0 && !readBeforeBooking && <p className="text-[15px]" style={{ color: 'var(--s-muted)' }}>See booking details when you book.</p>}
                        {policyLines.map(p => <p key={p} className="text-[15px]">{p}</p>)}
                        {readBeforeBooking && (
                            <details className="group text-[15px]">
                                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-medium">
                                    Read before booking
                                    <span className="transition-transform group-open:rotate-45" aria-hidden>+</span>
                                </summary>
                                <p className="whitespace-pre-line pb-1 leading-relaxed" style={{ color: 'var(--s-muted)' }}>{readBeforeBooking}</p>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export function BookBand({ title, body, className, style, inverse }: { title?: string; body?: string; className?: string; style?: React.CSSProperties; inverse?: boolean }) {
    const { bookHref, info } = useSite()
    return (
        <section className={cx(SECTION, 'text-center', className)} style={{ background: inverse ? 'var(--s-fg)' : 'var(--s-accent)', color: inverse ? 'var(--s-bg)' : 'var(--s-accent-fg)', ...style }}>
            <div className={cx(INNER, 'flex max-w-2xl flex-col items-center gap-6')}>
                <Heading style={{ fontSize: fluid(2, 6, 3.5) }}>{title ?? 'Ready when you are.'}</Heading>
                <p className="text-[17px] opacity-80">{body ?? `Pick a service and a time that works. ${info.businessName} will see you soon.`}</p>
                <Button href={bookHref()} size="lg" variant="inverse" className={inverse ? '' : '!bg-[var(--s-accent-fg)] !text-[var(--s-accent)] !border-[var(--s-accent-fg)]'}>Book an appointment</Button>
            </div>
        </section>
    )
}

export function Footer() {
    const { info, site, bookHref } = useSite()
    const links = contactLinks(site.content).filter(l => l.label === 'Instagram' || l.label === 'TikTok')
    return (
        <footer className={cx(PAD_X, 'py-10')} style={{ borderTop: '1px solid var(--s-border)' }}>
            <div className={cx(INNER, 'flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between')}>
                <div className="flex items-center gap-3">
                    <Logo size={32} />
                    <div>
                        <p className="font-semibold" style={{ fontFamily: 'var(--s-heading)' }}>{info.businessName}</p>
                        {info.place && <p className="text-sm" style={{ color: 'var(--s-muted)' }}>{info.place}</p>}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    {links.map(l => <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center underline-offset-4 hover:underline">{l.display}</a>)}
                    <a href={bookHref()} className="flex min-h-11 items-center font-semibold" style={{ color: 'var(--s-accent)' }}>Book online</a>
                </div>
            </div>
            <p className={cx(INNER, 'mt-8 text-xs')} style={{ color: 'var(--s-muted)' }}>
                © {new Date().getFullYear()} {info.businessName} · Booking by <a href="https://afroallure.co" className="underline underline-offset-2">AfroAllure</a>
            </p>
        </footer>
    )
}

/** Rating and services count, for heroes. */
export function TrustLine({ className }: { className?: string }) {
    const { info } = useSite()
    const bits = [
        info.rating && `${info.rating.average.toFixed(1)}★ from ${info.rating.count} review${info.rating.count === 1 ? '' : 's'}`,
        info.services.length > 0 && `${info.services.length} service${info.services.length === 1 ? '' : 's'}`,
        info.travels ? 'Travels to you' : info.place,
    ].filter(Boolean)
    if (!bits.length) return null
    return <p className={cx('text-sm', className)} style={{ color: 'var(--s-muted)' }}>{bits.join('  ·  ')}</p>
}
