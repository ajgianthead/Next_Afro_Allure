'use client'

import { useState } from 'react'
import { CalendarCheck, Phone } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { Stars } from '@/features/siteBuilder/templates/parts'
import { useBuilder, useSection } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { EditorNote, OpeningsSignup, Scroller } from './shared'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface BookNowContent {
    eyebrow: string
    heading: string
    text: string
    primary: LinkValue
    secondary: LinkValue
    phone: string
    media: SiteMedia | null
    /** Stats + CTA: e.g. "300+" / "happy clients" (empty uses the rating and services). */
    stats: { value: string; label: string }[]
}

const DEFAULT: BookNowContent = {
    eyebrow: '',
    heading: 'Ready for your next appointment?',
    text: 'Pick a service and a time that works for you.',
    primary: { label: 'Book now', href: 'book' },
    secondary: { label: '', href: '#services' },
    phone: '',
    media: null,
    stats: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useCta(c: BookNowContent) {
    const { bookHref, info, openings, week } = useBuilder()
    return {
        primary: c.primary?.label ? { label: c.primary.label, href: resolveHref(c.primary.href, bookHref) } : { label: 'Book now', href: bookHref() },
        secondary: c.secondary?.label ? { label: c.secondary.label, href: resolveHref(c.secondary.href, bookHref) } : null,
        tel: c.phone ? `tel:${c.phone.replace(/[^\d+]/g, '')}` : '',
        info, openings: openings ?? [], week: week ?? [], bookHref,
    }
}

const Eyebrow = ({ c, center }: { c: BookNowContent; center?: boolean }) =>
    c.eyebrow ? <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className={cx('!text-[color:var(--s-accent-text)]', center && 'text-center')}>{c.eyebrow}</Txt> : null
const Heading = ({ c, size = 44, className }: { c: BookNowContent; size?: number; className?: string }) =>
    <Txt role="heading" as="h2" defaults={{ font: 'heading', size, weight: 600, leading: 1.1 }} className={className}>{c.heading}</Txt>
const Text = ({ c, className }: { c: BookNowContent; className?: string }) =>
    c.text ? <Txt role="text" defaults={{ size: 17, leading: 1.6 }} className={cx('!text-[color:var(--s-muted)]', className)}>{c.text}</Txt> : null

function Buttons({ c, className, center }: { c: BookNowContent; className?: string; center?: boolean }) {
    const t = useCta(c)
    return (
        <div className={cx('flex flex-wrap gap-3', center && 'justify-center', className)}>
            <Btn href={t.primary.href}>{t.primary.label}</Btn>
            {t.secondary && <Btn href={t.secondary.href} variant="secondary">{t.secondary.label}</Btn>}
        </div>
    )
}

const Stack = ({ c, center, size, className }: { c: BookNowContent; center?: boolean; size?: number; className?: string }) => (
    <div className={cx('flex flex-col gap-4', center && 'items-center text-center', className)}>
        <Eyebrow c={c} center={center} /><Heading c={c} size={size} /><Text c={c} className={cx('max-w-xl', center && 'mx-auto')} /><Buttons c={c} center={center} className="pt-2" />
    </div>
)

/** Text in the accent's readable color, for accent-filled blocks. */
function useOnAccent(): React.CSSProperties {
    const { palette: p } = useSection()
    return { background: p.accent, color: p.accentFg, ['--s-fg' as string]: p.accentFg, ['--s-muted' as string]: p.accentFg, ['--s-accent' as string]: p.bg, ['--s-accent-text' as string]: p.bg, ['--s-accent-fg' as string]: p.fg }
}

const OnPhoto = { color: '#fff', ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent-text' as string]: '#fff' } as React.CSSProperties
const PAD = 'px-5 @3xl:px-12 @5xl:px-20'

// ─── Layouts ─────────────────────────────────────────────────────────────────

const CenteredBand = ({ content: c }: LayoutProps<BookNowContent>) => <Stack c={c} center />

const Split = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
        <div className="flex max-w-2xl flex-col gap-3"><Eyebrow c={c} /><Heading c={c} size={36} /><Text c={c} /></div>
        <Buttons c={c} className="flex-none" />
    </div>
)

const Card = ({ content: c }: LayoutProps<BookNowContent>) => (
    <Item card className="mx-auto w-full max-w-3xl p-8 @3xl:p-14"><Stack c={c} center size={40} /></Item>
)

const MinimalLink = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <p className="text-center text-lg">
            <Txt role="heading" as="span" defaults={{ size: 18, weight: 600 }}>{c.heading}</Txt>{' '}
            <a href={t.primary.href} className="font-semibold underline underline-offset-4" style={{ color: 'var(--s-accent-text)' }}>{t.primary.label} →</a>
        </p>
    )
}

const TwoButtons = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <div className="flex flex-col items-center gap-5 text-center">
            <Eyebrow c={c} center /><Heading c={c} /><Text c={c} className="max-w-xl" />
            <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Btn href={t.primary.href}>{t.primary.label}</Btn>
                {/* The booking page offers the waitlist when nothing is open. */}
                <Btn href={t.secondary?.href ?? t.bookHref()} variant="secondary">{t.secondary?.label ?? 'Join the waitlist'}</Btn>
            </div>
        </div>
    )
}

const GradientBand = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className={cx(PAD, 'py-16 @3xl:py-24')} style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--s-accent) 22%, var(--s-bg)), var(--s-bg) 55%, color-mix(in srgb, var(--s-accent) 12%, var(--s-bg)))' }}>
        <Stack c={c} center />
    </div>
)

const BorderedBox = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className="mx-auto w-full max-w-3xl p-8 @3xl:p-14" style={{ border: '2px solid var(--s-fg)', borderRadius: 'var(--s-radius)', outline: '1px solid var(--s-fg)', outlineOffset: 6 }} data-enter="item">
        <Stack c={c} center size={40} />
    </div>
)

const PhoneBook = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <div className="flex flex-col items-center gap-5 text-center">
            <Eyebrow c={c} center /><Heading c={c} /><Text c={c} className="max-w-xl" />
            <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Btn href={t.primary.href}><CalendarCheck size={16} aria-hidden />{t.primary.label}</Btn>
                {t.tel ? <Btn href={t.tel} variant="secondary"><Phone size={16} aria-hidden />Call {c.phone}</Btn> : <EditorNote className="!p-2">Add a phone number to show Call</EditorNote>}
            </div>
        </div>
    )
}

const PhotoBackground = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10" data-kenburns="" data-parallax="">
            <Media media={c.media} label="a photo behind the heading" className="h-full w-full" rounded={false} />
            <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className={cx(PAD, 'py-24 @3xl:py-32')} style={OnPhoto}><Stack c={c} center size={52} /></div>
    </div>
)

const PhotoBeside = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Media media={c.media} label="a photo" className="aspect-[4/3] w-full" kenburns />
        <Stack c={c} />
    </div>
)

const NextOpenings = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <Eyebrow c={c} center /><Heading c={c} /><Text c={c} className="max-w-xl" />
            {t.openings.length ? (
                <div className="flex flex-wrap justify-center gap-2">
                    {t.openings.map(o => <Btn key={o.label} href={o.href ?? t.primary.href} variant="secondary">{o.label}</Btn>)}
                </div>
            ) : <Buttons c={c} center />}
        </div>
    )
}

const WeekStrip = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3"><Eyebrow c={c} /><Heading c={c} size={36} /><Text c={c} /></div>
            {t.week.length ? (
                <Scroller label="The next 7 days">
                    {t.week.map(d => (
                        <Item key={d.date} className="flex-none snap-start">
                            <a href={t.primary.href} className="flex w-24 flex-col items-center gap-1 p-4 text-center transition-colors hover:border-[color:var(--s-accent)]"
                                style={{ border: '1.5px solid var(--s-border)', borderRadius: 'var(--s-radius)', background: 'var(--s-card)' }}>
                                <span className="text-[13px] font-bold uppercase">{d.day}</span>
                                <span className="text-[13px]" style={{ color: 'var(--s-muted)' }}>{d.date}</span>
                                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold"><span aria-hidden className={cx('h-2 w-2 rounded-full', d.open ? 'bg-emerald-500' : 'bg-zinc-400')} />{d.open ? 'Open' : 'Full'}</span>
                            </a>
                        </Item>
                    ))}
                </Scroller>
            ) : <EditorNote>The next 7 days show here, with open or full dots from your calendar.</EditorNote>}
            <Buttons c={c} />
        </div>
    )
}

const ServicePicker = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    const [pick, setPick] = useState('')
    const href = pick ? t.bookHref(pick) : t.primary.href
    return (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 text-center">
            <Eyebrow c={c} center /><Heading c={c} size={36} /><Text c={c} />
            <div className="flex w-full flex-col gap-2 @2xl:flex-row">
                <label className="sr-only" htmlFor="aa-cta-service">Service</label>
                <select id="aa-cta-service" value={pick} onChange={e => setPick(e.target.value)} className="min-h-12 min-w-0 flex-1 px-4 text-[15px]"
                    style={{ border: '1.5px solid var(--s-border)', borderRadius: 'var(--s-button-radius)', background: 'var(--s-bg)', color: 'var(--s-fg)' }}>
                    <option value="">Choose a service</option>
                    {t.info.services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.price}</option>)}
                </select>
                <Btn href={href} className="!min-h-12">{t.primary.label}</Btn>
            </div>
        </div>
    )
}

const WaitlistForm = ({ content: c }: LayoutProps<BookNowContent>) => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Eyebrow c={c} /><Text c={c} />
        <OpeningsSignup heading={c.heading || 'Fully booked? Get first dibs on openings'} />
    </div>
)

const BigType = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    return (
        <a href={t.primary.href} className="group block text-center" aria-label={t.primary.label}>
            <Txt role="heading" as="h2" defaults={{ font: 'heading', size: 112, weight: 700, leading: 0.9, case: 'upper' }} className="transition-colors group-hover:!text-[color:var(--s-accent-text)]">{c.heading || 'Book your appointment'}</Txt>
            <span className="mt-6 inline-block text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--s-accent-text)' }}>{t.primary.label} →</span>
        </a>
    )
}

const Marquee = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    const onAccent = useOnAccent()
    const word = `${t.primary.label}  •  `.repeat(8)
    const line = <Txt role="heading" as="span" enter={false} defaults={{ font: 'heading', size: 56, weight: 700, case: 'upper', leading: 1 }} className="whitespace-nowrap pr-4">{word}</Txt>
    return (
        <a href={t.primary.href} className="block overflow-hidden py-6" style={onAccent} aria-label={t.primary.label}>
            <div className="aa-marquee" style={{ ['--aa-marquee-duration' as string]: '28s' }}>{line}<span aria-hidden className="aa-marquee-dup">{line}</span></div>
        </a>
    )
}

const Diagonal = ({ content: c }: LayoutProps<BookNowContent>) => {
    const onAccent = useOnAccent()
    return (
        <div className="py-10">
            <div className={cx(PAD, '-skew-y-3 py-16 @3xl:py-20')} style={onAccent}>
                <div className="skew-y-3"><Stack c={c} center /></div>
            </div>
        </div>
    )
}

const QuoteCta = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    const r = t.info.reviews.find(x => x.rating >= 5) ?? t.info.reviews[0]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            {r ? (
                <figure className="flex flex-col items-center gap-3" data-enter="item">
                    <Stars rating={r.rating} size={16} />
                    <blockquote><Txt role="quote" defaults={{ font: 'heading', size: 24, leading: 1.4, italic: true }}>“{r.text}”</Txt></blockquote>
                    <figcaption className="text-sm font-semibold" style={{ color: 'var(--s-muted)' }}>— {r.name}</figcaption>
                </figure>
            ) : <EditorNote>Your best review shows here once clients leave reviews.</EditorNote>}
            <Heading c={c} size={32} /><Buttons c={c} center />
        </div>
    )
}

const StatsCta = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    const stats = c.stats.length ? c.stats : [
        ...(t.info.rating ? [{ value: `${t.info.rating.average.toFixed(1)}★`, label: `from ${t.info.rating.count} reviews` }] : []),
        { value: String(t.info.services.length), label: t.info.services.length === 1 ? 'service' : 'services' },
        ...(t.info.place ? [{ value: t.info.place.split(',')[0], label: 'based in' }] : []),
    ]
    return (
        <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                {stats.map((s, i) => (
                    <Item key={i} className="flex flex-col">
                        <Txt role="stat" as="div" count defaults={{ font: 'heading', size: 48, weight: 700, leading: 1 }}>{s.value}</Txt>
                        <Txt role="statLabel" as="div" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{s.label}</Txt>
                    </Item>
                ))}
            </div>
            <Heading c={c} size={32} /><Buttons c={c} center />
        </div>
    )
}

const StickyBar = ({ content: c }: LayoutProps<BookNowContent>) => {
    const t = useCta(c)
    const { editing } = useBuilder()
    return (
        <div data-aa-bookbar="" className={cx('z-40 flex items-center justify-between gap-4 px-5 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,.25)] @3xl:px-12',
            editing ? 'relative' : 'fixed inset-x-0 bottom-0')} style={{ background: 'var(--s-bg)', borderTop: '1px solid var(--s-border)' }}>
            <Txt role="heading" as="p" enter={false} defaults={{ size: 15, weight: 600 }} className="hidden min-w-0 truncate @2xl:block">{c.heading}</Txt>
            <Btn href={t.primary.href} className="w-full @2xl:w-auto">{t.primary.label}</Btn>
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<BookNowContent>>[] = [
    CenteredBand, Split, Card, MinimalLink, TwoButtons, GradientBand, BorderedBox, PhoneBook,
    PhotoBackground, PhotoBeside, NextOpenings, WeekStrip, ServicePicker, WaitlistForm, BigType, Marquee,
    Diagonal, QuoteCta, StatsCta, StickyBar,
]

export const BookNowSection: SectionDefinition<BookNowContent> = {
    type: 'BookNow',
    label: 'Book now banner',
    description: 'A call to action that sends visitors to booking.',
    icon: CalendarCheck,
    wireframeId: 'cta',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'text', label: 'Text' },
        { id: 'quote', label: 'Review quote' },
        { id: 'stat', label: 'Stat numbers' },
        { id: 'statLabel', label: 'Stat labels' },
        { id: 'button', label: 'Buttons' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label (optional)', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Ready for your next appointment?', max: 100 },
        { kind: 'textarea', key: 'text', label: 'Text', rows: 2, max: 240 },
        { kind: 'link', key: 'primary', label: 'Main button' },
        { kind: 'link', key: 'secondary', label: 'Second button (optional)' },
        { kind: 'text', key: 'phone', label: 'Phone (Phone + Book)', placeholder: '(555) 123-4567', max: 30 },
        { kind: 'media', key: 'media', label: 'Photo or video (Photo layouts)', accept: 'media' },
        { kind: 'list', key: 'stats', label: 'Stats (Stats + CTA)', itemLabel: 'Stat', max: 4, empty: { value: '', label: '' },
            fields: [{ kind: 'text', key: 'value', label: 'Number', placeholder: '300+', max: 12 }, { kind: 'text', key: 'label', label: 'Label', placeholder: 'happy clients', max: 30 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => [6, 9, 16, 17, 20].includes(l),
    defaultStyle: { tint: true },
}

