'use client'

import { useEffect, useId, useState } from 'react'
import QRCode from 'react-qr-code'
import { Check, ChevronDown, Facebook, Instagram, Loader2, Mail, MapPin, MessageCircle, MessagesSquare, Music2, Phone, Send } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { useTurnstile } from '@/lib/abuse/useTurnstile'
import { useBuilder } from '../render/context'
import { Btn, cx, Item, Media, Txt } from '../render/primitives'
import { sendContactMessageAction } from '../server/contact'
import { EditorNote, Header, MapEmbed, directionsHref } from './shared'
import type { LayoutProps, SectionDefinition } from './types'

export interface ContactContent {
    eyebrow: string
    heading: string
    intro: string
    phone: string
    email: string
    /** Handles without the @, or full https links. */
    instagram: string
    tiktok: string
    facebook: string
    /** Can clients text this number? (Text me, Big phone) */
    texts: boolean
    media: SiteMedia | null
    faq: { q: string; a: string }[]
}

const DEFAULT: ContactContent = {
    eyebrow: 'Contact',
    heading: 'Get in touch',
    intro: '',
    phone: '',
    email: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    texts: true,
    media: null,
    faq: [],
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

interface Way { id: string; label: string; display: string; href: string; icon: typeof Phone; external?: boolean }

const handle = (v: string) => v.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//, '').replace(/[/?#].*$/, '')
const socialUrl = (v: string, base: string) => (/^https:\/\//.test(v.trim()) ? v.trim() : `${base}${handle(v)}`)

/** Every way to reach the business that it filled in. */
function useWays(c: ContactContent) {
    const { info } = useBuilder()
    const digits = c.phone.replace(/[^\d+]/g, '')
    const ways: Way[] = [
        ...(c.phone ? [{ id: 'phone', label: 'Call', display: c.phone, href: `tel:${digits}`, icon: Phone }] : []),
        ...(c.phone && c.texts ? [{ id: 'sms', label: 'Text', display: c.phone, href: `sms:${digits}`, icon: MessageCircle }] : []),
        ...(c.email ? [{ id: 'email', label: 'Email', display: c.email, href: `mailto:${c.email}`, icon: Mail }] : []),
        ...(c.instagram ? [{ id: 'instagram', label: 'Instagram', display: `@${handle(c.instagram)}`, href: socialUrl(c.instagram, 'https://instagram.com/'), icon: Instagram, external: true }] : []),
        ...(c.tiktok ? [{ id: 'tiktok', label: 'TikTok', display: `@${handle(c.tiktok)}`, href: socialUrl(c.tiktok, 'https://www.tiktok.com/@'), icon: Music2, external: true }] : []),
        ...(c.facebook ? [{ id: 'facebook', label: 'Facebook', display: handle(c.facebook) || 'Facebook', href: socialUrl(c.facebook, 'https://facebook.com/'), icon: Facebook, external: true }] : []),
    ]
    const socials = ways.filter(w => w.external)
    return { ways, socials, info, digits }
}

const linkProps = (w: Way) => (w.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})

function WayRow({ w, className }: { w: Way; className?: string }) {
    return (
        <a href={w.href} {...linkProps(w)} className={cx('group flex items-center gap-3', className)}>
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full" style={{ background: 'var(--s-surface)', color: 'var(--s-accent)' }}><w.icon size={18} aria-hidden /></span>
            <span className="flex min-w-0 flex-col leading-tight">
                <Txt role="label" as="span" enter={false} defaults={{ size: 12, weight: 600, case: 'upper', tracking: 0.1 }} className="!text-[color:var(--s-muted)]">{w.label}</Txt>
                <Txt role="value" as="span" enter={false} defaults={{ size: 16, weight: 600 }} className="truncate underline-offset-4 group-hover:underline">{w.display}</Txt>
            </span>
        </a>
    )
}

function WaysList({ c, className }: { c: ContactContent; className?: string }) {
    const t = useWays(c)
    if (!t.ways.length) return <EditorNote>Add your phone, email or socials in Properties.</EditorNote>
    return <ul className={cx('flex flex-col gap-4', className)}>{t.ways.map(w => <Item as="li" key={w.id}><WayRow w={w} /></Item>)}</ul>
}

const Head = ({ c, center }: { c: ContactContent; center?: boolean }) => <Header eyebrow={c.eyebrow} heading={c.heading} intro={c.intro} center={center} />

/** Name, how to reply, message: emailed to the business. */
function MessageForm({ className }: { className?: string }) {
    const { businessId, editing } = useBuilder()
    const id = useId()
    const [form, setForm] = useState({ name: '', contact: '', message: '' })
    const [state, setState] = useState<{ kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string }>({ kind: 'idle' })
    const { turnstile, getToken } = useTurnstile('site-contact')
    const field = 'min-h-11 w-full px-3.5 text-[15px] outline-none focus:border-[color:var(--s-accent)]'
    const fieldStyle = { border: '1px solid var(--s-border)', background: 'var(--s-bg)', color: 'var(--s-fg)', borderRadius: 'var(--s-button-radius)' }
    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (editing || !businessId) return
        setState({ kind: 'sending' })
        const r = await sendContactMessageAction({ businessId, ...form }, await getToken())
        setState(r.ok ? { kind: 'sent' } : { kind: 'error', message: r.error })
    }
    if (state.kind === 'sent') return <p role="status" className={cx('flex items-center gap-2 text-[16px]', className)}><Check size={18} style={{ color: 'var(--s-accent)' }} />Message sent. You’ll hear back soon.</p>
    return (
        <form onSubmit={submit} className={cx('flex flex-col gap-3', className)} data-enter="item">
            <label className="sr-only" htmlFor={`${id}-n`}>Your name</label>
            <input id={`${id}-n`} required maxLength={80} autoComplete="name" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={field} style={fieldStyle} />
            <label className="sr-only" htmlFor={`${id}-c`}>Email or phone</label>
            <input id={`${id}-c`} required maxLength={120} autoComplete="email" placeholder="Email or phone (so they can reply)" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className={field} style={fieldStyle} />
            <label className="sr-only" htmlFor={`${id}-m`}>Message</label>
            <textarea id={`${id}-m`} required maxLength={2000} rows={4} placeholder="Your message" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={cx(field, 'resize-y py-2.5')} style={fieldStyle} />
            {turnstile}
            {state.kind === 'error' && <p role="alert" className="text-[13.5px]" style={{ color: '#d14343' }}>{state.message}</p>}
            <button type="submit" disabled={state.kind === 'sending'} className="inline-flex min-h-11 items-center justify-center gap-2 px-5 text-[15px] font-semibold disabled:opacity-60"
                style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-button-radius)' }}>
                {state.kind === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} aria-hidden />}Send message
            </button>
        </form>
    )
}

// ─── Layouts ─────────────────────────────────────────────────────────────────

const IconList = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8"><Head c={c} /><WaysList c={c} /></div>
)

const Cards = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            {t.ways.length ? (
                <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
                    {t.ways.map(w => (
                        <Item key={w.id} card className="p-0">
                            <a href={w.href} {...linkProps(w)} className="flex flex-col items-center gap-3 p-7 text-center">
                                <w.icon size={26} style={{ color: 'var(--s-accent)' }} aria-hidden />
                                <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--s-muted)' }}>{w.label}</span>
                                <span className="break-all text-[16px] font-semibold">{w.display}</span>
                            </a>
                        </Item>
                    ))}
                </div>
            ) : <WaysList c={c} />}
        </div>
    )
}

const BigLinks = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col items-center gap-8 text-center">
            <Head c={c} center />
            <ul className="flex flex-col items-center gap-3">
                {t.ways.filter(w => w.id !== 'sms').map(w => (
                    <Item as="li" key={w.id}><a href={w.href} {...linkProps(w)} className="underline-offset-8 hover:underline"><Txt role="big" as="span" enter={false} defaults={{ font: 'heading', size: 40, weight: 600 }} className="break-all">{w.display}</Txt></a></Item>
                ))}
            </ul>
            {!t.ways.length && <WaysList c={c} />}
        </div>
    )
}

const SocialButtons = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col items-center gap-8 text-center">
            <Head c={c} center />
            {t.ways.length ? <div className="flex flex-wrap justify-center gap-3">{t.ways.map(w => <Btn key={w.id} href={w.href} variant="secondary"><w.icon size={16} aria-hidden />{w.label}</Btn>)}</div> : <WaysList c={c} />}
        </div>
    )
}

const TwoColumns = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Head c={c} />
        <WaysList c={c} />
    </div>
)

const Minimal = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col gap-3">
            <Header eyebrow={c.eyebrow} heading={c.heading} size={28} />
            <p className="flex flex-wrap gap-x-5 gap-y-1 text-[15.5px]">{t.ways.filter(w => w.id !== 'sms').map(w => <a key={w.id} href={w.href} {...linkProps(w)} className="underline underline-offset-4">{w.display}</a>)}</p>
            {!t.ways.length && <WaysList c={c} />}
        </div>
    )
}

const BigPhone = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col items-center gap-6 text-center">
            <Head c={c} center />
            {c.phone ? <>
                <a href={`tel:${t.digits}`}><Txt role="big" as="span" enter={false} defaults={{ font: 'heading', size: 72, weight: 700, leading: 1 }} className="whitespace-nowrap">{c.phone}</Txt></a>
                <div className="flex flex-wrap justify-center gap-3"><Btn href={`tel:${t.digits}`}><Phone size={16} aria-hidden />Call</Btn>{c.texts && <Btn href={`sms:${t.digits}`} variant="secondary"><MessageCircle size={16} aria-hidden />Text</Btn>}</div>
            </> : <EditorNote>Add your phone number in Properties.</EditorNote>}
        </div>
    )
}

const PhotoContact = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-16">
        <Media media={c.media} label="a photo" className="aspect-[4/5] w-full" kenburns />
        <div className="flex flex-col gap-8"><Head c={c} /><WaysList c={c} /></div>
    </div>
)

const MessageFormLayout = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8"><Head c={c} center /><MessageForm /></div>
)

const FormDetails = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="grid gap-10 @3xl:grid-cols-[1fr_1.3fr] @3xl:gap-16">
        <div className="flex flex-col gap-8"><Head c={c} /><WaysList c={c} /></div>
        <MessageForm />
    </div>
)

const QR = ({ content: c }: LayoutProps<ContactContent>) => {
    const { bookHref, info } = useBuilder()
    const [url, setUrl] = useState('')
    useEffect(() => { setUrl(new URL(bookHref(), window.location.href).toString()) }, [bookHref])
    return (
        <div className="grid items-center gap-10 @3xl:grid-cols-[auto_1fr] @3xl:gap-16">
            <Item className="mx-auto flex flex-col items-center gap-3 bg-white p-5" style={{ borderRadius: 'var(--s-radius)', border: '1px solid var(--s-border)' }}>
                {url ? <QRCode value={url} size={176} fgColor="#111111" bgColor="#ffffff" title={`Book with ${info.businessName}`} /> : <div className="h-44 w-44" />}
                <span className="text-[13px] font-semibold text-[#111]">Scan to book</span>
            </Item>
            <div className="flex flex-col gap-8"><Head c={c} /><WaysList c={c} /></div>
        </div>
    )
}

const BusinessCard = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    const { themeProps } = useBuilder()
    return (
        <div className="flex flex-col items-center gap-8">
            <Head c={c} center />
            <Item className="relative w-full max-w-lg overflow-hidden p-8 shadow-[0_24px_48px_-24px_rgba(0,0,0,.4)] @2xl:aspect-[1.75]" style={{ background: 'var(--s-card)', border: '1px solid var(--s-border)', borderRadius: 16 }}>
                <span aria-hidden className="absolute inset-y-0 left-0 w-2" style={{ background: 'var(--s-accent)' }} />
                <div className="flex h-full flex-col justify-between gap-6">
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {themeProps.logo && <img src={themeProps.logo.url} alt="" className="h-10 w-auto object-contain" />}
                        <Txt role="big" as="span" enter={false} defaults={{ font: 'heading', size: 24, weight: 600 }}>{t.info.businessName}</Txt>
                    </div>
                    <ul className="flex flex-col gap-1 text-[14px]">
                        {t.ways.filter(w => w.id !== 'sms').slice(0, 4).map(w => <li key={w.id}><a href={w.href} {...linkProps(w)} className="inline-flex items-center gap-2"><w.icon size={14} style={{ color: 'var(--s-accent)' }} aria-hidden />{w.display}</a></li>)}
                        {t.info.place && <li className="inline-flex items-center gap-2"><MapPin size={14} style={{ color: 'var(--s-accent)' }} aria-hidden />{t.info.place}</li>}
                    </ul>
                </div>
            </Item>
        </div>
    )
}

const TextMe = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
            <Head c={c} center />
            {c.phone ? (
                <a href={`sms:${t.digits}`} className="group flex w-full flex-col gap-2" data-enter="item">
                    <span className="self-start rounded-2xl rounded-bl-sm px-4 py-3 text-left text-[15px]" style={{ background: 'var(--s-surface)', border: '1px solid var(--s-border)' }}>Hi! Do you have anything open this week?</span>
                    <span className="inline-flex items-center gap-2 self-end rounded-2xl rounded-br-sm px-5 py-3 text-[15px] font-semibold transition-transform group-hover:-translate-y-0.5" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}><MessageCircle size={17} aria-hidden />Text me at {c.phone}</span>
                </a>
            ) : <EditorNote>Add your phone number in Properties.</EditorNote>}
        </div>
    )
}

const FloatingCard = ({ content: c }: LayoutProps<ContactContent>) => (
    <div className="relative">
        <Media media={c.media} label="a wide photo" className="aspect-[4/5] w-full @3xl:aspect-[21/9]" rounded={false} kenburns />
        <Item card className="relative mx-4 -mt-28 p-7 @3xl:absolute @3xl:right-12 @3xl:top-1/2 @3xl:m-0 @3xl:w-[400px] @3xl:-translate-y-1/2">
            <div className="flex flex-col gap-6"><Head c={c} /><WaysList c={c} /></div>
        </Item>
    </div>
)

const Banner = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col items-center justify-between gap-6 px-5 py-12 text-center @3xl:flex-row @3xl:px-12 @3xl:text-left @5xl:px-20"
            style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', ['--s-fg' as string]: 'var(--s-accent-fg)' }}>
            <Txt role="heading" as="h2" defaults={{ font: 'heading', size: 32, weight: 600 }}>{c.heading}</Txt>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">{t.ways.filter(w => w.id !== 'sms').map(w => <a key={w.id} href={w.href} {...linkProps(w)} className="inline-flex items-center gap-2 text-[16px] font-semibold"><w.icon size={17} aria-hidden />{w.display}</a>)}</div>
        </div>
    )
}

const SocialsGrid = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="flex flex-col gap-10">
            <Head c={c} center />
            {t.socials.length ? (
                <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                    {t.socials.map(w => (
                        <Item key={w.id} className="p-0">
                            <a href={w.href} {...linkProps(w)} className="flex aspect-square flex-col items-center justify-center gap-3 transition-colors hover:bg-[color:var(--s-surface)]" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                                <w.icon size={32} style={{ color: 'var(--s-accent)' }} aria-hidden /><span className="text-[15px] font-semibold">{w.display}</span>
                            </a>
                        </Item>
                    ))}
                </div>
            ) : <EditorNote>Add your Instagram, TikTok or Facebook in Properties.</EditorNote>}
        </div>
    )
}

const HoursContact = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-2 @3xl:gap-16">
            <div className="flex flex-col gap-8"><Head c={c} /><WaysList c={c} /></div>
            <div className="flex flex-col gap-3">
                <Txt role="label" as="h3" defaults={{ size: 12, weight: 700, case: 'upper', tracking: 0.14 }} className="!text-[color:var(--s-muted)]">Hours</Txt>
                {t.info.hours.length ? (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15.5px]">{t.info.hours.map(h => <div key={h.days} className="contents"><dt className="font-semibold">{h.days}</dt><dd style={{ color: 'var(--s-muted)' }}>{h.hours}</dd></div>)}</dl>
                ) : <EditorNote>Your hours show here.</EditorNote>}
            </div>
        </div>
    )
}

const MapContact = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="grid gap-10 @3xl:grid-cols-[1.2fr_1fr] @3xl:items-center">
            <MapEmbed place={t.info.travels ? null : t.info.place} className="h-72 @3xl:h-96" />
            <div className="flex flex-col gap-8">
                <Head c={c} /><WaysList c={c} />
                {t.info.place && !t.info.travels && <div><Btn href={directionsHref(t.info.place)} variant="secondary"><MapPin size={15} aria-hidden />Directions</Btn></div>}
            </div>
        </div>
    )
}

const FaqContact = ({ content: c }: LayoutProps<ContactContent>) => {
    const faq = c.faq.length ? c.faq : [{ q: 'How do I book?', a: 'Pick a service and a time on the booking page. You’ll get a confirmation by email.' }]
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <div className="flex flex-col gap-3">
                {faq.map((x, i) => (
                    <Item key={i}>
                        <details className="group" style={{ border: '1px solid var(--s-border)', borderRadius: 'var(--s-radius)' }}>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold">{x.q}<ChevronDown size={17} className="flex-none transition-transform group-open:rotate-180" aria-hidden /></summary>
                            <p className="px-5 pb-5 text-[15px]" style={{ color: 'var(--s-muted)' }}>{x.a}</p>
                        </details>
                    </Item>
                ))}
            </div>
            <div className="flex flex-col gap-6"><Header eyebrow={c.eyebrow} heading={c.heading === DEFAULT.heading ? 'Still have a question?' : c.heading} intro={c.intro} /><WaysList c={c} /></div>
        </div>
    )
}

const BorderedList = ({ content: c }: LayoutProps<ContactContent>) => {
    const t = useWays(c)
    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <Head c={c} />
            {t.ways.length ? (
                <ul className="flex flex-col">
                    {t.ways.map(w => (
                        <Item as="li" key={w.id} className="border-t last:border-b" style={{ borderColor: 'var(--s-border)' }}>
                            <a href={w.href} {...linkProps(w)} className="flex items-center justify-between gap-4 py-5">
                                <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: 'var(--s-muted)' }}>{w.label}</span>
                                <span className="truncate text-[17px] font-semibold">{w.display} <span aria-hidden style={{ color: 'var(--s-accent)' }}>→</span></span>
                            </a>
                        </Item>
                    ))}
                </ul>
            ) : <WaysList c={c} />}
        </div>
    )
}

const LAYOUTS: React.ComponentType<LayoutProps<ContactContent>>[] = [
    IconList, Cards, BigLinks, SocialButtons, TwoColumns, Minimal, BigPhone, PhotoContact,
    MessageFormLayout, FormDetails, QR, BusinessCard, TextMe, FloatingCard, Banner, SocialsGrid,
    HoursContact, MapContact, FaqContact, BorderedList,
]

export const ContactSection: SectionDefinition<ContactContent> = {
    type: 'Contact',
    label: 'Contact',
    description: 'How clients reach you: phone, text, email, socials or a message form.',
    icon: MessagesSquare,
    wireframeId: 'contact',
    textRoles: [
        { id: 'eyebrow', label: 'Small label' },
        { id: 'heading', label: 'Heading' },
        { id: 'intro', label: 'Intro text' },
        { id: 'label', label: 'Labels' },
        { id: 'value', label: 'Details' },
        { id: 'big', label: 'Big text' },
        { id: 'button', label: 'Buttons' },
    ],
    fields: [
        { kind: 'text', key: 'eyebrow', label: 'Small label', placeholder: 'Contact', max: 40 },
        { kind: 'text', key: 'heading', label: 'Heading', placeholder: 'Get in touch', max: 100 },
        { kind: 'textarea', key: 'intro', label: 'Intro (optional)', rows: 2, max: 300 },
        { kind: 'text', key: 'phone', label: 'Phone', placeholder: '(555) 123-4567', max: 30 },
        { kind: 'toggle', key: 'texts', label: 'Clients can text this number' },
        { kind: 'text', key: 'email', label: 'Email', max: 120 },
        { kind: 'text', key: 'instagram', label: 'Instagram', placeholder: '@yourhandle', max: 200 },
        { kind: 'text', key: 'tiktok', label: 'TikTok', placeholder: '@yourhandle', max: 200 },
        { kind: 'text', key: 'facebook', label: 'Facebook', placeholder: 'facebook.com/yourpage', max: 200 },
        { kind: 'media', key: 'media', label: 'Photo or video (photo layouts)', accept: 'media' },
        { kind: 'list', key: 'faq', label: 'Questions (FAQ + contact)', itemLabel: 'Question', max: 5, empty: { q: '', a: '' },
            fields: [{ kind: 'text', key: 'q', label: 'Question', max: 120 }, { kind: 'textarea', key: 'a', label: 'Answer', rows: 3, max: 600 }] },
    ],
    defaultContent: DEFAULT,
    layouts: LAYOUTS,
    fullBleed: l => l === 14 || l === 15,
}
