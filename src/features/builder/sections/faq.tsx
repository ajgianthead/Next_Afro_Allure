'use client'

import { useId, useState } from 'react'
import { CalendarCheck, ChevronDown, CircleHelp, CreditCard, HelpCircle, Mail, Phone, Scissors, Search, Sparkles } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { Header } from './shared'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface FaqContent {
    eyebrow: string
    heading: string
    intro: string
    items: { q: string; a: string; topic: string }[]
    media: SiteMedia | null
    /** "Still have a question?" button (FAQ + contact). */
    button: LinkValue
}

const DEFAULT: FaqContent = {
    eyebrow: 'FAQ',
    heading: 'Questions, answered',
    intro: '',
    items: [],
    media: null,
    button: { label: 'Ask a question', href: '#contact' },
}

type QA = { q: string; a: string; topic: string }

/** The business's questions, or starter ones built from its own booking rules. */
function useFaq(c: FaqContent): QA[] {
    const { info } = useBuilder()
    const own = (c.items ?? []).filter(x => x.q && x.a).map(x => ({ ...x, topic: x.topic?.trim() || 'General' }))
    if (own.length) return own
    const p = info.policies
    return [
        { q: 'How do I book?', a: 'Pick a service and a time on the booking page. You’ll get a confirmation email with everything you need.', topic: 'Booking' },
        ...(p.deposit ? [{ q: 'Do I need a deposit?', a: `Yes: a ${p.deposit.replace(/ to book$/, '')} holds your spot and goes toward your total.`, topic: 'Payments' }] : []),
        { q: 'Can I cancel or reschedule?', a: p.cancelDays > 0 ? `Yes, up to ${p.cancelDays} day${p.cancelDays === 1 ? '' : 's'} before your appointment, from the link in your confirmation email.` : 'Yes, any time before your appointment, from the link in your confirmation email.', topic: 'Booking' },
        ...(p.readBeforeBooking ? [{ q: 'How should I prepare?', a: p.readBeforeBooking, topic: 'Your visit' }] : []),
        ...(info.place ? [{ q: 'Where are you located?', a: info.travels ? 'I come to you. Add your address when you book.' : `${info.place}. The exact address is in your confirmation email.`, topic: 'Your visit' }] : []),
    ]
}

const TOPIC_ICONS: Record<string, typeof HelpCircle> = { Booking: CalendarCheck, Payments: CreditCard, 'Your visit': Sparkles, Services: Scissors }
const topicIcon = (t: string) => TOPIC_ICONS[t] ?? HelpCircle

const Q = ({ x, size = 18, className }: { x: QA; size?: number; className?: string }) =>
    <Txt role="question" as="h3" defaults={{ size, weight: 600, leading: 1.35 }} className={className}>{x.q}</Txt>
const A = ({ x, size = 15.5, className }: { x: QA; size?: number; className?: string }) =>
    <Txt role="answer" defaults={{ size, leading: 1.65 }} className={cx('whitespace-pre-line !text-[color:var(--s-muted)]', className)}>{x.a}</Txt>
const Head = ({ c, center }: { c: FaqContent; center?: boolean }) => <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center={center} />

function Accordion({ items, firstOpen = true, className, size }: { items: QA[]; firstOpen?: boolean; className?: string; size?: number }) {
    return (
        <div className={cx('flex flex-col gap-2', className)}>
            {items.map((x, i) => (
                <Item key={i}>
                    <details open={firstOpen && i === 0} className="group" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)', background: 'var(--s-card)' }}>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4"><Q x={x} size={size} /><ChevronDown size={18} className="flex-none transition-transform group-open:rotate-180" aria-hidden /></summary>
                        <div className="px-5 pb-5"><A x={x} /></div>
                    </details>
                </Item>
            ))}
        </div>
    )
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const AccordionLayout = ({ content: c }: LayoutProps<FaqContent>) => <div className="mx-auto flex w-full max-w-2xl flex-col gap-8"><Head c={c} center /><Accordion items={useFaq(c)} /></div>

const TwoColAccordion = ({ content: c }: LayoutProps<FaqContent>) => {
    const items = useFaq(c)
    const half = Math.ceil(items.length / 2)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            <div className="grid gap-2 @3xl:grid-cols-2 @3xl:gap-4"><Accordion items={items.slice(0, half)} /><Accordion items={items.slice(half)} firstOpen={false} /></div>
        </div>
    )
}

const OpenList = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
        <Head c={c} />
        <dl className="flex flex-col gap-8">{useFaq(c).map((x, i) => <Item key={i} className="flex flex-col gap-2"><dt><Q x={x} /></dt><dd><A x={x} /></dd></Item>)}</dl>
    </div>
)

const Cards = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col gap-10">
        <Head c={c} center />
        <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">{useFaq(c).map((x, i) => <Item key={i} card className="flex flex-col gap-3 p-6"><Q x={x} /><A x={x} /></Item>)}</div>
    </div>
)

const Numbered = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <Head c={c} />
        <ol className="flex flex-col gap-8">
            {useFaq(c).map((x, i) => (
                <Item as="li" key={i} className="flex gap-5">
                    <Txt role="number" as="span" defaults={{ font: 'heading', size: 32, weight: 600, leading: 1 }} className="flex-none tabular-nums !text-[color:var(--s-accent-text)]">{String(i + 1).padStart(2, '0')}</Txt>
                    <div className="flex flex-col gap-2"><Q x={x} /><A x={x} /></div>
                </Item>
            ))}
        </ol>
    </div>
)

const Split = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-[1fr_1.6fr] @3xl:gap-16"><Head c={c} /><Accordion items={useFaq(c)} /></div>
)

const CategoryTabs = ({ content: c }: LayoutProps<FaqContent>) => {
    const items = useFaq(c)
    const topics = [...new Set(items.map(x => x.topic))]
    const [active, setActive] = useState(0)
    const cur = topics[Math.min(active, topics.length - 1)]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Head c={c} center />
            {topics.length > 1 && (
                <div role="tablist" className="flex flex-wrap justify-center gap-2">
                    {topics.map((t, i) => <button key={t} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)} className="rounded-full px-4 py-2 text-sm font-semibold"
                        style={i === active ? { background: 'var(--s-accent)', color: 'var(--s-accent-fg)' } : { border: '1px solid var(--s-border)' }}>{t}</button>)}
                </div>
            )}
            <div role="tabpanel"><Accordion items={items.filter(x => x.topic === cur)} /></div>
        </div>
    )
}

const Minimal = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col gap-6">
        <Header eyebrow={c.eyebrow} heading={c.heading} size={28} />
        <div className="flex flex-col gap-5">{useFaq(c).map((x, i) => <div key={i} className="flex flex-col gap-1" data-enter="item"><Q x={x} size={16} /><A x={x} size={15} /></div>)}</div>
    </div>
)

const BorderedRows = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <Head c={c} />
        <ul>{useFaq(c).map((x, i) => <Item as="li" key={i} className="grid gap-2 border-t py-6 last:border-b @3xl:grid-cols-[1fr_1.4fr] @3xl:gap-8" style={{ borderColor: 'var(--s-border)' }}><Q x={x} /><A x={x} /></Item>)}</ul>
    </div>
)

const HighlightedFirst = ({ content: c }: LayoutProps<FaqContent>) => {
    const [first, ...rest] = useFaq(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Head c={c} />
            {first && <Item className="flex flex-col gap-3 p-7" style={{ background: 'color-mix(in srgb, var(--s-accent) 10%, var(--s-bg))', borderRadius: 'var(--s-radius)', borderLeft: '4px solid var(--s-accent)' }}><Q x={first} size={22} /><A x={first} size={17} /></Item>}
            <Accordion items={rest} firstOpen={false} />
        </div>
    )
}

const Chat = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <Head c={c} center />
        <div className="flex flex-col gap-5">
            {useFaq(c).map((x, i) => (
                <Item key={i} className="flex flex-col gap-2">
                    <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 text-[15px] font-medium" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{x.q}</p>
                    <p className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>{x.a}</p>
                </Item>
            ))}
        </div>
    </div>
)

const SearchLayout = ({ content: c }: LayoutProps<FaqContent>) => {
    const items = useFaq(c)
    const [q, setQ] = useState('')
    const id = useId()
    const shown = q.trim() ? items.filter(x => `${x.q} ${x.a}`.toLowerCase().includes(q.trim().toLowerCase())) : items
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Head c={c} center />
            <div className="relative">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--s-muted)' }} aria-hidden />
                <label className="sr-only" htmlFor={id}>Search questions</label>
                <input id={id} type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search questions" className="min-h-12 w-full pl-11 pr-4 text-[15px] outline-none focus:border-[color:var(--s-accent)]"
                    style={{ border: '1.5px solid var(--s-border)', borderRadius: 'var(--s-button-radius)', background: 'var(--s-bg)', color: 'var(--s-fg)' }} />
            </div>
            <p className="sr-only" aria-live="polite">{shown.length} question{shown.length === 1 ? '' : 's'}</p>
            {shown.length ? <Accordion items={shown} firstOpen={!!q.trim()} /> : <p className="text-center text-[15px]" style={{ color: 'var(--s-muted)' }}>No questions match “{q}”.</p>}
        </div>
    )
}

function FlipCard({ x }: { x: QA }) {
    const [flipped, setFlipped] = useState(false)
    return (
        <Item className="[perspective:1000px]">
            <button type="button" onClick={() => setFlipped(f => !f)} aria-pressed={flipped} className="relative block h-56 w-full text-left transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none"
                style={{ transform: flipped ? 'rotateY(180deg)' : undefined }}>
                <span className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden]" style={{ background: 'var(--s-card)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }} aria-hidden={flipped}>
                    <Q x={x} size={19} /><span className="text-[13px] font-semibold" style={{ color: 'var(--s-accent-text)' }}>Tap for the answer</span>
                </span>
                <span className="absolute inset-0 overflow-y-auto p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-radius)' }} aria-hidden={!flipped}>
                    <span className="whitespace-pre-line text-[15px] leading-relaxed">{x.a}</span>
                </span>
            </button>
        </Item>
    )
}

const FlipCards = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col gap-10">
        <Head c={c} center />
        <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">{useFaq(c).map((x, i) => <FlipCard key={i} x={x} />)}</div>
    </div>
)

const IconQuestion = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <Head c={c} />
        <div className="grid gap-8 @3xl:grid-cols-2">
            {useFaq(c).map((x, i) => {
                const Icon = topicIcon(x.topic)
                return (
                    <Item key={i} className="flex gap-4">
                        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }}><Icon size={19} aria-hidden /></span>
                        <div className="flex flex-col gap-1.5"><Q x={x} size={17} /><A x={x} size={15} /></div>
                    </Item>
                )
            })}
        </div>
    </div>
)

const ImageAccordion = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="grid items-start gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Media media={c.media} label="a photo" className="aspect-[4/5] w-full @3xl:sticky @3xl:top-24" />
        <div className="flex flex-col gap-8"><Head c={c} /><Accordion items={useFaq(c)} /></div>
    </div>
)

const StickyHeading = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-[1fr_1.6fr] @3xl:gap-16">
        <div className="@3xl:sticky @3xl:top-24 @3xl:self-start"><Head c={c} /></div>
        <dl className="flex flex-col gap-4">{useFaq(c).map((x, i) => <Item key={i} card className="flex flex-col gap-2 p-6"><dt><Q x={x} /></dt><dd><A x={x} /></dd></Item>)}</dl>
    </div>
)

const BigQuestion = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col gap-12">
        <Head c={c} />
        {useFaq(c).map((x, i) => (
            <Item key={i} className="grid gap-3 @3xl:grid-cols-[1.5fr_1fr] @3xl:gap-12">
                <Txt role="question" as="h3" defaults={{ font: 'heading', size: 40, weight: 500, leading: 1.15 }}>{x.q}</Txt>
                <A x={x} className="@3xl:pt-3" />
            </Item>
        ))}
    </div>
)

const StackedPanels = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col">
        <div className="px-5 py-12 @3xl:px-12 @5xl:px-20"><Head c={c} center /></div>
        {useFaq(c).map((x, i) => (
            <div key={i} className="px-5 py-10 @3xl:px-12 @5xl:px-20" style={i % 2 === 0 ? { background: 'var(--s-surface)' } : undefined}>
                <Item className="mx-auto grid max-w-5xl gap-3 @3xl:grid-cols-[1fr_1.4fr] @3xl:gap-12"><Q x={x} size={22} /><A x={x} size={16.5} /></Item>
            </div>
        ))}
    </div>
)

const TwoColumnsOpen = ({ content: c }: LayoutProps<FaqContent>) => (
    <div className="flex flex-col gap-10">
        <Head c={c} center />
        <dl className="grid gap-x-12 gap-y-8 @3xl:grid-cols-2">{useFaq(c).map((x, i) => <Item key={i} className="flex flex-col gap-2"><dt><Q x={x} /></dt><dd><A x={x} /></dd></Item>)}</dl>
    </div>
)

const FaqContact = ({ content: c }: LayoutProps<FaqContent>) => {
    const { bookHref } = useBuilder()
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <Head c={c} center />
            <Accordion items={useFaq(c)} />
            <Item card className="flex flex-col items-center gap-4 p-8 text-center">
                <CircleHelp size={28} style={{ color: 'var(--s-accent)' }} aria-hidden />
                <Txt role="question" as="h3" defaults={{ font: 'heading', size: 24, weight: 600 }}>Still have a question?</Txt>
                {c.button?.label && <Btn href={resolveHref(c.button.href, bookHref)} variant="secondary">{c.button.href.startsWith('tel:') ? <Phone size={15} aria-hidden /> : <Mail size={15} aria-hidden />}{c.button.label}</Btn>}
            </Item>
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<FaqContent>>[] = [
    AccordionLayout, TwoColAccordion, OpenList, Cards, Numbered, Split, CategoryTabs, Minimal,
    BorderedRows, HighlightedFirst, Chat, SearchLayout, FlipCards, IconQuestion, ImageAccordion, StickyHeading,
    BigQuestion, StackedPanels, TwoColumnsOpen, FaqContact,
]

export const FaqSection: SectionDefinition<FaqContent> = {
    type: 'FAQ',
    label: 'FAQ',
    description: 'Common questions and answers. Starts with ones from your booking settings.',
    icon: HelpCircle,
    wireframeId: 'faq',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'question', label: 'Questions' },
        { id: 'answer', label: 'Answers' },
        { id: 'number', label: 'Numbers' },
        { id: 'button', label: 'Button' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'FAQ', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Questions, answered', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300 },
        { kind: 'list', key: 'items', label: 'Questions', itemLabel: 'Question', max: 16, empty: { q: '', a: '', topic: '' },
            help: 'Until you add your own, a few are written from your booking settings.',
            fields: [
                { kind: 'text', key: 'q', label: 'Question', max: 160 },
                { kind: 'textarea', key: 'a', label: 'Answer', rows: 3, max: 1200 },
                { kind: 'text', key: 'topic', label: 'Topic (Category tabs)', placeholder: 'Booking', max: 30 },
            ] },
        { kind: 'media', key: 'media', label: 'Photo or video (Image + accordion)', accept: 'media' },
        { kind: 'link', key: 'button', label: 'Button (FAQ + contact)' },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 18,
}
