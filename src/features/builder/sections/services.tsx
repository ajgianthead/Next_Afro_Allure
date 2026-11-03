'use client'

import { useState } from 'react'
import { ChevronDown, Clock, Scissors } from 'lucide-react'
import type { SiteMedia, SiteService } from '@/features/siteBuilder/siteData'
import { useBuilder, useSection } from '../render/context'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import type { LayoutProps, SectionDefinition, ServicePick } from './types'

export interface ServicesContent {
    eyebrow: string
    heading: string
    intro: string
    services: ServicePick
    showDescriptions: boolean
    showDuration: boolean
    bookLabel: string
    /** Band photo behind the Overlap cards layout. */
    media: SiteMedia | null
}

const DEFAULT: ServicesContent = {
    eyebrow: 'Services',
    heading: 'Services & pricing',
    intro: '',
    services: { mode: 'all', ids: [], limit: 0 },
    showDescriptions: true,
    showDuration: true,
    bookLabel: 'Book',
    media: null,
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useServices(c: ServicesContent): SiteService[] {
    const { info } = useBuilder()
    const pick = c.services ?? DEFAULT.services
    const list = pick.mode === 'picked'
        ? pick.ids.map(id => info.services.find(s => s.id === id)).filter((s): s is SiteService => !!s)
        : info.services
    return pick.mode === 'all' && pick.limit > 0 ? list.slice(0, pick.limit) : list
}

function groups(list: SiteService[]): { name: string; items: SiteService[] }[] {
    const out = new Map<string, SiteService[]>()
    for (const s of list) {
        const k = s.category?.trim() || 'Services'
        out.set(k, [...(out.get(k) ?? []), s])
    }
    return [...out].map(([name, items]) => ({ name, items }))
}

const photoOf = (s: SiteService): SiteMedia | null => (s.photo ? { url: s.photo, path: '', kind: 'image' } : null)

function Header({ c, center, className }: { c: ServicesContent; center?: boolean; className?: string }) {
    if (!c.eyebrow && !c.heading && !c.intro) return null
    return (
        <div className={cx('flex flex-col gap-3', center && 'items-center text-center', className)}>
            {c.eyebrow && <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className="!text-[color:var(--s-accent-text)]">{c.eyebrow}</Txt>}
            {c.heading && <Txt role="heading" as="h2" defaults={{ font: 'heading', size: 40, weight: 600, leading: 1.1 }}>{c.heading}</Txt>}
            {c.intro && <Txt role="intro" defaults={{ size: 17, leading: 1.6 }} className={cx('max-w-2xl !text-[color:var(--s-muted)]', center && 'mx-auto')}>{c.intro}</Txt>}
        </div>
    )
}

const Name = ({ s, size = 19, className }: { s: SiteService; size?: number; className?: string }) =>
    <Txt role="name" as="h3" defaults={{ font: 'heading', size, weight: 600, leading: 1.2 }} className={className}>{s.name}</Txt>

const Price = ({ s, size = 17, className }: { s: SiteService; size?: number; className?: string }) =>
    <Txt role="price" as="span" defaults={{ size, weight: 600 }} className={cx('whitespace-nowrap', className)}>{s.price}</Txt>

function Duration({ c, s, className }: { c: ServicesContent; s: SiteService; className?: string }) {
    if (!c.showDuration || !s.duration) return null
    return (
        <Txt role="meta" as="span" defaults={{ size: 13 }} className={cx('inline-flex items-center gap-1 !text-[color:var(--s-muted)]', className)}>
            <Clock size={13} aria-hidden />{s.duration}
        </Txt>
    )
}

function Desc({ c, s, className, clamp }: { c: ServicesContent; s: SiteService; className?: string; clamp?: boolean }) {
    if (!c.showDescriptions || !s.description) return null
    return <Txt role="description" defaults={{ size: 14.5, leading: 1.6 }} className={cx('!text-[color:var(--s-muted)]', clamp && 'line-clamp-3', className)}>{s.description}</Txt>
}

function Book({ c, s, className, quiet }: { c: ServicesContent; s: SiteService; className?: string; quiet?: boolean }) {
    const { bookHref } = useBuilder()
    return <Btn href={bookHref(s.id)} variant={quiet ? 'secondary' : 'primary'} className={className}>{c.bookLabel || 'Book'}<span className="sr-only"> {s.name}</span></Btn>
}

function Empty() {
    const { editing } = useBuilder()
    return editing ? <p className="rounded-lg p-6 text-center text-sm" style={{ border: '1.5px dashed var(--s-border)', color: 'var(--s-muted)' }}>Your services show here. Add them on the Services page.</p> : null
}

/** Section header + list, with the empty state. */
function Frame({ c, center, children, list }: { c: ServicesContent; center?: boolean; children: React.ReactNode; list: SiteService[] }) {
    return (
        <div className="flex flex-col gap-10">
            <Header c={c} center={center} />
            {list.length ? children : <Empty />}
        </div>
    )
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

function PriceRow({ c, s }: { c: ServicesContent; s: SiteService }) {
    return (
        <Item className="flex flex-col gap-1 py-4">
            <div className="flex items-baseline gap-3">
                <Name s={s} size={18} className="min-w-0" />
                <span aria-hidden className="min-w-6 flex-1 translate-y-[-4px] border-b border-dotted" style={{ borderColor: 'var(--s-border)' }} />
                <Price s={s} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1"><Duration c={c} s={s} /><Desc c={c} s={s} className="min-w-0 flex-1 basis-60" /></div>
        </Item>
    )
}

const PriceList = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return <Frame c={c} list={list} center><div className="mx-auto w-full max-w-3xl">{list.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div></Frame>
}

const TwoColumnMenu = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return <Frame c={c} list={list} center><div className="grid gap-x-12 @3xl:grid-cols-2">{list.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div></Frame>
}

const ListBook = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <ul className="flex flex-col">
                {list.map(s => (
                    <Item as="li" key={s.id} className="flex flex-col gap-3 border-t py-5 @3xl:flex-row @3xl:items-center @3xl:gap-8" style={{ borderColor: 'var(--s-border)' }}>
                        <div className="flex min-w-0 flex-1 flex-col gap-1"><Name s={s} /><Desc c={c} s={s} /></div>
                        <div className="flex items-center gap-4"><Duration c={c} s={s} /><Price s={s} /><Book c={c} s={s} /></div>
                    </Item>
                ))}
            </ul>
        </Frame>
    )
}

function ServiceCard({ c, s, aspect = 'aspect-[4/3]', big }: { c: ServicesContent; s: SiteService; aspect?: string; big?: boolean }) {
    return (
        <Item card className="flex flex-col overflow-hidden">
            <Media media={photoOf(s)} label="a photo of this service" className={cx(aspect, 'w-full')} rounded={false} />
            <div className={cx('flex flex-1 flex-col gap-2', big ? 'p-6' : 'p-5')}>
                <div className="flex items-start justify-between gap-3"><Name s={s} size={big ? 22 : 19} /><Price s={s} /></div>
                <Duration c={c} s={s} />
                <Desc c={c} s={s} clamp={!big} />
                <div className="mt-auto pt-3"><Book c={c} s={s} className="w-full" /></div>
            </div>
        </Item>
    )
}

const Cards3 = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return <Frame c={c} list={list}><div className="grid gap-5 @2xl:grid-cols-2 @4xl:grid-cols-3">{list.map(s => <ServiceCard key={s.id} c={c} s={s} />)}</div></Frame>
}

const Cards2 = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return <Frame c={c} list={list}><div className="grid gap-6 @3xl:grid-cols-2">{list.map(s => <ServiceCard key={s.id} c={c} s={s} aspect="aspect-[16/10]" big />)}</div></Frame>
}

const Table = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <div className="hidden @3xl:block">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="text-[13px] uppercase tracking-[0.1em]" style={{ color: 'var(--s-muted)' }}>
                            <th scope="col" className="py-3 font-semibold">Service</th>
                            {c.showDuration && <th scope="col" className="py-3 font-semibold">Time</th>}
                            <th scope="col" className="py-3 font-semibold">Price</th>
                            <th scope="col" className="py-3"><span className="sr-only">Book</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(s => (
                            <tr key={s.id} className="border-t align-middle" style={{ borderColor: 'var(--s-border)' }} data-enter="item">
                                <td className="py-4 pr-6"><Name s={s} size={17} /><Desc c={c} s={s} className="max-w-md" /></td>
                                {c.showDuration && <td className="py-4 pr-6"><Txt role="meta" as="span" defaults={{ size: 14 }}>{s.duration}</Txt></td>}
                                <td className="py-4 pr-6"><Price s={s} /></td>
                                <td className="py-4 text-right"><Book c={c} s={s} quiet /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Phones: the table becomes rows. */}
            <ul className="flex flex-col @3xl:hidden">
                {list.map(s => (
                    <Item as="li" key={s.id} className="flex items-center gap-4 border-t py-4" style={{ borderColor: 'var(--s-border)' }}>
                        <div className="min-w-0 flex-1"><Name s={s} size={17} /><div className="flex gap-3"><Price s={s} size={14} /><Duration c={c} s={s} /></div></div>
                        <Book c={c} s={s} quiet />
                    </Item>
                ))}
            </ul>
        </Frame>
    )
}

function CategoryButtons({ names, active, onPick, vertical }: { names: string[]; active: number; onPick: (i: number) => void; vertical?: boolean }) {
    return (
        <div role="tablist" className={cx('flex gap-2', vertical ? 'flex-row flex-wrap @3xl:flex-col' : 'flex-wrap')}>
            {names.map((n, i) => (
                <button key={n} type="button" role="tab" aria-selected={i === active} onClick={() => onPick(i)}
                    className={cx('text-sm font-semibold transition-colors', vertical ? 'rounded-lg px-4 py-2.5 text-left @3xl:text-base' : 'rounded-full px-4 py-2')}
                    style={i === active ? { background: 'var(--s-accent)', color: 'var(--s-accent-fg)' } : { border: '1px solid var(--s-border)' }}>
                    {n}
                </button>
            ))}
        </div>
    )
}

const CategoryTabs = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const g = groups(list)
    const [active, setActive] = useState(0)
    const cur = g[Math.min(active, g.length - 1)]
    return (
        <Frame c={c} list={list} center>
            <div className="flex flex-col items-center gap-8">
                {g.length > 1 && <CategoryButtons names={g.map(x => x.name)} active={active} onPick={setActive} />}
                <div role="tabpanel" className="w-full max-w-3xl">{cur?.items.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div>
            </div>
        </Frame>
    )
}

const CategoryAccordion = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                {groups(list).map((g, i) => (
                    <Item key={g.name}>
                        <details open={i === 0} className="group overflow-hidden" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                                <Txt role="category" as="span" defaults={{ font: 'heading', size: 22, weight: 600 }}>{g.name}</Txt>
                                <span className="flex items-center gap-3 text-sm" style={{ color: 'var(--s-muted)' }}>{g.items.length}<ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden /></span>
                            </summary>
                            <div className="px-5 pb-2">{g.items.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div>
                        </details>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const Carousel = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 @3xl:-mx-0 @3xl:px-0" tabIndex={0} aria-label="Services, scroll sideways">
                {list.map(s => <div key={s.id} className="w-[78%] flex-none snap-start @2xl:w-[44%] @4xl:w-[31%]"><ServiceCard c={c} s={s} /></div>)}
            </div>
        </Frame>
    )
}

const FeaturedList = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const [first, ...rest] = list
    return (
        <Frame c={c} list={list}>
            <div className="grid gap-8 @3xl:grid-cols-2 @3xl:gap-12">
                {first && (
                    <Item card className="flex flex-col overflow-hidden">
                        <Media media={photoOf(first)} label="a photo of this service" className="aspect-[4/3] w-full" rounded={false} />
                        <div className="flex flex-col gap-3 p-6">
                            <Txt role="badge" defaults={{ size: 12, weight: 700, case: 'upper', tracking: 0.14 }} className="!text-[color:var(--s-accent-text)]">Most booked</Txt>
                            <div className="flex items-start justify-between gap-3"><Name s={first} size={26} /><Price s={first} size={20} /></div>
                            <Duration c={c} s={first} /><Desc c={c} s={first} />
                            <div className="pt-2"><Book c={c} s={first} /></div>
                        </div>
                    </Item>
                )}
                <div className="flex flex-col">{rest.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div>
            </div>
        </Frame>
    )
}

const PhotoRows = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <div className="flex flex-col gap-12">
                {list.map((s, i) => (
                    <Item key={s.id} className="grid items-center gap-6 @3xl:grid-cols-2 @3xl:gap-14">
                        <Media media={photoOf(s)} label="a photo of this service" className={cx('aspect-[4/3] w-full', i % 2 === 1 && '@3xl:order-2')} />
                        <div className="flex flex-col gap-3">
                            <Name s={s} size={28} />
                            <div className="flex flex-wrap items-center gap-4"><Price s={s} size={19} /><Duration c={c} s={s} /></div>
                            <Desc c={c} s={s} />
                            <div className="pt-2"><Book c={c} s={s} /></div>
                        </div>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const HoverReveal = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const { bookHref } = useBuilder()
    return (
        <Frame c={c} list={list}>
            <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-3">
                {list.map(s => (
                    <Item key={s.id} className="group relative aspect-[3/4] overflow-hidden" style={{ borderRadius: 'var(--s-radius)' }}>
                        <a href={bookHref(s.id)} className="absolute inset-0 block" aria-label={`Book ${s.name}, ${s.price}`}>
                            <Media media={photoOf(s)} label="a photo" className="h-full w-full" rounded={false} />
                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4 text-white transition-[padding] duration-300 group-hover:pb-6 group-focus-visible:pb-6"
                                style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.72))', ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent-text' as string]: '#fff' }}>
                                <Name s={s} size={18} />
                                <span className="flex gap-3"><Price s={s} size={14} /><Duration c={c} s={s} /></span>
                                <span className="max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:opacity-100 group-focus-visible:max-h-24 group-focus-visible:opacity-100"><Desc c={c} s={s} clamp /></span>
                            </div>
                        </a>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const Masonry = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const aspects = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]']
    return (
        <Frame c={c} list={list}>
            <div className="columns-2 gap-3 @4xl:columns-3">
                {list.map((s, i) => (
                    <Item key={s.id} className="relative mb-3 break-inside-avoid overflow-hidden" style={{ borderRadius: 'var(--s-radius)' }}>
                        <Media media={photoOf(s)} label="a photo" className={cx(aspects[i % aspects.length], 'w-full')} rounded={false} />
                        <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{s.price}</span>
                        <div className="flex flex-col items-start gap-2 p-3 @2xl:flex-row @2xl:items-center @2xl:justify-between"><Name s={s} size={16} /><Book c={c} s={s} quiet /></div>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const Numbered = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <Frame c={c} list={list}>
            <ol className="grid gap-x-12 gap-y-10 @3xl:grid-cols-2">
                {list.map((s, i) => (
                    <Item as="li" key={s.id} className="flex gap-5">
                        <Txt role="number" as="span" defaults={{ font: 'heading', size: 44, weight: 600, leading: 1 }} className="flex-none whitespace-nowrap tabular-nums !text-[color:var(--s-accent-text)]">{String(i + 1).padStart(2, '0')}</Txt>
                        <div className="flex min-w-0 flex-col gap-2 pt-1">
                            <Name s={s} size={21} />
                            <div className="flex flex-wrap gap-4"><Price s={s} /><Duration c={c} s={s} /></div>
                            <Desc c={c} s={s} />
                        </div>
                    </Item>
                ))}
            </ol>
        </Frame>
    )
}

const BigType = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const { bookHref } = useBuilder()
    return (
        <Frame c={c} list={list}>
            <ul className="flex flex-col">
                {list.map(s => (
                    <Item as="li" key={s.id} className="border-t" style={{ borderColor: 'var(--s-border)' }}>
                        <a href={bookHref(s.id)} className="group flex flex-col gap-2 py-6 @3xl:flex-row @3xl:items-baseline @3xl:justify-between @3xl:gap-8">
                            <Txt role="name" as="h3" defaults={{ font: 'heading', size: 56, weight: 500, leading: 1 }} className="transition-colors group-hover:!text-[color:var(--s-accent-text)]">{s.name}</Txt>
                            <span className="flex flex-none items-baseline gap-5"><Duration c={c} s={s} /><Price s={s} size={18} /></span>
                        </a>
                    </Item>
                ))}
            </ul>
        </Frame>
    )
}

const PricingCards = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const { palette: p } = useSection()
    // The highlighted card swaps to the accent color; its button turns the page color.
    const inverse = { background: p.accent, color: p.accentFg, ['--s-fg' as string]: p.accentFg, ['--s-muted' as string]: p.accentFg, ['--s-accent' as string]: p.bg, ['--s-accent-text' as string]: p.bg, ['--s-accent-fg' as string]: p.fg, ['--s-border' as string]: p.accent }
    return (
        <Frame c={c} list={list} center>
            <div className="grid items-stretch gap-5 @3xl:grid-cols-3">
                {list.map((s, i) => {
                    const featured = i === 1 || list.length === 1
                    return (
                        <Item key={s.id} card className="flex flex-col gap-4 p-7"
                            style={featured ? inverse : undefined}>
                            {featured && <Txt role="badge" defaults={{ size: 12, weight: 700, case: 'upper', tracking: 0.14 }}>Most booked</Txt>}
                            <Name s={s} size={22} />
                            <Txt role="bigPrice" as="div" defaults={{ font: 'heading', size: 44, weight: 600, leading: 1 }}>{s.price}</Txt>
                            <Duration c={c} s={s} />
                            <Desc c={c} s={s} />
                            <div className="mt-auto pt-3"><Book c={c} s={s} className="w-full" /></div>
                        </Item>
                    )
                })}
            </div>
        </Frame>
    )
}

const SplitCategories = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const g = groups(list)
    const [active, setActive] = useState(0)
    const cur = g[Math.min(active, g.length - 1)]
    return (
        <Frame c={c} list={list}>
            <div className="grid gap-8 @3xl:grid-cols-[1fr_2.4fr] @3xl:gap-14">
                <div className="@3xl:sticky @3xl:top-24 @3xl:self-start"><CategoryButtons names={g.map(x => x.name)} active={active} onPick={setActive} vertical /></div>
                <div role="tabpanel">{cur?.items.map(s => <PriceRow key={s.id} c={c} s={s} />)}</div>
            </div>
        </Frame>
    )
}

const CirclePhotos = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const { bookHref } = useBuilder()
    return (
        <Frame c={c} list={list} center>
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 @3xl:grid-cols-3 @5xl:grid-cols-4">
                {list.map(s => (
                    <Item key={s.id} className="flex flex-col items-center gap-3 text-center">
                        <a href={bookHref(s.id)} className="block w-full max-w-[200px]" aria-label={`Book ${s.name}`}>
                            <Media media={photoOf(s)} label="a photo" className="aspect-square w-full !rounded-full" />
                        </a>
                        <Name s={s} size={18} />
                        <span className="flex flex-wrap justify-center gap-3"><Price s={s} size={15} /><Duration c={c} s={s} /></span>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const OverlapCards = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    return (
        <div className="flex flex-col">
            <div className="relative px-5 pb-40 pt-16 @3xl:px-12 @5xl:px-20">
                <div className="absolute inset-0 -z-10 overflow-hidden" data-kenburns="">
                    <Media media={c.media} label="a wide photo for behind the cards" className="h-full w-full" rounded={false} />
                    <div className="absolute inset-0 bg-black/45" />
                </div>
                <div className="mx-auto max-w-6xl" style={{ ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent-text' as string]: '#fff', color: '#fff' }}><Header c={c} /></div>
            </div>
            <div className="mx-auto -mt-28 grid w-full max-w-6xl gap-5 px-5 @2xl:grid-cols-2 @3xl:px-12 @4xl:grid-cols-3 @5xl:px-20">
                {list.length ? list.map(s => <ServiceCard key={s.id} c={c} s={s} />) : <Empty />}
            </div>
        </div>
    )
}

const QuickPicks = ({ content: c }: LayoutProps<ServicesContent>) => {
    const list = useServices(c)
    const { bookHref } = useBuilder()
    return (
        <Frame c={c} list={list} center>
            <div className="flex flex-wrap justify-center gap-3">
                {list.map(s => (
                    <Item key={s.id}>
                        <a href={bookHref(s.id)} className="inline-flex flex-wrap items-center gap-x-2 rounded-full px-5 py-3 text-[15px] transition-colors hover:border-[color:var(--s-accent)]" style={{ border: '1px solid var(--s-border)', background: 'var(--s-card)' }}>
                            <Txt role="name" as="span" defaults={{ size: 15, weight: 600 }}>{s.name}</Txt>
                            <span aria-hidden style={{ color: 'var(--s-muted)' }}>·</span>
                            <Price s={s} size={15} className="!font-normal" />
                            {c.showDuration && s.duration && <><span aria-hidden style={{ color: 'var(--s-muted)' }}>·</span><Txt role="meta" as="span" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{s.duration}</Txt></>}
                        </a>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<ServicesContent>>[] = [
    PriceList, TwoColumnMenu, ListBook, Cards3, Cards2, Table, CategoryTabs, CategoryAccordion,
    Carousel, FeaturedList, PhotoRows, HoverReveal, Masonry, Numbered, BigType, PricingCards,
    SplitCategories, CirclePhotos, OverlapCards, QuickPicks,
]

export const ServicesSection: SectionDefinition<ServicesContent> = {
    type: 'Services',
    label: 'Services',
    description: 'Your services with prices, times and a Book button.',
    icon: Scissors,
    wireframeId: 'services',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'name', label: 'Service names' },
        { id: 'price', label: 'Prices' },
        { id: 'meta', label: 'Times' },
        { id: 'description', label: 'Descriptions' },
        { id: 'category', label: 'Category names' },
        { id: 'number', label: 'Big numbers' },
        { id: 'button', label: 'Book buttons' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Services', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Services & pricing', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300 },
        { kind: 'services', key: 'services', label: 'Which services' },
        { kind: 'toggle', key: 'showDescriptions', label: 'Show descriptions' },
        { kind: 'toggle', key: 'showDuration', label: 'Show how long each takes' },
        { kind: 'text', key: 'bookLabel', label: 'Book button text', placeholder: 'Book', max: 20 },
        { kind: 'media', key: 'media', label: 'Band photo (Overlap cards)', accept: 'image' },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 19,
}
