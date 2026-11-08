'use client'

import { Facebook, Instagram, Mail, MapPin, Music2, PanelBottom, Phone, Youtube } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder, useSection } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, LogoMark, Media, Txt } from '../render/primitives'
import { OpeningsSignup } from './shared'
import type { SocialKind } from './navbar'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface FooterContent {
    tagline: string
    links: LinkValue[]
    phone: string
    email: string
    socials: { kind: SocialKind; url: string }[]
    /** Book band / Marquee: the call to action. */
    ctaHeading: string
    book: LinkValue
    signupHeading: string
    photos: SiteMedia[]
    /** Text after the © line, e.g. "Licensed cosmetologist". */
    legal: string
}

const DEFAULT: FooterContent = {
    tagline: '',
    links: [
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Gallery', href: '#gallery' },
        { label: 'Contact', href: '#contact' },
    ],
    phone: '',
    email: '',
    socials: [],
    ctaHeading: 'Ready for your next appointment?',
    book: { label: 'Book now', href: 'book' },
    signupHeading: 'Get first dibs on openings',
    photos: [],
    legal: '',
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useFooter(c: FooterContent) {
    const { info, bookHref, themeProps } = useBuilder()
    return {
        name: info.businessName,
        logo: themeProps.logo,
        place: info.place,
        hours: info.hours,
        links: (c.links ?? []).filter(l => l.label).map(l => ({ label: l.label, href: resolveHref(l.href, bookHref) })),
        book: c.book?.label ? { label: c.book.label, href: resolveHref(c.book.href, bookHref) } : null,
        copy: `© ${new Date().getFullYear()} ${info.businessName}${c.legal ? ` · ${c.legal}` : ''}`,
    }
}

function Name({ c, size = 22, className }: { c: FooterContent; size?: number; className?: string }) {
    const t = useFooter(c)
    if (t.logo) {
        // eslint-disable-next-line @next/next/no-img-element
        return <LogoMark base={Math.round(size * 1.8)} alt={t.name} className={className} />
    }
    return <Txt role="name" as="div" enter={false} defaults={{ font: 'heading', size, weight: 600, leading: 1.1 }} className={className}>{t.name}</Txt>
}

function Tagline({ c, className }: { c: FooterContent; className?: string }) {
    if (!c.tagline) return null
    return <Txt role="tagline" enter={false} defaults={{ size: 14.5, leading: 1.6 }} className={cx('max-w-xs !text-[color:var(--s-muted)]', className)}>{c.tagline}</Txt>
}

function Links({ c, className, vertical }: { c: FooterContent; className?: string; vertical?: boolean }) {
    const t = useFooter(c)
    if (!t.links.length) return null
    return (
        <nav aria-label="Footer">
            <ul className={cx('flex gap-x-6 gap-y-2', vertical ? 'flex-col' : 'flex-wrap', className)}>
                {t.links.map(l => <li key={l.label}><a href={l.href} className="transition-opacity hover:opacity-70"><Txt role="link" as="span" enter={false} defaults={{ size: 14.5 }}>{l.label}</Txt></a></li>)}
            </ul>
        </nav>
    )
}

function Socials({ c, className }: { c: FooterContent; className?: string }) {
    const icons = { instagram: Instagram, tiktok: Music2, facebook: Facebook, youtube: Youtube }
    const list = (c.socials ?? []).filter(s => /^https:\/\//.test(s.url))
    if (!list.length) return null
    return (
        <ul className={cx('flex flex-wrap items-center gap-2', className)}>
            {list.map((s, i) => {
                const Icon = icons[s.kind] ?? Instagram
                return <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.kind} className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-70" style={{ border: '1px solid var(--s-border)' }}><Icon size={17} aria-hidden /></a></li>
            })}
        </ul>
    )
}

function Contact({ c, className }: { c: FooterContent; className?: string }) {
    const t = useFooter(c)
    const rows = [
        c.phone && { icon: Phone, text: c.phone, href: `tel:${c.phone.replace(/[^\d+]/g, '')}` },
        c.email && { icon: Mail, text: c.email, href: `mailto:${c.email}` },
        t.place && { icon: MapPin, text: t.place, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.place)}` },
    ].filter(Boolean) as { icon: typeof Phone; text: string; href: string }[]
    if (!rows.length) return null
    return (
        <ul className={cx('flex flex-col gap-2', className)}>
            {rows.map(r => <li key={r.text}><a href={r.href} className="inline-flex min-w-0 items-center gap-2 text-[14.5px] transition-opacity [overflow-wrap:anywhere] hover:opacity-70" target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"><r.icon size={15} aria-hidden style={{ color: 'var(--s-accent)' }} />{r.text}</a></li>)}
        </ul>
    )
}

function Hours({ c, className }: { c: FooterContent; className?: string }) {
    const t = useFooter(c)
    if (!t.hours.length) return null
    return (
        <dl className={cx('grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[14.5px]', className)}>
            {t.hours.map(h => <div key={h.days} className="contents"><dt style={{ color: 'var(--s-muted)' }}>{h.days}</dt><dd>{h.hours}</dd></div>)}
        </dl>
    )
}

const ColTitle = ({ children }: { children: React.ReactNode }) =>
    <Txt role="colTitle" as="h3" enter={false} defaults={{ size: 12, weight: 700, case: 'upper', tracking: 0.14 }} className="mb-3 !text-[color:var(--s-muted)]">{children}</Txt>

function Legal({ c, className, center }: { c: FooterContent; className?: string; center?: boolean }) {
    const t = useFooter(c)
    return (
        <div className={cx('flex flex-col gap-2 text-[13px] @3xl:flex-row @3xl:items-center @3xl:justify-between', center && 'items-center text-center @3xl:justify-center @3xl:gap-6', className)} style={{ color: 'var(--s-muted)' }}>
            <span>{t.copy}</span>
            <a href="https://afroallure.co" target="_blank" rel="noopener" className="hover:underline">Booking by AfroAllure</a>
        </div>
    )
}

const PAD = 'px-5 @3xl:px-12 @5xl:px-20'
const Inner = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cx('mx-auto w-full max-w-6xl', className)}>{children}</div>
const Foot = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) =>
    <footer className={cx(PAD, 'py-12 @3xl:py-16', className)} style={style}>{children}</footer>
const Rule = () => <hr className="my-8 border-0 border-t" style={{ borderColor: 'var(--s-border)' }} />

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Simple = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between"><Name c={c} /><Links c={c} /></div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const Centered = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner className="flex flex-col items-center gap-5 text-center">
        <Name c={c} /><Tagline c={c} className="mx-auto" /><Links c={c} className="justify-center" /><Socials c={c} className="justify-center" />
        <Legal c={c} center className="pt-4" />
    </Inner></Foot>
)

const Columns = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="grid gap-10 @2xl:grid-cols-2 @4xl:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div className="flex flex-col gap-3"><Name c={c} /><Tagline c={c} /><Socials c={c} className="pt-1" /></div>
            <div><ColTitle>Explore</ColTitle><Links c={c} vertical /></div>
            <div><ColTitle>Contact</ColTitle><Contact c={c} /></div>
            <div><ColTitle>Hours</ColTitle><Hours c={c} /></div>
        </div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const SocialsRow = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="flex flex-col items-start gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between"><div className="flex flex-col gap-2"><Name c={c} /><Tagline c={c} /></div><Socials c={c} /></div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const Minimal = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot className="!py-8"><Inner className="flex flex-col items-center gap-4 text-center"><Links c={c} className="justify-center !text-[13px]" /><Legal c={c} center /></Inner></Foot>
)

const TwoRows = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot className="!py-0"><Inner>
        <div className="flex flex-col gap-6 py-10 @3xl:flex-row @3xl:items-center @3xl:justify-between"><Name c={c} size={20} /><Links c={c} /><Socials c={c} /></div>
        <div className="border-t py-6" style={{ borderColor: 'var(--s-border)' }}><Legal c={c} /></div>
    </Inner></Foot>
)

const BigName = ({ content: c }: LayoutProps<FooterContent>) => {
    const t = useFooter(c)
    const { style } = useSection()
    // Fills the width (about 0.55em per letter) unless the business set a size.
    const fit = style.text.wordmark?.size ? undefined : `clamp(40px, ${Math.min(30, 170 / Math.max(t.name.length, 4)).toFixed(1)}cqi, 260px)`
    return (
        <footer className="overflow-hidden pt-12 @3xl:pt-16">
            <div className={PAD}><Inner className="flex flex-col gap-8 @3xl:flex-row @3xl:justify-between"><Links c={c} /><Contact c={c} /></Inner></div>
            <Txt role="wordmark" as="div" enter={false} defaults={{ font: 'heading', size: 150, weight: 700, leading: 0.85, tracking: -0.03 }} className="mt-10 whitespace-nowrap px-3 text-center @3xl:mt-14">
                <span className="block pb-[0.12em]" style={fit ? { fontSize: fit, lineHeight: 1 } : undefined}>{t.name}</span>
            </Txt>
            <div className={cx(PAD, 'py-6')}><Inner><Legal c={c} /></Inner></div>
        </footer>
    )
}

const BookBand = ({ content: c }: LayoutProps<FooterContent>) => {
    const t = useFooter(c)
    const { palette: p } = useSection()
    return (
        <footer>
            <div className={cx(PAD, 'py-14 text-center @3xl:py-20')} style={{ background: p.accent, color: p.accentFg, ['--s-fg' as string]: p.accentFg, ['--s-accent' as string]: p.bg, ['--s-accent-text' as string]: p.bg, ['--s-accent-fg' as string]: p.fg } as React.CSSProperties}>
                <Inner className="flex flex-col items-center gap-6">
                    <Txt role="ctaHeading" as="h2" defaults={{ font: 'heading', size: 44, weight: 600, leading: 1.1 }} className="max-w-2xl">{c.ctaHeading}</Txt>
                    {t.book && <Btn href={t.book.href}>{t.book.label}</Btn>}
                </Inner>
            </div>
            <Simple content={c} layout={1} />
        </footer>
    )
}

const HoursContact = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="grid gap-10 @3xl:grid-cols-3">
            <div className="flex flex-col gap-3"><Name c={c} /><Tagline c={c} /><Links c={c} className="pt-2" /></div>
            <div><ColTitle>Hours</ColTitle><Hours c={c} /></div>
            <div><ColTitle>Find us</ColTitle><Contact c={c} /><Socials c={c} className="pt-4" /></div>
        </div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

function MapEmbed({ className }: { className?: string }) {
    const { info, editing } = useBuilder()
    if (!info.place) return editing ? <div className={cx('flex items-center justify-center text-sm', className)} style={{ border: '1.5px dashed var(--s-border)', color: 'var(--s-muted)', borderRadius: 'var(--s-radius)' }}>Add your address in Settings to show a map</div> : null
    return (
        <iframe title={`Map of ${info.place}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className={cx('w-full border-0', className)} style={{ borderRadius: 'var(--s-radius)' }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(info.place)}&output=embed`} />
    )
}

const MapFooter = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1.3fr] @3xl:items-center">
            <div className="flex flex-col gap-5"><Name c={c} /><Contact c={c} /><Hours c={c} /></div>
            <MapEmbed className="h-64 @3xl:h-72" />
        </div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const CardFooter = ({ content: c }: LayoutProps<FooterContent>) => (
    <footer className="p-3 @3xl:p-6">
        <div className="px-6 py-10 @3xl:px-12 @3xl:py-14" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 28 }}>
            <Inner>
                <div className="flex flex-col gap-8 @3xl:flex-row @3xl:justify-between"><div className="flex flex-col gap-3"><Name c={c} /><Tagline c={c} /></div><Links c={c} vertical className="@3xl:!flex-row" /><Socials c={c} /></div>
                <Rule /><Legal c={c} />
            </Inner>
        </div>
    </footer>
)

const Split = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="grid gap-10 @3xl:grid-cols-2">
            <div className="flex flex-col gap-4"><Name c={c} size={30} /><Tagline c={c} /><Socials c={c} /></div>
            <div className="grid gap-8 @2xl:grid-cols-2"><div><ColTitle>Pages</ColTitle><Links c={c} vertical /></div><div><ColTitle>Contact</ColTitle><Contact c={c} /></div></div>
        </div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const Signup = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner>
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1.4fr] @3xl:items-end">
            <div className="flex flex-col gap-3"><Name c={c} /><Tagline c={c} /><Links c={c} className="pt-2" /></div>
            <OpeningsSignup heading={c.signupHeading} />
        </div>
        <Rule /><Legal c={c} />
    </Inner></Foot>
)

const PhotoStrip = ({ content: c }: LayoutProps<FooterContent>) => {
    const { editing } = useBuilder()
    const photos: (SiteMedia | null)[] = c.photos?.length ? c.photos.slice(0, 6) : editing ? Array(6).fill(null) : []
    return (
        <footer>
            {photos.length > 0 && (
                <div className="grid grid-cols-3 @3xl:grid-cols-6">
                    {photos.map((m, i) => <Media key={i} media={m} label="a photo" className="aspect-square w-full" rounded={false} />)}
                </div>
            )}
            <Simple content={c} layout={1} />
        </footer>
    )
}

const Stacked = ({ content: c }: LayoutProps<FooterContent>) => (
    <Foot><Inner className="flex flex-col items-center gap-6 text-center">
        <Name c={c} size={28} /><Tagline c={c} className="mx-auto" /><Links c={c} vertical className="items-center" /><Contact c={c} className="items-center" /><Socials c={c} className="justify-center" /><Legal c={c} center className="pt-2" />
    </Inner></Foot>
)

const BoxedCells = ({ content: c }: LayoutProps<FooterContent>) => {
    const cell = 'p-6 @3xl:p-8'
    const line = { borderColor: 'var(--s-border)' }
    return (
        <footer className="border-t" style={line}>
            <div className="grid @3xl:grid-cols-4">
                <div className={cx(cell, 'border-b @3xl:border-b-0 @3xl:border-r')} style={line}><Name c={c} /><Tagline c={c} className="pt-2" /></div>
                <div className={cx(cell, 'border-b @3xl:border-b-0 @3xl:border-r')} style={line}><ColTitle>Pages</ColTitle><Links c={c} vertical /></div>
                <div className={cx(cell, 'border-b @3xl:border-b-0 @3xl:border-r')} style={line}><ColTitle>Contact</ColTitle><Contact c={c} /></div>
                <div className={cell}><ColTitle>Hours</ColTitle><Hours c={c} /></div>
            </div>
            <div className={cx(PAD, 'border-t py-5')} style={line}><Legal c={c} /></div>
        </footer>
    )
}

/** Dark band: the footer in the text color, whatever the section colors. */
const DarkBand = ({ content: c }: LayoutProps<FooterContent>) => (
    <div style={{ background: '#111', color: '#f2f2f2', ['--s-fg' as string]: '#f2f2f2', ['--s-muted' as string]: 'rgba(242,242,242,.62)', ['--s-border' as string]: 'rgba(242,242,242,.16)' }}>
        <Columns content={c} layout={3} />
    </div>
)

const Marquee = ({ content: c }: LayoutProps<FooterContent>) => {
    const t = useFooter(c)
    const word = (t.name + ' · ').repeat(4)
    const line = () => <Txt role="wordmark" as="span" enter={false} defaults={{ font: 'heading', size: 96, weight: 700, leading: 1 }} className="whitespace-nowrap pr-8 uppercase">{word}</Txt>
    return (
        <footer className="overflow-hidden pt-12">
            <div className="aa-marquee" style={{ ['--aa-marquee-duration' as string]: '40s' }}>
                <a href={t.book?.href ?? '#'} aria-label={t.book?.label ?? t.name}>{line()}</a>
                <span aria-hidden className="aa-marquee-dup">{line()}</span>
            </div>
            <div className={cx(PAD, 'py-10')}><Inner className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between"><Links c={c} /><Socials c={c} /></Inner></div>
            <div className={cx(PAD, 'pb-8')}><Inner><Legal c={c} /></Inner></div>
        </footer>
    )
}

const LogoCenter = ({ content: c }: LayoutProps<FooterContent>) => {
    const half = Math.ceil((c.links ?? []).filter(l => l.label).length / 2)
    const links = (c.links ?? []).filter(l => l.label)
    return (
        <Foot><Inner>
            <div className="flex flex-col items-center gap-6 @3xl:grid @3xl:grid-cols-[1fr_auto_1fr] @3xl:gap-10">
                <Links c={{ ...c, links: links.slice(0, half) }} className="justify-center @3xl:justify-end" />
                <Name c={c} size={26} className="order-first @3xl:order-none" />
                <Links c={{ ...c, links: links.slice(half) }} className="justify-center @3xl:justify-start" />
            </div>
            <Rule /><Legal c={c} center />
        </Inner></Foot>
    )
}

const Compact = ({ content: c }: LayoutProps<FooterContent>) => {
    const t = useFooter(c)
    return (
        <footer className={cx(PAD, 'py-5')} style={{ borderTop: '1px solid var(--s-border)' }}>
            <Inner className="flex flex-col items-center gap-3 text-[13px] @3xl:flex-row @3xl:justify-between" >
                <span style={{ color: 'var(--s-muted)' }}>{t.copy}</span>
                <Links c={c} className="justify-center !gap-x-4 !text-[13px]" />
            </Inner>
        </footer>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<FooterContent>>[] = [
    Simple, Centered, Columns, SocialsRow, Minimal, TwoRows, BigName, BookBand,
    HoursContact, MapFooter, CardFooter, Split, Signup, PhotoStrip, Stacked, BoxedCells,
    DarkBand, Marquee, LogoCenter, Compact,
]

export const FooterSection: SectionDefinition<FooterContent> = {
    type: 'Footer',
    label: 'Footer',
    description: 'The bottom of the page: links, contact, hours and socials.',
    icon: PanelBottom,
    wireframeId: 'footer',
    single: true,
    textRoles: [
        { id: 'name', label: 'Business name' },
        { id: 'tagline', label: 'Tagline' },
        { id: 'link', label: 'Links' },
        { id: 'colTitle', label: 'Column titles' },
        { id: 'ctaHeading', label: 'Book band heading' },
        { id: 'signupHeading', label: 'Sign-up heading' },
        { id: 'wordmark', label: 'Big name' },
        { id: 'button', label: 'Button' },
    ],
    fields: [
        { kind: 'textarea', key: 'tagline', label: 'Tagline', rows: 2, max: 160, placeholder: 'Braids and natural hair care in Brooklyn.' },
        { kind: 'list', key: 'links', label: 'Links', itemLabel: 'Link', max: 8, empty: { label: '', href: '#services' }, fields: [{ kind: 'link', key: '', label: 'Link' }] },
        { kind: 'text', key: 'phone', label: 'Phone', max: 30 },
        { kind: 'text', key: 'email', label: 'Email', max: 120 },
        { kind: 'list', key: 'socials', label: 'Social links', itemLabel: 'Social link', max: 4, empty: { kind: 'instagram', url: 'https://' },
            fields: [
                { kind: 'select', key: 'kind', label: 'Site', options: [{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'facebook', label: 'Facebook' }, { value: 'youtube', label: 'YouTube' }] },
                { kind: 'text', key: 'url', label: 'Link', placeholder: 'https://instagram.com/…', max: 200 },
            ] },
        { kind: 'text', key: 'ctaHeading', label: 'Book band heading (Book band)', max: 100 },
        { kind: 'link', key: 'book', label: 'Book button (Book band, Marquee)' },
        { kind: 'text', key: 'signupHeading', label: 'Sign-up heading (Openings signup)', max: 80, help: 'Visitors join your waitlist and get an email when a time opens up.' },
        { kind: 'mediaList', key: 'photos', label: 'Photos and videos (Photo strip)', max: 6 },
        { kind: 'text', key: 'legal', label: 'After the © line (optional)', placeholder: 'Licensed cosmetologist', max: 80 },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: () => true,
    defaultAnimation: { entrance: 'fade' },
}
