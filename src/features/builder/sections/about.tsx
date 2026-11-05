'use client'

import { useId, useState } from 'react'
import { UserRound } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface AboutContent {
    eyebrow: string
    heading: string
    body: string
    quote: string
    signature: string
    since: string
    button: LinkValue
    media: SiteMedia | null
    media2: SiteMedia | null
    media3: SiteMedia | null
    video: SiteMedia | null
    facts: { value: string; label: string }[]
    values: { title: string; text: string }[]
    timeline: { year: string; title: string; text: string }[]
    qa: { q: string; a: string }[]
    tabs: { title: string; text: string }[]
}

const DEFAULT: AboutContent = {
    eyebrow: 'About',
    heading: '',
    body: '',
    quote: '',
    signature: '',
    since: '',
    button: { label: '', href: 'book' },
    media: null, media2: null, media3: null, video: null,
    facts: [],
    values: [],
    timeline: [],
    qa: [],
    tabs: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

function useAbout(c: AboutContent) {
    const { info, bookHref } = useBuilder()
    const body = c.body || info.fallbackBio
    return {
        heading: c.heading || `Meet ${info.businessName}`,
        paragraphs: body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean),
        button: c.button.label ? { label: c.button.label, href: resolveHref(c.button.href, bookHref) } : null,
        name: info.businessName,
    }
}

function Eyebrow({ c, center }: { c: AboutContent; center?: boolean }) {
    if (!c.eyebrow) return null
    return <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className={cx('!text-[color:var(--s-accent-text)]', center && 'text-center')}>{c.eyebrow}</Txt>
}

function Heading({ c, size = 40, center, className }: { c: AboutContent; size?: number; center?: boolean; className?: string }) {
    const t = useAbout(c)
    return <Txt role="heading" as="h2" defaults={{ font: 'heading', size, weight: 600, leading: 1.1 }} className={cx(center && 'text-center', className)}>{t.heading}</Txt>
}

function Body({ c, center, className, dropCap }: { c: AboutContent; center?: boolean; className?: string; dropCap?: boolean }) {
    const t = useAbout(c)
    return (
        <div className={cx('flex flex-col gap-4', center && 'text-center', className)}>
            {t.paragraphs.map((p, i) => (
                <Txt key={i} role="body" defaults={{ size: 17, leading: 1.7 }}
                    className={cx('!text-[color:var(--s-muted)] whitespace-pre-line', dropCap && i === 0 && 'first-letter:float-left first-letter:mr-2 first-letter:font-[family-name:var(--s-heading)] first-letter:text-[3.6em] first-letter:leading-[0.85] first-letter:text-[color:var(--s-accent-text)]')}>
                    {p}
                </Txt>
            ))}
        </div>
    )
}

function Action({ c, center }: { c: AboutContent; center?: boolean }) {
    const t = useAbout(c)
    if (!t.button) return null
    return <div className={cx('pt-2', center && 'flex justify-center')}><Btn href={t.button.href}>{t.button.label}</Btn></div>
}

/** Eyebrow, heading, body and button: the usual text column. */
function Copy({ c, center, size, className }: { c: AboutContent; center?: boolean; size?: number; className?: string }) {
    return (
        <div className={cx('flex flex-col gap-5', center && 'items-center', className)}>
            <Eyebrow c={c} center={center} />
            <Heading c={c} size={size} center={center} />
            <Body c={c} center={center} />
            <Action c={c} center={center} />
        </div>
    )
}

const Narrow = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cx('mx-auto w-full max-w-2xl', className)}>{children}</div>

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Text = ({ content: c }: LayoutProps<AboutContent>) => <Narrow><Copy c={c} center /></Narrow>

const PhotoSide = ({ content: c, right }: LayoutProps<AboutContent> & { right?: boolean }) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Media media={c.media} label="a photo of you or your space" className={cx('aspect-[4/5] w-full', right && '@3xl:order-2')} kenburns />
        <Copy c={c} />
    </div>
)

const TwoColumns = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    const half = Math.ceil(t.paragraphs.length / 2)
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4"><Eyebrow c={c} /><Heading c={c} size={44} className="max-w-3xl" /></div>
            <div className="grid gap-6 @3xl:grid-cols-2 @3xl:gap-12">
                {[t.paragraphs.slice(0, half), t.paragraphs.slice(half)].map((col, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        {col.map((p, j) => <Txt key={j} role="body" defaults={{ size: 17, leading: 1.7 }} className="!text-[color:var(--s-muted)]">{p}</Txt>)}
                    </div>
                ))}
            </div>
            <Action c={c} />
        </div>
    )
}

const PortraitCircle = ({ content: c }: LayoutProps<AboutContent>) => (
    <Narrow className="flex flex-col items-center gap-6">
        <Media media={c.media} label="a portrait" className="aspect-square w-40 !rounded-full @3xl:w-48" />
        <Copy c={c} center />
    </Narrow>
)

const PullQuote = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    return (
        <Narrow className="flex flex-col gap-8">
            <Eyebrow c={c} />
            <Txt role="quote" as="h2" defaults={{ font: 'heading', size: 40, weight: 500, leading: 1.2, italic: true }}>
                “{c.quote || t.paragraphs[0]?.split(/(?<=[.!?])\s/)[0] || t.heading}”
            </Txt>
            <div className="h-px w-16" style={{ background: 'var(--s-accent)' }} />
            <Body c={c} />
            <Action c={c} />
        </Narrow>
    )
}

function Facts({ c, className }: { c: AboutContent; className?: string }) {
    const { info } = useBuilder()
    const facts = c.facts.length ? c.facts : [
        { value: String(info.services.length), label: info.services.length === 1 ? 'service' : 'services' },
        ...(info.rating ? [{ value: info.rating.average.toFixed(1), label: `stars from ${info.rating.count} reviews` }] : []),
        ...(info.place ? [{ value: info.place.split(',')[0], label: 'based in' }] : []),
    ]
    return (
        <div className={cx('grid grid-cols-2 gap-6 @3xl:grid-cols-4', className)}>
            {facts.map((f, i) => (
                <Item key={i} className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: 'var(--s-border)' }}>
                    <Txt role="factValue" as="div" count defaults={{ font: 'heading', size: 36, weight: 600, leading: 1 }}>{f.value}</Txt>
                    <Txt role="factLabel" as="div" defaults={{ size: 13 }} className="!text-[color:var(--s-muted)]">{f.label}</Txt>
                </Item>
            ))}
        </div>
    )
}

const Credentials = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="flex flex-col gap-12">
        <div className="grid gap-8 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
            <div className="flex flex-col gap-4"><Eyebrow c={c} /><Heading c={c} /></div>
            <div className="flex flex-col gap-5"><Body c={c} /><Action c={c} /></div>
        </div>
        <Facts c={c} />
    </div>
)

const Values = ({ content: c }: LayoutProps<AboutContent>) => {
    const values = c.values.length ? c.values : [
        { title: 'Healthy hair first', text: 'Gentle tension and protective styles that last.' },
        { title: 'On time', text: 'Your appointment starts when it’s booked.' },
        { title: 'A calm chair', text: 'A space to relax while we work.' },
    ]
    return (
        <div className="flex flex-col gap-10">
            <Narrow><Copy c={c} center /></Narrow>
            <div className="grid gap-4 @3xl:grid-cols-3">
                {values.map((v, i) => (
                    <Item key={i} card className="flex flex-col gap-3 p-6">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{i + 1}</span>
                        <Txt role="itemTitle" as="h3" defaults={{ font: 'heading', size: 20, weight: 600 }}>{v.title}</Txt>
                        <Txt role="itemText" defaults={{ size: 15, leading: 1.6 }} className="!text-[color:var(--s-muted)]">{v.text}</Txt>
                    </Item>
                ))}
            </div>
        </div>
    )
}

const Arch = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
        <Media media={c.media} label="a photo" className="mx-auto aspect-[3/4] w-full max-w-sm !rounded-t-[999px]" kenburns />
        <Copy c={c} />
    </div>
)

const Overlapping = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid items-center gap-12 @3xl:grid-cols-2 @3xl:gap-16">
        <div className="relative pb-[18%] pr-[18%]">
            <Media media={c.media} label="a photo" className="aspect-[4/5] w-full" />
            <Media media={c.media2} label="a second photo" className="!absolute bottom-0 right-0 aspect-square w-[48%] ring-8 ring-[color:var(--s-bg)]" />
        </div>
        <Copy c={c} />
    </div>
)

const FullPhotoCard = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="relative">
        <Media media={c.media} label="a wide photo" className="aspect-[4/5] w-full @3xl:aspect-[21/9]" rounded={false} kenburns />
        <Item card className="relative -mt-24 mx-4 p-6 @3xl:absolute @3xl:bottom-10 @3xl:left-10 @3xl:m-0 @3xl:max-w-md @3xl:p-8">
            <Copy c={c} size={32} />
        </Item>
    </div>
)

const Since = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid items-center gap-8 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
        <div className="flex flex-col">
            <Txt role="sinceLabel" defaults={{ size: 14, weight: 600, case: 'upper', tracking: 0.2 }} className="!text-[color:var(--s-muted)]">Since</Txt>
            <Txt role="since" as="div" count defaults={{ font: 'heading', size: 128, weight: 600, leading: 0.9 }} className="!text-[color:var(--s-accent-text)]">{c.since || String(new Date().getFullYear())}</Txt>
        </div>
        <Copy c={c} />
    </div>
)

const Signature = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    return (
        <Narrow className="flex flex-col gap-6">
            <Eyebrow c={c} />
            <Heading c={c} />
            <Body c={c} />
            <Txt role="signature" defaults={{ font: 'Dancing Script', size: 40, leading: 1.1 }} className="!text-[color:var(--s-accent-text)]">{c.signature || t.name}</Txt>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500&display=swap" precedence="default" />
            <Action c={c} />
        </Narrow>
    )
}

const Timeline = ({ content: c }: LayoutProps<AboutContent>) => {
    const steps = c.timeline.length ? c.timeline : [
        { year: '2016', title: 'First clients', text: 'Braiding friends and family from home.' },
        { year: '2019', title: 'Licensed', text: 'Finished cosmetology school.' },
        { year: '2022', title: 'Opened the studio', text: 'A space of my own.' },
    ]
    return (
        <div className="grid gap-10 @3xl:grid-cols-[2fr_3fr] @3xl:gap-16">
            <Copy c={c} />
            <ol className="relative flex flex-col gap-8 border-l pl-8" style={{ borderColor: 'var(--s-border)' }}>
                {steps.map((s, i) => (
                    <Item as="li" key={i} className="relative flex flex-col gap-1">
                        <span className="absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full" style={{ background: 'var(--s-accent)', boxShadow: '0 0 0 4px var(--s-bg)' }} />
                        <Txt role="year" defaults={{ size: 13, weight: 700, tracking: 0.12 }} className="!text-[color:var(--s-accent-text)]">{s.year}</Txt>
                        <Txt role="itemTitle" as="h3" defaults={{ font: 'heading', size: 22, weight: 600 }}>{s.title}</Txt>
                        <Txt role="itemText" defaults={{ size: 15, leading: 1.6 }} className="!text-[color:var(--s-muted)]">{s.text}</Txt>
                    </Item>
                ))}
            </ol>
        </div>
    )
}

const QA = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    const qa = c.qa.length ? c.qa : [
        { q: 'Who I am', a: t.paragraphs[0] ?? '' },
        { q: 'What I do', a: 'Protective styles that look good and keep your hair healthy.' },
        { q: 'Why clients come back', a: 'Neat work, honest timing and a relaxed chair.' },
    ]
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4"><Eyebrow c={c} /><Heading c={c} /></div>
            <div className="grid gap-8 @3xl:grid-cols-3">
                {qa.map((x, i) => (
                    <Item key={i} className="flex flex-col gap-2 border-t pt-5" style={{ borderColor: 'var(--s-accent)' }}>
                        <Txt role="question" as="h3" defaults={{ font: 'heading', size: 20, weight: 600 }}>{x.q}</Txt>
                        <Txt role="answer" as="div" defaults={{ size: 15, leading: 1.65 }} className="!text-[color:var(--s-muted)]">{x.a}</Txt>
                    </Item>
                ))}
            </div>
            <Action c={c} />
        </div>
    )
}

const Tabs = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    const tabs = c.tabs.length ? c.tabs : [
        { title: 'My story', text: t.paragraphs.join('\n\n') },
        { title: 'Training', text: 'Licensed cosmetologist with ongoing classes in braiding and scalp care.' },
        { title: 'Products I use', text: 'Pre-stretched, hypoallergenic hair and gentle, natural products.' },
    ]
    const [active, setActive] = useState(0)
    const id = useId()
    const cur = tabs[Math.min(active, tabs.length - 1)]
    return (
        <Narrow className="flex flex-col gap-6">
            <Eyebrow c={c} />
            <Heading c={c} />
            <div role="tablist" className="flex flex-wrap gap-2">
                {tabs.map((x, i) => (
                    <button key={i} type="button" role="tab" id={`${id}-t${i}`} aria-selected={i === active} aria-controls={`${id}-p`} onClick={() => setActive(i)}
                        className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                        style={i === active ? { background: 'var(--s-accent)', color: 'var(--s-accent-fg)' } : { border: '1px solid var(--s-border)' }}>
                        {x.title}
                    </button>
                ))}
            </div>
            <div role="tabpanel" id={`${id}-p`} aria-labelledby={`${id}-t${active}`}>
                <Txt role="body" defaults={{ size: 17, leading: 1.7 }} className="whitespace-pre-line !text-[color:var(--s-muted)]">{cur?.text}</Txt>
            </div>
            <Action c={c} />
        </Narrow>
    )
}

const Video = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Media media={c.video ?? c.media} label="a short intro video" className="aspect-video w-full" />
        <Copy c={c} />
    </div>
)

const StickyPhoto = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div><Media media={c.media} label="a photo" className="aspect-[4/5] w-full @3xl:sticky @3xl:top-24" /></div>
        <div className="flex flex-col gap-8 @3xl:py-16">
            <Copy c={c} />
            <Facts c={c} className="@3xl:!grid-cols-2" />
        </div>
    </div>
)

const Collage = ({ content: c }: LayoutProps<AboutContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <div className="grid grid-cols-2 gap-3">
            <Media media={c.media} label="a photo" className="row-span-2 aspect-[3/5] w-full" />
            <Media media={c.media2} label="a second photo" className="aspect-square w-full" />
            <Media media={c.media3} label="a third photo" className="aspect-square w-full" />
        </div>
        <Copy c={c} />
    </div>
)

const Editorial = ({ content: c }: LayoutProps<AboutContent>) => {
    const t = useAbout(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[3fr_2fr] @3xl:gap-16">
            <div className="flex flex-col gap-6">
                <Eyebrow c={c} />
                <Heading c={c} size={52} />
                <Body c={c} dropCap className="max-w-xl" />
                <Action c={c} />
            </div>
            <figure className="flex flex-col gap-2">
                <Media media={c.media} label="a photo" className="aspect-[3/4] w-full" rounded={false} />
                <Txt role="caption" as="div" defaults={{ size: 12, italic: true }} className="!text-[color:var(--s-muted)]">{t.name}</Txt>
            </figure>
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<AboutContent>>[] = [
    Text,
    p => <PhotoSide {...p} />,
    p => <PhotoSide {...p} right />,
    TwoColumns,
    PortraitCircle,
    PullQuote,
    Credentials,
    Values,
    Arch,
    Overlapping,
    FullPhotoCard,
    Since,
    Signature,
    Timeline,
    QA,
    Tabs,
    Video,
    StickyPhoto,
    Collage,
    Editorial,
]

export const AboutSection: SectionDefinition<AboutContent> = {
    type: 'About',
    label: 'About',
    description: 'Your story, a photo, and what makes you different.',
    icon: UserRound,
    wireframeId: 'about',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'body', label: 'Bio text' },
        { id: 'quote', label: 'Quote' },
        { id: 'itemTitle', label: 'Card and step titles' },
        { id: 'itemText', label: 'Card and step text' },
        { id: 'factValue', label: 'Fact numbers' },
        { id: 'factLabel', label: 'Fact labels' },
        { id: 'since', label: 'Big year' },
        { id: 'signature', label: 'Signature' },
        { id: 'button', label: 'Button' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'About', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Meet your stylist', max: 100 },
        { kind: 'textarea', key: 'body', label: 'Your story', rows: 6, max: 2000, help: 'Leave a blank line between paragraphs. Empty uses your profile bio.' },
        { kind: 'media', key: 'media', label: 'Photo', accept: 'image' },
        { kind: 'media', key: 'media2', label: 'Second photo (Overlapping, Collage)', accept: 'image' },
        { kind: 'media', key: 'media3', label: 'Third photo (Collage)', accept: 'image' },
        { kind: 'media', key: 'video', label: 'Intro video (Video)', accept: 'media' },
        { kind: 'link', key: 'button', label: 'Button (optional)' },
        { kind: 'textarea', key: 'quote', label: 'Quote (Pull quote)', rows: 2, max: 240 },
        { kind: 'text', key: 'signature', label: 'Signature (Signature)', placeholder: 'Your name', max: 40 },
        { kind: 'text', key: 'since', label: 'Year you started (Since…)', placeholder: '2015', max: 4 },
        { kind: 'list', key: 'facts', label: 'Facts (Credentials, Sticky photo)', itemLabel: 'Fact', max: 4, empty: { value: '', label: '' },
            fields: [{ kind: 'text', key: 'value', label: 'Number or word', placeholder: '8 yrs', max: 12 }, { kind: 'text', key: 'label', label: 'Label', placeholder: 'experience', max: 40 }] },
        { kind: 'list', key: 'values', label: 'Values (Values)', itemLabel: 'Value', max: 3, empty: { title: '', text: '' },
            fields: [{ kind: 'text', key: 'title', label: 'Title', max: 40 }, { kind: 'textarea', key: 'text', label: 'Text', rows: 2, max: 160 }] },
        { kind: 'list', key: 'timeline', label: 'Steps (Timeline)', itemLabel: 'Step', max: 6, empty: { year: '', title: '', text: '' },
            fields: [{ kind: 'text', key: 'year', label: 'Year', max: 10 }, { kind: 'text', key: 'title', label: 'Title', max: 60 }, { kind: 'textarea', key: 'text', label: 'Text', rows: 2, max: 200 }] },
        { kind: 'list', key: 'qa', label: 'Questions (Q&A)', itemLabel: 'Question', max: 3, empty: { q: '', a: '' },
            fields: [{ kind: 'text', key: 'q', label: 'Question', max: 60 }, { kind: 'textarea', key: 'a', label: 'Answer', rows: 3, max: 400 }] },
        { kind: 'list', key: 'tabs', label: 'Tabs (Tabs)', itemLabel: 'Tab', max: 4, empty: { title: '', text: '' },
            fields: [{ kind: 'text', key: 'title', label: 'Tab name', max: 30 }, { kind: 'textarea', key: 'text', label: 'Text', rows: 4, max: 1200 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 11,
}
