'use client'

// Animated demos of real AfroAllure screens and messages, drawn in code so the
// pages have motion and product shots before any recordings exist. Each one
// shows what the product actually does; the wording of the texts comes from
// the real SMS templates.

import { useEffect, useState } from 'react'
import './widgets.css'
import { smsTemplates } from '@/lib/sms/templates'
import type { SampleMenu, Widget } from '../content'
import { BrowserFrame, Card, money, PhoneFrame, useCycle } from './frames'
import { DashboardDemo } from './Dashboard'

const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const WARM = '#FAF7F2'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const WHEN = 'Sat, Oct 10 at 2:00 PM'

// ─── Size × length picker ─────────────────────────────────────────────────────

function splitCell(cell: string): { price: string; time: string } {
    const [price, time] = cell.split(' · ')
    return { price: price ?? cell, time: time ?? '' }
}

/** Steps through a sample menu's options the way a client taps through them. */
export function PricePicker({ menu }: { menu: SampleMenu }) {
    // Grid menus have size rows × length columns; list menus have Price/Time columns.
    const isList = menu.columns[0] === 'Price'
    const combos = isList
        ? menu.rows.map((r, i) => ({ row: i, col: 0, price: r.cells[0], time: r.cells[1] ?? '' }))
        : menu.rows.flatMap((r, i) => r.cells.map((c, j) => ({ row: i, col: j, ...splitCell(c) })))
    const order = [0, Math.min(4, combos.length - 1), combos.length - 1, Math.min(2, combos.length - 1)]
    const step = useCycle(order.length, 1800, 1)
    const pick = combos[order[step]] ?? combos[0]

    const chip = (label: string, on: boolean) => (
        <span key={label} className="aa-w-cell" style={{
            fontSize: 12, padding: '7px 12px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--acc)' : LINE}`,
            background: on ? 'var(--acc)' : '#fff', color: on ? '#fff' : INK, fontWeight: 600, whiteSpace: 'nowrap',
        }}>{label}</span>
    )

    return (
        <PhoneFrame>
            <div className="aa-w" style={{ padding: '44px 18px 18px', display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
                <div>
                    <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>Choose your style</div>
                    <div style={{ fontFamily: SERIF, fontSize: 22, marginTop: 4 }}>{menu.service}</div>
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{isList ? 'Option' : 'Size'}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{menu.rows.map((r, i) => chip(r.label.replace(/ \(.*\)$/, ''), i === pick.row))}</div>
                </div>
                {!isList && (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Length</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{menu.columns.map((c, j) => chip(c, j === pick.col))}</div>
                    </div>
                )}
                {menu.extras && menu.extras.length > 0 && (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Add-ons</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{menu.extras.slice(0, 2).map((x, i) => chip(x, step === 2 && i === 0))}</div>
                    </div>
                )}
                <div style={{ marginTop: 'auto', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span key={pick.price} className="aa-w-in" style={{ fontFamily: SERIF, fontSize: 30 }}>{pick.price}</span>
                        <span style={{ fontSize: 12, color: MUTED }}>{pick.time}</span>
                    </div>
                    <div className="aa-w-pulse" style={{ marginTop: 10, textAlign: 'center', background: 'var(--acc)', color: '#fff', borderRadius: 999, padding: '10px 0', fontSize: 13, fontWeight: 600 }}>
                        Book this style
                    </div>
                </div>
            </div>
        </PhoneFrame>
    )
}

// ─── Instagram-style DM thread ────────────────────────────────────────────────

export function DmThread({ messages }: { messages: { from: 'client' | 'you'; text: string }[] }) {
    const step = useCycle(messages.length + 2, 1300, messages.length + 1)
    const shown = Math.min(step, messages.length)
    return (
        <PhoneFrame dark>
            <div className="aa-w" style={{ padding: '44px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8, height: '100%', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid #2A2727' }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C9974A,#FC6161)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>New message request</span>
                </div>
                {messages.slice(0, shown).map((m, i) => (
                    <div key={`${i}-${m.text}`} className="aa-w-in" style={{
                        alignSelf: m.from === 'you' ? 'flex-end' : 'flex-start', maxWidth: '82%', fontSize: 13, lineHeight: 1.4,
                        padding: '9px 12px', borderRadius: 18,
                        background: m.from === 'you' ? 'var(--acc)' : '#2A2727',
                    }}>{m.text}</div>
                ))}
                {shown < messages.length && (
                    <div className="aa-w-typing" style={{ alignSelf: messages[shown].from === 'you' ? 'flex-end' : 'flex-start', padding: '10px 12px', borderRadius: 18, background: '#2A2727' }}>
                        <span /><span /><span />
                    </div>
                )}
            </div>
        </PhoneFrame>
    )
}

// ─── Texts arriving on a lock screen ─────────────────────────────────────────

export function TextStack({ business, service }: { business: string; service: string }) {
    const texts = [
        { label: 'Booked', body: smsTemplates.clientConfirmation({ business, service, when: WHEN }) },
        { label: 'Tomorrow', body: smsTemplates.clientReminder({ business, service, when: WHEN, kind: 'day' }) },
        { label: 'In 1 hour', body: smsTemplates.clientReminder({ business, service, when: WHEN, kind: 'hour' }) },
        { label: 'After', body: smsTemplates.clientPaymentLink({ business, service, url: 'afroallure.co/p/4561ec13' }) },
    ]
    const step = useCycle(texts.length + 2, 1600, texts.length)
    const shown = Math.min(step, texts.length)
    return (
        <PhoneFrame dark>
            <div className="aa-w" style={{ padding: '56px 12px 12px', height: '100%', background: 'radial-gradient(ellipse at 30% 0%, color-mix(in srgb, var(--acc) 45%, #141212), #141212 70%)' }}>
                <div style={{ textAlign: 'center', color: '#fff', marginBottom: 18 }}>
                    <div style={{ fontSize: 46, fontWeight: 300, letterSpacing: '-.02em' }}>9:41</div>
                    <div style={{ fontSize: 12, opacity: .7 }}>Friday, October 9</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
                    {texts.slice(0, shown).map(t => (
                        <div key={t.label} className="aa-w-in" style={{ background: 'rgba(250,247,242,.92)', borderRadius: 16, padding: '10px 12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: MUTED, marginBottom: 3 }}>
                                <strong style={{ color: INK }}>Messages</strong><span>{t.label}</span>
                            </div>
                            <div style={{ fontSize: 12, lineHeight: 1.35 }}>{t.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </PhoneFrame>
    )
}

// ─── Deposit checkout ─────────────────────────────────────────────────────────

export function Checkout({ service, totalCents, depositCents, noShowFeeCents }: { service: string; totalCents: number; depositCents: number; noShowFeeCents?: number }) {
    const step = useCycle(4, 1500, 3)
    const ticked = step >= 1
    const paid = step >= 3
    return (
        <Card style={{ width: '100%', maxWidth: 380, margin: '0 auto', padding: 22 }}>
            <div className="aa-w">
                <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>Confirm & pay deposit</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, margin: '6px 0 14px' }}>{service}</div>
                {[
                    ['Total', money(totalCents)],
                    ['Deposit due today', money(depositCents)],
                    ['Balance at the appointment', money(totalCents - depositCents)],
                ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', borderBottom: `1px solid ${LINE}` }}>
                        <span style={{ color: MUTED }}>{k}</span><strong>{v}</strong>
                    </div>
                ))}
                {noShowFeeCents ? (
                    <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: '12px 0 0' }}>
                        Your card is saved. A {money(noShowFeeCents)} no-show fee may be charged if you miss this appointment.
                    </p>
                ) : null}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '14px 0', fontSize: 12, lineHeight: 1.45 }}>
                    <span className="aa-w-cell" style={{
                        flexShrink: 0, width: 18, height: 18, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: ticked ? 'none' : `1.5px solid ${INK}`, background: ticked ? 'var(--acc)' : 'transparent', color: '#fff', fontSize: 12,
                    }}>{ticked ? '✓' : ''}</span>
                    I&apos;ve read the prep instructions and agree to the cancellation and no-show policy.
                </div>
                <div className={paid ? '' : step === 2 ? 'aa-w-pulse' : ''} style={{
                    textAlign: 'center', borderRadius: 999, padding: '12px 0', fontSize: 14, fontWeight: 600, color: '#fff',
                    background: paid ? '#1F8A5B' : 'var(--acc)', opacity: ticked ? 1 : .45, transition: 'background .3s, opacity .3s',
                }}>
                    {paid ? 'Booked ✓' : `Pay ${money(depositCents)} deposit`}
                </div>
            </div>
        </Card>
    )
}

// ─── A booking site in a browser ─────────────────────────────────────────────

export function BookingSite({ business, slug, services }: { business: string; slug: string; services: { name: string; price: string; time: string }[] }) {
    const step = useCycle(services.length, 1700, 0)
    return (
        <BrowserFrame url={`${slug}.afroallure.co`}>
            <div className="aa-w" style={{ background: WARM }}>
                <div style={{ padding: '26px 22px 18px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--acc) 85%, #0F0E0E), #0F0E0E)', color: '#fff' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.18)', marginBottom: 10 }} />
                    <div style={{ fontFamily: SERIF, fontSize: 24 }}>{business}</div>
                    <div style={{ fontSize: 12, opacity: .75, marginTop: 2 }}>Book online · Deposit secures your spot</div>
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {services.map((s, i) => (
                        <div key={s.name} className="aa-w-cell" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#fff', borderRadius: 12, padding: '11px 14px',
                            border: `1.5px solid ${i === step ? 'var(--acc)' : LINE}`, transform: i === step ? 'scale(1.01)' : 'none',
                        }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: MUTED }}>{s.time}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.price}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, background: i === step ? 'var(--acc)' : WARM, color: i === step ? '#fff' : INK }}>Book</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </BrowserFrame>
    )
}

// ─── A week filling up, a cancellation refilled from the waitlist ───────────

export function Calendar() {
    const step = useCycle(5, 1400, 4)
    const days = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const blocks: { day: number; top: number; h: number; label: string; at: number }[] = [
        { day: 0, top: 8, h: 34, label: 'Knotless', at: 0 },
        { day: 1, top: 30, h: 30, label: 'Retwist', at: 0 },
        { day: 2, top: 8, h: 22, label: 'Silk press', at: 1 },
        { day: 3, top: 20, h: 40, label: 'Sew-in', at: 1 },
        { day: 4, top: 8, h: 50, label: 'Boho braids', at: 0 },
    ]
    const cancelled = step === 2
    const refilled = step >= 3
    return (
        <Card style={{ width: '100%', maxWidth: 460, margin: '0 auto', padding: 18 }}>
            <div className="aa-w">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 20 }}>This week</div>
                    <span style={{ fontSize: 11, color: MUTED }}>Waitlist: 3 waiting</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                    {days.map((d, i) => (
                        <div key={d}>
                            <div style={{ fontSize: 11, color: MUTED, textAlign: 'center', marginBottom: 6 }}>{d}</div>
                            <div style={{ position: 'relative', height: 200, background: WARM, borderRadius: 10 }}>
                                {blocks.filter(b => b.day === i && step >= b.at).map(b => {
                                    const isThu = i === 3
                                    const label = isThu && cancelled ? 'Cancelled' : isThu && refilled ? 'From waitlist' : b.label
                                    const bg = isThu && cancelled ? '#fff' : isThu && refilled ? '#1F8A5B' : 'var(--acc)'
                                    return (
                                        <div key={b.label} className="aa-w-in aa-w-cell" style={{
                                            position: 'absolute', left: 4, right: 4, top: `${b.top}%`, height: `${b.h}%`, borderRadius: 8,
                                            background: bg, color: isThu && cancelled ? '#C2410C' : '#fff',
                                            border: isThu && cancelled ? '1.5px dashed #C2410C' : 'none',
                                            fontSize: 10, fontWeight: 600, padding: 6, lineHeight: 1.2,
                                        }}>{label}</div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 12, minHeight: 18 }}>
                    {cancelled ? 'Friday 10am opened up. Emailing your waitlist…' : refilled ? 'Booked by someone on your waitlist.' : 'Clients book your open times.'}
                </div>
            </div>
        </Card>
    )
}

// ─── Where the money goes ───────────────────────────────────────────────────

function useCountUp(target: number, run: boolean): number {
    const [v, setV] = useState(target)
    useEffect(() => {
        if (!run || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setV(target); return }
        let raf = 0
        const start = performance.now()
        const tick = (t: number) => {
            const p = Math.min(1, (t - start) / 900)
            setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
            if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [target, run])
    return v
}

export function Payout({ amountCents }: { amountCents: number }) {
    const stripe = Math.round(amountCents * 0.029) + 30
    const keep = amountCents - stripe
    const step = useCycle(3, 2200, 2)
    const shown = useCountUp(keep, step === 2)
    return (
        <Card style={{ width: '100%', maxWidth: 400, margin: '0 auto', padding: 24 }}>
            <div className="aa-w">
                <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>One appointment on Growth</div>
                {[
                    ['Client pays', money(amountCents), INK],
                    ['Card processing (Stripe, 2.9% + 30¢)', `-${money(stripe)}`, MUTED],
                    ['AfroAllure fee', '$0', 'var(--acc)'],
                ].map(([k, v, c], i) => (
                    <div key={k} className={step >= Math.min(i, 1) ? 'aa-w-in' : ''} style={{
                        display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '11px 0', borderBottom: `1px solid ${LINE}`,
                        opacity: step >= Math.min(i, 1) ? 1 : 0,
                    }}>
                        <span style={{ color: MUTED }}>{k}</span><strong style={{ color: c }}>{v}</strong>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>You keep</span>
                    <span style={{ fontFamily: SERIF, fontSize: 36 }}>{money(shown)}</span>
                </div>
            </div>
        </Card>
    )
}

// ─── Rebook reminder email ───────────────────────────────────────────────────

export function Rebook({ business, service, weeks }: { business: string; service: string; weeks: number }) {
    const step = useCycle(3, 1700, 2)
    return (
        <div className="aa-w" style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
            <Card style={{ padding: 22 }}>
                {/* Weeks since the last visit, filling up until the reminder goes out. Inside the card so it shows on any background. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                    {Array.from({ length: weeks }, (_, i) => (
                        <span key={i} className="aa-w-cell" style={{ flex: 1, maxWidth: 26, height: 6, borderRadius: 3, background: step >= 1 || i < weeks - 2 ? 'var(--acc)' : LINE }} />
                    ))}
                    <span style={{ fontSize: 11, color: MUTED, marginLeft: 6, whiteSpace: 'nowrap' }}>{weeks} weeks</span>
                </div>
                <div style={{ opacity: step >= 1 ? 1 : .35, transition: 'opacity .4s' }}>
                <div style={{ fontSize: 11, color: MUTED }}>From {business}</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, margin: '6px 0 8px' }}>Time for your next {service.toLowerCase()}?</div>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: '0 0 14px' }}>
                    It&apos;s been about {weeks} weeks since your last visit. Grab a time that works for you.
                </p>
                <div className={step === 2 ? 'aa-w-pulse' : ''} style={{ display: 'inline-block', background: 'var(--acc)', color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 600 }}>
                    Book your next visit
                </div>
                </div>
            </Card>
        </div>
    )
}

// ─── Loyalty punch card ──────────────────────────────────────────────────────

/** Visits stamp in one by one until the reward code is issued, as in the loyalty email. */
export function Loyalty({ business, visits, reward }: { business: string; visits: number; reward: string }) {
    const step = useCycle(visits + 2, 900, visits + 1)
    const filled = Math.min(step, visits)
    const earned = step > visits
    return (
        <Card style={{ width: '100%', maxWidth: 400, margin: '0 auto', padding: 24 }}>
            <div className="aa-w">
                <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>Rewards at {business}</div>
                <div style={{ fontFamily: SERIF, fontSize: 22, margin: '6px 0 16px' }}>
                    {earned ? `You earned ${reward}.` : `${visits - filled} visit${visits - filled === 1 ? '' : 's'} to ${reward}`}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visits}, 1fr)`, gap: 8 }}>
                    {Array.from({ length: visits }, (_, i) => (
                        <span key={i} className="aa-w-cell" style={{
                            aspectRatio: '1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: `1.5px solid ${i < filled ? 'var(--acc)' : LINE}`, background: i < filled ? 'var(--acc)' : WARM,
                            color: '#fff', fontSize: 15, fontWeight: 700,
                        }}>{i < filled ? '✓' : ''}</span>
                    ))}
                </div>
                <div style={{ marginTop: 18, minHeight: 58 }}>
                    {earned ? (
                        <div className="aa-w-in" style={{ background: WARM, border: `1.5px dashed var(--acc)`, borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ fontSize: 11, color: MUTED }}>Use this code on your next visit</div>
                            <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 18, fontWeight: 700, letterSpacing: '.08em', marginTop: 2 }}>AA-7F3KQ2</div>
                        </div>
                    ) : (
                        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: 0 }}>Each completed appointment counts. Progress is emailed after every visit.</p>
                    )}
                </div>
            </div>
        </Card>
    )
}

// ─── Working hours and booking rules ────────────────────────────────────────

const HOURS: [string, string][] = [
    ['Mon', 'Closed'], ['Tue', '9:00 AM – 6:00 PM'], ['Wed', '9:00 AM – 6:00 PM'], ['Thu', '9:00 AM – 1:00 PM, 3:00 – 8:00 PM'],
    ['Fri', '8:00 AM – 6:00 PM'], ['Sat', '7:00 AM – 4:00 PM'], ['Sun', 'Closed'],
]

/** A weekly schedule, then a one-off day off and the booking rules clients book within. */
export function Hours() {
    const step = useCycle(3, 1800, 2)
    return (
        <Card style={{ width: '100%', maxWidth: 420, margin: '0 auto', padding: 22 }}>
            <div className="aa-w">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 20 }}>Working hours</div>
                    <span style={{ fontSize: 11, color: MUTED }}>Your time zone</span>
                </div>
                {HOURS.map(([d, h]) => (
                    <div key={d} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13, padding: '7px 0', borderBottom: `1px solid ${LINE}` }}>
                        <strong style={{ width: 40 }}>{d}</strong>
                        <span style={{ color: h === 'Closed' ? MUTED : INK, textAlign: 'right' }}>{h}</span>
                    </div>
                ))}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 74 }}>
                    {step >= 1 && (
                        <div className="aa-w-in" style={{ fontSize: 12, padding: '8px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--acc) 12%, #fff)', display: 'flex', justifyContent: 'space-between' }}>
                            <span><strong>Fri, Dec 26</strong> · day off</span><span style={{ color: MUTED }}>Date override</span>
                        </div>
                    )}
                    {step >= 2 && (
                        <div className="aa-w-in" style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                            Clients book up to 8 weeks ahead and can reschedule up to 2 days before.
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

export function WidgetView({ widget, menu }: { widget: Widget; menu?: SampleMenu }) {
    switch (widget.kind) {
        case 'price-picker': return menu ? <PricePicker menu={menu} /> : null
        case 'dm-thread': return <DmThread messages={widget.messages} />
        case 'texts': return <TextStack business={widget.business} service={widget.service} />
        case 'checkout': return <Checkout {...widget} />
        case 'booking-site': return <BookingSite {...widget} />
        case 'calendar': return <Calendar />
        case 'payout': return <Payout amountCents={widget.amountCents} />
        case 'rebook': return <Rebook {...widget} />
        case 'loyalty': return <Loyalty {...widget} />
        case 'hours': return <Hours />
        case 'dashboard': return <DashboardDemo view={widget.view} business={widget.business} />
    }
}
