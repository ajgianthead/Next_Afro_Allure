'use client'

// The AfroAllure dashboard, drawn at 1280 × 800 inside the laptop frame:
// the real sidebar sections and the real flows (week calendar and an
// appointment's payment buttons, the size × length service editor, the
// Incomplete → no-show → no-show fee path). A stand-in until screen
// recordings are added through SLOT_MEDIA.

import { Fragment } from 'react'
import './widgets.css'
import { LaptopFrame, useCycle } from './frames'

const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const WARM = '#FAF7F2'
const SERIF = "'Fraunces', 'Times New Roman', serif"

export type DashboardView = 'appointments' | 'services' | 'no-show'

const NAV: { label?: string; items: string[] }[] = [
    { items: ['Dashboard', 'Appointments', 'Clients', 'Rewards', 'Analytics'] },
    { label: 'Booking', items: ['Booking Site', 'Availability', 'Waitlist', 'Booking Settings', 'Share Openings'] },
    { label: 'Business', items: ['Services', 'Monetization'] },
]

function Sidebar({ active, business }: { active: string; business: string }) {
    return (
        <aside style={{ width: 230, flexShrink: 0, borderRight: `1px solid ${LINE}`, background: '#fff', padding: '22px 14px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--acc)' }} />
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{business}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Growth</div>
                </div>
            </div>
            {NAV.map(group => (
                <div key={group.label ?? 'main'}>
                    {group.label && <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600, padding: '0 10px 6px' }}>{group.label}</div>}
                    {group.items.map(item => (
                        <div key={item} style={{
                            fontSize: 13, padding: '8px 10px', borderRadius: 8, fontWeight: item === active ? 600 : 400,
                            background: item === active ? WARM : 'transparent', color: item === active ? INK : MUTED,
                        }}>{item}</div>
                    ))}
                </div>
            ))}
        </aside>
    )
}

function Header({ title }: { title: string }) {
    return (
        <div style={{ height: 56, borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', background: '#fff' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔔</span>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#D9D4CC' }} />
            </div>
        </div>
    )
}

const Button = ({ children, primary = false, pulse = false, done = false }: { children: React.ReactNode; primary?: boolean; pulse?: boolean; done?: boolean }) => (
    <span className={pulse ? 'aa-w-pulse' : ''} style={{
        display: 'inline-flex', alignItems: 'center', padding: '0 16px', height: 36, borderRadius: 999, fontSize: 13, fontWeight: 600,
        background: done ? '#1F8A5B' : primary ? 'var(--acc)' : '#fff', color: done || primary ? '#fff' : INK,
        border: done || primary ? 'none' : `1px solid ${LINE}`, transition: 'background .3s',
    }}>{children}</span>
)

// ─── Appointments: week calendar + an appointment being paid ─────────────────

const WEEK = ['Mon 6', 'Tue 7', 'Wed 8', 'Thu 9', 'Fri 10', 'Sat 11']
const APPTS = [
    { day: 0, top: 6, h: 30, label: 'Medium knotless', who: 'Ashley R.' },
    { day: 1, top: 40, h: 22, label: 'Silk press', who: 'Monique T.' },
    { day: 2, top: 10, h: 18, label: 'Retwist', who: 'Jordan K.' },
    { day: 3, top: 30, h: 40, label: 'Boho knotless', who: 'Tasha W.' },
    { day: 4, top: 8, h: 26, label: 'Sew-in', who: 'Kim D.' },
    { day: 5, top: 20, h: 48, label: 'Small knotless', who: 'Bria L.' },
]

function Appointments({ business }: { business: string }) {
    const step = useCycle(5, 1500, 4)
    const open = step >= 1
    const paid = step >= 3
    const focus = APPTS[3]
    return (
        <>
            <Sidebar active="Appointments" business={business} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: WARM, minWidth: 0 }}>
                <Header title="Appointments" />
                <div style={{ flex: 1, display: 'flex', gap: 18, padding: 22, minHeight: 0 }}>
                    <div style={{ flex: 1, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div style={{ fontFamily: SERIF, fontSize: 22 }}>October 6 – 11</div>
                            <div style={{ display: 'flex', gap: 6 }}>{['Day', 'Week', 'Month'].map(v => <span key={v} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: v === 'Week' ? INK : WARM, color: v === 'Week' ? '#fff' : MUTED }}>{v}</span>)}</div>
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                            {WEEK.map((d, i) => (
                                <div key={d} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 12, color: MUTED, textAlign: 'center', marginBottom: 8 }}>{d}</div>
                                    <div style={{ position: 'relative', flex: 1, background: WARM, borderRadius: 10 }}>
                                        {APPTS.filter(a => a.day === i).map(a => {
                                            const isFocus = a === focus
                                            return (
                                                <div key={a.label} className="aa-w-cell" style={{
                                                    position: 'absolute', left: 5, right: 5, top: `${a.top}%`, height: `${a.h}%`, borderRadius: 8, padding: 8,
                                                    background: isFocus && paid ? '#1F8A5B' : 'var(--acc)', color: '#fff',
                                                    boxShadow: isFocus && open ? '0 0 0 3px rgba(15,14,14,.25)' : 'none',
                                                }}>
                                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</div>
                                                    <div style={{ fontSize: 11, opacity: .85 }}>{a.who}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ width: 330, flexShrink: 0, opacity: open ? 1 : 0, transform: open ? 'none' : 'translateX(20px)', transition: 'opacity .4s, transform .4s' }}>
                        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontFamily: SERIF, fontSize: 21 }}>{focus.label}</div>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: paid ? 'rgba(31,138,91,.12)' : 'rgba(34,197,94,.1)', color: paid ? '#1F8A5B' : '#16a34a' }}>{paid ? 'Completed' : 'Confirmed'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: MUTED, margin: '4px 0 16px' }}>{focus.who} · Thu, Oct 9 · 11:00 AM</div>
                            {[['Total', '$280'], ['Deposit paid', '$70'], ['Balance', paid ? '$0' : '$210']].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: `1px solid ${LINE}` }}>
                                    <span style={{ color: MUTED }}>{k}</span><strong>{v}</strong>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                                {paid ? <Button done>Paid ✓</Button> : <>
                                    <Button primary pulse={step === 2}>Send Payment Link</Button>
                                    <Button>Mark Paid (Cash)</Button>
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── Services: size × length grid being filled in ────────────────────────────

const SIZES = ['Large', 'Medium', 'Small']
const LENGTHS = ['Shoulder', 'Mid-back', 'Waist']
const PRICES = [['$160', '$180', '$210'], ['$200', '$230', '$260'], ['$260', '$300', '$340']]

function Services({ business }: { business: string }) {
    const step = useCycle(11, 450, 10)
    return (
        <>
            <Sidebar active="Services" business={business} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: WARM, minWidth: 0 }}>
                <Header title="Services" />
                <div style={{ flex: 1, display: 'flex', gap: 18, padding: 22, minHeight: 0 }}>
                    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[['Knotless braids', 'from $160'], ['Boho knotless', 'from $200'], ['Feed-in cornrows', 'from $90'], ['Take-down', '$45']].map(([n, p], i) => (
                            <div key={n} style={{ background: '#fff', border: `1.5px solid ${i === 0 ? 'var(--acc)' : LINE}`, borderRadius: 14, padding: 14 }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{n}</div>
                                <div style={{ fontSize: 12, color: MUTED }}>{p}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ flex: 1, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 22 }}>
                        <div style={{ fontFamily: SERIF, fontSize: 24 }}>Knotless braids</div>
                        <div style={{ fontSize: 13, color: MUTED, margin: '4px 0 18px' }}>Size × length pricing · Each combination has its own price and time</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(3, 1fr)', gap: 8, alignItems: 'center' }}>
                            <span />
                            {LENGTHS.map(l => <span key={l} style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>{l}</span>)}
                            {SIZES.map((s, i) => (
                                <Fragment key={s}>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{s}</span>
                                    {LENGTHS.map((l, j) => {
                                        const filled = step > i * 3 + j
                                        return (
                                            <span key={s + l} className="aa-w-cell" style={{
                                                height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15,
                                                border: `1.5px solid ${step === i * 3 + j + 1 ? 'var(--acc)' : LINE}`, color: filled ? INK : '#C9C0B3',
                                            }}>{filled ? PRICES[i][j] : '$'}</span>
                                        )
                                    })}
                                </Fragment>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 22, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>Hair</span>
                            {['None', 'Included', 'Optional +$30', 'Client brings'].map((h, i) => (
                                <span key={h} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 999, border: `1.5px solid ${i === 2 ? 'var(--acc)' : LINE}`, background: i === 2 ? 'var(--acc)' : '#fff', color: i === 2 ? '#fff' : INK }}>{h}</span>
                            ))}
                        </div>
                        <div style={{ marginTop: 22, padding: 14, background: WARM, borderRadius: 12, fontSize: 13, color: MUTED }}>
                            <strong style={{ color: INK }}>Prep:</strong> Come with hair washed, blow-dried and detangled. No oils.
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ─── No-show: Incomplete → mark no-show → charge the agreed fee ─────────────

function NoShow({ business }: { business: string }) {
    const step = useCycle(5, 1600, 4)
    const noShow = step >= 2
    const charged = step >= 4
    return (
        <>
            <Sidebar active="Appointments" business={business} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: WARM, minWidth: 0 }}>
                <Header title="Appointments" />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 40 }}>
                    <div style={{ width: 520, background: '#fff', border: `1px solid ${LINE}`, borderRadius: 18, padding: 26, boxShadow: '0 20px 50px rgba(15,14,14,.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontFamily: SERIF, fontSize: 24 }}>Small knotless · Waist</div>
                            <span className="aa-w-cell" style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: noShow ? '#E8E2D6' : 'rgba(201,151,74,.12)', color: noShow ? '#6F6863' : '#C9974A' }}>
                                {noShow ? 'No Show' : 'Incomplete'}
                            </span>
                        </div>
                        <div style={{ fontSize: 13, color: MUTED, margin: '6px 0 18px' }}>Bria L. · Sat, Oct 11 · 9:00 AM</div>
                        {[['Total', '$340'], ['Deposit paid', '$85'], ['Card on file', 'Visa •••• 4242']].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '9px 0', borderTop: `1px solid ${LINE}` }}>
                                <span style={{ color: MUTED }}>{k}</span><strong>{v}</strong>
                            </div>
                        ))}
                        {!noShow ? (
                            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                                <Button>They came — Mark Paid (Cash)</Button>
                                <Button primary pulse={step === 1}>They didn&apos;t come — Mark No-show</Button>
                            </div>
                        ) : (
                            <div className="aa-w-in" style={{ marginTop: 18, padding: 16, borderRadius: 14, background: WARM }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>No-show fee</div>
                                <div style={{ fontSize: 13, color: MUTED, margin: '4px 0 12px' }}>Agreed at booking: $85, charged to the saved card.</div>
                                {charged ? <Button done>Charged $85 ✓</Button> : <Button primary pulse={step === 3}>Charge $85 no-show fee</Button>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export function DashboardDemo({ view, business }: { view: DashboardView; business: string }) {
    return (
        <LaptopFrame canvas>
            {/* textAlign: centered page sections must not center the app's own text. */}
            <div className="aa-w" style={{ width: 1280, height: 800, display: 'flex', background: WARM, textAlign: 'left' }}>
                {view === 'services' ? <Services business={business} /> : view === 'no-show' ? <NoShow business={business} /> : <Appointments business={business} />}
            </div>
        </LaptopFrame>
    )
}
