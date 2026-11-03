'use client'

import { useState } from 'react'
import { AlarmClock, Ban, CalendarClock, CalendarX, Check, ChevronDown, ClipboardList, CreditCard, ShieldCheck, X } from 'lucide-react'
import { useBuilder } from '../render/context'
import { cx, Item, Txt } from '../render/primitives'
import { EditorNote, Header } from './shared'
import type { LayoutProps, SectionDefinition } from './types'

export interface PoliciesContent {
    eyebrow: string
    heading: string
    intro: string
    /** "Before your appointment" lines, one per line (empty: the Read-before-booking sentences). */
    prep: string
    dos: string
    donts: string
    extra: { title: string; text: string }[]
}

const DEFAULT: PoliciesContent = {
    eyebrow: 'Good to know',
    heading: 'Policies',
    intro: '',
    prep: '',
    dos: '',
    donts: '',
    extra: [],
}

interface Policy { id: string; title: string; text: string; icon: typeof Check; short: string; amount?: string }

const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean)
const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean)

/** The business's booking rules in plain words, plus any the business added. */
function usePolicies(c: PoliciesContent) {
    const { info } = useBuilder()
    const p = info.policies
    const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`
    const list: Policy[] = [
        ...(p.deposit ? [{ id: 'deposit', title: 'Deposit', text: `A ${p.deposit.replace(/ to book$/, '')} holds your spot and goes toward your total.`, icon: CreditCard, short: 'Deposit to book', amount: p.deposit.split(' ')[0] }] : []),
        { id: 'cancel', title: 'Cancellations', text: p.cancelDays > 0 ? `Cancel at least ${days(p.cancelDays)} before your appointment.` : 'Cancel online any time before your appointment.', icon: CalendarX, short: p.cancelDays > 0 ? `Cancel ${days(p.cancelDays)} ahead` : 'Free cancellation' },
        { id: 'reschedule', title: 'Rescheduling', text: p.rescheduleDays > 0 ? `Reschedule at least ${days(p.rescheduleDays)} before your appointment.` : 'Reschedule online any time before your appointment.', icon: CalendarClock, short: p.rescheduleDays > 0 ? `Reschedule ${days(p.rescheduleDays)} ahead` : 'Easy rescheduling' },
        ...(p.lateFee ? [{ id: 'late', title: 'Running late', text: `There’s a fee of ${p.lateFee}.`, icon: AlarmClock, short: 'Late fee', amount: p.lateFee.split(' ')[0] }] : []),
        ...(p.noShowFee ? [{ id: 'noshow', title: 'No-shows', text: `There’s a fee of ${p.noShowFee}.`, icon: Ban, short: 'No-show fee', amount: p.noShowFee.split(' ')[0] }] : []),
        ...c.extra.filter(x => x.title).map((x, i) => ({ id: `extra-${i}`, title: x.title, text: x.text, icon: ShieldCheck, short: x.title })),
    ]
    const prep = c.prep ? lines(c.prep) : sentences(p.readBeforeBooking)
    return { list, prep, read: p.readBeforeBooking, info }
}

const Title = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) =>
    <Txt role="title" as="h3" defaults={{ size, weight: 600 }}>{children}</Txt>
const Body = ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <Txt role="text" defaults={{ size: 15, leading: 1.6 }} className={cx('!text-[color:var(--s-muted)]', className)}>{children}</Txt>
const IconDot = ({ icon: Icon, className }: { icon: typeof Check; className?: string }) => (
    <span className={cx('flex h-10 w-10 flex-none items-center justify-center rounded-full', className)} style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }}><Icon size={18} aria-hidden /></span>
)
const Head = ({ c, center }: { c: PoliciesContent; center?: boolean }) => <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center={center} />

// ─── Layouts ─────────────────────────────────────────────────────────────────

const CardsGrid = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                {t.list.map(p => <Item key={p.id} card className="flex flex-col gap-3 p-6"><IconDot icon={p.icon} /><Title>{p.title}</Title><Body>{p.text}</Body></Item>)}
            </div>
        </div>
    )
}

const Accordion = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const items = [...t.list, ...(t.read ? [{ id: 'read', title: 'Read before booking', text: t.read, icon: ClipboardList, short: '' }] : [])]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Head c={c} center />
            <div className="flex flex-col gap-2">
                {items.map((p, i) => (
                    <Item key={p.id}>
                        <details open={i === 0} className="group" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4"><Title>{p.title}</Title><ChevronDown size={18} className="flex-none transition-transform group-open:rotate-180" aria-hidden /></summary>
                            <div className="px-5 pb-5"><Body className="whitespace-pre-line">{p.text}</Body></div>
                        </details>
                    </Item>
                ))}
            </div>
        </div>
    )
}

function CheckList({ items, className }: { items: string[]; className?: string }) {
    return (
        <ul className={cx('flex flex-col gap-3', className)}>
            {items.map((x, i) => (
                <Item as="li" key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}><Check size={14} aria-hidden /></span>
                    <Txt role="text" as="span" defaults={{ size: 16, leading: 1.5 }}>{x}</Txt>
                </Item>
            ))}
        </ul>
    )
}

const Checklist = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.heading === DEFAULT.heading ? 'Before your appointment' : c.heading} intro={c.intro} />
            {t.prep.length ? <CheckList items={t.prep} /> : <EditorNote>Add your prep steps (Properties → Before your appointment), or fill in Read before booking in Booking Settings.</EditorNote>}
        </div>
    )
}

const TwoColumns = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} />
            <div className="grid gap-10 @3xl:grid-cols-2">
                <div className="flex flex-col gap-5">
                    <Title size={20}>Policies</Title>
                    {t.list.map(p => <div key={p.id} className="flex flex-col gap-1" data-enter="item"><Title size={16}>{p.title}</Title><Body>{p.text}</Body></div>)}
                </div>
                <div className="flex flex-col gap-5"><Title size={20}>Before you come</Title>{t.prep.length ? <CheckList items={t.prep} /> : <Body>Nothing special: just come as you are.</Body>}</div>
            </div>
        </div>
    )
}

const IconList = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Head c={c} />
            <ul className="flex flex-col gap-6">
                {t.list.map(p => <Item as="li" key={p.id} className="flex gap-4"><IconDot icon={p.icon} /><div className="flex flex-col gap-1"><Title>{p.title}</Title><Body>{p.text}</Body></div></Item>)}
            </ul>
        </div>
    )
}

const HighlightBox = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const [key, ...rest] = t.list
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            <Head c={c} />
            {key && (
                <Item className="flex gap-4 p-6" style={{ background: 'color-mix(in srgb, var(--s-accent) 12%, var(--s-bg))', borderLeft: '4px solid var(--s-accent)', borderRadius: 'var(--s-radius)' }}>
                    <key.icon size={22} className="mt-0.5 flex-none" style={{ color: 'var(--s-accent)' }} aria-hidden />
                    <div className="flex flex-col gap-1"><Title size={19}>{key.title}</Title><Txt role="text" defaults={{ size: 16 }}>{key.text}</Txt></div>
                </Item>
            )}
            <ul className="flex flex-col gap-3 px-1">{rest.map(p => <li key={p.id} data-enter="item"><span className="font-semibold">{p.title}.</span> <span style={{ color: 'var(--s-muted)' }}>{p.text}</span></li>)}</ul>
        </div>
    )
}

const Steps = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const deposit = t.list.find(p => p.id === 'deposit')
    const steps = [
        { title: 'Book online', text: 'Pick your service and a time that works.' },
        ...(deposit ? [{ title: 'Pay the deposit', text: deposit.text }] : []),
        { title: 'Arrive prepped', text: t.prep[0] ?? 'Come a few minutes early.' },
    ]
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            <ol className={cx('grid gap-6', steps.length === 3 ? '@3xl:grid-cols-3' : '@3xl:grid-cols-2')}>
                {steps.map((s, i) => (
                    <Item as="li" key={i} className="flex flex-col items-center gap-3 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{i + 1}</span>
                        <Title>{s.title}</Title><Body>{s.text}</Body>
                    </Item>
                ))}
            </ol>
        </div>
    )
}

const Table = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <Head c={c} />
            <table className="w-full border-collapse text-left">
                <tbody>
                    {t.list.map(p => (
                        <tr key={p.id} className="border-b align-top" style={{ borderColor: 'var(--s-border)' }} data-enter="item">
                            <th scope="row" className="w-1/3 py-4 pr-4 font-semibold">{p.title}</th>
                            <td className="py-4" style={{ color: 'var(--s-muted)' }}>{p.text}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const Minimal = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="flex flex-col gap-4">
            <Header eyebrow={c.eyebrow} heading={c.heading} size={28} />
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[15.5px]">{t.list.map(p => <li key={p.id}>{p.text}</li>)}</ul>
        </div>
    )
}

const Split = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1.6fr] @3xl:gap-16">
            <Head c={c} />
            <ul className="flex flex-col">{t.list.map(p => <Item as="li" key={p.id} className="flex flex-col gap-1 border-t py-5" style={{ borderColor: 'var(--s-border)' }}><Title>{p.title}</Title><Body>{p.text}</Body></Item>)}</ul>
        </div>
    )
}

const Timeline = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const before = [...t.list.filter(p => ['deposit', 'cancel', 'reschedule'].includes(p.id)).map(p => p.text), ...t.prep]
    const during = t.list.filter(p => p.id === 'late').map(p => p.text)
    const after = t.list.filter(p => p.id === 'noshow' || p.id.startsWith('extra')).map(p => p.text)
    const stages = [{ title: 'Before', items: before }, { title: 'On the day', items: during.length ? during : ['Arrive a few minutes early.'] }, ...(after.length ? [{ title: 'Good to know', items: after }] : [])]
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <Head c={c} />
            <ol className="relative flex flex-col gap-8 border-l pl-8" style={{ borderColor: 'var(--s-border)' }}>
                {stages.map(s => (
                    <Item as="li" key={s.title} className="relative flex flex-col gap-2">
                        <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full" style={{ background: 'var(--s-accent)', boxShadow: '0 0 0 4px var(--s-bg)' }} />
                        <Title size={19}>{s.title}</Title>
                        <ul className="flex flex-col gap-1.5">{s.items.map((x, i) => <li key={i}><Body>{x}</Body></li>)}</ul>
                    </Item>
                ))}
            </ol>
        </div>
    )
}

const Tabs = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const tabs = [
        ...(t.list.some(p => p.id === 'deposit') ? [{ title: 'Deposits', items: t.list.filter(p => p.id === 'deposit') }] : []),
        { title: 'Cancellations', items: t.list.filter(p => ['cancel', 'reschedule', 'late', 'noshow'].includes(p.id)) },
        { title: 'Prep', items: t.prep.map((x, i) => ({ id: `p${i}`, title: '', text: x, icon: Check, short: '' })) },
        ...(t.list.some(p => p.id.startsWith('extra')) ? [{ title: 'More', items: t.list.filter(p => p.id.startsWith('extra')) }] : []),
    ].filter(x => x.items.length)
    const [active, setActive] = useState(0)
    const cur = tabs[Math.min(active, tabs.length - 1)]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Head c={c} />
            <div role="tablist" className="flex flex-wrap gap-2">
                {tabs.map((x, i) => (
                    <button key={x.title} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)} className="rounded-full px-4 py-2 text-sm font-semibold"
                        style={i === active ? { background: 'var(--s-accent)', color: 'var(--s-accent-fg)' } : { border: '1px solid var(--s-border)' }}>{x.title}</button>
                ))}
            </div>
            <div role="tabpanel" className="flex flex-col gap-4">{cur?.items.map(p => <div key={p.id} className="flex flex-col gap-1">{p.title && <Title>{p.title}</Title>}<Body>{p.text}</Body></div>)}</div>
        </div>
    )
}

const Numbered = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} />
            <ol className="grid gap-x-10 gap-y-8 @3xl:grid-cols-2">
                {t.list.map((p, i) => (
                    <Item as="li" key={p.id} className="flex gap-4">
                        <Txt role="number" as="span" defaults={{ font: 'heading', size: 36, weight: 600, leading: 1 }} className="flex-none tabular-nums !text-[color:var(--s-accent)]">{String(i + 1).padStart(2, '0')}</Txt>
                        <div className="flex flex-col gap-1"><Title>{p.title}</Title><Body>{p.text}</Body></div>
                    </Item>
                ))}
            </ol>
        </div>
    )
}

const Banner = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const key = t.list[0]
    const [open, setOpen] = useState(false)
    if (!key) return null
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center justify-between gap-3 px-5 py-4 text-center @3xl:flex-row @3xl:text-left" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }} data-enter="item">
                <p className="flex items-center gap-3"><key.icon size={18} style={{ color: 'var(--s-accent)' }} aria-hidden /><span className="font-semibold">{key.title}:</span> <span style={{ color: 'var(--s-muted)' }}>{key.text}</span></p>
                <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="flex-none text-sm font-semibold underline underline-offset-4">{open ? 'Hide' : 'Read all policies'}</button>
            </div>
            {open && <ul className="flex flex-col gap-3 px-2">{t.list.slice(1).map(p => <li key={p.id}><span className="font-semibold">{p.title}.</span> <span style={{ color: 'var(--s-muted)' }}>{p.text}</span></li>)}</ul>}
        </div>
    )
}

const BorderedRows = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
            <Head c={c} center />
            <ul style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                {t.list.map((p, i) => (
                    <Item as="li" key={p.id} className="flex flex-col gap-1 p-5 @3xl:flex-row @3xl:gap-8" style={i ? { borderTop: '1px solid var(--s-border)' } : undefined}>
                        <span className="font-semibold @3xl:w-44 @3xl:flex-none">{p.title}</span><Body>{p.text}</Body>
                    </Item>
                ))}
            </ul>
        </div>
    )
}

const DoDont = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const dos = c.dos ? lines(c.dos) : t.prep
    const donts = c.donts ? lines(c.donts) : []
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            <div className="grid gap-6 @3xl:grid-cols-2">
                {[{ title: 'Please do', items: dos, icon: Check, color: '#15803d' }, { title: 'Please don’t', items: donts, icon: X, color: '#b91c1c' }].map(col => (
                    <Item key={col.title} card className="flex flex-col gap-4 p-6">
                        <Title size={20}>{col.title}</Title>
                        {col.items.length ? (
                            <ul className="flex flex-col gap-3">{col.items.map((x, i) => <li key={i} className="flex gap-3"><col.icon size={18} className="mt-0.5 flex-none" style={{ color: col.color }} aria-hidden /><span>{x}</span></li>)}</ul>
                        ) : <EditorNote className="!p-3">Add lines in Properties.</EditorNote>}
                    </Item>
                ))}
            </div>
        </div>
    )
}

const StickyHeading = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[1fr_1.6fr] @3xl:gap-16">
            <div className="@3xl:sticky @3xl:top-24 @3xl:self-start"><Head c={c} /></div>
            <div className="flex flex-col gap-4">{t.list.map(p => <Item key={p.id} card className="flex gap-4 p-6"><IconDot icon={p.icon} /><div className="flex flex-col gap-1"><Title>{p.title}</Title><Body>{p.text}</Body></div></Item>)}</div>
        </div>
    )
}

const FeeCards = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    const fees = t.list.filter(p => p.amount)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            {fees.length ? (
                <div className={cx('grid gap-4', fees.length > 1 && '@2xl:grid-cols-2', fees.length > 2 && '@4xl:grid-cols-3')}>
                    {fees.map(p => (
                        <Item key={p.id} card className="flex flex-col items-center gap-2 p-7 text-center">
                            <Txt role="amount" as="div" defaults={{ font: 'heading', size: 48, weight: 700, leading: 1 }} className="!text-[color:var(--s-accent)]">{p.amount}</Txt>
                            <Title>{p.short}</Title><Body>{p.text}</Body>
                        </Item>
                    ))}
                </div>
            ) : <Body className="text-center">No deposit or fees: just book.</Body>}
        </div>
    )
}

const ReadBeforeBooking = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
            <Header eyebrow={c.eyebrow} heading={c.heading === DEFAULT.heading ? 'Read before booking' : c.heading} intro={c.intro} />
            {t.read
                ? <Item card className="p-7"><Txt role="text" defaults={{ size: 17, leading: 1.7 }} className="whitespace-pre-line">{t.read}</Txt></Item>
                : <EditorNote>Your Read-before-booking note shows here. Write it in Booking Settings.</EditorNote>}
        </div>
    )
}

const CompactStrip = ({ content: c }: LayoutProps<PoliciesContent>) => {
    const t = usePolicies(c)
    return (
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {t.list.map(p => <Item as="li" key={p.id} className="flex items-center gap-2 text-[14.5px] font-medium"><p.icon size={17} style={{ color: 'var(--s-accent)' }} aria-hidden />{p.short}</Item>)}
        </ul>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<PoliciesContent>>[] = [
    CardsGrid, Accordion, Checklist, TwoColumns, IconList, HighlightBox, Steps, Table,
    Minimal, Split, Timeline, Tabs, Numbered, Banner, BorderedRows, DoDont,
    StickyHeading, FeeCards, ReadBeforeBooking, CompactStrip,
]

export const PoliciesSection: SectionDefinition<PoliciesContent> = {
    type: 'Policies',
    label: 'Policies',
    description: 'Deposits, cancellations, fees and how to prepare, from your booking settings.',
    icon: ShieldCheck,
    wireframeId: 'policies',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'title', label: 'Policy titles' },
        { id: 'text', label: 'Policy text' },
        { id: 'amount', label: 'Fee amounts' },
        { id: 'number', label: 'Numbers' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Good to know', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Policies', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300, help: 'Deposits, cancellations and fees come from Booking Settings and stay up to date.' },
        { kind: 'textarea', key: 'prep', label: 'Before your appointment', rows: 4, max: 800, help: 'One step per line. Empty uses your Read-before-booking note.' },
        { kind: 'textarea', key: 'dos', label: 'Please do (Do / Don’t)', rows: 3, max: 600, help: 'One per line.' },
        { kind: 'textarea', key: 'donts', label: 'Please don’t (Do / Don’t)', rows: 3, max: 600, help: 'One per line.' },
        { kind: 'list', key: 'extra', label: 'More policies', itemLabel: 'Policy', max: 6, empty: { title: '', text: '' },
            fields: [{ kind: 'text', key: 'title', label: 'Title', placeholder: 'Guests', max: 40 }, { kind: 'textarea', key: 'text', label: 'Details', rows: 2, max: 300, placeholder: 'Please come alone; there’s limited seating.' }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
}
