'use client'

import { createContext, useContext, useState } from 'react'
import { ChevronLeft, ChevronRight, Images, Instagram } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { Lightbox } from '@/features/siteBuilder/templates/parts'
import { useBuilder } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface GalleryContent {
    eyebrow: string
    heading: string
    intro: string
    photos: SiteMedia[]
    /** One caption per line, in photo order. */
    captions: string
    /** Instagram (or any) link, for the Feed grid and as an optional button. */
    button: LinkValue
}

const DEFAULT: GalleryContent = {
    eyebrow: 'Portfolio',
    heading: 'Recent work',
    intro: '',
    photos: [],
    captions: '',
    button: { label: '', href: 'https://instagram.com/' },
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

/** Opens the lightbox at a photo (live site only). */
const OpenContext = createContext<(i: number) => void>(() => {})

function usePhotos(c: GalleryContent, min = 0): (SiteMedia | null)[] {
    const { editing } = useBuilder()
    const photos = c.photos ?? []
    // In the editor, empty slots show where photos go.
    return editing && photos.length < min ? [...photos, ...Array<null>(min - photos.length).fill(null)] : photos
}

const captionsOf = (c: GalleryContent) => (c.captions ?? '').split('\n').map(s => s.trim())

/** A photo that opens the lightbox. */
function Tile({ media, i, className, rounded = true, style }: { media: SiteMedia | null; i: number; className?: string; rounded?: boolean; style?: React.CSSProperties }) {
    const open = useContext(OpenContext)
    const { editing } = useBuilder()
    const inner = <Media media={media} label="a photo" className={cx('h-full w-full', className)} rounded={rounded} style={style} />
    if (!media || editing) return inner
    return <button type="button" onClick={() => open(i)} className="block h-full w-full cursor-zoom-in text-left" aria-label={`Open photo ${i + 1}`}>{inner}</button>
}

function Header({ c, center, className }: { c: GalleryContent; center?: boolean; className?: string }) {
    if (!c.eyebrow && !c.heading && !c.intro) return null
    return (
        <div className={cx('flex flex-col gap-3', center && 'items-center text-center', className)}>
            {c.eyebrow && <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className="!text-[color:var(--s-accent)]">{c.eyebrow}</Txt>}
            {c.heading && <Txt role="heading" as="h2" defaults={{ font: 'heading', size: 40, weight: 600, leading: 1.1 }}>{c.heading}</Txt>}
            {c.intro && <Txt role="intro" defaults={{ size: 17, leading: 1.6 }} className={cx('max-w-2xl !text-[color:var(--s-muted)]', center && 'mx-auto')}>{c.intro}</Txt>}
        </div>
    )
}

function Action({ c, center }: { c: GalleryContent; center?: boolean }) {
    const { bookHref } = useBuilder()
    if (!c.button?.label) return null
    return <div className={cx('flex', center && 'justify-center')}><Btn href={resolveHref(c.button.href, bookHref)} variant="secondary">{c.button.label}</Btn></div>
}

/** Header, photos, button, and the lightbox. */
function Frame({ c, center = true, children, header = true }: { c: GalleryContent; center?: boolean; children: React.ReactNode; header?: boolean }) {
    const [open, setOpen] = useState<number | null>(null)
    const photos = c.photos ?? []
    return (
        <OpenContext.Provider value={setOpen}>
            <div className="flex flex-col gap-10">
                {header && <Header c={c} center={center} />}
                {children}
                <Action c={c} center={center} />
            </div>
            {open !== null && photos[open] && <Lightbox items={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
        </OpenContext.Provider>
    )
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Grid = ({ content: c, cols }: LayoutProps<GalleryContent> & { cols: 3 | 4 }) => {
    const photos = usePhotos(c, cols * 2)
    return (
        <Frame c={c}>
            <div className={cx('grid grid-cols-2 gap-2 @3xl:gap-3', cols === 3 ? '@3xl:grid-cols-3' : '@3xl:grid-cols-4')}>
                {photos.map((m, i) => <Item key={i} className="aspect-square"><Tile media={m} i={i} /></Item>)}
            </div>
        </Frame>
    )
}

const Captions = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    const caps = captionsOf(c)
    return (
        <Frame c={c}>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 @3xl:grid-cols-3 @3xl:gap-x-5">
                {photos.map((m, i) => (
                    <Item key={i} className="flex flex-col gap-2">
                        <div className="aspect-[4/5]"><Tile media={m} i={i} /></div>
                        {caps[i] && <Txt role="caption" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{caps[i]}</Txt>}
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

function Scroller({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 @3xl:-mx-12 @3xl:px-12" tabIndex={0} aria-label={label}>
            {children}
        </div>
    )
}

const Carousel = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 5)
    return (
        <Frame c={c}>
            <Scroller label="Photos, scroll sideways">
                {photos.map((m, i) => <Item key={i} className="aspect-[4/5] w-[72%] flex-none snap-start @3xl:w-[30%]"><Tile media={m} i={i} /></Item>)}
            </Scroller>
        </Frame>
    )
}

const Slider = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 3)
    const [i, setI] = useState(0)
    const n = Math.max(photos.length, 1)
    const go = (d: number) => setI(x => (x + d + n) % n)
    const caps = captionsOf(c)
    return (
        <Frame c={c}>
            <div className="relative" data-enter="media" aria-roledescription="carousel">
                <div className="aspect-[4/5] w-full @3xl:aspect-[16/8]"><Tile media={photos[i] ?? null} i={i} /></div>
                {n > 1 && <>
                    <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"><ChevronLeft size={20} /></button>
                    <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"><ChevronRight size={20} /></button>
                </>}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <Txt role="caption" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{caps[i] ?? ''}</Txt>
                    <span className="text-sm tabular-nums" style={{ color: 'var(--s-muted)' }} aria-live="polite">{i + 1} / {n}</span>
                </div>
            </div>
        </Frame>
    )
}

const Masonry = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 7)
    const aspects = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/5]', 'aspect-[5/4]']
    return (
        <Frame c={c}>
            <div className="columns-2 gap-2 @3xl:columns-3 @3xl:gap-3">
                {photos.map((m, i) => <Item key={i} className={cx('mb-2 break-inside-avoid @3xl:mb-3', aspects[i % aspects.length])}><Tile media={m} i={i} /></Item>)}
            </div>
        </Frame>
    )
}

const TwoLarge = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 2)
    return (
        <Frame c={c}>
            <div className="grid gap-3 @3xl:grid-cols-2 @3xl:gap-5">
                {photos.map((m, i) => <Item key={i} className="aspect-[4/5]"><Tile media={m} i={i} /></Item>)}
            </div>
        </Frame>
    )
}

const FeaturedGrid = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 5)
    const [first, ...rest] = photos
    return (
        <Frame c={c}>
            <div className="grid gap-2 @3xl:grid-cols-2 @3xl:gap-3">
                <Item className="aspect-square"><Tile media={first ?? null} i={0} /></Item>
                <div className="grid grid-cols-2 gap-2 @3xl:gap-3">
                    {rest.slice(0, 4).map((m, i) => <Item key={i} className="aspect-square"><Tile media={m} i={i + 1} /></Item>)}
                </div>
            </div>
        </Frame>
    )
}

const Mosaic = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    // A repeating 6-photo pattern of mixed sizes.
    const spans = ['col-span-2 row-span-2', '', '', 'row-span-2', '', 'col-span-2']
    return (
        <Frame c={c}>
            <div className="grid grid-flow-row-dense auto-rows-[38vw] grid-cols-3 gap-1.5 @3xl:auto-rows-[200px] @3xl:grid-cols-4 @3xl:gap-2">
                {photos.map((m, i) => <Item key={i} className={spans[i % spans.length]}><Tile media={m} i={i} rounded={false} /></Item>)}
            </div>
        </Frame>
    )
}

const Bento = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 5)
    const spans = ['@3xl:col-span-2 @3xl:row-span-2', '', '', '@3xl:col-span-2', '']
    return (
        <Frame c={c}>
            <div className="grid grid-flow-row-dense auto-rows-[44vw] grid-cols-2 gap-3 @3xl:auto-rows-[190px] @3xl:grid-cols-4 @3xl:gap-4">
                {photos.map((m, i) => <Item key={i} className={cx(spans[i % spans.length], i === 0 && 'col-span-2')}><Tile media={m} i={i} style={{ borderRadius: 24 }} /></Item>)}
            </div>
        </Frame>
    )
}

const Filmstrip = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    return (
        <Frame c={c} center={false}>
            <Scroller label="Photos, scroll sideways">
                {photos.map((m, i) => <Item key={i} className="h-72 w-56 flex-none snap-start @3xl:h-96 @3xl:w-72"><Tile media={m} i={i} rounded={false} /></Item>)}
            </Scroller>
        </Frame>
    )
}

const Marquee = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    const strip = (dup?: boolean) => photos.map((m, i) => (
        <div key={`${dup ? 'd' : 'o'}${i}`} className="h-56 w-44 flex-none pr-3 @3xl:h-80 @3xl:w-64" aria-hidden={dup || undefined}>
            {/* The duplicate copy is decorative: not focusable, hidden from screen readers. */}
            {dup ? <Media media={m} label="a photo" className="h-full w-full" /> : <Tile media={m} i={i} />}
        </div>
    ))
    return (
        <Frame c={c}>
            <div className="-mx-5 overflow-hidden @3xl:-mx-12 @5xl:-mx-20" data-enter="media">
                <div className="aa-marquee" style={{ ['--aa-marquee-duration' as string]: `${Math.max(20, photos.length * 6)}s` }}>
                    {strip()}
                    <div className="aa-marquee-dup flex">{strip(true)}</div>
                </div>
            </div>
        </Frame>
    )
}

const Staggered = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    const cols = [0, 1, 2].map(k => photos.map((m, i) => ({ m, i })).filter(x => x.i % 3 === k))
    return (
        <Frame c={c}>
            <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-3 @3xl:gap-4">
                {cols.map((col, k) => (
                    <div key={k} className={cx('flex flex-col gap-3 @3xl:gap-4', k === 1 && 'mt-12 @3xl:mt-20', k === 2 && 'hidden @3xl:flex @3xl:mt-8')}>
                        {col.map(x => <Item key={x.i} className="aspect-[3/4]"><Tile media={x.m} i={x.i} /></Item>)}
                    </div>
                ))}
            </div>
            {/* Phones: the third column's photos join the first two. */}
            <div className="grid grid-cols-2 gap-3 @3xl:hidden">
                {cols[2].map(x => <Item key={x.i} className="aspect-[3/4]"><Tile media={x.m} i={x.i} /></Item>)}
            </div>
        </Frame>
    )
}

const Polaroids = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 6)
    const caps = captionsOf(c)
    const tilt = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0', '-rotate-3']
    return (
        <Frame c={c}>
            <div className="grid grid-cols-2 gap-5 @3xl:grid-cols-3 @3xl:gap-8">
                {photos.map((m, i) => (
                    <Item key={i} className={cx('flex flex-col gap-2 bg-white p-2.5 pb-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,.35)] transition-transform hover:rotate-0', tilt[i % tilt.length])}>
                        <div className="aspect-square"><Tile media={m} i={i} rounded={false} /></div>
                        <Txt role="caption" defaults={{ font: 'Caveat', size: 18 }} className="min-h-[1.4em] text-center !text-[#333]">{caps[i] ?? ''}</Txt>
                    </Item>
                ))}
            </div>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap" precedence="default" />
        </Frame>
    )
}

function Compare({ before, after }: { before: SiteMedia | null; after: SiteMedia | null }) {
    const [pos, setPos] = useState(50)
    return (
        <div className="relative aspect-[4/5] w-full select-none overflow-hidden" style={{ borderRadius: 'var(--s-radius)' }}>
            <Media media={after} label="the after photo" className="absolute inset-0 h-full w-full" rounded={false} />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                <Media media={before} label="the before photo" className="h-full w-full" rounded={false} />
            </div>
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }} />
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">Before</span>
            <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">After</span>
            <input type="range" min={0} max={100} value={pos} onChange={e => setPos(Number(e.target.value))}
                aria-label="Compare before and after" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
        </div>
    )
}

const BeforeAfterPairs = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 4)
    const pairs = Array.from({ length: Math.floor(photos.length / 2) }, (_, k) => [photos[k * 2], photos[k * 2 + 1]] as const)
    const caps = captionsOf(c)
    return (
        <Frame c={c}>
            <div className="grid gap-6 @3xl:grid-cols-2">
                {pairs.map(([b, a], k) => (
                    <Item key={k} className="flex flex-col gap-2">
                        <Compare before={b} after={a} />
                        {caps[k] && <Txt role="caption" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{caps[k]}</Txt>}
                    </Item>
                ))}
            </div>
            <p className="text-center text-sm" style={{ color: 'var(--s-muted)' }}>Drag across each photo to compare.</p>
        </Frame>
    )
}

const Circles = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 8)
    return (
        <Frame c={c}>
            <div className="grid grid-cols-2 gap-5 @2xl:grid-cols-3 @4xl:grid-cols-4">
                {photos.map((m, i) => <Item key={i} className="mx-auto aspect-square w-full max-w-[220px]"><Tile media={m} i={i} className="!rounded-full" /></Item>)}
            </div>
        </Frame>
    )
}

const CollageText = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 4)
    return (
        <Frame c={c} header={false}>
            <div className="relative grid grid-cols-2 gap-2 @3xl:grid-cols-4">
                {photos.slice(0, 4).map((m, i) => <Item key={i} className={cx('aspect-[3/4]', i % 2 === 1 && '@3xl:mt-10')}><Tile media={m} i={i} rounded={false} /></Item>)}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35 p-6"
                    style={{ ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent' as string]: '#fff', color: '#fff' }}>
                    <Header c={c} center />
                </div>
            </div>
            {photos.length > 4 && (
                <div className="grid grid-cols-3 gap-2 @3xl:grid-cols-6">
                    {photos.slice(4).map((m, i) => <Item key={i} className="aspect-square"><Tile media={m} i={i + 4} /></Item>)}
                </div>
            )}
        </Frame>
    )
}

const FullStack = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 3)
    const caps = captionsOf(c)
    return (
        <Frame c={c}>
            <div className="flex flex-col gap-6 @3xl:gap-10">
                {photos.map((m, i) => (
                    <Item key={i} className="flex flex-col gap-2">
                        <div className="aspect-[4/5] w-full @3xl:aspect-[16/9]"><Tile media={m} i={i} /></div>
                        {caps[i] && <Txt role="caption" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]">{caps[i]}</Txt>}
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const FeedGrid = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 9).slice(0, 9)
    const { bookHref } = useBuilder()
    const href = c.button?.href ? resolveHref(c.button.href, bookHref) : ''
    return (
        <Frame c={{ ...c, button: { ...c.button, label: '' } }}>
            <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-1">
                {photos.map((m, i) => <Item key={i} className="aspect-square"><Tile media={m} i={i} rounded={false} /></Item>)}
            </div>
            {href && href !== 'https://instagram.com/' && (
                <div className="flex justify-center"><Btn href={href} variant="secondary"><Instagram size={16} aria-hidden />{c.button.label || 'Follow on Instagram'}</Btn></div>
            )}
        </Frame>
    )
}

const LightboxStrip = ({ content: c }: LayoutProps<GalleryContent>) => {
    const photos = usePhotos(c, 5)
    const [i, setI] = useState(0)
    return (
        <Frame c={c}>
            <div className="flex flex-col gap-3">
                <div className="aspect-[4/5] w-full @3xl:aspect-[16/9]" data-enter="media"><Tile media={photos[i] ?? null} i={i} /></div>
                <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Choose a photo">
                    {photos.map((m, k) => (
                        <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={`Photo ${k + 1}`} onClick={() => setI(k)}
                            className="h-16 w-16 flex-none overflow-hidden transition-opacity @3xl:h-20 @3xl:w-24"
                            style={{ borderRadius: 'var(--s-radius)', opacity: k === i ? 1 : 0.55, outline: k === i ? '2px solid var(--s-accent)' : undefined, outlineOffset: 2 }}>
                            <Media media={m} label="a photo" className="h-full w-full" />
                        </button>
                    ))}
                </div>
            </div>
        </Frame>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<GalleryContent>>[] = [
    p => <Grid {...p} cols={3} />,
    p => <Grid {...p} cols={4} />,
    Captions, Carousel, Slider, Masonry, TwoLarge, FeaturedGrid,
    Mosaic, Bento, Filmstrip, Marquee, Staggered, Polaroids, BeforeAfterPairs, Circles,
    CollageText, FullStack, FeedGrid, LightboxStrip,
]

export const GallerySection: SectionDefinition<GalleryContent> = {
    type: 'Gallery',
    label: 'Gallery',
    description: 'Photos of your work. Visitors tap one to see it full size.',
    icon: Images,
    wireframeId: 'gallery',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'caption', label: 'Captions' },
        { id: 'button', label: 'Button' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Portfolio', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Recent work', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300 },
        { kind: 'mediaList', key: 'photos', label: 'Photos', max: 24, help: 'Before / after pairs uses them two at a time: before, then after.' },
        { kind: 'textarea', key: 'captions', label: 'Captions (optional)', rows: 4, max: 2000, help: 'One per line, in the same order as the photos.' },
        { kind: 'link', key: 'button', label: 'Button (e.g. your Instagram)' },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
}
