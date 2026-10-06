// AfroAllure — For Businesses Page
// Confident, detailed. Bento features, dark "why" section, premium pricing, gold founding section.
'use client'
import './forBusinesses.css'
import { useState, useEffect, useRef } from "react";
import LOGO from '../../../public/images/logo_transparent_background.png'
import Image from "next/image";
import { Menu, Sparkles } from "lucide-react";
import {
    dollars, GROWTH_MONTHLY_CENTS, GROWTH_YEARLY_CENTS, STARTER_LIMITS, TRIAL_DAYS, YEARLY_FREE_MONTHS,
    YEARLY_FULL_PRICE_CENTS, YEARLY_SAVINGS_CENTS, YEARLY_SAVINGS_PERCENT, yearlyPerMonth, type BillingInterval,
} from '@/features/billing/plans';
import {
    ACUITY, AFROALLURE_GROWTH_MONTHLY, AFROALLURE_GROWTH_YEARLY, CHECKED_ON as COMPETITORS_CHECKED_ON,
    GLOSSGENIUS, monthlyCost, STYLESEAT, type CostModel,
} from '@/features/billing/competitors';
import { STARTER_PLATFORM_FEE_PERCENT, STRIPE_PROCESSING_FIXED_CENTS, STRIPE_PROCESSING_PERCENT } from '@/lib/fees';


const RED = '#FC6161';
const DARK = '#0F0E0E';
const DARKER = '#272635';
const WARM = '#FAF7F2';
const GOLD = '#C9974A';
const INK = '#1A1818';
const MUTED = '#6F6863';
const LINE = '#E8E2D6';

const SERIF = "'Fraunces', 'Times New Roman', serif";
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";





const Icon = ({ d, size = 22, stroke = 1.6, fill = 'none' }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
        strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
);

const ICONS = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    check: <path d="M5 12l5 5L20 7" />,
    star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" fill="currentColor" />,
    spark: <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" fill="currentColor" />,
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
    crown: <path d="M3 9l3 8h12l3-8-5 3-4-6-4 6-5-3z" />,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
};

// ─────────────────────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────────────────────
function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div ref={ref} className="aa-mobile-nav" style={{
            position: 'sticky', top: 0, zIndex: 100,
            backgroundColor: DARK, borderBottom: '1px solid rgba(250,247,242,.08)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px' }}>
                <Image src={LOGO} alt="AfroAllure" width={130} style={{ filter: 'brightness(0) invert(1)' }} />
                <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: WARM, display: 'flex' }}>
                    <Menu size={24} />
                </button>
            </div>
            {open && (
                <div style={{ background: '#1A1818', borderBottom: '1px solid rgba(250,247,242,.08)' }}>
                    {[{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }].map(({ label, href }) => (
                        <a key={label} href={href} onClick={() => setOpen(false)} style={{
                            display: 'block', padding: '16px 24px',
                            fontFamily: SANS, fontSize: 15, color: 'rgba(250,247,242,.85)',
                            borderBottom: '1px solid rgba(250,247,242,.08)', textDecoration: 'none',
                        }}>{label}</a>
                    ))}
                    {isLoggedIn ? (
                        <div style={{ padding: '16px 24px' }}>
                            <a href="/dashboard" onClick={() => setOpen(false)} style={{
                                display: 'block', textAlign: 'center',
                                background: 'rgba(250,247,242,.1)', color: WARM,
                                border: '1.5px solid rgba(250,247,242,.2)',
                                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                padding: '14px', borderRadius: 999, textDecoration: 'none',
                            }}>Dashboard →</a>
                        </div>
                    ) : (
                        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <a href="/login" onClick={() => setOpen(false)} style={{
                                display: 'block', textAlign: 'center',
                                background: 'transparent', color: WARM,
                                border: '1.5px solid rgba(250,247,242,.3)',
                                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                padding: '13px', borderRadius: 999, textDecoration: 'none',
                            }}>Login</a>
                            <a href="/register" onClick={() => setOpen(false)} style={{
                                display: 'block', textAlign: 'center',
                                background: RED, color: '#fff',
                                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                padding: '14px', borderRadius: 999, textDecoration: 'none',
                            }}>Register</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
function Nav({ dark = false, isLoggedIn = false }: { dark?: boolean; isLoggedIn?: boolean }) {
    const muted = dark ? 'rgba(250,247,242,.7)' : MUTED;
    return (
        <nav className="aa-nav" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '22px 56px',
            borderBottom: `1px solid ${dark ? 'rgba(250,247,242,.08)' : LINE}`,
            background: dark ? 'transparent' : WARM,
            position: 'relative', zIndex: 5,
        }}>
            <a style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div>
                    <Image style={{ filter: 'brightness(0) invert(1)' }}
                        src={LOGO} alt="logo-img" width={150} />
                </div>
            </a>
            <div className="aa-nav-links" style={{ display: 'flex', gap: 36, fontFamily: SANS, fontSize: 14, color: muted, fontWeight: 500 }}>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
            </div>
            {isLoggedIn ? (
                <a href="/dashboard" style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: 13,
                    color: WARM, border: `1.5px solid rgba(250,247,242,.5)`,
                    padding: '9px 18px', borderRadius: 999, background: 'transparent', textDecoration: 'none',
                }}>
                    Dashboard →
                </a>
            ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                    <a href="/login" style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: 13,
                        color: WARM, border: `1.5px solid rgba(250,247,242,.5)`,
                        padding: '9px 18px', borderRadius: 999, background: 'transparent', textDecoration: 'none',
                    }}>
                        Login
                    </a>
                    <a href="/register" style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: 13,
                        color: '#fff', background: RED,
                        padding: '11px 18px', borderRadius: 999, textDecoration: 'none',
                    }}>
                        Register
                    </a>
                </div>
            )}
        </nav>
    );
}

// ─────────────────────────────────────────────────────────────
// HERO — confident, direct, dark with hair-texture vibe
// ─────────────────────────────────────────────────────────────
function Hero({ isLoggedIn, foundingMemberCount }: { isLoggedIn: boolean; foundingMemberCount: number }) {
    return (
        <section style={{
            background: DARK, color: WARM, position: 'relative', overflow: 'hidden',
        }}>
            {/* Texture suggestion: large radial + concentric arcs */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
            radial-gradient(ellipse 60% 80% at 85% 30%, rgba(252,97,97,.18), transparent 60%),
            radial-gradient(ellipse 80% 60% at 10% 90%, rgba(201,151,74,.14), transparent 55%)
          `,
                pointerEvents: 'none',
            }} />
            {/* Coil pattern lines */}
            <svg viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid slice"
                style={{
                    position: 'absolute', right: -100, top: 60, width: 800, height: 600,
                    opacity: .15, pointerEvents: 'none'
                }}>
                {[...Array(14)].map((_, i) => (
                    <circle key={i} cx="900" cy="320" r={40 + i * 22}
                        fill="none" stroke={i % 3 === 0 ? GOLD : WARM} strokeWidth={i % 3 === 0 ? 1.2 : .6} />
                ))}
            </svg>

            <div className="aa-desktop-nav"><Nav dark isLoggedIn={isLoggedIn} /></div>

            <div className="aa-hero-inner" style={{
                maxWidth: 1240, margin: '0 auto', padding: '88px 56px 120px',
                position: 'relative', zIndex: 2,
            }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'rgba(250,247,242,.6)', marginBottom: 28,
                }}>
                    <span style={{ color: GOLD }}>For independent</span> · stylists · barbers · braiders
                </div>

                <h1 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(56px, 8vw, 112px)', lineHeight: .95,
                    letterSpacing: '-.04em', margin: 0, color: WARM,
                    maxWidth: 1100, textWrap: 'balance',
                }}>
                    Get discovered.<br />
                    Get booked.<br />
                    Get <em style={{ fontStyle: 'italic', color: RED }}>paid.</em>
                </h1>

                <p style={{
                    fontFamily: SANS, fontSize: 19, lineHeight: 1.5,
                    color: 'rgba(250,247,242,.78)',
                    margin: '36px 0 44px', maxWidth: 580, fontWeight: 400,
                }}>
                    AfroAllure gives Black beauty professionals a complete business system —
                    booking, payments, branding, and a community built around you.
                </p>

                <div className="aa-hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href="/register" style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: 15,
                        background: RED, color: '#fff', border: 'none',
                        padding: '15px 24px', borderRadius: 999, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        textDecoration: 'none',
                    }}>
                        Start Free for {TRIAL_DAYS} Days
                        <Icon d={ICONS.arrow} size={16} stroke={2} />
                    </a>
                    <a href="#pricing" style={{
                        fontFamily: SANS, fontWeight: 600, fontSize: 15,
                        background: 'transparent', color: WARM,
                        border: '1.5px solid rgba(250,247,242,.4)',
                        padding: '13.5px 22px', borderRadius: 999, cursor: 'pointer',
                        textDecoration: 'none',
                    }}>
                        See Pricing
                    </a>

                    <span style={{
                        marginLeft: 12, fontFamily: SANS, fontSize: 13,
                        color: 'rgba(250,247,242,.6)',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                    }} className="aa-rating">
                        <span style={{ color: GOLD, display: 'inline-flex' }}>
                            {[...Array(5)].map((_, i) => <Icon key={i} d={ICONS.star} size={11} fill="currentColor" />)}
                        </span>
                        {foundingMemberCount}+ founding members
                    </span>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FEATURES — bento layout, mini mockups in code
// ─────────────────────────────────────────────────────────────
function Features() {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '120px 56px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                <div className="aa-features-header" style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: 48, marginBottom: 56, flexWrap: 'wrap',
                }}>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: RED, marginBottom: 24, fontWeight: 600,
                        }}>Features</div>
                        <h2 style={{
                            fontFamily: SERIF, fontWeight: 400,
                            fontSize: 'clamp(38px, 4.8vw, 60px)', lineHeight: 1.02,
                            letterSpacing: '-.025em', margin: 0, color: INK,
                            maxWidth: 720, textWrap: 'balance',
                        }}>
                            Everything you need to run a<br />
                            <em style={{ fontStyle: 'italic' }}>modern beauty business.</em>
                        </h2>
                    </div>
                    <p style={{
                        fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: MUTED,
                        maxWidth: 360, margin: 0, fontWeight: 400,
                    }}>
                        Without the complexity, the fees, or the platforms that weren't built for you.
                    </p>
                </div>

                {/* Bento grid */}
                <div className="aa-bento" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gridAutoRows: 'min-content',
                    gap: 14,
                }}>
                    {/* Smart Booking — large left */}
                    <BentoCard span={3} rowSpan={2} h={460}>
                        <BentoHeader
                            eyebrow="01 · Calendar"
                            title="Smart Booking Calendar"
                            desc="Hours, services, buffers, blackouts. Set it once. Clients book themselves — never another DM thread."
                        />
                        <CalendarMock />
                    </BentoCard>

                    {/* Payments — large right */}
                    <BentoCard span={3} rowSpan={2} h={460} dark>
                        <BentoHeader
                            dark
                            eyebrow="02 · Payments"
                            title="Integrated Payments"
                            desc="Take deposits at booking. Cards, Apple Pay, Google Pay, Cash App. Cancellation policies enforced automatically."
                        />
                        <PaymentsMock />
                    </BentoCard>

                    {/* Analytics — wide */}
                    <BentoCard span={4} h={300}>
                        <BentoHeader
                            eyebrow="03 · Analytics"
                            title="Business Analytics"
                            desc="What pays best, who returns, what to raise prices on."
                        />
                        <AnalyticsMock />
                    </BentoCard>

                    {/* Booking page — narrow */}
                    <BentoCard span={2} h={300}>
                        <BentoHeader
                            eyebrow="04 · Page"
                            title="Custom Booking Page"
                            desc="Your URL. Your brand."
                        />
                        <PageMock />
                    </BentoCard>
                </div>
            </div>
        </section>
    );
}

function BentoCard({ children, span, rowSpan, h, dark }: any) {
    return (
        <div style={{
            gridColumn: `span ${span}`,
            gridRow: rowSpan ? `span ${rowSpan}` : undefined,
            background: dark ? INK : '#fff',
            color: dark ? WARM : INK,
            borderRadius: 24, padding: 28,
            border: `1px solid ${dark ? 'rgba(250,247,242,.08)' : LINE}`,
            minHeight: h, position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
        }}>{children}</div>
    );
}

function BentoHeader({ eyebrow, title, desc, dark }: any) {
    return (
        <div style={{ marginBottom: 22 }}>
            <div style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                color: dark ? 'rgba(250,247,242,.5)' : MUTED, marginBottom: 12, fontWeight: 600,
            }}>{eyebrow}</div>
            <div style={{
                fontFamily: SERIF, fontSize: 26, fontWeight: 500, letterSpacing: '-.015em',
                marginBottom: 8, color: dark ? WARM : INK,
            }}>{title}</div>
            <div style={{
                fontFamily: SANS, fontSize: 13, lineHeight: 1.55, fontWeight: 400,
                color: dark ? 'rgba(250,247,242,.65)' : MUTED, maxWidth: 380,
            }}>{desc}</div>
        </div>
    );
}

function CalendarMock() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = 2;
    return (
        <div style={{
            background: WARM, borderRadius: 16, padding: 18,
            flex: 1, display: 'flex', flexDirection: 'column', gap: 12,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: INK }}>September</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>WK 38</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {days.map((d, i) => (
                    <div key={i} style={{
                        textAlign: 'center', fontFamily: SANS, fontSize: 11,
                        color: MUTED, fontWeight: 600, paddingBottom: 4
                    }}>{d}</div>
                ))}
                {[...Array(7)].map((_, i) => (
                    <div key={i} style={{
                        aspectRatio: '1 / 1', borderRadius: 8,
                        background: i === today ? INK : '#fff',
                        color: i === today ? WARM : INK,
                        fontFamily: SANS, fontSize: 13, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${i === today ? INK : LINE}`,
                        position: 'relative',
                    }}>
                        {16 + i}
                        {[1, 2, 4, 5].includes(i) && (
                            <span style={{
                                position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                                width: 4, height: 4, borderRadius: '50%',
                                background: i === today ? RED : RED,
                            }} />
                        )}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                    { t: '10:00', n: 'Imani O.', s: 'Knotless · 4hr', c: '#E8DCC8' },
                    { t: '14:30', n: 'Brielle T.', s: 'Silk press', c: '#F2C8C8' },
                    { t: '18:00', n: 'Ade K.', s: 'Color refresh', c: '#E8CFA0' },
                ].map((a, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 10, background: '#fff',
                        border: `1px solid ${LINE}`,
                    }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: a.c }} />
                        <span style={{ fontFamily: MONO, fontSize: 11, color: INK, fontWeight: 600 }}>{a.t}</span>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: INK, fontWeight: 500 }}>{a.n}</span>
                        <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED, marginLeft: 'auto' }}>{a.s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PaymentsMock() {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
                background: 'rgba(250,247,242,.05)', borderRadius: 16, padding: 18,
                border: '1px solid rgba(250,247,242,.08)',
            }}>
                <div style={{
                    fontFamily: MONO, fontSize: 10, color: 'rgba(250,247,242,.5)',
                    letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 8
                }}>Deposit · Imani O.</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 400, color: WARM, letterSpacing: '-.02em' }}>$50.00</span>
                    <span style={{ fontFamily: SANS, fontSize: 12, color: '#7BD8A0', fontWeight: 600 }}>✓ Paid</span>
                </div>
                <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['Card', 'Apple Pay', 'Google Pay', 'Cash App'].map((m, i) => (
                        <span key={i} style={{
                            fontFamily: SANS, fontSize: 11, color: WARM, fontWeight: 500,
                            padding: '5px 10px', borderRadius: 999,
                            background: i === 0 ? RED : 'rgba(250,247,242,.08)',
                            border: i === 0 ? 'none' : '1px solid rgba(250,247,242,.12)',
                        }}>{m}</span>
                    ))}
                </div>
            </div>

            <div style={{
                background: 'rgba(250,247,242,.05)', borderRadius: 16, padding: 18,
                border: '1px solid rgba(250,247,242,.08)', flex: 1,
            }}>
                <div style={{
                    fontFamily: MONO, fontSize: 10, color: 'rgba(250,247,242,.5)',
                    letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 14
                }}>Recent</div>
                {[
                    ['Brielle T.', 'Silk press', '$110'],
                    ['Ade K.', 'Color refresh', '$165'],
                    ['Joy A.', 'Knotless braids', '$220'],
                ].map(([n, s, a], i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                        borderBottom: i < 2 ? '1px solid rgba(250,247,242,.06)' : 'none',
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: SANS, fontSize: 13, color: WARM, fontWeight: 600 }}>{n}</div>
                            <div style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(250,247,242,.5)' }}>{s}</div>
                        </div>
                        <span style={{ fontFamily: SERIF, fontSize: 17, color: WARM, fontWeight: 500 }}>{a}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsMock() {
    return (
        <div className="aa-analytics" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <div style={{
                        fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.14em',
                        textTransform: 'uppercase', fontWeight: 600
                    }}>This month</div>
                    <div style={{
                        fontFamily: SERIF, fontSize: 30, fontWeight: 500, color: INK,
                        letterSpacing: '-.02em', marginTop: 4
                    }}>$4,820</div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: '#0A8D54', fontWeight: 600 }}>↑ 18%</div>
                </div>
                <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 10 }}>
                    <div style={{
                        fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.14em',
                        textTransform: 'uppercase', fontWeight: 600
                    }}>Top service</div>
                    <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK, marginTop: 4 }}>
                        Knotless braids
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>62% of revenue</div>
                </div>
            </div>
            <div style={{
                background: WARM, borderRadius: 14, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 10,
            }}>
                <div style={{
                    fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.14em',
                    textTransform: 'uppercase', fontWeight: 600
                }}>Last 12 weeks</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'end', gap: 5 }}>
                    {[40, 56, 48, 72, 60, 82, 70, 90, 78, 96, 84, 100].map((h, i) => (
                        <div key={i} style={{
                            flex: 1, height: `${h}%`, borderRadius: 3,
                            background: i === 11 ? RED : '#D9C9B0',
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PageMock() {
    return (
        <div style={{
            flex: 1, background: WARM, borderRadius: 12, padding: 14,
            display: 'flex', flexDirection: 'column',
        }}>
            <div style={{
                fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.1em',
                marginBottom: 8
            }}>nia.afroallure.site</div>
            <div style={{
                background: '#3E2A1E', borderRadius: 8, padding: 14, color: '#D9B687',
                fontFamily: SERIF, fontSize: 18, fontWeight: 500, lineHeight: 1.1,
                marginBottom: 8,
            }}>
                Nia's<br />Studio
            </div>
            <div style={{
                background: '#fff', borderRadius: 8, padding: 8, fontFamily: SANS,
                fontSize: 10, color: INK, marginBottom: 6, display: 'flex', justifyContent: 'space-between',
            }}>
                <span>Knotless braids</span><span style={{ color: RED, fontWeight: 600 }}>Book →</span>
            </div>
            <div style={{
                background: '#fff', borderRadius: 8, padding: 8, fontFamily: SANS,
                fontSize: 10, color: INK, marginBottom: 6, display: 'flex', justifyContent: 'space-between',
            }}>
                <span>Silk press</span><span style={{ color: RED, fontWeight: 600 }}>Book →</span>
            </div>
            <div style={{
                background: '#fff', borderRadius: 8, padding: 8, fontFamily: SANS,
                fontSize: 10, color: INK, display: 'flex', justifyContent: 'space-between',
            }}>
                <span>Color refresh</span><span style={{ color: RED, fontWeight: 600 }}>Book →</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// WHY AFROALLURE — dark
// ─────────────────────────────────────────────────────────────
function WhyAfroAllure() {
    const points = [
        {
            n: '01',
            t: 'Built for Black beauty, not adapted for it',
            d: `When the platform is built around your specialties from day one — knotless,
            locs, silk press, kids' styles, barbering — your services aren't an afterthought
            tucked into a generic dropdown. The defaults work for you, the templates look
            like you, and the discovery filters reflect what your clients actually search for.`,
        },
        {
            n: '02',
            t: 'You own your clients — we never sell your data',
            d: `Your client list is yours. Your booking history is yours. Export it any time,
            in any format, and take it anywhere. We don't monetize introductions to your
            own clients, we don't gate communication, and we don't treat your customer
            relationships as inventory we can resell to the highest bidder.`,
        },
        {
            n: '03',
            t: 'Business-first, not marketplace-first',
            d: `The directory is a benefit you receive, not the product we sell. AfroAllure
            is built so you can run a complete business on it — even if no one ever
            discovers you through us. Your booking page, your payments, your client
            management, your analytics. The marketplace is the cherry, not the cake.`,
        },
    ];

    return (
        <section className="aa-section" style={{ background: DARKER, color: WARM, padding: '120px 56px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'rgba(250,247,242,.5)', marginBottom: 24,
                }}>
                    <span style={{ color: GOLD }}>Difference</span> &nbsp; positioning
                </div>
                <h2 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(48px, 6.5vw, 88px)', lineHeight: .98,
                    letterSpacing: '-.03em', margin: '0 0 80px', color: WARM,
                }}>
                    Why <em style={{ fontStyle: 'italic' }}>AfroAllure?</em>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {points.map((p, i) => (
                        <div key={i} className="aa-why-row" style={{
                            display: 'grid', gridTemplateColumns: '120px 1.5fr 2fr', gap: 48,
                            padding: '40px 0',
                            borderTop: '1px solid rgba(250,247,242,.12)',
                            alignItems: 'start',
                        }}>
                            <div style={{
                                fontFamily: MONO, fontSize: 12, letterSpacing: '.16em',
                                color: GOLD, fontWeight: 700, paddingTop: 8,
                            }}>{p.n}</div>
                            <div style={{
                                fontFamily: SERIF, fontSize: 28, fontWeight: 500,
                                letterSpacing: '-.02em', lineHeight: 1.05, color: WARM,
                                textWrap: 'balance',
                            }}>{p.t}</div>
                            <p className="aa-why-desc" style={{
                                fontFamily: SANS, fontSize: 16, lineHeight: 1.6,
                                color: 'rgba(250,247,242,.72)', margin: 0, fontWeight: 400,
                                textWrap: 'pretty',
                            }}>{p.d}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────
function Pricing() {
    const [interval, setBillingInterval] = useState<BillingInterval>('year')
    const yearly = interval === 'year'
    const growth = [
        'No AfroAllure fee on your payments',
        'Unlimited bookings & availability schedules',
        'Your own booking site at yourname.afroallure.co',
        'Size × length pricing, deposits & refunds',
        'No-show & late fees on a saved card',
        'Loyalty rewards, rebook reminders & waitlist',
        'Automated email reminders',
        'Booking analytics & client management',
    ];
    const starter = [
        `${STARTER_LIMITS.manualBookingsPerMonth} manual bookings a month`,
        `${STARTER_LIMITS.availabilitySchedules} availability schedule`,
        'Online booking & deposits',
        '1% AfroAllure fee on card payments',
    ];

    const Check = ({ dark }: { dark?: boolean }) => (
        <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: dark ? RED : WARM, color: dark ? '#fff' : INK,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
            <Icon d={ICONS.check} size={11} stroke={2.5} />
        </span>
    )

    return (
        <section id="pricing" className="aa-section" style={{ background: WARM, padding: '120px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                        color: RED, marginBottom: 22, fontWeight: 600,
                    }}>Pricing</div>
                    <h2 style={{
                        fontFamily: SERIF, fontWeight: 400,
                        fontSize: 'clamp(40px, 5.2vw, 68px)', lineHeight: 1,
                        letterSpacing: '-.025em', margin: '0 0 18px', color: INK,
                    }}>
                        Keep <em style={{ fontStyle: 'italic' }}>every</em> dollar you book.
                    </h2>
                    <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.5, color: MUTED, margin: 0 }}>
                        No percentage fee on Growth. Try it free for {TRIAL_DAYS} days — no credit card.
                    </p>
                </div>

                {/* Monthly / yearly toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
                    <div role="tablist" aria-label="Billing period" style={{
                        display: 'inline-flex', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 999, padding: 4,
                    }}>
                        {(['month', 'year'] as const).map(v => (
                            <button key={v} type="button" role="tab" aria-selected={interval === v}
                                onClick={() => setBillingInterval(v)}
                                style={{
                                    fontFamily: SANS, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                                    padding: '10px 20px', borderRadius: 999,
                                    background: interval === v ? INK : 'transparent', color: interval === v ? '#fff' : MUTED,
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                }}>
                                {v === 'month' ? 'Monthly' : 'Yearly'}
                                {v === 'year' && (
                                    <span style={{
                                        background: RED, color: '#fff', fontSize: 10, letterSpacing: '.06em',
                                        padding: '3px 8px', borderRadius: 999, fontWeight: 700,
                                    }}>SAVE {YEARLY_SAVINGS_PERCENT}%</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="aa-pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20 }}>
                    {/* GROWTH */}
                    <div className="aa-pricing-card" style={{
                        background: '#fff', borderRadius: 24, padding: '40px 36px',
                        border: `2px solid ${RED}`,
                        boxShadow: '0 30px 80px -30px rgba(252,97,97,.4), 0 0 0 6px rgba(252,97,97,.08)',
                        display: 'flex', flexDirection: 'column', position: 'relative',
                    }}>
                        <span style={{
                            position: 'absolute', top: -14, left: 36,
                            background: RED, color: '#fff',
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                            padding: '7px 14px', borderRadius: 999, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                        }}>
                            <Icon d={ICONS.spark} size={11} fill="currentColor" />
                            {TRIAL_DAYS} days free
                        </span>

                        <div style={{
                            fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: RED, marginBottom: 18, fontWeight: 600,
                        }}>Growth</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                            {yearly && (
                                <span style={{ fontFamily: SERIF, fontSize: 30, color: MUTED, textDecoration: 'line-through', lineHeight: 1 }}>
                                    {dollars(YEARLY_FULL_PRICE_CENTS)}
                                </span>
                            )}
                            <span style={{
                                fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: INK,
                                letterSpacing: '-.03em', lineHeight: 1
                            }}>{dollars(yearly ? GROWTH_YEARLY_CENTS : GROWTH_MONTHLY_CENTS)}</span>
                            <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED, fontWeight: 500 }}>/{yearly ? 'year' : 'month'}</span>
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 8 }}>
                            {yearly
                                ? <>That&apos;s {yearlyPerMonth()}/mo — <strong style={{ color: INK }}>{YEARLY_FREE_MONTHS} months free</strong>, you save {dollars(YEARLY_SAVINGS_CENTS)}</>
                                : <>Cancel anytime · or {dollars(GROWTH_YEARLY_CENTS)}/yr and save {YEARLY_SAVINGS_PERCENT}%</>}
                        </div>

                        <a href={`/register?subscription=${interval}`} style={{
                            marginTop: 28, fontFamily: SANS, fontWeight: 600, fontSize: 14,
                            background: RED, color: '#fff', border: 'none',
                            padding: '14px 22px', borderRadius: 999, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            textDecoration: 'none',
                        }}>
                            Start your {TRIAL_DAYS}-day free trial
                            <Icon d={ICONS.arrow} size={14} stroke={2} />
                        </a>
                        <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: 10, textAlign: 'center' }}>
                            No credit card to start · card processing 2.9% + 30¢ at cost
                        </div>

                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                            color: MUTED, margin: '32px 0 16px', fontWeight: 600,
                        }}>Everything included</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {growth.map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 14, color: INK }}>
                                    <Check dark />{f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* STARTER */}
                    <div className="aa-pricing-card" style={{
                        background: '#fff', borderRadius: 24, padding: '40px 36px',
                        border: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{
                            fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: MUTED, marginBottom: 18, fontWeight: 600,
                        }}>Starter</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontFamily: SERIF, fontSize: 60, fontWeight: 400, color: INK, letterSpacing: '-.03em', lineHeight: 1 }}>$0</span>
                            <span style={{ fontFamily: SANS, fontSize: 14, color: MUTED, fontWeight: 500 }}>/month</span>
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 8 }}>
                            Free forever · 1% per card payment
                        </div>

                        <a href="/register" style={{
                            marginTop: 28, fontFamily: SANS, fontWeight: 600, fontSize: 14,
                            background: WARM, color: INK, border: `1.5px solid ${INK}`,
                            padding: '14px 22px', borderRadius: 999, cursor: 'pointer',
                            display: 'inline-block', textDecoration: 'none', textAlign: 'center',
                        }}>Start free</a>
                        <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, marginTop: 10, textAlign: 'center' }}>
                            Every account starts with {TRIAL_DAYS} days of Growth
                        </div>

                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                            color: MUTED, margin: '32px 0 16px', fontWeight: 600,
                        }}>Good for getting started</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {starter.map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 14, color: INK }}>
                                    <Check />{f}
                                </li>
                            ))}
                        </ul>
                        <div style={{
                            marginTop: 'auto', paddingTop: 28, fontFamily: SANS, fontSize: 13, color: MUTED, lineHeight: 1.55,
                        }}>
                            Once you&apos;re collecting about {dollars(GROWTH_MONTHLY_CENTS * 100)} a month by card, the 1% costs as much as Growth — so Growth pays for itself.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FEE TRANSPARENCY — calculator + comparison
// ─────────────────────────────────────────────────────────────
function FeeNumberInput({ label, value, onChange, prefix }: { label: string; value: number; onChange: (n: number) => void; prefix?: string }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{
                fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
                textTransform: 'uppercase', color: MUTED, display: 'block', marginBottom: 8,
            }}>{label}</label>
            <div style={{ position: 'relative' }}>
                {prefix && (
                    <span style={{
                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                        fontFamily: SANS, fontSize: 15, color: INK, fontWeight: 600, pointerEvents: 'none',
                    }}>{prefix}</span>
                )}
                <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={value}
                    onChange={e => onChange(Math.max(0, Number(e.target.value)))}
                    style={{
                        width: '100%', height: 44, paddingLeft: prefix ? 28 : 14, paddingRight: 14,
                        border: `1px solid ${LINE}`, borderRadius: 8,
                        fontFamily: SANS, fontSize: 15, color: INK, background: '#fff', outline: 'none',
                    }}
                />
            </div>
        </div>
    )
}

function FeeTransparency() {
    const [amount, setAmount] = useState(150)
    const [payments, setPayments] = useState(27)

    const safe = Math.max(0, amount || 0)
    const stripeFee = safe * STRIPE_PROCESSING_PERCENT + STRIPE_PROCESSING_FIXED_CENTS / 100
    const payout = Math.max(0, safe - stripeFee)
    const usage = { payments: Math.max(0, payments || 0), average: safe }

    const compare: { model: CostModel; highlight?: boolean }[] = [
        { model: AFROALLURE_GROWTH_YEARLY, highlight: true },
        { model: AFROALLURE_GROWTH_MONTHLY },
        { model: STYLESEAT },
        { model: GLOSSGENIUS },
        { model: ACUITY },
    ]

    return (
        <section className="aa-section" style={{ background: WARM, padding: '80px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: RED, marginBottom: 16, fontWeight: 600,
                }}>Pricing Transparency</div>
                <h2 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(32px, 4vw, 52px)', lineHeight: 1.05,
                    letterSpacing: '-.025em', margin: 0, color: INK,
                }}>
                    Understand exactly what you take home.
                </h2>

                <div className="aa-fee-grid">
                    {/* LEFT — Calculator */}
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: MUTED, marginBottom: 10, fontWeight: 600,
                        }}>How our fees work</div>
                        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, letterSpacing: '-.015em', marginBottom: 8, color: INK }}>
                            The breakdown
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: MUTED, marginBottom: 24 }}>
                            Put in your own numbers. On Growth, the only thing taken from a payment is Stripe&apos;s card processing, at cost.
                        </div>

                        <FeeNumberInput label="Your average service price" prefix="$" value={amount} onChange={setAmount} />
                        <FeeNumberInput label="Card payments a month" value={payments} onChange={setPayments} />

                        <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 16, padding: 20 }}>
                            <div style={{
                                fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
                                color: MUTED, fontWeight: 600, marginBottom: 12,
                            }}>
                                On a ${safe.toFixed(2)} service, on Growth
                            </div>
                            {[
                                { label: 'Client pays', value: `$${safe.toFixed(2)}`, muted: false },
                                { label: 'Card processing (Stripe, at cost: 2.9% + $0.30)', value: `-$${stripeFee.toFixed(2)}`, muted: true },
                                { label: 'AfroAllure fee', value: '$0.00', muted: true },
                            ].map(({ label, value, muted }, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                                    padding: '10px 0', borderBottom: '1px solid rgba(232,226,214,0.5)',
                                }}>
                                    <span style={{ fontFamily: SANS, fontSize: 14, color: muted ? MUTED : INK }}>{label}</span>
                                    <span style={{ fontFamily: SANS, fontSize: 14, color: muted ? MUTED : INK, fontWeight: 500 }}>{value}</span>
                                </div>
                            ))}
                            <hr style={{ border: 'none', borderTop: `1px solid ${LINE}`, margin: '4px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                                <span style={{ fontFamily: SANS, fontSize: 14, color: INK, fontWeight: 600 }}>You receive</span>
                                <span style={{ fontFamily: SERIF, fontSize: 22, color: INK, fontWeight: 700, letterSpacing: '-.01em' }}>
                                    ${payout.toFixed(2)}
                                </span>
                            </div>
                            <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
                                On the free Starter plan, 1% more (${(safe * STARTER_PLATFORM_FEE_PERCENT).toFixed(2)}) is taken.
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Comparison */}
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: MUTED, marginBottom: 10, fontWeight: 600,
                        }}>The alternatives</div>
                        <div style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 500, letterSpacing: '-.015em', marginBottom: 8, color: INK }}>
                            What you&apos;d pay each month
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: MUTED, marginBottom: 20 }}>
                            Plan price plus card fees on ${(usage.payments * safe).toLocaleString('en-US', { maximumFractionDigits: 0 })} a month in card payments.
                        </div>

                        <div style={{ border: `1px solid ${LINE}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
                            {compare.map(({ model, highlight }, i) => (
                                <div key={model.name + model.planLabel} style={{
                                    display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
                                    padding: '14px 18px',
                                    background: highlight ? 'rgba(252,97,97,0.05)' : 'transparent',
                                    borderBottom: i < compare.length - 1 ? `1px solid ${LINE}` : 'none',
                                }}>
                                    <div>
                                        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: highlight ? RED : INK }}>{model.name}</div>
                                        <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>
                                            {model.planLabel} · {(model.cardPercent * 100).toFixed(1)}%{model.cardFixed ? ` + ${Math.round(model.cardFixed * 100)}¢` : ''} per card payment
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: SERIF, fontSize: 20, color: INK, whiteSpace: 'nowrap' }}>
                                        ${monthlyCost(model, usage).toFixed(0)}<span style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>/mo</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p style={{ fontFamily: SANS, fontSize: 12, color: MUTED, fontStyle: 'italic', marginTop: 12, lineHeight: 1.5 }}>
                            Published pricing as of {COMPETITORS_CHECKED_ON}. StyleSeat also charges 30% of a new client&apos;s first visit (up to $50)
                            when its marketplace sends them. Acuity&apos;s Starter plan has no text reminders; its plan with them is $34/mo.
                            Card rates assume standard US cards. Cash payments have no fees anywhere.
                        </p>
                    </div>
                </div>

                <div style={{
                    marginTop: 40, background: 'rgba(201,151,74,0.08)',
                    border: '1px solid rgba(201,151,74,0.3)',
                    borderRadius: 12, padding: 20,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                    <Sparkles size={18} color="#C9974A" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontFamily: SANS, fontSize: 14, color: '#3A3532', lineHeight: 1.6, margin: 0 }}>
                        Why no percentage fee: you did the work, so the booking money is yours. Growth is one flat price —
                        it keeps AfroAllure running without taking a cut of your income as you grow.
                    </p>
                </div>
            </div>
        </section>
    )
}

// ─────────────────────────────────────────────────────────────
// FOUNDING MEMBER — warm white with thick gold border
// ─────────────────────────────────────────────────────────────
function Founding({ foundingMemberCount }: { foundingMemberCount: number }) {
    return (
        <section className="aa-section" style={{ background: WARM, padding: '40px 56px 120px' }}>
            <div className="aa-founding-card" style={{
                maxWidth: 1240, margin: '0 auto',
                background: '#fff',
                border: `3px solid ${GOLD}`,
                borderRadius: 28, padding: '72px 64px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Gold ornamental corners */}
                <svg viewBox="0 0 200 200" style={{
                    position: 'absolute', top: -40, right: -40, width: 280, height: 280,
                    opacity: .12, pointerEvents: 'none',
                }}>
                    {[...Array(8)].map((_, i) => (
                        <circle key={i} cx="100" cy="100" r={20 + i * 12}
                            fill="none" stroke={GOLD} strokeWidth="1" />
                    ))}
                </svg>

                <div className="aa-founding-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64, alignItems: 'center', position: 'relative' }}>
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: GOLD, color: '#fff',
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                            padding: '8px 14px', borderRadius: 999, fontWeight: 700, marginBottom: 28,
                        }}>
                            <Icon d={ICONS.crown} size={12} stroke={2} />
                            Founding member
                        </div>

                        <h2 style={{
                            fontFamily: SERIF, fontWeight: 400,
                            fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1,
                            letterSpacing: '-.025em', margin: 0, color: INK, textWrap: 'balance',
                        }}>
                            Lock in your rate.<br />
                            <em style={{ fontStyle: 'italic', color: GOLD }}>Forever.</em>
                        </h2>

                        <div style={{
                            fontFamily: SANS, fontSize: 16, lineHeight: 1.65, color: '#3A3532',
                            marginTop: 28, fontWeight: 400, maxWidth: 560,
                        }}>
                            <p style={{ margin: '0 0 14px' }}>
                                Growth is $25/mo today and is going up for new members. Founding members keep
                                $25/mo — or $250/yr — for as long as they stay subscribed, no matter what AfroAllure
                                charges later. First in the marketplace when it launches. Your badge on your public
                                page, permanently.
                            </p>
                            <p style={{ margin: 0, color: MUTED }}>
                                Only 250 spots. Once they're gone, this offer doesn't come back.
                            </p>
                        </div>

                        <div className="aa-founding-cta" style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                            <a href="/register" style={{
                                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                                background: INK, color: WARM, border: 'none',
                                padding: '15px 24px', borderRadius: 999, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                textDecoration: 'none',
                            }}>
                                Become a Founding Member
                                <Icon d={ICONS.arrow} size={16} stroke={2} />
                            </a>
                            <span style={{
                                fontFamily: MONO, fontSize: 11, letterSpacing: '.14em',
                                textTransform: 'uppercase', color: MUTED,
                            }}>
                                {foundingMemberCount} / 250 spots claimed
                            </span>
                        </div>
                    </div>

                    {/* Right: founding member benefits */}
                    <div style={{
                        background: WARM, borderRadius: 20, padding: 32,
                        border: `1px solid ${LINE}`,
                    }}>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                            color: GOLD, fontWeight: 700, marginBottom: 20,
                        }}>What's included</div>
                        <ul style={{
                            listStyle: 'none', padding: 0, margin: 0,
                            display: 'flex', flexDirection: 'column', gap: 18
                        }}>
                            {[
                                ['First-listed in marketplace', 'When it opens'],
                                [`${TRIAL_DAYS} days free`, 'Every feature, no card needed'],
                                ['Rate locked forever', '$25/mo or $250/yr — always'],
                                ['Founding-member badge', 'On your public page'],
                                ['Priority support', 'Direct access to the team'],
                            ].map(([t, d], i) => (
                                <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                    <span style={{
                                        width: 22, height: 22, borderRadius: '50%',
                                        background: GOLD, color: '#fff', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon d={ICONS.check} size={12} stroke={2.5} />
                                    </span>
                                    <div>
                                        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK }}>{t}</div>
                                        <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED }}>{d}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FINAL CTA — dark
// ─────────────────────────────────────────────────────────────
function FinalCTA() {
    return (
        <section className="aa-section" style={{ background: DARK, color: WARM, padding: '120px 56px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 60% 80% at 50% 100%, rgba(252,97,97,.18), transparent 60%)`,
                pointerEvents: 'none',
            }} />
            <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'rgba(250,247,242,.5)', marginBottom: 28,
                }}>
                    <span style={{ color: RED }}>Founding spots</span> &nbsp; closing soon
                </div>
                <h2 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(46px, 6vw, 84px)', lineHeight: .98, letterSpacing: '-.03em',
                    margin: 0, color: WARM, textWrap: 'balance',
                }}>
                    Your first month is free. The founding<br />
                    spots <em style={{ fontStyle: 'italic', color: GOLD }}>won't last.</em>
                </h2>
                <p style={{
                    fontFamily: SANS, fontSize: 17, lineHeight: 1.55,
                    color: 'rgba(250,247,242,.75)',
                    margin: '24px auto 40px', maxWidth: 560, fontWeight: 400,
                }}>
                    Every feature free for {TRIAL_DAYS} days, no card needed. Join now to lock in $25/mo forever
                    and be first in the marketplace at launch.
                </p>

                <a href="/register" style={{
                    fontFamily: SANS, fontWeight: 600, fontSize: 16,
                    background: RED, color: '#fff', border: 'none',
                    padding: '17px 30px', borderRadius: 999, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    textDecoration: 'none',
                }}>
                    Start Booking with AfroAllure
                    <Icon d={ICONS.arrow} size={16} stroke={2} />
                </a>

                <div style={{
                    marginTop: 24, fontFamily: SANS, fontSize: 13,
                    color: 'rgba(250,247,242,.55)',
                }}>
                    No credit card · No percentage fees on Growth · Built in Florida
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FOOTER (same as landing)
// ─────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="aa-section" style={{
            background: DARK, color: WARM, padding: '64px 56px 48px',
            borderTop: '1px solid rgba(250,247,242,.08)'
        }}>
            <div className="aa-footer-grid" style={{
                maxWidth: 1240, margin: '0 auto',
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 48,
                paddingBottom: 48, borderBottom: '1px solid rgba(250,247,242,.1)',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                        <div>
                            <Image style={{ filter: 'brightness(0) invert(1)' }}
                                src={LOGO} alt="logo-img" width={150} />
                        </div>
                    </div>
                    <p style={{
                        fontFamily: SERIF, fontSize: 18, color: 'rgba(250,247,242,.7)',
                        margin: 0, fontStyle: 'italic', maxWidth: 320, lineHeight: 1.4
                    }}>
                        The platform Black beauty was waiting for.
                    </p>
                </div>
                <div>
                    <div style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: '.16em',
                        textTransform: 'uppercase', color: 'rgba(250,247,242,.5)', marginBottom: 18
                    }}>Platform</div>
                    <ul style={{
                        listStyle: 'none', padding: 0, margin: 0,
                        display: 'flex', flexDirection: 'column', gap: 12, fontFamily: SANS, fontSize: 14
                    }}>
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>Features</a></li>
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>Marketplace</a></li>
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>For Businesses</a></li>
                        <li><a href="/founding-members" style={{ color: 'rgba(250,247,242,.85)', textDecoration: 'none' }}>Founding Members</a></li>
                        <li><a href="/switch/styleseat" style={{ color: 'rgba(250,247,242,.85)', textDecoration: 'none' }}>Switching from StyleSeat</a></li>
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>Register</a></li>
                    </ul>
                </div>
                <div>
                    <div style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: '.16em',
                        textTransform: 'uppercase', color: 'rgba(250,247,242,.5)', marginBottom: 18
                    }}>Reach us</div>
                    <ul style={{
                        listStyle: 'none', padding: 0, margin: 0,
                        display: 'flex', flexDirection: 'column', gap: 12, fontFamily: SANS, fontSize: 14
                    }}>
                        <li><a href="https://instagram.com/afroallure_" style={{ color: 'rgba(250,247,242,.85)' }}>Instagram</a></li>
                        <li><a href="mailto:abijahnesbitt@afroallure.co" style={{ color: 'rgba(250,247,242,.85)' }}>abijahnesbitt@afroallure.co</a></li>
                    </ul>
                </div>
            </div>
            <div className="aa-footer-bottom" style={{
                maxWidth: 1240, margin: '0 auto', paddingTop: 24,
                display: 'flex', justifyContent: 'space-between',
                fontFamily: MONO, fontSize: 11, color: 'rgba(250,247,242,.4)',
                letterSpacing: '.08em',
            }}>
                <span>© 2026 AfroAllure, Inc.</span>
                <span>Made with care · Florida &amp; everywhere</span>
            </div>
        </footer>
    );
}

// ─────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────
function AfroAllureBusiness({ isLoggedIn = false, foundingMemberCount = 0 }: { isLoggedIn?: boolean; foundingMemberCount?: number }) {
    useEffect(() => {
        const cleanup = () => {
            document.body.style.pointerEvents = ''
            document.body.removeAttribute('data-scroll-locked')
            document.body.removeAttribute('aria-hidden')
        }
        const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload() }
        window.addEventListener('pageshow', handlePageShow)
        cleanup()
        return () => window.removeEventListener('pageshow', handlePageShow)
    }, [])

    return (
        <div className="aa-business-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
            <MobileNav isLoggedIn={isLoggedIn} />
            <Hero isLoggedIn={isLoggedIn} foundingMemberCount={foundingMemberCount} />
            <Features />
            <WhyAfroAllure />
            <Pricing />
            <FeeTransparency />
            <Founding foundingMemberCount={foundingMemberCount} />
            <FinalCTA />
            <Footer />
        </div>
    );
}
export default AfroAllureBusiness;
