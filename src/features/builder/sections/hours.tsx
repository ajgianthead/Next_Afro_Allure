'use client'

import { Accessibility, Car, ChevronDown, Clock, MapPin, Navigation, Train } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder } from '../render/context'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { directionsHref, EditorNote, Header, MapEmbed, parseRanges, Scroller, useToday, weekRows } from './shared'
import type { LayoutProps, SectionDefinition } from './types'

export interface HoursContent {
    eyebrow: string
    heading: string
    intro: string
    /** Parking, transit, accessibility notes (shown by the layouts that have room for them). */
    parking: string
    gettingHere: string
    accessibility: string
    /** "I travel to you" areas, one per line. */
    areas: string
    media: SiteMedia | null
    showBook: boolean
}

const DEFAULT: HoursContent = {
    eyebrow: 'Visit',
    heading: 'Hours & location',
    intro: '',
    parking: '',
    gettingHere: '',
    accessibility: '',
    areas: '',
    media: null,
    showBook: true,
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useVisit(c: HoursContent) {
    const { info, bookHref, openings, week } = useBuilder()
    return {
        place: info.place,
        travels: info.travels,
        hours: info.hours,
        rows: weekRows(info.hours),
        openings: openings ?? [],
        week: week ?? [],
        areas: c.areas.split('\n').map(s => s.trim()).filter(Boolean),
        book: bookHref(),
        placeLine: info.travels ? 'I travel to you' : info.place,
        privacy: info.travels ? 'Tell me your address when you book.' : 'The exact address is sent when you book.',
    }
}

function HoursList({ c, className, compact }: { c: HoursContent; className?: string; compact?: boolean }) {
    const t = useVisit(c)
    if (!t.hours.length) return <EditorNote>Your hours show here. Set them on the Availability page.</EditorNote>
    return (
        <dl className={cx('grid grid-cols-[auto_1fr] gap-x-6', compact ? 'gap-y-1 text-[14.5px]' : 'gap-y-2 text-[15.5px]', className)}>
            {t.hours.map(h => (
                <div key={h.days} className="contents">
                    <dt><Txt role="day" as="span" enter={false} defaults={{ size: compact ? 14.5 : 15.5, weight: 600 }}>{h.days}</Txt></dt>
                    <dd><Txt role="time" as="span" enter={false} defaults={{ size: compact ? 14.5 : 15.5 }} className="!text-[color:var(--s-muted)]">{h.hours}</Txt></dd>
                </div>
            ))}
        </dl>
    )
}

function Place({ c, className, withButton = true }: { c: HoursContent; className?: string; withButton?: boolean }) {
    const t = useVisit(c)
    if (!t.placeLine) return <EditorNote>Your city shows here. Add your address in Settings.</EditorNote>
    return (
        <div className={cx('flex flex-col gap-2', className)}>
            <p className="flex items-start gap-2"><MapPin size={18} className="mt-0.5 flex-none" style={{ color: 'var(--s-accent)' }} aria-hidden />
                <Txt role="place" as="span" enter={false} defaults={{ size: 17, weight: 600 }}>{t.placeLine}</Txt></p>
            {t.travels && t.areas.length > 0 && <Txt role="note" defaults={{ size: 14.5 }} className="!text-[color:var(--s-muted)]">{t.areas.join(' · ')}</Txt>}
            <Txt role="note" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{t.privacy}</Txt>
            {withButton && t.place && !t.travels && (
                <div className="pt-2"><Btn href={directionsHref(t.place)} variant="secondary"><Navigation size={15} aria-hidden />Directions</Btn></div>
            )}
        </div>
    )
}

function Notes({ c, className }: { c: HoursContent; className?: string }) {
    const rows = [
        c.parking && { icon: Car, title: 'Parking', text: c.parking },
        c.gettingHere && { icon: Train, title: 'Getting here', text: c.gettingHere },
        c.accessibility && { icon: Accessibility, title: 'Accessibility', text: c.accessibility },
    ].filter(Boolean) as { icon: typeof Car; title: string; text: string }[]
    if (!rows.length) return null
    return (
        <ul className={cx('flex flex-col gap-3', className)}>
            {rows.map(r => (
                <li key={r.title} className="flex gap-3"><r.icon size={18} className="mt-0.5 flex-none" style={{ color: 'var(--s-accent)' }} aria-hidden />
                    <span><Txt role="noteTitle" as="span" enter={false} defaults={{ size: 15, weight: 600 }}>{r.title}</Txt>
                        <Txt role="note" enter={false} defaults={{ size: 14.5, leading: 1.55 }} className="!text-[color:var(--s-muted)]">{r.text}</Txt></span>
                </li>
            ))}
        </ul>
    )
}

function TodayBadge({ className }: { className?: string }) {
    const today = useToday()
    if (!today) return null
    return (
        <span className={cx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold', className)} style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>
            <span aria-hidden className={cx('h-2 w-2 rounded-full', today.open ? 'bg-emerald-500' : 'bg-zinc-400')} />{today.label}
        </span>
    )
}

function Openings({ c, className, vertical }: { c: HoursContent; className?: string; vertical?: boolean }) {
    const t = useVisit(c)
    const { editing } = useBuilder()
    if (!t.openings.length) {
        return editing
            ? <EditorNote>Your next open times show here, straight from your calendar.</EditorNote>
            : <p className={cx('text-[15px]', className)} style={{ color: 'var(--s-muted)' }}>Fully booked this week. <a href={t.book} className="font-semibold underline underline-offset-4">Join the waitlist</a></p>
    }
    return (
        <ul className={cx('flex gap-2', vertical ? 'flex-col' : 'flex-wrap', className)}>
            {t.openings.map(o => (
                <Item as="li" key={o.label}>
                    <a href={o.href ?? t.book} className="flex min-h-11 items-center justify-between gap-3 px-4 text-[15px] font-semibold transition-colors hover:border-[color:var(--s-accent)]"
                        style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-button-radius)', background: 'var(--s-card)' }}>
                        {o.label}<span aria-hidden style={{ color: 'var(--s-accent)' }}>→</span>
                    </a>
                </Item>
            ))}
        </ul>
    )
}

const BookBtn = ({ c, className }: { c: HoursContent; className?: string }) => {
    const t = useVisit(c)
    return c.showBook ? <div className={className}><Btn href={t.book}>Book now</Btn></div> : null
}

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => <Item card className={cx('flex flex-col gap-4 p-6 @3xl:p-8', className)}>{children}</Item>
const Label = ({ children }: { children: React.ReactNode }) =>
    <Txt role="label" as="h3" defaults={{ size: 12, weight: 700, case: 'upper', tracking: 0.14 }} className="!text-[color:var(--s-muted)]">{children}</Txt>

// ─── Layouts ─────────────────────────────────────────────────────────────────

const HoursAddress = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="flex flex-col gap-10">
        <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} />
        <div className="grid gap-10 @3xl:grid-cols-2">
            <div className="flex flex-col gap-3"><Label>Hours</Label><HoursList c={c} /></div>
            <div className="flex flex-col gap-3"><Label>Location</Label><Place c={c} /><Notes c={c} className="pt-3" /></div>
        </div>
        <BookBtn c={c} />
    </div>
)

const HoursTable = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
            {t.hours.length ? (
                <table className="w-full border-collapse">
                    <tbody>
                        {t.rows.map(r => (
                            <tr key={r.day} className="border-b" style={{ borderColor: 'var(--s-border)', background: r.today ? 'var(--s-surface)' : undefined }}>
                                <th scope="row" className="py-3 pl-3 text-left font-semibold">{r.day}{r.today && <span className="ml-2 text-xs font-medium" style={{ color: 'var(--s-accent-text)' }}>Today</span>}</th>
                                <td className="py-3 pr-3 text-right" style={{ color: r.closed ? 'var(--s-muted)' : undefined }}>{r.hours}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <HoursList c={c} />}
            <Place c={c} className="items-center text-center" />
        </div>
    )
}

const AddressCard = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
        <Card className="items-center text-center"><Place c={c} className="items-center" /><TodayBadge /></Card>
    </div>
)

const MapDetails = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-center">
            <MapEmbed place={t.travels ? null : t.place} className="h-72 @3xl:h-96" />
            <div className="flex flex-col gap-6"><Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} /><Place c={c} /><HoursList c={c} compact /></div>
        </div>
    )
}

const FullMapCard = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="relative">
            <MapEmbed place={t.travels ? null : t.place} className="h-80 @3xl:h-[480px]" rounded={false} />
            <div className="relative -mt-16 px-5 @3xl:absolute @3xl:left-12 @3xl:top-1/2 @3xl:mt-0 @3xl:-translate-y-1/2 @3xl:px-0">
                <Card className="@3xl:max-w-sm"><Header eyebrow={c.eyebrow} heading={c.heading} size={28} /><Place c={c} /><HoursList c={c} compact /></Card>
            </div>
        </div>
    )
}

const OpenNow = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="flex flex-col items-center gap-6 text-center">
        <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
        <TodayBadge className="!text-[15px] !px-4 !py-2" />
        <HoursList c={c} className="text-left" />
        <BookBtn c={c} />
    </div>
)

const NextOpenings = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <Header eyebrow={c.eyebrow} heading={c.heading || 'Next openings'} intro={c.intro} center />
        <Openings c={c} className="justify-center" />
        <p className="text-center text-sm" style={{ color: 'var(--s-muted)' }}>Times update as people book.</p>
    </div>
)

const TwoCards = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="flex flex-col gap-10">
        <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
        <div className="grid gap-5 @3xl:grid-cols-2">
            <Card><Label>Location</Label><Place c={c} /><Notes c={c} /></Card>
            <Card><Label>Hours</Label><HoursList c={c} /><TodayBadge className="self-start" /></Card>
        </div>
    </div>
)

const IconsRow = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    const today = useToday()
    const cells = [
        { icon: MapPin, title: t.travels ? 'Location' : 'Address', text: t.placeLine ?? 'Set in Settings' },
        { icon: Clock, title: 'Today', text: today?.label ?? 'See hours' },
        { icon: Car, title: 'Parking', text: c.parking || 'Ask when you book' },
        { icon: Accessibility, title: 'Accessibility', text: c.accessibility || 'Ask when you book' },
    ]
    return (
        <div className="flex flex-col gap-10">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
            <ul className="grid grid-cols-2 gap-6 @3xl:grid-cols-4">
                {cells.map(x => (
                    <Item as="li" key={x.title} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }}><x.icon size={20} aria-hidden /></span>
                        <Txt role="noteTitle" as="h3" defaults={{ size: 15, weight: 600 }}>{x.title}</Txt>
                        <Txt role="note" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{x.text}</Txt>
                    </Item>
                ))}
            </ul>
        </div>
    )
}

const WeekGrid = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="flex flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} />
            <ol className="grid grid-cols-2 gap-2 @2xl:grid-cols-4 @4xl:grid-cols-7">
                {t.rows.map(r => (
                    <Item as="li" key={r.day} className="flex flex-col gap-1 p-4"
                        style={{ border: `1px solid ${r.today ? 'var(--s-accent)' : 'var(--s-border)'}`, borderRadius: 'var(--s-radius)', background: r.closed ? 'transparent' : 'var(--s-card)' }}>
                        <Txt role="day" as="span" defaults={{ size: 13, weight: 700, case: 'upper', tracking: 0.12 }}>{r.day}</Txt>
                        <Txt role="time" as="span" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{r.hours}</Txt>
                    </Item>
                ))}
            </ol>
            <Place c={c} />
        </div>
    )
}

const WeekStrip = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="flex flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} />
            <Scroller label="This week, scroll sideways">
                {(t.week.length ? t.week.map(d => ({ key: d.date, top: d.day, mid: d.date, open: d.open, today: d.day === 'Today' })) : t.rows.map(r => ({ key: r.day, top: r.day, mid: r.hours, open: !r.closed, today: r.today }))).map(d => (
                    <Item key={d.key} className="flex w-28 flex-none snap-start flex-col items-center gap-1.5 p-4 text-center"
                        style={{ border: `1.5px solid ${d.today ? 'var(--s-accent)' : 'var(--s-border)'}`, borderRadius: 'var(--s-radius)' }}>
                        <span className="text-[13px] font-bold uppercase tracking-wider">{d.top}</span>
                        <span className="text-[13px]" style={{ color: 'var(--s-muted)' }}>{d.mid}</span>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold"><span aria-hidden className={cx('h-2 w-2 rounded-full', d.open ? 'bg-emerald-500' : 'bg-zinc-400')} />{d.open ? 'Open' : t.week.length ? 'Full' : 'Closed'}</span>
                    </Item>
                ))}
            </Scroller>
            <BookBtn c={c} />
        </div>
    )
}

const BigToday = ({ content: c }: LayoutProps<HoursContent>) => {
    const today = useToday()
    return (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
            {c.eyebrow && <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className="!text-[color:var(--s-accent-text)]">{c.eyebrow}</Txt>}
            <Txt role="today" as="h2" defaults={{ font: 'heading', size: 72, weight: 600, leading: 1 }}>{today ? (today.open ? `Open today ${today.hours}` : 'Closed today') : c.heading}</Txt>
            <Place c={c} className="items-center" withButton={false} />
            <BookBtn c={c} />
        </div>
    )
}

const OpeningsMap = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:items-start">
            <div className="flex flex-col gap-6"><Header eyebrow={c.eyebrow} heading={c.heading || 'Next openings'} intro={c.intro} /><Openings c={c} vertical /><Place c={c} withButton={false} /></div>
            <MapEmbed place={t.travels ? null : t.place} className="h-72 @3xl:h-[420px]" />
        </div>
    )
}

const ServiceArea = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <Header eyebrow={c.eyebrow} heading={c.heading || 'I come to you'} intro={c.intro} center />
            {t.areas.length > 0
                ? <ul className="flex flex-wrap justify-center gap-2">{t.areas.map(a => <Item as="li" key={a} className="rounded-full px-4 py-2 text-[15px] font-medium" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>{a}</Item>)}</ul>
                : <EditorNote>List the areas you travel to (Properties → Areas I travel to).</EditorNote>}
            <HoursList c={c} compact className="text-left" />
            <BookBtn c={c} />
        </div>
    )
}

const StudioPhoto = ({ content: c }: LayoutProps<HoursContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-2 @3xl:items-center">
        <Media media={c.media} label="a photo of your space" className="aspect-[4/3] w-full" kenburns />
        <div className="flex flex-col gap-6"><Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} /><Place c={c} /><HoursList c={c} compact /></div>
    </div>
)

const AccordionLayout = ({ content: c }: LayoutProps<HoursContent>) => {
    const panels = [
        { title: 'Hours', body: <HoursList c={c} /> },
        { title: 'Getting here', body: <div className="flex flex-col gap-3"><Place c={c} />{c.gettingHere && <p className="text-[15px]" style={{ color: 'var(--s-muted)' }}>{c.gettingHere}</p>}</div> },
        ...(c.parking ? [{ title: 'Parking', body: <p className="text-[15px]" style={{ color: 'var(--s-muted)' }}>{c.parking}</p> }] : []),
        ...(c.accessibility ? [{ title: 'Accessibility', body: <p className="text-[15px]" style={{ color: 'var(--s-muted)' }}>{c.accessibility}</p> }] : []),
    ]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
            <div className="flex flex-col gap-3">
                {panels.map((p, i) => (
                    <Item key={p.title}>
                        <details open={i === 0} className="group" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                                <Txt role="noteTitle" as="span" defaults={{ font: 'heading', size: 20, weight: 600 }}>{p.title}</Txt>
                                <ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden />
                            </summary>
                            <div className="px-5 pb-5">{p.body}</div>
                        </details>
                    </Item>
                ))}
            </div>
        </div>
    )
}

const MapBackground = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10 opacity-35 grayscale" aria-hidden><MapEmbed place={t.travels ? null : t.place} className="h-full !min-h-full" rounded={false} decorative /></div>
            <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg, var(--s-bg) 25%, color-mix(in srgb, var(--s-bg) 55%, transparent))' }} />
            <div className="flex max-w-md flex-col gap-6 px-5 py-16 @3xl:px-12 @3xl:py-24 @5xl:px-20">
                <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} /><HoursList c={c} /><Place c={c} />
            </div>
        </div>
    )
}

const Timeline = ({ content: c }: LayoutProps<HoursContent>) => {
    const today = useToday()
    const ranges = today?.open ? parseRanges(today.hours) : []
    const [lo, hi] = [6, 22]
    const pct = (h: number) => `${Math.max(0, Math.min(100, ((h - lo) / (hi - lo)) * 100))}%`
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading || 'Today'} intro={c.intro} />
            <div className="flex flex-col gap-2" data-enter="item">
                <div className="relative h-10 overflow-hidden" style={{ background: 'var(--s-surface)', borderRadius: 999 }} role="img" aria-label={today?.label ?? 'Hours'}>
                    {ranges.map(([a, b], i) => <span key={i} className="absolute inset-y-0" style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})`, background: 'var(--s-accent)', borderRadius: 999 }} />)}
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'var(--s-muted)' }}><span>6 AM</span><span>Noon</span><span>6 PM</span><span>10 PM</span></div>
            </div>
            <p className="text-lg font-semibold">{today?.label ?? 'Set your hours on the Availability page'}</p>
            <HoursList c={c} compact />
        </div>
    )
}

const Minimal = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    return (
        <div className="flex flex-col gap-4">
            <Header eyebrow={c.eyebrow} heading={c.heading} size={28} />
            <ul className="flex flex-col gap-1 text-[15.5px]">
                {t.hours.map(h => <li key={h.days}><span className="font-semibold">{h.days}</span> · {h.hours}</li>)}
                {t.placeLine && <li><span className="font-semibold">{t.travels ? 'Mobile' : 'Location'}</span> · {t.placeLine}</li>}
            </ul>
        </div>
    )
}

const FooterStrip = ({ content: c }: LayoutProps<HoursContent>) => {
    const t = useVisit(c)
    const today = useToday()
    return (
        <div className="flex flex-col items-center justify-between gap-3 text-[14.5px] @3xl:flex-row">
            {t.placeLine && <span className="inline-flex items-center gap-2"><MapPin size={15} style={{ color: 'var(--s-accent)' }} aria-hidden />{t.placeLine}</span>}
            {today && <span className="inline-flex items-center gap-2"><Clock size={15} style={{ color: 'var(--s-accent)' }} aria-hidden />{today.label}</span>}
            {c.showBook && <a href={t.book} className="font-semibold underline underline-offset-4">Book now</a>}
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<HoursContent>>[] = [
    HoursAddress, HoursTable, AddressCard, MapDetails, FullMapCard, OpenNow, NextOpenings, TwoCards,
    IconsRow, WeekGrid, WeekStrip, BigToday, OpeningsMap, ServiceArea, StudioPhoto, AccordionLayout,
    MapBackground, Timeline, Minimal, FooterStrip,
]

export const HoursSection: SectionDefinition<HoursContent> = {
    type: 'Hours',
    label: 'Hours and location',
    description: 'When you’re open and where to find you, with live open times.',
    icon: Clock,
    wireframeId: 'hours',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'day', label: 'Days' },
        { id: 'time', label: 'Times' },
        { id: 'place', label: 'Location' },
        { id: 'noteTitle', label: 'Note titles' },
        { id: 'note', label: 'Notes' },
        { id: 'today', label: 'Big “Open today” line' },
        { id: 'button', label: 'Buttons' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Visit', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Hours & location', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300 },
        { kind: 'toggle', key: 'showBook', label: 'Show a Book button' },
        { kind: 'textarea', key: 'parking', label: 'Parking (optional)', rows: 2, max: 240, placeholder: 'Free street parking on Bergen St.' },
        { kind: 'textarea', key: 'gettingHere', label: 'Getting here (optional)', rows: 2, max: 240, placeholder: '2 blocks from the A/C at Nostrand Ave.' },
        { kind: 'textarea', key: 'accessibility', label: 'Accessibility (optional)', rows: 2, max: 240, placeholder: 'Ground floor, no steps.' },
        { kind: 'textarea', key: 'areas', label: 'Areas I travel to (if you’re mobile)', rows: 3, max: 400, help: 'One per line.' },
        { kind: 'media', key: 'media', label: 'Photo of your space (Studio photo)', accept: 'image' },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 5 || l === 17,
}
