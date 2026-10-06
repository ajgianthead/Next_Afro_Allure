// AfroAllure — Switching from StyleSeat
// Same visual language as /for-businesses. Every StyleSeat figure here is from
// StyleSeat's own published pricing (checked Oct 2026) — keep it that way, and
// update STYLESEAT below if their pricing changes.
'use client'
import '../../for-businesses/forBusinesses.css'
import './switch.css'
import { useState } from 'react'
import Image from 'next/image'
import LOGO from '../../../../public/images/logo_transparent_background.png'
import {
    PLATFORM_FEE_PERCENT, STRIPE_PROCESSING_FIXED_CENTS, STRIPE_PROCESSING_PERCENT,
} from '@/lib/fees'

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

const STYLESEAT = {
    monthly: 35,
    cardPercent: 0.026,
    cardFixed: 0.3,
    newClientPercent: 0.3,
    newClientCap: 50,
}
const AFROALLURE_MONTHLY_AFTER_BETA = 25
const AA_CARD_PERCENT = PLATFORM_FEE_PERCENT + STRIPE_PROCESSING_PERCENT
const AA_CARD_FIXED = STRIPE_PROCESSING_FIXED_CENTS / 100

const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

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

// ─────────────────────────────────────────────────────────────
function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
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
                <Eyebrow color={GOLD}>Switching from StyleSeat</Eyebrow>
                <h1 style={{
                    fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(44px, 6.4vw, 84px)',
                    lineHeight: .98, letterSpacing: '-.03em', margin: '0 0 26px',
                }}>
                    Bring your clients.<br /><em style={{ color: RED }}>Keep your name on it.</em>
                </h1>
                <p style={{ fontFamily: SANS, fontSize: 18, lineHeight: 1.55, color: 'rgba(250,247,242,.75)', maxWidth: 620, margin: '0 0 36px' }}>
                    Your booking page should look like your brand, not a directory listing next to the stylist down the street.
                    Move your client list, your menu and your link to AfroAllure in about 15 minutes.
                </p>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <PrimaryCta href={isLoggedIn ? '/dashboard/clients' : '/register'}>
                        {isLoggedIn ? 'Import your clients' : 'Start free — no card needed'}
                    </PrimaryCta>
                    <a href="#how" style={{ fontFamily: SANS, fontSize: 15, color: WARM, fontWeight: 500 }}>How switching works</a>
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
const GAINS: { title: string; body: string }[] = [
    { title: 'Your own booking site', body: 'A real site at yourname.afroallure.co with your colors, fonts, photos and policies — no other stylists listed beside you.' },
    { title: 'Priced the way braids are priced', body: 'Size × length pricing, hair included or not, and prep instructions, so clients book the exact style and see the real price.' },
    { title: 'No-show and late fees, automatically', body: 'Card on file at booking. Charge a no-show fee in one tap, and late fees land on the final balance.' },
    { title: 'Loyalty rewards', body: 'Reward clients after a set number of visits or amount spent — money or a percentage off their next appointment, sent to them automatically.' },
    { title: 'Rebook reminders', body: 'Clients get a nudge when it is time for their next appointment, with a link straight to your calendar.' },
    { title: 'Waitlist and openings graphics', body: 'When someone cancels, clients on your waitlist whose dates fit get an email right away. And post a ready-made openings graphic to your stories.' },
]

function WhatYouGet() {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>What you get</Eyebrow>
                <H2>Built for the way you already work.</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 620, lineHeight: 1.55, margin: '0 0 48px' }}>
                    Most of your clients already find you on Instagram and through referrals. AfroAllure is built to turn
                    them into regulars — and keep them yours.
                </p>
                <div className="aa-switch-grid">
                    {GAINS.map(g => (
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

// ─────────────────────────────────────────────────────────────
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

function CostCompare() {
    const [appointments, setAppointments] = useState(40)
    const [price, setPrice] = useState(150)
    const [marketplaceClients, setMarketplaceClients] = useState(2)

    const cardFees = (pct: number, fixed: number) => appointments * (price * pct + fixed)
    const newClientFee = marketplaceClients * Math.min(price * STYLESEAT.newClientPercent, STYLESEAT.newClientCap)
    const styleSeat = STYLESEAT.monthly + cardFees(STYLESEAT.cardPercent, STYLESEAT.cardFixed) + newClientFee
    const aaBeta = cardFees(AA_CARD_PERCENT, AA_CARD_FIXED)
    const aaAfter = AFROALLURE_MONTHLY_AFTER_BETA + aaBeta

    const rows: [string, string, string][] = [
        ['Monthly plan', `${money(STYLESEAT.monthly)}/mo`, `$0 in beta · ${money(AFROALLURE_MONTHLY_AFTER_BETA)}/mo after`],
        ['Card payments', '2.6% + 30¢', `${(AA_CARD_PERCENT * 100).toFixed(1)}% + 30¢ (card processing at cost + 1%)`],
        ['New clients from the marketplace', '30% of their first visit, up to $50', 'No new-client fee'],
        ['Your own website', '$10/mo add-on', 'Included'],
    ]

    const Total = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
        <div style={{
            flex: 1, minWidth: 150, padding: '18px 20px', borderRadius: 16,
            background: accent ? '#fff' : 'transparent', border: `1px solid ${accent ? RED : LINE}`,
        }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: accent ? RED : MUTED, fontWeight: 600, marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: SERIF, fontSize: 32, color: INK, letterSpacing: '-.02em' }}>{money(value)}<span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>/mo</span></div>
        </div>
    )

    return (
        <section className="aa-section" style={{ background: '#fff', padding: '110px 56px', borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <Eyebrow>The honest math</Eyebrow>
                <H2>What you&apos;d pay each month.</H2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, maxWidth: 640, lineHeight: 1.55, margin: '0 0 40px' }}>
                    Our card fee is a little higher than StyleSeat&apos;s. There&apos;s no monthly fee during beta and no new-client fee ever.
                    Put in your own numbers.
                </p>

                <div className="aa-switch-calc">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <NumberField label="Appointments paid by card each month" value={appointments} onChange={setAppointments} />
                        <NumberField label="Average appointment price" prefix="$" value={price} onChange={setPrice} />
                        <NumberField
                            label="New clients StyleSeat sends you each month"
                            hint="Only clients who found you by searching StyleSeat — not ones who used your own link."
                            value={marketplaceClients}
                            onChange={setMarketplaceClients}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <Total label="StyleSeat" value={styleSeat} />
                            <Total label="AfroAllure · beta" value={aaBeta} accent />
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>
                            After beta: {money(aaAfter)}/mo on AfroAllure. Founding members lock in the {money(AFROALLURE_MONTHLY_AFTER_BETA)} rate.
                        </div>
                        <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden', marginTop: 6 }}>
                            <div className="aa-switch-row" style={{ background: WARM, borderBottom: `1px solid ${LINE}` }}>
                                <span />
                                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 600 }}>StyleSeat</span>
                                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: RED, fontWeight: 700 }}>AfroAllure</span>
                            </div>
                            {rows.map(([label, ss, aa], i) => (
                                <div key={label} className="aa-switch-row" style={{ borderBottom: i < rows.length - 1 ? `1px solid ${LINE}` : 'none' }}>
                                    <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{label}</span>
                                    <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED }}>{ss}</span>
                                    <span style={{ fontFamily: SANS, fontSize: 13, color: INK, fontWeight: 600 }}>{aa}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                            StyleSeat figures from StyleSeat&apos;s published pricing (standard plan, card-on-file rate), October 2026;
                            promotional rates and optional add-ons like Smart Pricing aren&apos;t included. Cash payments have no fees on either.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
const STEPS: { title: string; body: React.ReactNode }[] = [
    {
        title: 'Export your client list from StyleSeat',
        body: <>In the StyleSeat app, open <strong>Clients</strong>, tap <strong>⋯</strong> in the top corner and choose <strong>Export Client List</strong>. StyleSeat emails you a CSV file. <strong>Do this before you cancel</strong> — the export only works while your StyleSeat subscription is active.</>,
    },
    {
        title: 'Create your AfroAllure account and add your services',
        body: <>Set up your menu with size and length pricing, deposits and policies. Connect Stripe to get paid. Pick a look for your booking site.</>,
    },
    {
        title: 'Import your clients',
        body: <>In your dashboard, go to <strong>Clientele → Import</strong> and upload the CSV. We match the columns for you, skip anyone already on your list, and send nothing to your clients.</>,
    },
    {
        title: 'Swap your link and tell your clients',
        body: <>Put your new link in your Instagram bio and send the message below. Keep StyleSeat open until the appointments already booked there are done — StyleSeat doesn&apos;t export upcoming appointments, so jot them down or add them to your AfroAllure calendar.</>,
    },
]

function HowToSwitch() {
    return (
        <section id="how" className="aa-section" style={{ background: WARM, padding: '110px 56px' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                <Eyebrow>How to switch</Eyebrow>
                <H2>Four steps. About 15 minutes.</H2>
                <ol style={{ listStyle: 'none', padding: 0, margin: '40px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {STEPS.map((s, i) => (
                        <li key={s.title} style={{
                            display: 'grid', gridTemplateColumns: '48px 1fr', gap: 18, background: '#fff',
                            border: `1px solid ${LINE}`, borderRadius: 20, padding: '24px 24px',
                        }}>
                            <span style={{
                                width: 40, height: 40, borderRadius: '50%', background: i === 0 ? RED : DARK, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: SERIF, fontSize: 18,
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

// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
const FAQ: [string, string][] = [
    ['Will my clients get an email or text when I import them?', 'No. Importing just adds them to your client list. They only hear from you when they book, or when you turn on reminders like rebooking nudges.'],
    ['Can I keep StyleSeat while I try AfroAllure?', 'Yes. Plenty of stylists run both for a few weeks while their existing StyleSeat appointments finish. Just make sure the same time slot isn\'t open on both.'],
    ['What about my StyleSeat reviews?', 'Reviews stay on StyleSeat. Screenshot your favorites and add them to your AfroAllure booking site.'],
    ['Do I lose new clients from StyleSeat search?', 'You lose StyleSeat\'s search listing if you cancel. If most of your clients come from Instagram, TikTok and referrals, that\'s usually a small share — the calculator above shows what those clients cost you today.'],
    ['How do clients pay?', 'By card through Stripe, with deposits, a card on file for no-show and late fees, and the balance charged at the end. Cash works too and has no fees.'],
]

function Faq() {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '110px 56px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <Eyebrow>Questions</Eyebrow>
                <H2>Before you switch.</H2>
                <div style={{ marginTop: 32, borderTop: `1px solid ${LINE}` }}>
                    {FAQ.map(([q, a]) => (
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

function FinalCta({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '0 56px 120px' }}>
            <div style={{
                maxWidth: 1000, margin: '0 auto', textAlign: 'center', background: '#fff',
                border: `2px solid ${GOLD}`, borderRadius: 28, padding: '64px 32px',
            }}>
                <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 4vw, 50px)', letterSpacing: '-.02em', margin: '0 0 14px', color: INK }}>
                    Your clients, your brand, your booking site.
                </h2>
                <p style={{ fontFamily: SANS, fontSize: 16, color: MUTED, margin: '0 0 30px' }}>
                    Free during beta. Questions? Email <a href="mailto:abijahnesbitt@afroallure.co" style={{ color: INK }}>abijahnesbitt@afroallure.co</a> and we&apos;ll help you move.
                </p>
                <PrimaryCta href={isLoggedIn ? '/dashboard/clients' : '/register'}>
                    {isLoggedIn ? 'Import your clients' : 'Start free'}
                </PrimaryCta>
            </div>
        </section>
    )
}

export default function SwitchFromStyleSeat({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="aa-business-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
            <Nav isLoggedIn={isLoggedIn} />
            <Hero isLoggedIn={isLoggedIn} />
            <WhatYouGet />
            <CostCompare />
            <HowToSwitch />
            <Announcement />
            <Faq />
            <FinalCta isLoggedIn={isLoggedIn} />
        </div>
    )
}
