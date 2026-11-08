'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { Stars } from '@/features/siteBuilder/templates/parts'
import { useBuilder, useSection } from '../render/context'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { resolveHref } from '../render/links'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface HeroContent {
    eyebrow: string
    heading: string
    subheading: string
    primary: LinkValue
    secondary: LinkValue
    media: SiteMedia | null
    media2: SiteMedia | null
    media3: SiteMedia | null
    slides: SiteMedia[]
    before: SiteMedia | null
    after: SiteMedia | null
    stats: { value: string; label: string }[]
}

const DEFAULT: HeroContent = {
    eyebrow: '',
    heading: '',
    subheading: '',
    primary: { label: 'Book an appointment', href: 'book' },
    secondary: { label: '', href: '#services' },
    media: null, media2: null, media3: null,
    slides: [],
    before: null, after: null,
    stats: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

/** Heading, subheading, eyebrow and buttons, with fallbacks to the business's real details. */
function useHeroText(c: HeroContent) {
    const { info, bookHref } = useBuilder()
    return {
        eyebrow: c.eyebrow,
        heading: c.heading || info.businessName,
        sub: c.subheading || info.fallbackBio.split(/(?<=[.!?])\s/)[0] || '',
        primary: c.primary.label ? { label: c.primary.label, href: resolveHref(c.primary.href, bookHref) } : null,
        secondary: c.secondary.label ? { label: c.secondary.label, href: resolveHref(c.secondary.href, bookHref) } : null,
    }
}

function Copy({ c, align = 'left', size = 56, className, maxSub = 'max-w-xl' }: {
    c: HeroContent
    align?: 'left' | 'center'
    size?: number
    className?: string
    maxSub?: string
}) {
    const t = useHeroText(c)
    const center = align === 'center'
    return (
        <div className={cx('flex flex-col gap-5', center && 'items-center text-center', className)}>
            {t.eyebrow && <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className="!text-[color:var(--s-accent-text)]">{t.eyebrow}</Txt>}
            <Txt role="heading" as="h1" defaults={{ font: 'heading', size, weight: 600, leading: 1.04 }}>{t.heading}</Txt>
            {t.sub && <Txt role="subheading" defaults={{ size: 18, leading: 1.6 }} className={cx(maxSub, '!text-[color:var(--s-muted)]', center && 'mx-auto')}>{t.sub}</Txt>}
            {(t.primary || t.secondary) && (
                <div className={cx('flex flex-wrap gap-3 pt-1', center && 'justify-center')}>
                    {t.primary && <Btn href={t.primary.href}>{t.primary.label}</Btn>}
                    {t.secondary && <Btn href={t.secondary.href} variant="secondary">{t.secondary.label}</Btn>}
                </div>
            )}
        </div>
    )
}

/** Light text over a photo: the copy block in on-dark colors. */
function OnPhoto({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className} style={{ ['--s-fg' as string]: '#ffffff', ['--s-muted' as string]: 'rgba(255,255,255,.82)', ['--s-accent-text' as string]: '#ffffff', color: '#fff' }}>{children}</div>
}

function PhotoBackdrop({ media, dim = 0.42, children, className }: { media: SiteMedia | null; dim?: number; children: React.ReactNode; className?: string }) {
    return (
        <div className={cx('relative isolate overflow-hidden', className)}>
            <div className="absolute inset-0 -z-10" data-kenburns="">
                <Media media={media} label="a cover photo or video" className="h-full w-full" rounded={false} eager />
                <div className="absolute inset-0" style={{ background: '#000', opacity: dim }} />
            </div>
            {children}
        </div>
    )
}

const PAD = 'px-5 @3xl:px-12 @5xl:px-20'

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Centered = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="py-10 @3xl:py-20"><Copy c={c} align="center" size={64} /></div>
)

const Split = ({ content: c, reverse }: LayoutProps<HeroContent> & { reverse?: boolean }) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Copy c={c} className={reverse ? '@3xl:order-2' : ''} />
        <Media media={c.media} label="a cover photo or video" className="aspect-[4/5] w-full @3xl:aspect-[4/5]" eager kenburns />
    </div>
)

const FullCenter = ({ content: c }: LayoutProps<HeroContent>) => (
    <PhotoBackdrop media={c.media} className="flex min-h-[78svh] items-center">
        <OnPhoto className={cx(PAD, 'mx-auto w-full max-w-4xl py-24')}><Copy c={c} align="center" size={68} /></OnPhoto>
    </PhotoBackdrop>
)

const FullCorner = ({ content: c }: LayoutProps<HeroContent>) => (
    <PhotoBackdrop media={c.media} dim={0.35} className="flex min-h-[82svh] items-end">
        <OnPhoto className={cx(PAD, 'w-full max-w-3xl pb-14 pt-40 @3xl:pb-20')}><Copy c={c} size={64} /></OnPhoto>
    </PhotoBackdrop>
)

const Stacked = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="flex flex-col gap-10">
        <Media media={c.media} label="a cover photo or video" className="aspect-[16/9] w-full" eager kenburns />
        <Copy c={c} align="center" size={52} />
    </div>
)

const MinimalLine = ({ content: c }: LayoutProps<HeroContent>) => {
    const t = useHeroText(c)
    return (
        <div className="flex flex-col items-start gap-8 py-16 @3xl:py-28">
            <Txt role="heading" as="h1" defaults={{ font: 'heading', size: 76, weight: 500, leading: 1 }} className="max-w-5xl">{t.heading}</Txt>
            {t.primary && <Btn href={t.primary.href}>{t.primary.label}</Btn>}
        </div>
    )
}

const PortraitIntro = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
        <Media media={c.media} label="a portrait" className="aspect-square w-40 !rounded-full @3xl:w-52" eager />
        <Copy c={c} align="center" size={48} />
    </div>
)

const VideoBg = ({ content: c }: LayoutProps<HeroContent>) => (
    <PhotoBackdrop media={c.media} dim={0.45} className="flex min-h-[85svh] items-center">
        <OnPhoto className={cx(PAD, 'mx-auto w-full max-w-4xl py-24')}><Copy c={c} align="center" size={72} /></OnPhoto>
    </PhotoBackdrop>
)

const Slideshow = ({ content: c }: LayoutProps<HeroContent>) => {
    const slides = c.slides.length ? c.slides : [c.media].filter(Boolean) as SiteMedia[]
    const [i, setI] = useState(0)
    const { editing } = useBuilder()
    return (
        <div className="relative isolate flex min-h-[80svh] items-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
                {(slides.length ? slides : [null]).map((m, k) => (
                    <div key={k} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: k === i ? 1 : 0 }}>
                        <Media media={m} label="slideshow photos" className="h-full w-full" rounded={false} eager={k === 0} />
                    </div>
                ))}
                <div className="absolute inset-0 bg-black/40" />
            </div>
            <OnPhoto className={cx(PAD, 'mx-auto w-full max-w-4xl py-24')}><Copy c={c} align="center" size={64} /></OnPhoto>
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                    {slides.map((_, k) => (
                        <button key={k} type="button" aria-label={`Photo ${k + 1}`} onClick={() => setI(k)}
                            className="h-2.5 w-2.5 rounded-full" style={{ background: k === i ? '#fff' : 'rgba(255,255,255,.45)' }} />
                    ))}
                </div>
            )}
            {!editing && slides.length > 1 && <AutoAdvance count={slides.length} onTick={() => setI(v => (v + 1) % slides.length)} />}
        </div>
    )
}

/** Advances the slideshow every 5 s; never for people who prefer reduced motion. */
function AutoAdvance({ count, onTick }: { count: number; onTick: () => void }) {
    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
        const id = setInterval(onTick, 5000)
        return () => clearInterval(id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count])
    return null
}

const Collage = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-[1fr_1.1fr] @3xl:gap-14">
        <Copy c={c} />
        <div className="relative aspect-[5/4] w-full">
            <Media media={c.media} label="a photo" className="absolute left-0 top-0 h-[64%] w-[56%] shadow-xl" eager />
            <Media media={c.media2} label="a second photo" className="absolute right-0 top-[16%] h-[58%] w-[48%] shadow-xl" />
            <Media media={c.media3} label="a third photo" className="absolute bottom-0 left-[20%] h-[40%] w-[40%] shadow-xl" />
        </div>
    </div>
)

const Oversized = ({ content: c }: LayoutProps<HeroContent>) => {
    const t = useHeroText(c)
    return (
        <div className="flex flex-col gap-6 py-6">
            <Txt role="heading" as="h1" defaults={{ font: 'heading', size: 128, weight: 700, leading: 0.9, tracking: -0.02 }} className="uppercase">{t.heading}</Txt>
            <div className="grid items-end gap-6 @3xl:grid-cols-[1fr_auto]">
                <div className="flex flex-col gap-5">
                    {t.sub && <Txt role="subheading" defaults={{ size: 18, leading: 1.6 }} className="max-w-xl !text-[color:var(--s-muted)]">{t.sub}</Txt>}
                    {t.primary && <div><Btn href={t.primary.href}>{t.primary.label}</Btn></div>}
                </div>
                <Media media={c.media} label="a photo" className="aspect-[4/3] w-full @3xl:w-80" eager />
            </div>
        </div>
    )
}

const FloatingCard = ({ content: c }: LayoutProps<HeroContent>) => (
    <PhotoBackdrop media={c.media} dim={0.1} className="flex min-h-[80svh] items-center">
        <div className={cx(PAD, 'w-full py-20')}>
            <Item card className="max-w-lg p-7 @3xl:p-10"><Copy c={c} size={44} /></Item>
        </div>
    </PhotoBackdrop>
)

const Arch = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-[1fr_0.85fr] @3xl:gap-16">
        <Copy c={c} />
        <Media media={c.media} label="a cover photo" className="mx-auto aspect-[3/4] w-full max-w-md" style={{ borderRadius: '999px 999px 12px 12px' }} eager kenburns />
    </div>
)

const OffsetFrame = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="grid items-center gap-12 @3xl:grid-cols-2 @3xl:gap-16">
        <Copy c={c} />
        <div className="relative mx-auto w-full max-w-md pb-6 pr-6">
            <div className="absolute bottom-0 right-0 h-[88%] w-[88%]" style={{ background: 'var(--s-accent)', opacity: 0.18, borderRadius: 'var(--s-radius)' }} />
            <Media media={c.media} label="a cover photo" className="relative aspect-[4/5] w-full" eager />
        </div>
    </div>
)

const Diagonal = ({ content: c }: LayoutProps<HeroContent>) => (
    <div className="relative isolate grid min-h-[70svh] items-center @3xl:grid-cols-2">
        <div className={cx(PAD, 'py-16 @3xl:py-24')}><Copy c={c} /></div>
        <div className="relative h-72 @3xl:absolute @3xl:inset-y-0 @3xl:right-0 @3xl:h-auto @3xl:w-[55%]" style={{ clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }}>
            <Media media={c.media} label="a cover photo" className="h-full w-full" rounded={false} eager />
        </div>
    </div>
)

const Stats = ({ content: c }: LayoutProps<HeroContent>) => {
    const { info } = useBuilder()
    const stats = c.stats.length ? c.stats : [
        ...(info.rating ? [{ value: `${info.rating.average.toFixed(1)}★`, label: `${info.rating.count} reviews` }] : []),
        { value: String(info.services.length), label: info.services.length === 1 ? 'service' : 'services' },
    ]
    return (
        <div className="flex flex-col items-center gap-14 py-8">
            <Copy c={c} align="center" size={60} />
            <div className="grid w-full max-w-3xl grid-cols-2 gap-6 @3xl:grid-cols-3">
                {stats.map((s, i) => (
                    <Item key={i} className="flex flex-col items-center gap-1 text-center">
                        <Txt role="stat" defaults={{ font: 'heading', size: 44, weight: 600 }} className="!text-[color:var(--s-accent-text)]" count enter={false}>{s.value}</Txt>
                        <Txt role="statLabel" defaults={{ size: 14 }} className="!text-[color:var(--s-muted)]" enter={false}>{s.label}</Txt>
                    </Item>
                ))}
            </div>
        </div>
    )
}

const BeforeAfter = ({ content: c }: LayoutProps<HeroContent>) => {
    const [pos, setPos] = useState(50)
    return (
        <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
            <Copy c={c} />
            <div className="relative aspect-[4/5] w-full select-none overflow-hidden" style={{ borderRadius: 'var(--s-radius)' }} data-enter="media">
                <Media media={c.after} label="the after photo" className="absolute inset-0 h-full w-full" rounded={false} />
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                    <Media media={c.before} label="the before photo" className="h-full w-full" rounded={false} />
                </div>
                <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }} />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">Before</span>
                <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">After</span>
                <input type="range" min={0} max={100} value={pos} onChange={e => setPos(Number(e.target.value))}
                    aria-label="Compare before and after" className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
            </div>
        </div>
    )
}

const MarqueeHeadline = ({ content: c }: LayoutProps<HeroContent>) => {
    const t = useHeroText(c)
    const word = (t.heading + ' · ').repeat(4)
    return (
        <PhotoBackdrop media={c.media} dim={0.35} className="flex min-h-[78svh] flex-col justify-center gap-10 py-20">
            <OnPhoto className="overflow-hidden">
                <div className="aa-marquee" style={{ ['--aa-marquee-duration' as string]: '30s' }}>
                    <Txt role="heading" as="h1" enter={false} defaults={{ font: 'heading', size: 112, weight: 700, leading: 1 }} className="whitespace-nowrap pr-8 uppercase">{word}</Txt>
                    {/* The copy that makes the loop seamless: hidden from screen readers and when motion is reduced. */}
                    <span aria-hidden className="aa-marquee-dup"><Txt role="heading" as="span" enter={false} defaults={{ font: 'heading', size: 112, weight: 700, leading: 1 }} className="whitespace-nowrap pr-8 uppercase">{word}</Txt></span>
                </div>
            </OnPhoto>
            {t.primary && <div className={cx(PAD, 'flex justify-center')}><Btn href={t.primary.href}>{t.primary.label}</Btn></div>}
        </PhotoBackdrop>
    )
}

const NextOpenings = ({ content: c }: LayoutProps<HeroContent>) => {
    const { openings, bookHref } = useBuilder()
    const times = (openings ?? []).slice(0, 3)
    return (
        <div className="flex flex-col items-center gap-10 py-8">
            <Copy c={c} align="center" size={56} />
            <div className="flex w-full max-w-2xl flex-col items-center gap-3">
                <Txt role="openingsTitle" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.14 }} className="!text-[color:var(--s-muted)]">Next openings</Txt>
                <div className="grid w-full gap-3 @xl:grid-cols-3">
                    {times.length ? times.map((o, i) => (
                        <Item key={i} card className="text-center">
                            <a href={o.href || bookHref()} className="block p-4 font-semibold">{o.label}</a>
                        </Item>
                    )) : (
                        <Item card className="text-center @xl:col-span-3"><a href={bookHref()} className="block p-4 font-semibold">See open times</a></Item>
                    )}
                </div>
            </div>
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<HeroContent>>[] = [
    Centered,
    Split,
    p => <Split {...p} reverse />,
    FullCenter,
    FullCorner,
    Stacked,
    MinimalLine,
    PortraitIntro,
    VideoBg,
    Slideshow,
    Collage,
    Oversized,
    FloatingCard,
    Arch,
    OffsetFrame,
    Diagonal,
    Stats,
    BeforeAfter,
    MarqueeHeadline,
    NextOpenings,
]

export const HeroSection: SectionDefinition<HeroContent> = {
    type: 'Hero',
    label: 'Hero',
    description: 'The first screen: headline, photo or video, and the Book button.',
    icon: Sparkles,
    wireframeId: 'hero',
    textRoles: [
        { id: 'eyebrow', label: 'Small label above' },
        { id: 'heading', label: 'Headline' },
        { id: 'subheading', label: 'Subheading' },
        { id: 'button', label: 'Buttons' },
        { id: 'stat', label: 'Stat numbers' },
        { id: 'statLabel', label: 'Stat labels' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label above the headline', placeholder: 'e.g. Braids · Brooklyn', max: 60 },
        { kind: 'text', key: 'heading', label: 'Headline', placeholder: 'Your business name', max: 120 },
        { kind: 'textarea', key: 'subheading', label: 'Subheading', placeholder: 'One line about what you do', rows: 2, max: 240 },
        { kind: 'link', key: 'primary', label: 'Main button' },
        { kind: 'link', key: 'secondary', label: 'Second button (optional)' },
        { kind: 'media', key: 'media', label: 'Cover photo or video', accept: 'media' },
        { kind: 'media', key: 'media2', label: 'Second photo or video (Collage)', accept: 'media' },
        { kind: 'media', key: 'media3', label: 'Third photo or video (Collage)', accept: 'media' },
        { kind: 'mediaList', key: 'slides', label: 'Slideshow photos and videos', max: 6 },
        { kind: 'media', key: 'before', label: 'Before photo or video (Before / after)', accept: 'media' },
        { kind: 'media', key: 'after', label: 'After photo or video (Before / after)', accept: 'media' },
        { kind: 'list', key: 'stats', label: 'Stats (Stats row)', itemLabel: 'Stat', max: 4, empty: { value: '', label: '' },
            fields: [{ kind: 'text', key: 'value', label: 'Number', placeholder: '300+', max: 12 }, { kind: 'text', key: 'label', label: 'Label', placeholder: 'happy clients', max: 30 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => [4, 5, 9, 10, 13, 16, 19].includes(l),
    defaultStyle: { spacing: { top: 'm', bottom: 'l', width: 'normal', shadow: false, border: false, dividerTop: 'none', dividerBottom: 'none' } },
}
