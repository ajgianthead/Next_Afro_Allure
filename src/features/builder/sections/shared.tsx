'use client'

// Pieces several sections share: the eyebrow/heading/intro header, the
// editor-only empty state, the map, sideways scrollers and today's hours.

import { useId, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { HoursLine } from '@/features/siteBuilder/siteData'
import { useTurnstile } from '@/lib/abuse/useTurnstile'
import { joinWaitlist } from '@/features/waitlist/server/actions'
import { useBuilder } from '../render/context'
import { cx, Txt } from '../render/primitives'

export function Header({ eyebrow, heading, intro, center, className, size = 40 }: {
    eyebrow?: string
    heading?: string
    intro?: string
    center?: boolean
    className?: string
    size?: number
}) {
    if (!eyebrow && !heading && !intro) return null
    return (
        <div className={cx('flex flex-col gap-3', center && 'items-center text-center', className)}>
            {eyebrow && <Txt role="eyebrow" defaults={{ size: 13, weight: 600, case: 'upper', tracking: 0.16 }} className="!text-[color:var(--s-accent)]">{eyebrow}</Txt>}
            {heading && <Txt role="heading" as="h2" defaults={{ font: 'heading', size, weight: 600, leading: 1.1 }}>{heading}</Txt>}
            {intro && <Txt role="intro" defaults={{ size: 17, leading: 1.6 }} className={cx('max-w-2xl whitespace-pre-line !text-[color:var(--s-muted)]', center && 'mx-auto')}>{intro}</Txt>}
        </div>
    )
}

/** Shown only in the editor, where a section has nothing to show yet. */
export function EditorNote({ children, className }: { children: React.ReactNode; className?: string }) {
    const { editing } = useBuilder()
    if (!editing) return null
    return <p className={cx('rounded-lg p-6 text-center text-sm', className)} style={{ border: '1.5px dashed var(--s-border)', color: 'var(--s-muted)' }}>{children}</p>
}

/** A Google map of a place (city level: the exact address is only sent with the booking). */
export function MapEmbed({ place, className, rounded = true, decorative }: { place: string | null; className?: string; rounded?: boolean
    /** A background: not focusable or clickable, hidden from screen readers. */
    decorative?: boolean }) {
    const { editing } = useBuilder()
    if (!place) {
        return editing
            ? <div className={cx('flex items-center justify-center p-4 text-center text-sm', className)} style={{ border: '1.5px dashed var(--s-border)', color: 'var(--s-muted)', borderRadius: rounded ? 'var(--s-radius)' : 0 }}>Add your address in Settings to show a map</div>
            : null
    }
    return (
        <iframe title={`Map of ${place}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            className={cx('w-full border-0', (editing || decorative) && 'pointer-events-none', className)} style={{ borderRadius: rounded ? 'var(--s-radius)' : 0 }}
            tabIndex={decorative ? -1 : undefined} aria-hidden={decorative || undefined}
            src={`https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`} />
    )
}

export const directionsHref = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`

/** A row that scrolls sideways on small screens. */
export function Scroller({ children, label, className }: { children: React.ReactNode; label: string; className?: string }) {
    return (
        <div className={cx('-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin] @3xl:-mx-0 @3xl:px-0', className)} tabIndex={0} aria-label={label}>
            {children}
        </div>
    )
}

const ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The hours line that covers a weekday ("Tue – Wed", "Sat"). */
export function lineForDay(hours: HoursLine[], dayIndex: number): HoursLine | null {
    const day = ORDER[dayIndex]
    return hours.find(h => {
        const parts = h.days.split(/\s*[–-]\s*/)
        if (parts.length === 1) return parts[0].startsWith(day)
        const a = ORDER.findIndex(d => parts[0].startsWith(d)), b = ORDER.findIndex(d => parts[1].startsWith(d))
        if (a < 0 || b < 0) return false
        return a <= b ? dayIndex >= a && dayIndex <= b : dayIndex >= a || dayIndex <= b
    }) ?? null
}

export const isClosed = (line: HoursLine | null) => !line || /closed/i.test(line.hours)

/** Today's hours: { open, hours: "9 AM – 6 PM" }, in the visitor's day (the business is usually local). */
export function useToday(): { open: boolean; hours: string; label: string } | null {
    const { info } = useBuilder()
    if (!info.hours.length) return null
    const line = lineForDay(info.hours, new Date().getDay())
    if (isClosed(line)) return { open: false, hours: '', label: 'Closed today' }
    return { open: true, hours: line!.hours, label: `Open today ${line!.hours}` }
}

/** "9am–12pm, 1pm–6pm" → [[9, 12], [13, 18]] in hours (also "9 AM – 6 PM"). */
export function parseRanges(hours: string): [number, number][] {
    const out: [number, number][] = []
    const re = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi
    const t = (h: string, min: string | undefined, ap: string) => ((Number(h) % 12) + (ap.toLowerCase() === 'pm' ? 12 : 0)) + Number(min ?? 0) / 60
    for (const m of hours.matchAll(re)) out.push([t(m[1], m[2], m[3]), t(m[4], m[5], m[6])])
    return out
}

/** One line per weekday, Monday first ("Mon" → "9 AM – 6 PM" / "Closed"). */
export function weekRows(hours: HoursLine[]): { day: string; hours: string; closed: boolean; today: boolean }[] {
    const today = new Date().getDay()
    return [1, 2, 3, 4, 5, 6, 0].map(i => {
        const line = lineForDay(hours, i)
        return { day: ORDER[i], hours: isClosed(line) ? 'Closed' : line!.hours, closed: isClosed(line), today: i === today }
    })
}

/** "Tell me when a time opens up": joins the business's waitlist for the next 60 days. */
export function OpeningsSignup({ heading, className }: { heading: string; className?: string }) {
    const { businessId, editing } = useBuilder()
    const uid = useId()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [state, setState] = useState<{ kind: 'idle' | 'saving' | 'done' } | { kind: 'error'; message: string }>({ kind: 'idle' })
    const { turnstile, getToken } = useTurnstile('waitlist')
    async function submit(e: React.FormEvent) {
        e.preventDefault()
        if (editing || !businessId) return
        setState({ kind: 'saving' })
        const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const from = new Date(), to = new Date(Date.now() + 60 * 86_400_000)
        const r = await joinWaitlist({ businessId, firstName: name, lastName: '', email, phone: '', fromDate: day(from), toDate: day(to), timeOfDay: 'any' }, await getToken())
        setState(r.ok ? { kind: 'done' } : { kind: 'error', message: r.error })
    }
    if (state.kind === 'done') {
        return <p className={cx('flex items-center gap-2 text-[15px]', className)} role="status"><Check size={18} style={{ color: 'var(--s-accent)' }} />You’re on the list. We’ll email you when a time opens up.</p>
    }
    return (
        <form onSubmit={submit} className={cx('flex flex-col gap-3', className)}>
            <Txt role="signupHeading" as="h3" enter={false} defaults={{ font: 'heading', size: 24, weight: 600 }}>{heading}</Txt>
            <div className="flex flex-col gap-2 @2xl:flex-row">
                <label className="sr-only" htmlFor={`${uid}-name`}>First name</label>
                <input id={`${uid}-name`} required value={name} onChange={e => setName(e.target.value)} placeholder="First name" autoComplete="given-name"
                    className="min-h-11 min-w-0 flex-1 px-3.5 text-[15px] outline-none focus:border-[color:var(--s-accent)]" style={{ border: '1px solid var(--s-border)', background: 'var(--s-bg)', color: 'var(--s-fg)', borderRadius: 'var(--s-button-radius)' }} />
                <label className="sr-only" htmlFor={`${uid}-email`}>Email</label>
                <input id={`${uid}-email`} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="email"
                    className="min-h-11 min-w-0 flex-[1.4] px-3.5 text-[15px] outline-none focus:border-[color:var(--s-accent)]" style={{ border: '1px solid var(--s-border)', background: 'var(--s-bg)', color: 'var(--s-fg)', borderRadius: 'var(--s-button-radius)' }} />
                <button type="submit" disabled={state.kind === 'saving'} className="inline-flex min-h-11 items-center justify-center gap-2 px-5 text-[14px] font-semibold disabled:opacity-60"
                    style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)', borderRadius: 'var(--s-button-radius)' }}>
                    {state.kind === 'saving' && <Loader2 size={15} className="animate-spin" />}Notify me
                </button>
            </div>
            {turnstile}
            {state.kind === 'error' && <p role="alert" className="text-[13.5px]" style={{ color: '#d14343' }}>{state.message}</p>}
            <p className="text-[12.5px]" style={{ color: 'var(--s-muted)' }}>We’ll only email you about open times in the next 60 days.</p>
        </form>
    )
}

