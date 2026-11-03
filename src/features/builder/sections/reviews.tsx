'use client'

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircleHeart, Quote } from 'lucide-react'
import type { SiteMedia, SiteReview } from '@/features/siteBuilder/siteData'
import { Stars } from '@/features/siteBuilder/templates/parts'
import { useBuilder } from '../render/context'
import { cx, Item, Media, Txt } from '../render/primitives'
import { EditorNote, Header, Scroller } from './shared'
import type { LayoutProps, SectionDefinition } from './types'

export interface ReviewsContent {
    eyebrow: string
    heading: string
    intro: string
    /** Hide reviews below this many stars. */
    minRating: number
    /** Most to show (0 = all). */
    limit: number
    /** Client or hairstyle photos, in review order (photo layouts). */
    photos: SiteMedia[]
    badges: { value: string; label: string }[]
}

const DEFAULT: ReviewsContent = {
    eyebrow: 'Reviews',
    heading: 'What clients say',
    intro: '',
    minRating: 4,
    limit: 0,
    photos: [],
    badges: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useReviews(c: ReviewsContent) {
    const { info, editing } = useBuilder()
    let list = info.reviews.filter(r => r.rating >= Number(c.minRating || 0))
    if (c.limit > 0) list = list.slice(0, c.limit)
    return { list, rating: info.rating, editing, photo: (i: number) => c.photos?.[i] ?? null }
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '★'

function Avatar({ r, media, size = 40 }: { r: SiteReview; media?: SiteMedia | null; size?: number }) {
    if (media) return <Media media={media} label="a client photo" className="flex-none !rounded-full" style={{ width: size, height: size }} />
    return <span aria-hidden className="flex flex-none items-center justify-center rounded-full font-semibold" style={{ width: size, height: size, fontSize: size * 0.38, background: 'var(--s-surface)', color: 'var(--s-accent)', border: '1px solid var(--s-border)' }}>{initials(r.name)}</span>
}

const QuoteText = ({ r, size = 16, className, clamp }: { r: SiteReview; size?: number; className?: string; clamp?: boolean }) =>
    <Txt role="quote" defaults={{ size, leading: 1.6 }} className={cx(clamp && 'line-clamp-5', className)}>“{r.text}”</Txt>
const Name = ({ r, className }: { r: SiteReview; className?: string }) =>
    <Txt role="name" as="span" defaults={{ size: 14, weight: 600 }} className={className}>{r.name}</Txt>

function ReviewCard({ r, media, className, big }: { r: SiteReview; media?: SiteMedia | null; className?: string; big?: boolean }) {
    return (
        <Item card className={cx('flex flex-col gap-4 p-6', className)}>
            <Stars rating={r.rating} size={big ? 18 : 15} />
            <QuoteText r={r} size={big ? 20 : 15.5} clamp={!big} />
            <div className="mt-auto flex items-center gap-3"><Avatar r={r} media={media} size={36} /><Name r={r} /></div>
        </Item>
    )
}

function Summary({ className, center }: { className?: string; center?: boolean }) {
    const { info } = useBuilder()
    if (!info.rating) return null
    return (
        <div className={cx('flex items-center gap-3', center && 'justify-center', className)}>
            <Stars rating={info.rating.average} size={18} />
            <span className="text-[15px] font-semibold">{info.rating.average.toFixed(1)}</span>
            <span className="text-[14px]" style={{ color: 'var(--s-muted)' }}>from {info.rating.count} review{info.rating.count === 1 ? '' : 's'}</span>
        </div>
    )
}

function Frame({ c, center = true, children, list }: { c: ReviewsContent; center?: boolean; children: React.ReactNode; list: SiteReview[] }) {
    return (
        <div className="flex flex-col gap-10">
            <div className={cx('flex flex-col gap-3', center && 'items-center')}><Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center={center} /><Summary center={center} /></div>
            {list.length ? children : <EditorNote>Your reviews show here once clients leave them after appointments.</EditorNote>}
        </div>
    )
}

function Arrows({ onPrev, onNext, i, n }: { onPrev: () => void; onNext: () => void; i: number; n: number }) {
    if (n < 2) return null
    return (
        <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={onPrev} aria-label="Previous review" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ border: '1px solid var(--s-border)' }}><ChevronLeft size={18} /></button>
            <span className="text-sm tabular-nums" style={{ color: 'var(--s-muted)' }} aria-live="polite">{i + 1} / {n}</span>
            <button type="button" onClick={onNext} aria-label="Next review" className="flex h-11 w-11 items-center justify-center rounded-full" style={{ border: '1px solid var(--s-border)' }}><ChevronRight size={18} /></button>
        </div>
    )
}

function useStep(n: number) {
    const [i, setI] = useState(0)
    return { i: Math.min(i, Math.max(0, n - 1)), prev: () => setI(x => (x - 1 + n) % n), next: () => setI(x => (x + 1) % n), set: setI }
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Single = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const r = t.list[0]
    return (
        <Frame c={c} list={t.list}>
            {r && (
                <figure className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center" data-enter="item">
                    <Stars rating={r.rating} size={20} />
                    <blockquote><Txt role="quote" defaults={{ font: 'heading', size: 32, leading: 1.35 }}>“{r.text}”</Txt></blockquote>
                    <figcaption className="flex items-center gap-3"><Avatar r={r} media={t.photo(0)} /><Name r={r} /></figcaption>
                </figure>
            )}
        </Frame>
    )
}

const ThreeCards = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return <Frame c={c} list={t.list}><div className="grid gap-5 @3xl:grid-cols-3">{t.list.slice(0, 3).map((r, i) => <ReviewCard key={i} r={r} media={t.photo(i)} />)}</div></Frame>
}

const GridStars = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {t.list.map((r, i) => (
                    <Item key={i} className="flex flex-col gap-2 border-t pt-4" style={{ borderColor: 'var(--s-border)' }}>
                        <div className="flex items-center justify-between"><Name r={r} /><Stars rating={r.rating} size={13} /></div>
                        <QuoteText r={r} size={15} clamp />
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const Carousel = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <Scroller label="Reviews, scroll sideways">
                {t.list.map((r, i) => <div key={i} className="w-[82%] flex-none snap-start @2xl:w-[46%] @4xl:w-[31%]"><ReviewCard r={r} media={t.photo(i)} className="h-full" /></div>)}
            </Scroller>
        </Frame>
    )
}

const List = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <ul className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                {t.list.map((r, i) => <Item as="li" key={i} className="flex flex-col gap-2"><Stars rating={r.rating} size={14} /><QuoteText r={r} size={17} /><Name r={r} className="!text-[color:var(--s-muted)]" /></Item>)}
            </ul>
        </Frame>
    )
}

const QuotePhoto = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const s = useStep(t.list.length)
    const r = t.list[s.i]
    return (
        <Frame c={c} list={t.list} center={false}>
            {r && (
                <div className="grid items-center gap-10 @3xl:grid-cols-[1fr_1.4fr] @3xl:gap-16">
                    <Media media={t.photo(s.i)} label="a client or hairstyle photo" className="aspect-[4/5] w-full" />
                    <figure className="flex flex-col gap-5">
                        <Quote size={36} style={{ color: 'var(--s-accent)' }} aria-hidden />
                        <blockquote><Txt role="quote" defaults={{ font: 'heading', size: 28, leading: 1.4 }}>{r.text}</Txt></blockquote>
                        <figcaption className="flex items-center gap-3"><Stars rating={r.rating} size={15} /><Name r={r} /></figcaption>
                        <div className="self-start"><Arrows onPrev={s.prev} onNext={s.next} i={s.i} n={t.list.length} /></div>
                    </figure>
                </div>
            )}
        </Frame>
    )
}

const RatingSummary = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <div className="flex flex-col gap-10">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
            {t.rating && (
                <div className="flex flex-col items-center gap-2" data-enter="item">
                    <Txt role="score" as="div" count defaults={{ font: 'heading', size: 96, weight: 700, leading: 1 }}>{t.rating.average.toFixed(1)}</Txt>
                    <Stars rating={t.rating.average} size={24} />
                    <span className="text-[15px]" style={{ color: 'var(--s-muted)' }}>from {t.rating.count} review{t.rating.count === 1 ? '' : 's'}</span>
                </div>
            )}
            {t.list.length ? <div className="grid gap-5 @3xl:grid-cols-3">{t.list.slice(0, 3).map((r, i) => <ReviewCard key={i} r={r} />)}</div> : <EditorNote>Your reviews show here.</EditorNote>}
        </div>
    )
}

const Split = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1.6fr] @3xl:gap-16">
            <div className="flex flex-col gap-4 @3xl:sticky @3xl:top-24 @3xl:self-start"><Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} /><Summary /></div>
            {t.list.length ? <div className="flex flex-col gap-4">{t.list.slice(0, 4).map((r, i) => <ReviewCard key={i} r={r} media={t.photo(i)} />)}</div> : <EditorNote>Your reviews show here.</EditorNote>}
        </div>
    )
}

const Masonry = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return <Frame c={c} list={t.list}><div className="columns-1 gap-4 @2xl:columns-2 @4xl:columns-3">{t.list.map((r, i) => <div key={i} className="mb-4 break-inside-avoid"><ReviewCard r={r} media={t.photo(i)} big={i % 3 === 0} /></div>)}</div></Frame>
}

function MarqueeRow({ list, reverse, photo }: { list: SiteReview[]; reverse?: boolean; photo: (i: number) => SiteMedia | null }) {
    const cards = (dup?: boolean) => list.map((r, i) => (
        <div key={`${dup ? 'd' : 'o'}${i}`} className="w-80 flex-none pr-4" aria-hidden={dup || undefined}>
            <div className="flex h-full flex-col gap-3 p-5" style={{ background: 'var(--s-card)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                <Stars rating={r.rating} size={13} /><p className="line-clamp-4 text-[15px] leading-relaxed">“{r.text}”</p>
                <div className="mt-auto flex items-center gap-2"><Avatar r={r} media={photo(i)} size={30} /><span className="text-sm font-semibold">{r.name}</span></div>
            </div>
        </div>
    ))
    return (
        <div className="aa-marquee" data-reverse={reverse ? '' : undefined} style={{ ['--aa-marquee-duration' as string]: `${Math.max(30, list.length * 9)}s` }}>
            {cards()}<div className="aa-marquee-dup flex">{cards(true)}</div>
        </div>
    )
}

const Marquee = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return <Frame c={c} list={t.list}><div className="-mx-5 overflow-hidden @3xl:-mx-12 @5xl:-mx-20" data-enter="item"><MarqueeRow list={t.list} photo={t.photo} /></div></Frame>
}

const DoubleMarquee = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const half = Math.ceil(t.list.length / 2)
    return (
        <Frame c={c} list={t.list}>
            <div className="-mx-5 flex flex-col gap-4 overflow-hidden @3xl:-mx-12 @5xl:-mx-20" data-enter="item">
                <MarqueeRow list={t.list.slice(0, half)} photo={t.photo} />
                <MarqueeRow list={t.list.slice(half).length ? t.list.slice(half) : t.list} reverse photo={i => t.photo(i + half)} />
            </div>
        </Frame>
    )
}

const ChatBubbles = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const { info } = useBuilder()
    return (
        <Frame c={c} list={t.list}>
            <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
                {t.list.slice(0, 5).map((r, i) => (
                    <Item key={i} className="flex flex-col gap-2">
                        <div className="flex items-end gap-2"><Avatar r={r} media={t.photo(i)} size={30} />
                            <p className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>{r.text}</p></div>
                        {i === 0 && <p className="ml-auto max-w-[70%] rounded-2xl rounded-br-sm px-4 py-2 text-[15px]" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>Thank you {r.name}! 💕 — {info.businessName}</p>}
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const CardDeck = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const s = useStep(t.list.length)
    const order = t.list.map((_, k) => (s.i + k) % t.list.length).slice(0, 3)
    return (
        <Frame c={c} list={t.list}>
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
                <div className="relative h-80">
                    {order.reverse().map((idx, k, arr) => {
                        const depth = arr.length - 1 - k
                        return (
                            <div key={idx} className="absolute inset-x-0 top-0 transition-transform duration-300" style={{ transform: `translateY(${depth * 14}px) rotate(${depth ? (depth % 2 ? 3 : -3) : 0}deg) scale(${1 - depth * 0.04})`, zIndex: 10 - depth }}>
                                <ReviewCard r={t.list[idx]} media={t.photo(idx)} className="h-72" />
                            </div>
                        )
                    })}
                </div>
                <Arrows onPrev={s.prev} onNext={s.next} i={s.i} n={t.list.length} />
            </div>
        </Frame>
    )
}

const FeaturedSmall = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const [first, ...rest] = t.list
    return (
        <Frame c={c} list={t.list}>
            <div className="grid gap-5 @3xl:grid-cols-[1.4fr_1fr]">
                {first && <ReviewCard r={first} media={t.photo(0)} big />}
                <div className="flex flex-col gap-4">{rest.slice(0, 3).map((r, i) => <ReviewCard key={i} r={r} media={t.photo(i + 1)} />)}</div>
            </div>
        </Frame>
    )
}

const PhotoBacked = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const s = useStep(t.list.length)
    const r = t.list[s.i]
    if (!r) return <Frame c={c} list={t.list}>{null}</Frame>
    return (
        <div className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10" data-kenburns=""><Media media={t.photo(s.i) ?? c.photos?.[0] ?? null} label="a photo of the hairstyle" className="h-full w-full" rounded={false} /><div className="absolute inset-0 bg-black/55" /></div>
            <figure className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-20 text-center text-white @3xl:py-28" style={{ ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent-text' as string]: '#fff' }}>
                {c.eyebrow && <span className="text-[13px] font-semibold uppercase tracking-[0.16em]">{c.eyebrow}</span>}
                <Stars rating={r.rating} size={20} />
                <blockquote><Txt role="quote" defaults={{ font: 'heading', size: 34, leading: 1.35 }}>“{r.text}”</Txt></blockquote>
                <figcaption className="font-semibold">{r.name}</figcaption>
                <div className="[&_button]:border-white/50"><Arrows onPrev={s.prev} onNext={s.next} i={s.i} n={t.list.length} /></div>
            </figure>
        </div>
    )
}

const PostCards = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {t.list.map((r, i) => (
                    <Item key={i} card className="flex flex-col gap-3 p-5">
                        <div className="flex items-center gap-3"><Avatar r={r} media={t.photo(i)} size={40} />
                            <div className="flex flex-col leading-tight"><Name r={r} /><span className="text-[13px]" style={{ color: 'var(--s-muted)' }}>Booked through AfroAllure</span></div>
                            <span className="ml-auto"><Stars rating={r.rating} size={12} /></span></div>
                        <QuoteText r={r} size={15} />
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const AvatarSlider = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const s = useStep(t.list.length)
    const r = t.list[s.i]
    return (
        <Frame c={c} list={t.list}>
            {r && (
                <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
                    <Avatar r={r} media={t.photo(s.i)} size={120} />
                    <QuoteText r={r} size={20} />
                    <div className="flex items-center gap-2"><Stars rating={r.rating} size={15} /><Name r={r} /></div>
                    <div className="flex gap-2" role="tablist" aria-label="Choose a review">
                        {t.list.map((x, k) => <button key={k} type="button" role="tab" aria-selected={k === s.i} aria-label={`Review from ${x.name}`} onClick={() => s.set(k)} className="h-2.5 rounded-full transition-all" style={{ width: k === s.i ? 24 : 10, background: k === s.i ? 'var(--s-accent)' : 'var(--s-border)' }} />)}
                    </div>
                </div>
            )}
        </Frame>
    )
}

const Badges = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    const { info } = useBuilder()
    const badges = c.badges.length ? c.badges : [
        ...(t.rating ? [{ value: `${t.rating.average.toFixed(1)}★`, label: 'average rating' }, { value: String(t.rating.count), label: 'reviews' }] : []),
        { value: String(info.services.length), label: 'services' },
    ]
    return (
        <div className="flex flex-col gap-10">
            <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center />
            <div className="flex flex-wrap justify-center gap-4">
                {badges.map((b, i) => (
                    <Item key={i} className="flex min-w-36 flex-col items-center gap-1 rounded-full px-8 py-5" style={{ border: '1.5px solid var(--s-border)' }}>
                        <Txt role="score" as="div" count defaults={{ font: 'heading', size: 36, weight: 700, leading: 1 }}>{b.value}</Txt>
                        <span className="text-[13px]" style={{ color: 'var(--s-muted)' }}>{b.label}</span>
                    </Item>
                ))}
            </div>
            {t.list.length > 0 && <div className="grid gap-5 @3xl:grid-cols-2">{t.list.slice(0, 2).map((r, i) => <ReviewCard key={i} r={r} />)}</div>}
        </div>
    )
}

const Timeline = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <ol className="relative mx-auto flex w-full max-w-2xl flex-col gap-8 border-l pl-8" style={{ borderColor: 'var(--s-border)' }}>
                {t.list.map((r, i) => (
                    <Item as="li" key={i} className="relative flex flex-col gap-2">
                        <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full" style={{ background: 'var(--s-accent)', boxShadow: '0 0 0 4px var(--s-bg)' }} />
                        <div className="flex items-center gap-2"><Name r={r} /><Stars rating={r.rating} size={12} /></div>
                        <QuoteText r={r} size={15.5} />
                    </Item>
                ))}
            </ol>
        </Frame>
    )
}

const Accordion = ({ content: c }: LayoutProps<ReviewsContent>) => {
    const t = useReviews(c)
    return (
        <Frame c={c} list={t.list}>
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
                {t.list.map((r, i) => (
                    <Item key={i}>
                        <details open={i === 0} className="group" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                                <Avatar r={r} media={t.photo(i)} size={32} />
                                <span className="min-w-0 flex-1 truncate text-[15px]"><span className="font-semibold">{r.name}</span> <span style={{ color: 'var(--s-muted)' }}>· {r.text}</span></span>
                                <Stars rating={r.rating} size={12} />
                                <ChevronDown size={17} className="flex-none transition-transform group-open:rotate-180" aria-hidden />
                            </summary>
                            <div className="px-5 pb-5"><QuoteText r={r} size={16} /></div>
                        </details>
                    </Item>
                ))}
            </div>
        </Frame>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<ReviewsContent>>[] = [
    Single, ThreeCards, GridStars, Carousel, List, QuotePhoto, RatingSummary, Split,
    Masonry, Marquee, DoubleMarquee, ChatBubbles, CardDeck, FeaturedSmall, PhotoBacked, PostCards,
    AvatarSlider, Badges, Timeline, Accordion,
]

export const ReviewsSection: SectionDefinition<ReviewsContent> = {
    type: 'Reviews',
    label: 'Reviews',
    description: 'What clients say, from the reviews they leave after appointments.',
    icon: MessageCircleHeart,
    wireframeId: 'reviews',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'quote', label: 'Review text' },
        { id: 'name', label: 'Client names' },
        { id: 'score', label: 'Big rating' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Reviews', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'What clients say', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300, help: 'Reviews come from your clients and update on their own.' },
        { kind: 'select', key: 'minRating', label: 'Show reviews with', options: [{ value: '0', label: 'Any rating' }, { value: '3', label: '3 stars and up' }, { value: '4', label: '4 stars and up' }, { value: '5', label: '5 stars only' }] },
        { kind: 'number', key: 'limit', label: 'Most to show (0 = all)', min: 0, max: 12 },
        { kind: 'mediaList', key: 'photos', label: 'Photos (photo layouts)', max: 12, help: 'In the same order as the reviews.' },
        { kind: 'list', key: 'badges', label: 'Badges (Badges)', itemLabel: 'Badge', max: 4, empty: { value: '', label: '' },
            fields: [{ kind: 'text', key: 'value', label: 'Number', placeholder: '300+', max: 12 }, { kind: 'text', key: 'label', label: 'Label', placeholder: 'happy clients', max: 30 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 15,
    hideWhen: (c, _l, ctx) => !ctx.info.reviews.some(r => r.rating >= Number(c.minRating || 0)),
}
