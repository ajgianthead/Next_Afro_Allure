// AfroAllure — Switching from <platform>
// Same visual language as /for-businesses. Copy and competitor facts live in
// ./platforms.tsx; pricing math in src/features/billing.
'use client'
import '../for-businesses/forBusinesses.css'
import './switch.css'
import { useState } from 'react'
import Image from 'next/image'
import LOGO from '../../../public/images/logo_transparent_background.png'
import {
    AFROALLURE_GROWTH_MONTHLY, AFROALLURE_GROWTH_YEARLY, CHECKED_ON, monthlyCost, SOURCES,
} from '@/features/billing/competitors'
import { TRIAL_DAYS, YEARLY_SAVINGS_PERCENT } from '@/features/billing/plans'
import { PLATFORMS, SHARED_FAQ, type PlatformSlug, type SwitchPlatform } from './platforms'

const RED = '#FC6161'
const DARK = '#0F0E0E'
const WARM = '#FAF7F2'
const GOLD = '#C9974A'
const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'

const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS = "'Inter', system-ui, sans-serif"
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace"

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`

const Eyebrow = ({ children, color = RED }: { children: React.ReactNode; color?: string }) => (
    <div style={{
        fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
        color, marginBottom: 18, fontWeight: 600,
    }}>{children}</div>
)

const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{
        fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.05,
        letterSpacing: '-.025em', margin: '0 0 16px', color: INK,
    }}>{children}</h2>
)

const PrimaryCta = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} style={{
        fontFamily: SANS, fontWeight: 600, fontSize: 15, background: RED, color: '#fff',
        padding: '15px 26px', borderRadius: 999, textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>{children} →</a>
)

// ─────────────────────────────────────────────────────────────
function Nav({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <nav className="aa-nav" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 56px', borderBottom: `1px solid ${LINE}`, background: WARM,
        }}>
            <a href="/for-businesses" aria-label="AfroAllure for businesses">
                <Image src={LOGO} alt="AfroAllure" width={130} />
            </a>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: SANS, fontSize: 14 }}>
                {isLoggedIn ? (
                    <a href="/dashboard" style={{ color: INK, fontWeight: 600, textDecoration: 'none' }}>Dashboard</a>
                ) : (
                    <>
                        <a href="/login" style={{ color: INK, textDecoration: 'none' }}>Log in</a>
                        <a href="/register" style={{
                            background: DARK, color: '#fff', padding: '9px 18px', borderRadius: 999,
                            textDecoration: 'none', fontWeight: 600,
                        }}>Start free</a>
                    </>
                )}
            </div>
        </nav>
    )
}

function Hero({ p, isLoggedIn }: { p: SwitchPlatform; isLoggedIn: boolean }) {
    return (
        <section className="aa-section" style={{
            background: DARK, color: WARM, padding: '110px 56px 100px', position: 'relative', overflow: 'hidden',
        }}>
            <div aria-hidden style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 60% 80% at 85% 20%, rgba(252,97,97,.2), transparent 60%),
                             radial-gradient(ellipse 70% 60% at 5% 100%, rgba(201,151,74,.16), transparent 55%)`,
            }} />
            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
                <Eyebrow color={GOLD}>Switching from {p.name}</Eyebrow>
                <h1 className="aa-switch-h1" style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(44px, 6.4vw, 84px)',
                    lineHeight: .98, letterSpacing: '-.03em', margin: '0 0 26px',
                }}>
                    {p.heroTitle}
                </h1>
                <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: 'rgba(250,247,242,.75)', maxWidth: 640, margin: '0 0 36px' }}>
                    {p.heroBody}
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <PrimaryCta href={isLoggedIn ? '/dashboard/clients' : '/register'}>
                        {isLoggedIn ? 'Import your clients' : `Start free for ${TRIAL_DAYS} days`}
                    </PrimaryCta>
                    <a href="#how" style={{ fontFamily: SANS, fontSize: 15, color: WARM, fontWeight: 500 }}>How switching works</a>
                </div>
                {!isLoggedIn && (
                    <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(250,247,242,.55)', margin: '18px 0 0' }}>
                        No credit card · No percentage fee on Growth · Bring your client list
                    </p>
                )}
            </div>
        </section>
    )
}

function Gains({ p }: { p: SwitchPlatform }) {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>Why pros switch</Eyebrow>
                <H2>{p.gainsTitle}</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, lineHeight: 1.55, margin: '0 0 48px' }}>
                    {p.gainsIntro}
                </p>
                <div className="aa-switch-grid">
                    {p.gains.map(g => (
                        <div key={g.title} style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 20, padding: '28px 26px' }}>
                            <div style={{ width: 28, height: 3, background: GOLD, borderRadius: 2, marginBottom: 18 }} />
                            <div style={{ fontFamily: SERIF, fontSize: 21, color: INK, marginBottom: 10, letterSpacing: '-.01em' }}>{g.title}</div>
                            <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{g.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function SideBySide({ p }: { p: SwitchPlatform }) {
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <Eyebrow>Side by side</Eyebrow>
                <H2>{p.name} and AfroAllure, honestly.</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, lineHeight: 1.55, margin: '0 0 36px' }}>
                    Where they&apos;re ahead, we say so.
                </p>
                <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div className="aa-switch-row" style={{ background: WARM, borderBottom: `1px solid ${LINE}` }}>
                        <span />
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: RED, fontWeight: 700 }}>AfroAllure</span>
                    </div>
                    {p.compare.map((row, i) => (
                        <div key={row.label} className="aa-switch-row" style={{ borderBottom: i < p.compare.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                            <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{row.label}</span>
                            <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{row.them}</span>
                            <span style={{ fontFamily: SANS, fontSize: 13, color: INK, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                                {row.usWins && <span aria-label="better" style={{ color: RED }}>✓</span>}
                                {row.us}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function NumberField({ label, hint, value, onChange, prefix }: {
    label: string; hint?: string; value: number; onChange: (n: number) => void; prefix?: string
}) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INK }}>{label}</span>
            {hint && <span style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: -2 }}>{hint}</span>}
            <div style={{ position: 'relative' }}>
                {prefix && (
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INK }}>
                        {prefix}
                    </span>
                )}
                <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={value}
                    onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
                    style={{
                        width: '100%', height: 44, paddingLeft: prefix ? 28 : 14, paddingRight: 14,
                        border: `1px solid ${LINE}`, borderRadius: 10, fontFamily: SANS, fontSize: 15,
                        color: INK, background: '#fff', outline: 'none',
                    }}
                />
            </div>
        </label>
    )
}

function CostCompare({ p }: { p: SwitchPlatform }) {
    const [payments, setPayments] = useState(27)
    const [average, setAverage] = useState(150)
    const [marketplaceClients, setMarketplaceClients] = useState(2)

    const usage = { payments, average, marketplaceClients: p.cost.marketplaceInput ? marketplaceClients : 0 }
    const them = monthlyCost(p.cost.model, usage)
    const yearly = monthlyCost(AFROALLURE_GROWTH_YEARLY, usage)
    const monthly = monthlyCost(AFROALLURE_GROWTH_MONTHLY, usage)
    const diff = them - yearly

    const Total = ({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: boolean }) => (
        <div style={{
            flex: 1, minWidth: 150, padding: '18px 20px', borderRadius: 16,
            background: accent ? '#fff' : 'transparent', border: `${accent ? 2 : 1}px solid ${accent ? RED : LINE}`,
        }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: accent ? RED : MUTED, fontWeight: 600, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: SERIF, fontSize: 32, color: INK, letterSpacing: '-.02em' }}>{money(value)}<span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>/mo</span></div>
            {sub && <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: 4 }}>{sub}</div>}
        </div>
    )

    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>The math</Eyebrow>
                <H2>What you&apos;d pay each month.</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, lineHeight: 1.55, margin: '0 0 40px' }}>
                    Plan price plus card fees. Put in your own numbers.
                </p>

                <div className="aa-switch-calc">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <NumberField label="Card payments a month" value={payments} onChange={setPayments} />
                        <NumberField label="Average payment" prefix="$" value={average} onChange={setAverage} />
                        {p.cost.marketplaceInput && (
                            <NumberField
                                label={`New clients ${p.name} sends you each month`}
                                hint={`Only clients who found you by searching ${p.name}, not ones who used your own link.`}
                                value={marketplaceClients}
                                onChange={setMarketplaceClients}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Total label={p.name} value={them} sub={p.cost.model.planLabel} />
                            <Total label="AfroAllure Growth" value={yearly} sub={`Billed yearly (save ${YEARLY_SAVINGS_PERCENT}%) · ${money(monthly)}/mo billed monthly`} accent />
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 14, color: INK }}>
                            {diff >= 1
                                ? <>You&apos;d keep about <strong>{money(diff)} more a month</strong>, or {money(diff * 12)} a year.</>
                                : diff <= -1
                                    ? <>{p.name} comes out about {money(-diff)} a month cheaper at these numbers. What you get for the difference is above.</>
                                    : <>About the same either way at these numbers. What you get for it is above.</>}
                        </div>
                        <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                            {p.cost.note} Published pricing as of {CHECKED_ON}. Cash payments have no fees on either.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

function HowToSwitch({ p }: { p: SwitchPlatform }) {
    const steps: { title: string; body: React.ReactNode }[] = [
        { title: `Export your client list from ${p.name}`, body: p.exportStep },
        { title: 'Create your AfroAllure account and add your services', body: <>Start your free {TRIAL_DAYS}-day trial, with no card needed. Set up your menu with size and length pricing, deposits and policies, connect Stripe to get paid, and pick a look for your booking site.</> },
        { title: 'Import your clients', body: <>In your dashboard, go to <strong>Clients → Import</strong> and upload the CSV. We match the columns for you, skip anyone already on your list, and send nothing to your clients.</> },
        { title: 'Swap your link and tell your clients', body: <>Put your new link in your Instagram bio and send the message below. {p.appointmentsNote}</> },
    ]
    return (
        <section id="how" className="aa-section" style={{ background: '#fff', padding: '110px 56px' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <Eyebrow>How to switch</Eyebrow>
                <H2>Four steps. About 15 minutes.</H2>
                <ol style={{ listStyle: 'none', padding: 0, margin: '40px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {steps.map((s, i) => (
                        <li key={s.title} className="aa-switch-step" style={{
                            display: 'grid', gridTemplateColumns: '48px 1fr', gap: 18, background: WARM,
                            border: `1px solid ${LINE}`, borderRadius: 20, padding: 24,
                        }}>
                            <span style={{
                                width: 40, height: 40, borderRadius: '50%', background: i === 0 ? RED : DARK, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontSize: 18,
                            }}>{i + 1}</span>
                            <div>
                                <div style={{ fontFamily: SERIF, fontSize: 20, color: INK, marginBottom: 6, letterSpacing: '-.01em' }}>{s.title}</div>
                                <div style={{ fontFamily: SANS, fontSize: 14, color: MUTED, lineHeight: 1.65 }}>{s.body}</div>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

const ANNOUNCEMENT = `Hey love! Quick update: I've moved my booking to my own site. 💛

Book here from now on: [your link]

Same services, same me — plus you'll earn rewards on your visits. Any appointment you already have booked is still on.`

function Announcement() {
    const [copied, setCopied] = useState(false)
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(ANNOUNCEMENT)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch { /* clipboard blocked — the text is selectable */ }
    }
    return (
        <section className="aa-section" style={{ background: DARK, color: WARM, padding: '100px 56px' }}>
            <div className="aa-switch-announce" style={{ maxWidth: 1000, margin: '0 auto' }}>
                <div>
                    <Eyebrow color={GOLD}>Tell your clients</Eyebrow>
                    <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 3.6vw, 46px)', lineHeight: 1.05, letterSpacing: '-.02em', margin: '0 0 16px' }}>
                        A message you can send today.
                    </h2>
                    <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: 'rgba(250,247,242,.7)', margin: 0 }}>
                        Text it, post it to your story, or pin it. Swap in your link. Clients follow you, not the app.
                    </p>
                </div>
                <div style={{ background: 'rgba(250,247,242,.06)', border: '1px solid rgba(250,247,242,.14)', borderRadius: 20, padding: 24 }}>
                    <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line', margin: '0 0 18px', userSelect: 'all' }}>
                        {ANNOUNCEMENT}
                    </p>
                    <button type="button" onClick={copy} style={{
                        fontFamily: SANS, fontSize: 14, fontWeight: 600, background: WARM, color: INK,
                        border: 'none', borderRadius: 999, padding: '11px 20px', cursor: 'pointer',
                    }}>{copied ? 'Copied ✓' : 'Copy message'}</button>
                </div>
            </div>
        </section>
    )
}

function Faq({ p }: { p: SwitchPlatform }) {
    const items = [...SHARED_FAQ.slice(0, 2), ...p.faq, ...SHARED_FAQ.slice(2)]
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <Eyebrow>Questions</Eyebrow>
                <H2>Before you switch.</H2>
                <div style={{ marginTop: 32, borderTop: `1px solid ${LINE}` }}>
                    {items.map(([q, a]) => (
                        <details key={q} className="aa-switch-faq" style={{ borderBottom: `1px solid ${LINE}`, padding: '20px 0' }}>
                            <summary style={{ fontFamily: SERIF, fontSize: 19, color: INK, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                {q}<span aria-hidden style={{ color: RED, fontFamily: SANS }}>+</span>
                            </summary>
                            <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.65, margin: '12px 0 0' }}>{a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}

function FinalCta({ p, isLoggedIn }: { p: SwitchPlatform; isLoggedIn: boolean }) {
    const others = (Object.keys(PLATFORMS) as PlatformSlug[]).filter(s => s !== p.slug)
    return (
        <section className="aa-section" style={{ background: WARM, padding: '0 56px 100px' }}>
            <div style={{
                maxWidth: 1000, margin: '0 auto', textAlign: 'center', background: '#fff',
                border: `2px solid ${GOLD}`, borderRadius: 28, padding: '64px 32px',
            }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-.02em', margin: '0 0 14px', color: INK }}>
                    Your clients, your brand, your booking site.
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, margin: '0 0 30px' }}>
                    {TRIAL_DAYS} days free, no card needed. Questions? Email{' '}
                    <a href="mailto:abijahnesbitt@afroallure.co" style={{ color: INK }}>abijahnesbitt@afroallure.co</a>{' '}
                    and we&apos;ll help you move.
                </p>
                <PrimaryCta href={isLoggedIn ? '/dashboard/clients' : '/register'}>
                    {isLoggedIn ? 'Import your clients' : 'Start free'}
                </PrimaryCta>
            </div>
            <div style={{ maxWidth: 1000, margin: '28px auto 0', textAlign: 'center', fontFamily: SANS, fontSize: 13, color: MUTED }}>
                Switching from somewhere else?{' '}
                {others.map((s, i) => (
                    <span key={s}>
                        {i > 0 && ' · '}
                        <a href={`/switch/${s}`} style={{ color: INK }}>{PLATFORMS[s].name}</a>
                    </span>
                ))}
            </div>
            <div style={{ maxWidth: 1000, margin: '16px auto 0', textAlign: 'center', fontFamily: SANS, fontSize: 11, color: MUTED }}>
                Sources:{' '}
                {SOURCES[p.slug].map((src, i) => (
                    <span key={src.url}>
                        {i > 0 && ' · '}
                        <a href={src.url} target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>{src.label}</a>
                    </span>
                ))}
            </div>
        </section>
    )
}

export default function SwitchPage({ slug, isLoggedIn }: { slug: PlatformSlug; isLoggedIn: boolean }) {
    const p = PLATFORMS[slug]
    return (
        <div className="aa-business-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
            <Nav isLoggedIn={isLoggedIn} />
            <Hero p={p} isLoggedIn={isLoggedIn} />
            <Gains p={p} />
            <SideBySide p={p} />
            <CostCompare p={p} />
            <HowToSwitch p={p} />
            <Announcement />
            <Faq p={p} />
            <FinalCta p={p} isLoggedIn={isLoggedIn} />
        </div>
    )
}
