'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, Clock, Facebook, Instagram, MapPin, Menu, Music2, PanelTop, Phone, X, Youtube } from 'lucide-react'
import { useBuilder } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, LogoMark, Txt } from '../render/primitives'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export type SocialKind = 'instagram' | 'tiktok' | 'facebook' | 'youtube'

export interface NavbarContent {
    links: LinkValue[]
    book: LinkValue
    /** Text beside the logo; empty shows the business name. */
    name: string
    showName: boolean
    phone: string
    announcement: LinkValue
    status: string
    socials: { kind: SocialKind; url: string }[]
}

const DEFAULT: NavbarContent = {
    links: [
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Reviews', href: '#reviews' },
        { label: 'Contact', href: '#contact' },
    ],
    book: { label: 'Book now', href: 'book' },
    name: '',
    showName: true,
    phone: '',
    announcement: { label: '', href: 'book' },
    status: '',
    socials: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useNav(c: NavbarContent) {
    const { info, bookHref, themeProps } = useBuilder()
    return {
        name: c.name || info.businessName,
        logo: themeProps.logo,
        links: (c.links ?? []).filter(l => l.label).map(l => ({ label: l.label, href: resolveHref(l.href, bookHref) })),
        book: c.book?.label ? { label: c.book.label, href: resolveHref(c.book.href, bookHref) } : null,
    }
}

function Brand({ c, size = 36, nameSize = 19, hideNameOnPhone }: { c: NavbarContent; size?: number; nameSize?: number; hideNameOnPhone?: boolean }) {
    const t = useNav(c)
    const { basePath } = useBuilder()
    return (
        <a href={basePath || '/'} className="flex min-w-0 items-center gap-2.5" aria-label={`${t.name}, home`}>
            {t.logo
                // eslint-disable-next-line @next/next/no-img-element
                ? <LogoMark base={size} capOnPhone />
                : <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-full font-bold" style={{ width: size, height: size, background: 'var(--s-accent)', color: 'var(--s-accent-fg)', fontSize: size * 0.36, fontFamily: 'var(--s-heading)' }}>{monogram(t.name)}</span>}
            {c.showName && <Txt role="name" as="span" enter={false} defaults={{ font: 'heading', size: nameSize, weight: 600, leading: 1.1 }} className={cx('truncate', hideNameOnPhone && 'hidden @3xl:block')}>{t.name}</Txt>}
        </a>
    )
}

const monogram = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'A'

function Links({ c, className, linkClass, underline }: { c: NavbarContent; className?: string; linkClass?: string; underline?: boolean }) {
    const t = useNav(c)
    return (
        <ul className={cx('hidden items-center gap-6 @3xl:flex', className)}>
            {t.links.map(l => (
                <li key={l.label}>
                    <a href={l.href} className={cx('group relative inline-block py-1 transition-opacity hover:opacity-70', linkClass)}>
                        <Txt role="link" as="span" enter={false} defaults={{ size: 14.5, weight: 500 }}>{l.label}</Txt>
                        {underline && <span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ background: 'var(--s-accent)' }} />}
                    </a>
                </li>
            ))}
        </ul>
    )
}

function Book({ c, className, small }: { c: NavbarContent; className?: string; small?: boolean }) {
    const t = useNav(c)
    if (!t.book) return null
    return <Btn href={t.book.href} role="button" className={cx(small && '!min-h-9 !px-4 !text-[13px]', className)}>{t.book.label}</Btn>
}

/** Phones: a menu button that opens a full-screen list of links. `always` shows the button on every screen size. */
function MobileMenu({ c, always }: { c: NavbarContent; always?: boolean }) {
    const t = useNav(c)
    const [open, setOpen] = useState(false)
    const btn = useRef<HTMLButtonElement>(null)
    const [host, setHost] = useState<HTMLElement | null>(null)
    useEffect(() => { setHost(btn.current?.ownerDocument.body ?? null) }, [])
    useEffect(() => {
        if (!open) return
        const doc = btn.current?.ownerDocument
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        doc?.addEventListener('keydown', onKey)
        return () => doc?.removeEventListener('keydown', onKey)
    }, [open])
    // The panel copies the section's colors (it's portaled out of the section).
    const vars = btn.current ? Object.fromEntries(['--s-bg', '--s-fg', '--s-accent', '--s-accent-fg', '--s-muted', '--s-border', '--s-heading', '--s-body', '--s-button-radius'].map(v => [v, getComputedStyle(btn.current!).getPropertyValue(v)])) : {}
    return (
        <>
            <button ref={btn} type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}
                className={cx('flex h-10 w-10 flex-none items-center justify-center rounded-full', !always && '@3xl:hidden')} style={{ border: '1px solid var(--s-border)' }}>
                <Menu size={19} aria-hidden />
            </button>
            {open && host && createPortal(
                <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[100] flex flex-col overflow-y-auto p-6"
                    style={{ ...vars, background: 'var(--s-bg)', color: 'var(--s-fg)', fontFamily: 'var(--s-body)' } as React.CSSProperties}>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold" style={{ fontFamily: 'var(--s-heading)' }}>{t.name}</span>
                        <button type="button" autoFocus aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ border: '1px solid var(--s-border)' }}><X size={19} /></button>
                    </div>
                    <nav className="flex flex-1 flex-col justify-center gap-2 py-10">
                        {t.links.map(l => <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="py-2 text-4xl font-semibold" style={{ fontFamily: 'var(--s-heading)' }}>{l.label}</a>)}
                    </nav>
                    {t.book && <a href={t.book.href} className="flex min-h-12 items-center justify-center font-semibold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-button-radius)' }}>{t.book.label}</a>}
                </div>,
                host,
            )}
        </>
    )
}

/** True once the page has scrolled (for bars that change on scroll). */
function useScrolled(threshold = 40) {
    const ref = useRef<HTMLDivElement>(null)
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const win = ref.current?.ownerDocument.defaultView
        if (!win) return
        const on = () => setScrolled(win.scrollY > threshold)
        on()
        win.addEventListener('scroll', on, { passive: true })
        return () => win.removeEventListener('scroll', on)
    }, [threshold])
    return { ref, scrolled }
}

const ROW = 'flex items-center gap-4 px-5 @3xl:px-12 @5xl:px-20'
const Bar = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <nav aria-label="Main" className={cx('w-full', className)} style={{ borderBottom: '1px solid var(--s-border)', ...style }}>{children}</nav>
)

function SocialIcons({ c, className }: { c: NavbarContent; className?: string }) {
    const icons = { instagram: Instagram, tiktok: Music2, facebook: Facebook, youtube: Youtube }
    const list = (c.socials ?? []).filter(s => /^https:\/\//.test(s.url))
    if (!list.length) return null
    return (
        <ul className={cx('flex items-center gap-2', className)}>
            {list.map((s, i) => {
                const Icon = icons[s.kind] ?? Instagram
                return <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.kind} className="flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-70" style={{ border: '1px solid var(--s-border)' }}><Icon size={16} aria-hidden /></a></li>
            })}
        </ul>
    )
}

/** Today's hours, from the business's schedule ("Open today 9 AM – 6 PM"). */
function useToday() {
    const { info } = useBuilder()
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]
    const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const line = info.hours.find(h => {
        const parts = h.days.split(/\s*[–-]\s*/)
        if (parts.length === 1) return parts[0].startsWith(day)
        const a = order.findIndex(d => parts[0].startsWith(d)), b = order.findIndex(d => parts[1].startsWith(d))
        if (a < 0 || b < 0) return false
        const t = order.indexOf(day)
        return a <= b ? t >= a && t <= b : t >= a || t <= b
    })
    if (!line) return null
    return /closed/i.test(line.hours) ? 'Closed today' : `Open today ${line.hours}`
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Classic = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar><div className={cx(ROW, 'h-[72px] justify-between')}><Brand c={c} /><div className="flex items-center gap-6"><Links c={c} /><Book c={c} small /><MobileMenu c={c} /></div></div></Bar>
)

const CenteredLogo = ({ content: c }: LayoutProps<NavbarContent>) => {
    const t = useNav(c)
    const half = Math.ceil(t.links.length / 2)
    return (
        <Bar>
            <div className={cx(ROW, 'h-20 justify-between @3xl:grid @3xl:grid-cols-[1fr_auto_1fr]')}>
                <Links c={{ ...c, links: (c.links ?? []).filter(l => l.label).slice(0, half) }} />
                <div className="@3xl:justify-self-center"><Brand c={c} /></div>
                <div className="flex items-center justify-end gap-6"><Links c={{ ...c, links: (c.links ?? []).filter(l => l.label).slice(half) }} /><Book c={c} small /><MobileMenu c={c} /></div>
            </div>
        </Bar>
    )
}

const LogoOverLinks = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar>
        <div className={cx(ROW, 'justify-between py-4 @3xl:flex-col @3xl:gap-3 @3xl:py-6')}>
            <Brand c={c} size={44} nameSize={24} />
            <div className="flex items-center gap-6"><Links c={c} /><span className="@3xl:hidden"><MobileMenu c={c} /></span></div>
        </div>
    </Bar>
)

const Minimal = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar style={{ borderBottom: 'none' }}><div className={cx(ROW, 'h-[72px] justify-between')}><Brand c={c} /><Book c={c} small /></div></Bar>
)

const AlwaysMenu = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar><div className={cx(ROW, 'h-[72px] justify-between')}><Brand c={c} /><div className="flex items-center gap-3"><span className="hidden @3xl:block"><Book c={c} small /></span><MobileMenu c={c} always /></div></div></Bar>
)

const LeftLinks = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar>
        <div className={cx(ROW, 'h-[72px] justify-between @3xl:grid @3xl:grid-cols-[1fr_auto_1fr]')}>
            <Links c={c} className="!gap-5" />
            <Brand c={c} />
            <div className="flex items-center justify-end gap-3"><Book c={c} small /><MobileMenu c={c} /></div>
        </div>
    </Bar>
)

const RightLogo = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar><div className={cx(ROW, 'h-[72px] justify-between')}><MobileMenu c={c} /><Links c={c} /><Brand c={c} /></div></Bar>
)

const UnderlineTabs = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar><div className={cx(ROW, 'h-[72px] justify-between')}><Brand c={c} /><div className="flex items-center gap-6"><Links c={c} underline className="!gap-8" /><Book c={c} small /><MobileMenu c={c} /></div></div></Bar>
)

const Transparent = ({ content: c }: LayoutProps<NavbarContent>) => {
    const { ref, scrolled } = useScrolled()
    return (
        <div ref={ref} className="absolute inset-x-0 top-0 transition-colors duration-300"
            style={scrolled ? { background: 'var(--s-bg)', color: 'var(--s-fg)', boxShadow: '0 1px 0 var(--s-border)' } : { color: '#fff', ['--s-fg' as string]: '#fff', ['--s-border' as string]: 'rgba(255,255,255,.4)' }}>
            <nav aria-label="Main" className={cx(ROW, 'h-[76px] justify-between')}><Brand c={c} /><div className="flex items-center gap-6"><Links c={c} /><Book c={c} small /><MobileMenu c={c} /></div></nav>
        </div>
    )
}

const FloatingPill = ({ content: c }: LayoutProps<NavbarContent>) => (
    <div className="absolute inset-x-0 top-3 px-3 @3xl:top-5">
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 rounded-full pl-5 pr-2.5 shadow-[0_10px_30px_-12px_rgba(0,0,0,.3)]" style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)' }}>
            <Brand c={c} size={32} nameSize={17} /><div className="flex items-center gap-5"><Links c={c} className="!gap-5" /><Book c={c} small className="!rounded-full" /><MobileMenu c={c} /></div>
        </nav>
    </div>
)

const Glass = ({ content: c }: LayoutProps<NavbarContent>) => (
    <div className="absolute inset-x-0 top-0">
        <nav aria-label="Main" className={cx(ROW, 'h-[72px] justify-between backdrop-blur-xl')} style={{ background: 'color-mix(in srgb, var(--s-bg) 70%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--s-border) 70%, transparent)' }}>
            <Brand c={c} /><div className="flex items-center gap-6"><Links c={c} /><Book c={c} small /><MobileMenu c={c} /></div>
        </nav>
    </div>
)

function Strip({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cx('flex min-h-9 flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 py-1.5 text-[13px] @3xl:justify-between @3xl:px-12 @5xl:px-20', className)} style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>
            {children}
        </div>
    )
}

const InfoBar = ({ content: c }: LayoutProps<NavbarContent>) => {
    const { info } = useBuilder()
    const today = useToday()
    return (
        <div>
            <Strip>
                {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1.5"><Phone size={13} aria-hidden />{c.phone}</a>}
                {info.place && <span className="hidden items-center gap-1.5 @3xl:inline-flex"><MapPin size={13} aria-hidden />{info.place}</span>}
                {today && <span className="inline-flex items-center gap-1.5"><Clock size={13} aria-hidden />{today}</span>}
            </Strip>
            <Classic content={c} layout={1} />
        </div>
    )
}

const Announcement = ({ content: c }: LayoutProps<NavbarContent>) => {
    const { bookHref } = useBuilder()
    const a = c.announcement
    return (
        <div>
            {a?.label && (
                <Strip className="@3xl:!justify-center">
                    <a href={resolveHref(a.href, bookHref)} className="font-medium underline-offset-4 hover:underline">{a.label} →</a>
                </Strip>
            )}
            <Classic content={c} layout={1} />
        </div>
    )
}

const Wordmark = ({ content: c }: LayoutProps<NavbarContent>) => {
    const t = useNav(c)
    const { basePath } = useBuilder()
    return (
        <Bar>
            <div className="flex flex-col gap-3 px-5 pb-4 pt-6 @3xl:px-12 @5xl:px-20">
                <div className="flex items-start justify-between gap-4">
                    <a href={basePath || '/'} className="min-w-0"><Txt role="name" as="span" enter={false} defaults={{ font: 'heading', size: 64, weight: 600, leading: 0.95, tracking: -0.02 }} className="block">{t.name}</Txt></a>
                    <span className="pt-2"><MobileMenu c={c} /></span>
                </div>
                <div className="hidden items-center justify-between border-t pt-3 @3xl:flex" style={{ borderColor: 'var(--s-border)' }}><Links c={c} /><Book c={c} small /></div>
            </div>
        </Bar>
    )
}

const BoxedCells = ({ content: c }: LayoutProps<NavbarContent>) => {
    const t = useNav(c)
    const cell = { borderRight: '1px solid var(--s-border)' }
    return (
        <Bar style={{ borderTop: '1px solid var(--s-border)' }}>
            <div className="flex h-16 items-stretch">
                <div className="flex items-center px-5 @3xl:px-8" style={cell}><Brand c={c} size={32} nameSize={17} hideNameOnPhone /></div>
                {t.links.map(l => (
                    <a key={l.label} href={l.href} className="hidden flex-1 items-center justify-center text-[14px] font-medium transition-colors hover:bg-[color:var(--s-surface)] @3xl:flex" style={cell}>{l.label}</a>
                ))}
                <div className="ml-auto flex items-center px-3 @3xl:hidden"><MobileMenu c={c} /></div>
                {t.book && <a href={t.book.href} className="flex items-center px-5 text-[14px] font-semibold @3xl:px-8" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{t.book.label}</a>}
            </div>
        </Bar>
    )
}

const SocialCenter = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar><div className={cx(ROW, 'h-[72px] justify-between')}><Brand c={c} /><SocialIcons c={c} className="hidden @3xl:flex" /><div className="flex items-center gap-3"><Book c={c} small /><MobileMenu c={c} /></div></div></Bar>
)

const StatusBadge = ({ content: c }: LayoutProps<NavbarContent>) => {
    const { openings } = useBuilder()
    const today = useToday()
    const status = c.status || (openings?.[0] ? `Next opening: ${openings[0].label}` : today ?? '')
    return (
        <Bar>
            <div className={cx(ROW, 'h-[72px] justify-between')}>
                <div className="flex min-w-0 items-center gap-3">
                    <Brand c={c} hideNameOnPhone />
                    {status && <span className="inline-flex min-w-0 items-center gap-1.5 truncate rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
                        <span aria-hidden className="h-2 w-2 flex-none rounded-full bg-emerald-500" /><span className="truncate">{status}</span>
                    </span>}
                </div>
                <div className="flex flex-none items-center gap-6"><Links c={c} /><Book c={c} small /><MobileMenu c={c} /></div>
            </div>
        </Bar>
    )
}

const SplitPill = ({ content: c }: LayoutProps<NavbarContent>) => (
    <Bar style={{ borderBottom: 'none' }}>
        <div className={cx(ROW, 'h-20 justify-between')}>
            <Brand c={c} />
            <div className="hidden rounded-full px-6 py-2.5 @3xl:block" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}><Links c={c} className="!gap-7" /></div>
            <div className="flex items-center gap-3"><Book c={c} small className="!rounded-full" /><MobileMenu c={c} /></div>
        </div>
    </Bar>
)

/** Desktop: a slim vertical bar on the left edge with the logo, links as dots and Book; phones: a top bar. */
const SideRail = ({ content: c }: LayoutProps<NavbarContent>) => {
    const t = useNav(c)
    return (
        <>
            <div className="absolute inset-x-0 top-0 @3xl:hidden" style={{ background: 'var(--s-bg)' }}><Classic content={c} layout={1} /></div>
            <nav aria-label="Main" className="absolute left-4 top-6 hidden w-16 flex-col items-center gap-5 rounded-full py-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,.3)] @3xl:flex" style={{ background: 'var(--s-bg)', border: '1px solid var(--s-border)' }}>
                <Brand c={{ ...c, showName: false }} size={36} />
                <ul className="flex flex-col items-center gap-4">
                    {t.links.map(l => (
                        <li key={l.label}><a href={l.href} className="group relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[color:var(--s-surface)]" aria-label={l.label}>
                            <span aria-hidden className="text-[11px] font-semibold">{l.label.slice(0, 2)}</span>
                            <span aria-hidden className="pointer-events-none absolute left-11 whitespace-nowrap rounded-md px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100" style={{ background: 'var(--s-fg)', color: 'var(--s-bg)' }}>{l.label}</span>
                        </a></li>
                    ))}
                </ul>
                {t.book && <a href={t.book.href} aria-label={t.book.label} className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}><CalendarDays size={17} aria-hidden /></a>}
            </nav>
        </>
    )
}

const BottomBar = ({ content: c }: LayoutProps<NavbarContent>) => {
    const t = useNav(c)
    const { editing } = useBuilder()
    return (
        <div>
            <Bar><div className={cx(ROW, 'h-16 justify-between')}><Brand c={c} size={32} nameSize={17} /><div className="flex items-center gap-6"><Links c={c} /><span className="hidden @3xl:block"><Book c={c} small /></span><MobileMenu c={c} /></div></div></Bar>
            {t.book && (
                <div data-aa-bookbar="" className={cx('z-50 p-3 @3xl:hidden', editing ? 'relative' : 'fixed inset-x-0 bottom-0')} style={{ background: 'color-mix(in srgb, var(--s-bg) 92%, transparent)', borderTop: '1px solid var(--s-border)', backdropFilter: 'blur(10px)' }}>
                    <a href={t.book.href} className="flex min-h-12 items-center justify-center gap-2 font-semibold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-button-radius)' }}><CalendarDays size={17} aria-hidden />{t.book.label}</a>
                </div>
            )}
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<NavbarContent>>[] = [
    Classic, CenteredLogo, LogoOverLinks, Minimal, AlwaysMenu, LeftLinks, RightLogo, UnderlineTabs,
    Transparent, FloatingPill, Glass, InfoBar, Announcement, Wordmark, BoxedCells, SocialCenter,
    StatusBadge, SplitPill, SideRail, BottomBar,
]

export const NavbarSection: SectionDefinition<NavbarContent> = {
    type: 'Navbar',
    label: 'Menu bar',
    description: 'Your logo, links to each part of the page, and a Book button.',
    icon: PanelTop,
    wireframeId: 'navbar',
    single: true,
    textRoles: [
        { id: 'name', label: 'Business name' },
        { id: 'link', label: 'Links' },
        { id: 'button', label: 'Book button' },
    ],
    fields: [
        { kind: 'toggle', key: 'showName', label: 'Show the name beside the logo' },
        { kind: 'text', key: 'name', label: 'Name in the menu bar (optional)', placeholder: 'Same as Name on your website', max: 60, help: 'Only if the menu bar should say something shorter.' },
        { kind: 'list', key: 'links', label: 'Links', itemLabel: 'Link', max: 7, empty: { label: '', href: '#services' },
            fields: [{ kind: 'link', key: '', label: 'Link' }] },
        { kind: 'link', key: 'book', label: 'Book button' },
        { kind: 'text', key: 'phone', label: 'Phone (Info bar)', placeholder: '(555) 123-4567', max: 30 },
        { kind: 'link', key: 'announcement', label: 'Announcement (Announcement bar)', help: 'e.g. “Refer a friend, you both get $10 off”.' },
        { kind: 'text', key: 'status', label: 'Status (Status badge)', placeholder: 'Shows your next opening when empty', max: 60 },
        { kind: 'list', key: 'socials', label: 'Social links (Social center)', itemLabel: 'Social link', max: 4, empty: { kind: 'instagram', url: 'https://' },
            fields: [
                { kind: 'select', key: 'kind', label: 'Site', options: [{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'facebook', label: 'Facebook' }, { value: 'youtube', label: 'YouTube' }] },
                { kind: 'text', key: 'url', label: 'Link', placeholder: 'https://instagram.com/…', max: 200 },
            ] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: () => true,
    sticky: l => ([9, 10, 11, 19].includes(l) ? 'overlay' : l === 14 || l === 12 || l === 13 ? false : true),
    defaultAnimation: { entrance: 'none' },
}
