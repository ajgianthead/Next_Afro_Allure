'use client'

import { useEffect, useState } from 'react'
import { Gift, Heart, Share2, Sparkles, Ticket, X } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useBuilder, type BuilderContextValue } from '../render/context'
import { resolveHref } from '../render/links'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { EditorNote, Header } from './shared'
import type { LayoutProps, LinkValue, SectionDefinition } from './types'

export interface OffersContent {
    /** Which offer: the business's loyalty or referral program, both, or a custom promo. */
    show: 'auto' | 'loyalty' | 'referral' | 'custom'
    eyebrow: string
    /** Custom promo (and an optional heading over the program offers). */
    title: string
    detail: string
    /** Big text, e.g. "$10 OFF". */
    amount: string
    /** yyyy-mm-dd: the promo ends after this day (Countdown; hidden once it has passed). */
    endsOn: string
    button: LinkValue
    media: SiteMedia | null
    tiers: { title: string; text: string }[]
}

const DEFAULT: OffersContent = {
    show: 'auto',
    eyebrow: 'Rewards',
    title: '',
    detail: '',
    amount: '',
    endsOn: '',
    button: { label: 'Book now', href: 'book' },
    media: null,
    tiers: [],
}

interface Offer {
    kind: 'loyalty' | 'referral' | 'custom'
    title: string
    detail: string
    big: string
    visits?: number
}

/** The offers to show, from the business's programs or the custom promo. */
function offersFor(c: OffersContent, ctx: Pick<BuilderContextValue, 'offers' | 'editing'>): Offer[] {
    const o = ctx.offers
    const loyalty: Offer | null = o?.loyalty ? { kind: 'loyalty', title: o.loyalty.title, detail: o.loyalty.detail, big: o.loyalty.rewardText, visits: o.loyalty.visits } : null
    const referral: Offer | null = o?.referral ? { kind: 'referral', title: o.referral.title, detail: o.referral.detail, big: o.referral.rewardText } : null
    const custom: Offer | null = c.title || c.amount ? { kind: 'custom', title: c.title || 'Special offer', detail: c.detail, big: c.amount || c.title } : null
    const list = c.show === 'loyalty' ? [loyalty] : c.show === 'referral' ? [referral] : c.show === 'custom' ? [custom] : [custom, loyalty, referral]
    const out = list.filter((x): x is Offer => !!x)
    // In the editor, an example shows how the layout looks until a program is on.
    if (!out.length && ctx.editing) return [{ kind: 'custom', title: 'Refer a friend', detail: 'You both get $10 off when a friend books. Turn on Referrals or Loyalty to show your real offer.', big: '$10 off' }]
    return out
}

const ended = (c: OffersContent) => !!c.endsOn && /^\d{4}-\d{2}-\d{2}$/.test(c.endsOn) && new Date(`${c.endsOn}T23:59:59`) < new Date()

function useOffers(c: OffersContent) {
    const ctx = useBuilder()
    const list = ended(c) && c.show === 'custom' ? [] : offersFor(c, ctx)
    const button = c.button?.label ? { label: c.button.label, href: resolveHref(c.button.href, ctx.bookHref) } : null
    return { list, first: list[0] as Offer | undefined, button, book: ctx.bookHref() }
}

const icon = (o?: Offer) => (o?.kind === 'referral' ? Share2 : o?.kind === 'loyalty' ? Heart : Gift)

const Title = ({ o, size = 28, className }: { o: Offer; size?: number; className?: string }) =>
    <Txt role="title" as="h2" defaults={{ font: 'heading', size, weight: 600, leading: 1.15 }} className={className}>{o.title}</Txt>
const Detail = ({ o, className }: { o: Offer; className?: string }) =>
    o.detail ? <Txt role="detail" defaults={{ size: 16, leading: 1.6 }} className={cx('!text-[color:var(--s-muted)]', className)}>{o.detail}</Txt> : null
const Big = ({ o, size = 72, className }: { o: Offer; size?: number; className?: string }) =>
    <Txt role="amount" as="div" count defaults={{ font: 'heading', size, weight: 700, leading: 1, case: 'upper' }} className={cx('!text-[color:var(--s-accent-text)]', className)}>{o.big}</Txt>

function Action({ c, className, inverse }: { c: OffersContent; className?: string; inverse?: boolean }) {
    const t = useOffers(c)
    if (!t.button) return null
    return <div className={className}><Btn href={t.button.href} variant={inverse ? 'secondary' : 'primary'}>{t.button.label}</Btn></div>
}

function Eyebrow({ c, center }: { c: OffersContent; center?: boolean }) {
    return c.eyebrow ? <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className={cx('!text-[color:var(--s-accent-text)]', center && 'text-center')}>{c.eyebrow}</Txt> : null
}

/** Accent-colored block: text in the accent's readable color. */
const AccentBox = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div className={className} style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', ['--s-fg' as string]: 'var(--s-accent-fg)', ['--s-muted' as string]: 'var(--s-accent-fg)', ...style }}>{children}</div>
)

function None() {
    return <EditorNote>Turn on Loyalty or Referrals (Clientele → Rewards), or choose “Custom promo” in Properties.</EditorNote>
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const Strip = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    const Icon = icon(t.first)
    return (
        <AccentBox className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-5 py-3 text-center">
            <Icon size={17} aria-hidden />
            <Txt role="title" as="span" defaults={{ size: 15, weight: 600 }}>{t.first.title}: {t.first.detail || t.first.big}</Txt>
            {t.button && <a href={t.button.href} className="text-[15px] font-semibold underline underline-offset-4">{t.button.label}</a>}
        </AccentBox>
    )
}

const CenteredCard = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <Item card className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-8 text-center @3xl:p-12">
            <Eyebrow c={c} center /><Title o={t.first} /><Big o={t.first} size={56} /><Detail o={t.first} /><Action c={c} />
        </Item>
    )
}

const ColorBlock = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <AccentBox className="flex flex-col items-center gap-5 px-5 py-16 text-center @3xl:py-24">
            <Title o={t.first} size={44} /><Detail o={t.first} className="max-w-xl" />
            <Action c={c} inverse />
        </AccentBox>
    )
}

const BadgeButton = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <div className="flex flex-col items-center justify-center gap-4 text-center @3xl:flex-row @3xl:text-left">
            <span className="rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{t.first.big}</span>
            <Txt role="detail" as="p" defaults={{ size: 17 }}>{t.first.detail || t.first.title}</Txt>
            <Action c={c} />
        </div>
    )
}

const MinimalLine = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <p className="text-center text-[17px]">
            <Txt role="title" as="span" defaults={{ size: 17, weight: 600 }}>{t.first.title}.</Txt>{' '}
            <span style={{ color: 'var(--s-muted)' }}>{t.first.detail}</span>{' '}
            {t.button && <a href={t.button.href} className="font-semibold underline underline-offset-4" style={{ color: 'var(--s-accent-text)' }}>{t.button.label} →</a>}
        </p>
    )
}

const BigNumber = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <Eyebrow c={c} center /><Big o={t.first} size={128} /><Title o={t.first} size={24} /><Detail o={t.first} className="max-w-lg" /><Action c={c} />
        </div>
    )
}

const TwoOffers = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <div className="flex flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.title && t.list.length > 1 ? c.title : ''} center />
            <div className={cx('grid gap-5', t.list.length > 1 && '@3xl:grid-cols-2')}>
                {t.list.slice(0, 2).map(o => {
                    const Icon = icon(o)
                    return (
                        <Item key={o.kind} card className="flex flex-col gap-3 p-7">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }}><Icon size={20} aria-hidden /></span>
                            <Title o={o} size={24} /><Big o={o} size={40} /><Detail o={o} />
                        </Item>
                    )
                })}
            </div>
            <Action c={c} className="flex justify-center" />
        </div>
    )
}

const SplitIcon = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    const Icon = icon(t.first)
    return (
        <div className="grid items-center gap-10 @3xl:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-4"><Eyebrow c={c} /><Title o={t.first} size={40} /><Detail o={t.first} /><Action c={c} /></div>
            <div className="mx-auto flex aspect-square w-48 items-center justify-center rounded-full @3xl:w-64" style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }} data-enter="media">
                <Icon className="h-1/3 w-1/3" strokeWidth={1.5} aria-hidden />
            </div>
        </div>
    )
}

const Coupon = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <Item className="relative mx-auto grid w-full max-w-2xl overflow-hidden @2xl:grid-cols-[1fr_auto]" style={{ border: '2px dashed var(--s-accent)', borderRadius: 'var(--s-radius)', background: 'var(--s-card)' }}>
            <div className="flex flex-col gap-2 p-7"><Title o={t.first} size={24} /><Detail o={t.first} /></div>
            <div className="flex flex-col items-center justify-center gap-3 border-t-2 border-dashed p-7 @2xl:border-l-2 @2xl:border-t-0" style={{ borderColor: 'var(--s-accent)' }}>
                <Big o={t.first} size={44} /><Action c={c} />
            </div>
            <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: 'var(--s-bg)', border: '2px dashed var(--s-accent)' }} />
            <span aria-hidden className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: 'var(--s-bg)', border: '2px dashed var(--s-accent)' }} />
        </Item>
    )
}

const StampCard = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const o = t.list.find(x => x.kind === 'loyalty') ?? t.first
    if (!o) return <None />
    const n = Math.min(Math.max(o.visits ?? 5, 2), 12)
    return (
        <Item card className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 p-8 text-center">
            <Title o={o} size={26} />
            <ol className="grid grid-cols-5 gap-3" aria-label={`${n} visits`}>
                {Array.from({ length: n }, (_, i) => (
                    <li key={i} className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold" style={i === n - 1 ? { background: 'var(--s-accent)', color: 'var(--s-accent-fg)' } : { border: '2px dashed var(--s-border)', color: 'var(--s-muted)' }}>
                        {i === n - 1 ? <Gift size={18} aria-label="Reward" /> : i + 1}
                    </li>
                ))}
            </ol>
            <Txt role="detail" defaults={{ size: 16 }}>{n} visits = {o.big}</Txt>
            <Action c={c} />
        </Item>
    )
}

const Progress = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const o = t.list.find(x => x.kind === 'loyalty') ?? t.first
    if (!o) return <None />
    const n = Math.min(Math.max(o.visits ?? 5, 2), 12)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            <Header eyebrow={c.eyebrow} heading={o.title} />
            <div className="flex gap-1.5" data-enter="item" role="img" aria-label={`Visit ${n} times to get ${o.big}`}>
                {Array.from({ length: n }, (_, i) => <span key={i} className="h-3 flex-1 rounded-full" style={{ background: i < Math.ceil(n * 0.6) ? 'var(--s-accent)' : 'var(--s-surface)', border: '1px solid var(--s-border)' }} />)}
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--s-muted)' }}><span>Visit 1</span><span>Visit {n}: {o.big}</span></div>
            <Detail o={o} /><Action c={c} />
        </div>
    )
}

const Steps = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const o = t.list.find(x => x.kind === 'referral') ?? t.first
    if (!o) return <None />
    const steps = o.kind === 'loyalty'
        ? ['Book and come in', 'Every visit counts', `Get ${o.big}`]
        : ['Share your link with a friend', 'Your friend books', o.detail || `You both get ${o.big}`]
    return (
        <div className="flex flex-col gap-10">
            <Header eyebrow={c.eyebrow} heading={o.title} center />
            <ol className="grid gap-6 @3xl:grid-cols-3">
                {steps.map((s, i) => (
                    <Item as="li" key={i} className="flex flex-col items-center gap-3 text-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{i + 1}</span>
                        <Txt role="step" as="p" defaults={{ size: 17, weight: 600 }}>{s}</Txt>
                    </Item>
                ))}
            </ol>
            <Action c={c} className="flex justify-center" />
        </div>
    )
}

const GiftCard = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const { info } = useBuilder()
    if (!t.first) return <None />
    return (
        <div className="grid items-center gap-10 @3xl:grid-cols-2">
            <AccentBox className="relative mx-auto aspect-[1.6] w-full max-w-sm overflow-hidden p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,.45)]" style={{ borderRadius: 18 }}>
                <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full" style={{ background: 'color-mix(in srgb, var(--s-accent-fg) 14%, transparent)' }} />
                <div className="relative flex h-full flex-col justify-between">
                    <span className="text-sm font-semibold uppercase tracking-widest">{info.businessName}</span>
                    <Txt role="amount" as="span" defaults={{ font: 'heading', size: 48, weight: 700, leading: 1, case: 'upper' }}>{t.first.big}</Txt>
                </div>
            </AccentBox>
            <div className="flex flex-col gap-4"><Eyebrow c={c} /><Title o={t.first} size={36} /><Detail o={t.first} /><Action c={c} /></div>
        </div>
    )
}

const CodeBox = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const [code, setCode] = useState('')
    const { editing } = useBuilder()
    return (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 text-center">
            <Header eyebrow={c.eyebrow} heading={c.title || 'Have a referral code?'} intro={c.detail || 'Enter a friend’s code and book: the discount is added at checkout.'} center />
            <form className="flex w-full flex-col gap-2 @2xl:flex-row" onSubmit={e => { e.preventDefault(); if (!editing && code.trim()) location.href = `${t.book}${t.book.includes('?') ? '&' : '?'}ref=${encodeURIComponent(code.trim())}` }}>
                <label className="sr-only" htmlFor="aa-offer-code">Referral code</label>
                <input id="aa-offer-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODE" autoComplete="off" maxLength={24}
                    className="min-h-12 min-w-0 flex-1 px-4 text-center font-mono text-lg tracking-[0.2em] outline-none focus:border-[color:var(--s-accent)] @2xl:text-left"
                    style={{ border: '1.5px solid var(--s-border)', borderRadius: 'var(--s-button-radius)', background: 'var(--s-bg)', color: 'var(--s-fg)' }} />
                <button type="submit" className="min-h-12 px-6 font-semibold" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-button-radius)' }}>Use code</button>
            </form>
        </div>
    )
}

function useCountdown(endsOn: string) {
    const [now, setNow] = useState<number | null>(null)
    useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endsOn) || now === null) return null
    const left = Math.max(0, new Date(`${endsOn}T23:59:59`).getTime() - now)
    return { d: Math.floor(left / 864e5), h: Math.floor(left / 36e5) % 24, m: Math.floor(left / 6e4) % 60, s: Math.floor(left / 1e3) % 60 }
}

const Countdown = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const left = useCountdown(c.endsOn)
    if (!t.first) return <None />
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <Eyebrow c={c} center /><Title o={t.first} size={40} /><Detail o={t.first} className="max-w-lg" />
            {left ? (
                <div className="flex gap-3" role="timer" aria-label={`${left.d} days ${left.h} hours left`}>
                    {([['days', left.d], ['hours', left.h], ['min', left.m], ['sec', left.s]] as const).map(([l, v]) => (
                        <div key={l} className="flex w-16 flex-col items-center py-3 @3xl:w-20" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <span className="font-[family-name:var(--s-heading)] text-3xl font-semibold tabular-nums @3xl:text-4xl" aria-hidden>{String(v).padStart(2, '0')}</span>
                            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--s-muted)' }} aria-hidden>{l}</span>
                        </div>
                    ))}
                </div>
            ) : <EditorNote>Set an end date in Properties to show the countdown.</EditorNote>}
            <Action c={c} />
        </div>
    )
}

const ImageBackground = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <div className="relative isolate overflow-hidden">
            <div className="absolute inset-0 -z-10" data-kenburns="">
                <Media media={c.media} label="a photo behind the offer" className="h-full w-full" rounded={false} />
                <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="flex flex-col items-center gap-4 px-5 py-20 text-center text-white @3xl:py-28" style={{ ['--s-fg' as string]: '#fff', ['--s-muted' as string]: 'rgba(255,255,255,.85)', ['--s-accent' as string]: '#fff', ['--s-accent-text' as string]: '#fff', ['--s-accent-fg' as string]: '#111' }}>
                <Eyebrow c={c} center /><Big o={t.first} size={88} /><Title o={t.first} size={28} /><Detail o={t.first} className="max-w-lg" /><Action c={c} />
            </div>
        </div>
    )
}

const CornerRibbon = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    return (
        <Item card className="relative mx-auto flex w-full max-w-xl flex-col gap-3 overflow-hidden p-8 pr-16">
            <span className="absolute right-[-44px] top-6 w-44 rotate-45 py-1.5 text-center text-xs font-bold uppercase tracking-wider" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>{t.first.big}</span>
            <Eyebrow c={c} /><Title o={t.first} /><Detail o={t.first} /><Action c={c} className="pt-2" />
        </Item>
    )
}

const Tiers = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const tiers = c.tiers.length ? c.tiers : t.list.map(o => ({ title: o.title, text: o.detail || o.big }))
    if (!tiers.length) return <None />
    const shades = [35, 60, 100]
    return (
        <div className="flex flex-col gap-8">
            <Header eyebrow={c.eyebrow} heading={c.title || 'Rewards'} center />
            <ol className="mx-auto flex w-full max-w-2xl flex-col gap-3">
                {tiers.map((x, i) => (
                    <Item as="li" key={i} className="flex items-center gap-4 p-5" style={{ background: 'var(--s-card)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)', borderLeft: `6px solid color-mix(in srgb, var(--s-accent) ${shades[Math.min(i, 2)]}%, var(--s-bg))` }}>
                        <Sparkles size={20} style={{ color: 'var(--s-accent)' }} aria-hidden />
                        <div><Txt role="title" as="h3" defaults={{ size: 18, weight: 600 }}>{x.title}</Txt><Txt role="detail" defaults={{ size: 15 }} className="!text-[color:var(--s-muted)]">{x.text}</Txt></div>
                    </Item>
                ))}
            </ol>
            <Action c={c} className="flex justify-center" />
        </div>
    )
}

const Marquee = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    if (!t.first) return <None />
    const text = t.list.map(o => `${o.title}: ${o.big}`).join('  ✦  ') + '  ✦  '
    const line = (dup?: boolean) => <Txt role="title" as="span" enter={false} defaults={{ font: 'heading', size: 28, weight: 600, case: 'upper' }} className={cx('whitespace-nowrap pr-6', dup && 'aa-marquee-dup')}>{text.repeat(3)}</Txt>
    return (
        <AccentBox className="overflow-hidden py-5">
            <a href={t.button?.href ?? t.book} aria-label={`${t.first.title}: ${t.first.detail || t.first.big}`}>
                <div className="aa-marquee" style={{ ['--aa-marquee-duration' as string]: '30s' }}>{line()}<span aria-hidden className="aa-marquee-dup">{line(true)}</span></div>
            </a>
        </AccentBox>
    )
}

const FloatingRibbon = ({ content: c }: LayoutProps<OffersContent>) => {
    const t = useOffers(c)
    const { editing } = useBuilder()
    const [open, setOpen] = useState(false)
    if (!t.first) return <None />
    return (
        <div className={cx('z-40', editing ? 'relative flex justify-end py-4 pr-2' : 'fixed right-0 top-1/2 -translate-y-1/2')}>
            {open ? (
                <div role="dialog" aria-label={t.first.title} className="mr-3 flex w-72 flex-col gap-3 p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,.4)]" style={{ background: 'var(--s-card)', border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                    <div className="flex items-start justify-between gap-2"><Title o={t.first} size={20} /><button type="button" aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></button></div>
                    <Big o={t.first} size={32} /><Detail o={t.first} /><Action c={c} />
                </div>
            ) : (
                <button type="button" onClick={() => setOpen(true)} aria-expanded={false}
                    className="flex items-center gap-2 px-3 py-4 text-sm font-semibold [writing-mode:vertical-rl]" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: '10px 0 0 10px' }}>
                    <Ticket size={16} className="rotate-90" aria-hidden />{t.first.big}
                </button>
            )}
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<OffersContent>>[] = [
    Strip, CenteredCard, ColorBlock, BadgeButton, MinimalLine, BigNumber, TwoOffers, SplitIcon,
    Coupon, StampCard, Progress, Steps, GiftCard, CodeBox, Countdown, ImageBackground,
    CornerRibbon, Tiers, Marquee, FloatingRibbon,
]

export const OffersSection: SectionDefinition<OffersContent> = {
    type: 'Offers',
    label: 'Offers',
    description: 'Your loyalty and referral rewards, or a promo of your own.',
    icon: Gift,
    wireframeId: 'offers',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'title', label: 'Offer title' },
        { id: 'amount', label: 'Big amount' },
        { id: 'detail', label: 'Details' },
        { id: 'step', label: 'Steps' },
        { id: 'button', label: 'Button' },
    ],
    fields: [
        { kind: 'select', key: 'show', label: 'Offer to show', options: [
            { value: 'auto', label: 'My rewards (loyalty and referral)' },
            { value: 'loyalty', label: 'Loyalty rewards only' },
            { value: 'referral', label: 'Refer-a-friend only' },
            { value: 'custom', label: 'A custom promo' },
        ], help: 'Loyalty and referral offers come from Clientele → Rewards and update on their own.' },
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Rewards', max: 40 },
        { kind: 'text', key: 'title', label: 'Promo title', placeholder: 'New client special', max: 80 },
        { kind: 'text', key: 'amount', label: 'Promo amount', placeholder: '$15 OFF', max: 20 },
        { kind: 'textarea', key: 'detail', label: 'Promo details', rows: 2, max: 240 },
        { kind: 'text', key: 'endsOn', label: 'Promo ends on (Countdown)', placeholder: 'YYYY-MM-DD', max: 10, help: 'A custom promo hides itself after this day.' },
        { kind: 'link', key: 'button', label: 'Button' },
        { kind: 'media', key: 'media', label: 'Photo (Image background)', accept: 'image' },
        { kind: 'list', key: 'tiers', label: 'Tiers (Tiers)', itemLabel: 'Tier', max: 4, empty: { title: '', text: '' },
            fields: [{ kind: 'text', key: 'title', label: 'Tier name', max: 40 }, { kind: 'text', key: 'text', label: 'Reward', max: 120 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => [1, 3, 16, 19, 20].includes(l),
    hideWhen: (c, layout, ctx) => (layout === 14 ? !ctx.offers?.referral : (ended(c) && c.show === 'custom') || offersFor(c, { ...ctx, editing: false }).length === 0),
}

