// AfroAllure — Main Landing Page
// Editorial, warm, confident. Lead with operational pain, identity second.
'use client'
import './landingPage.css'
import { useState, useEffect, useRef } from "react";
import LOGO from '../../public/images/logo_transparent_background.png'
import Image from "next/image";
import { Menu, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { joinClientWaitlist } from '@/app/waitlist/actions';



const RED = '#FC6161';
const DARK = '#0F0E0E';
const WARM = '#FAF7F2';
const GOLD = '#C9974A';
const INK = '#1A1818';
const MUTED = '#6F6863';
const LINE = '#E8E2D6';

const SERIF = "'Fraunces', 'Times New Roman', serif";
const SANS = "'Inter', system-ui, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";





// ─────────────────────────────────────────────────────────────
// ICONS — simple inline SVGs, stroke-based
// ─────────────────────────────────────────────────────────────
const Icon = ({ d, size = 22, stroke = 1.6, fill = 'none' }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
        strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {typeof d === 'string' ? <path d={d} /> : d}
    </svg>
);

const ICONS = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    card: <><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M2 11h20M6 16h4" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></>,
    page: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9.5" r="2.5" /><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M21 20c0-2.5-1.7-4-4.5-4" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" fill="currentColor" />,
    spark: <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" fill="currentColor" />,
    check: <path d="M5 12l5 5L20 7" />,
};

// ─────────────────────────────────────────────────────────────
// SHARED — buttons, placeholder
// ─────────────────────────────────────────────────────────────
const Btn = ({ children, primary, light, dark, outline, onLight, full, sm, ...p }: any) => {
    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: SANS, fontWeight: 600, fontSize: sm ? 13 : 15,
        padding: sm ? '10px 18px' : '14px 22px',
        borderRadius: 999, border: '1.5px solid transparent',
        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
        letterSpacing: '-.005em', transition: 'transform .15s',
        width: full ? '100%' : 'auto',
    } as any;
    let style = { ...base };
    if (primary) style = { ...style, background: RED, color: '#fff' };
    else if (light) style = { ...style, background: WARM, color: INK };
    else if (dark) style = { ...style, background: INK, color: WARM };
    else if (outline && onLight) style = { ...style, background: 'transparent', color: INK, borderColor: INK };
    else if (outline) style = { ...style, background: 'transparent', color: WARM, borderColor: 'rgba(250,247,242,.4)' };
    else style = { ...style, background: INK, color: WARM };
    return <button style={style} {...p}>{children}<Icon d={ICONS.arrow} size={16} stroke={2} /></button>;
};

// Tonal warm-color placeholder
const Placeholder = ({ label, h = 200, tone = 'warm', radius = 16, style = {} }: any) => {
    const tones = {
        warm: { bg: '#E8DCC8', fg: '#7A5A3A' },
        rose: { bg: '#F2C8C8', fg: '#8C3838' },
        gold: { bg: '#E8CFA0', fg: '#5C401A' },
        cocoa: { bg: '#3E2A1E', fg: '#D9B687' },
        cream: { bg: '#F2E9D8', fg: '#8C7253' },
        noir: { bg: '#1A1614', fg: '#C9974A' },
    } as any;
    const c = tones[tone] || tones.warm;
    return (
        <div style={{
            height: h, width: '100%', background: c.bg, borderRadius: radius,
            display: 'flex', alignItems: 'flex-end', padding: 14, ...style,
        }}>
            <span style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
                textTransform: 'uppercase', color: c.fg, fontWeight: 600,
            }}>{label}</span>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────────────────────
function MobileNav() {
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
            backgroundColor: WARM, borderBottom: `1px solid ${LINE}`,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px' }}>
                <Image src={LOGO} alt="AfroAllure" width={130} />
                <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK, display: 'flex' }}>
                    <Menu size={24} />
                </button>
            </div>
            {open && (
                <div style={{ background: '#fff', borderBottom: `1px solid ${LINE}` }}>
                    {[{ label: 'Marketplace', href: '#marketplace' }, { label: 'For Businesses', href: '/for-businesses' }].map(({ label, href }) => (
                        <a key={label} href={href} onClick={() => setOpen(false)} style={{
                            display: 'block', padding: '16px 24px',
                            fontFamily: SANS, fontSize: 15, color: INK,
                            borderBottom: `1px solid ${LINE}`, textDecoration: 'none',
                        }}>{label}</a>
                    ))}
                    <div style={{ padding: '16px 24px' }}>
                        <a href="/register" onClick={() => setOpen(false)} style={{
                            display: 'block', textAlign: 'center',
                            background: RED, color: '#fff',
                            fontFamily: SANS, fontWeight: 600, fontSize: 15,
                            padding: '14px', borderRadius: 999, textDecoration: 'none',
                        }}>Join Beta — Free</a>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
function Nav({ dark = false }) {
    const fg = dark ? WARM : INK;
    const muted = dark ? 'rgba(250,247,242,.7)' : MUTED;
    return (
        <nav className="aa-nav" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '22px 56px', borderBottom: `1px solid ${dark ? 'rgba(250,247,242,.08)' : LINE}`,
            background: dark ? DARK : WARM,
        }}>
            <a style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <div>
                    <Image src={LOGO} alt="logo-img" width={150} />
                </div>
            </a>
            <div className="aa-nav-links" style={{ display: 'flex', gap: 36, fontFamily: SANS, fontSize: 14, color: muted, fontWeight: 500 }}>
                <a href="#features">Features</a>
                <a>Marketplace</a>
                <a href="/for-businesses">For Businesses</a>
            </div>
            <a style={{
                fontFamily: SANS, fontWeight: 600, fontSize: 13,
                background: RED, color: '#fff', padding: '11px 18px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
                Join Beta — Free
            </a>
        </nav>
    );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────
function Hero({ openWaitlist }: { openWaitlist: () => void }) {
    return (
        <section className="aa-hero aa-section" style={{ padding: '80px 56px 96px', background: WARM, position: 'relative' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                {/* Eyebrow */}
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
                    color: MUTED, marginBottom: 28,
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED }} />
                    For clients · for stylists · one platform
                </div>

                {/* Headline */}
                <h1 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(54px, 7vw, 96px)', lineHeight: .98,
                    letterSpacing: '-.035em', margin: 0, color: INK,
                    maxWidth: 1100, textWrap: 'balance',
                }}>
                    Find your stylist.<br />
                    <em style={{ fontStyle: 'italic', color: RED }}>Get discovered.</em>
                </h1>

                {/* Subheadline */}
                <p style={{
                    fontFamily: SANS, fontSize: 19, lineHeight: 1.5, color: '#3A3532',
                    margin: '32px 0 40px', maxWidth: 600, fontWeight: 400,
                }}>
                    AfroAllure is building the first marketplace dedicated to Black beauty professionals.
                    Clients find the right stylist. Stylists get the visibility they deserve.
                    Be part of it from the beginning.
                </p>

                {/* CTAs */}
                <div className="aa-hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
                    <a href="/register" style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: SANS, fontWeight: 600, fontSize: 15,
                        padding: '14px 22px', borderRadius: 999, border: '1.5px solid transparent',
                        cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
                        background: RED, color: '#fff',
                    }}>
                        I&apos;m a Stylist — Join Free
                        <Icon d={ICONS.arrow} size={16} stroke={2} />
                    </a>
                    <button onClick={openWaitlist} style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontFamily: SANS, fontWeight: 600, fontSize: 15,
                        padding: '14px 22px', borderRadius: 999,
                        border: `1.5px solid ${INK}`,
                        cursor: 'pointer', background: 'transparent', color: INK,
                    }}>
                        I&apos;m Looking for a Stylist — Get Notified
                        <Icon d={ICONS.arrow} size={16} stroke={2} />
                    </button>
                </div>

                {/* Stats row */}
                <div className="aa-hero-stats" style={{
                    display: 'flex', gap: 40, flexWrap: 'wrap', paddingTop: 28,
                    borderTop: `1px solid ${LINE}`, maxWidth: 720, marginBottom: 80,
                }}>
                    {[
                        ['250', 'Founding stylist spots'],
                        ['$0', 'Setup fees'],
                        ['2', 'Communities we serve'],
                    ].map(([n, l], i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                            <span style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 500, color: INK, letterSpacing: '-.02em' }}>{n}</span>
                            <span style={{ fontFamily: SANS, fontSize: 13, color: MUTED, fontWeight: 500 }}>{l}</span>
                        </div>
                    ))}
                </div>

                {/* Dashboard mockup */}
                <DashboardMock />
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD MOCK — calendar + today's appointments + earnings
// ─────────────────────────────────────────────────────────────
function DashboardMock() {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = 3; // Thursday
    const appts = [
        { time: '10:00', name: 'Imani O.', service: 'Knotless braids — medium', tone: 'warm', amt: '$220' },
        { time: '12:30', name: 'Brielle T.', service: 'Silk press + trim', tone: 'rose', amt: '$110' },
        { time: '15:00', name: 'Ade K.', service: 'Color refresh', tone: 'gold', amt: '$165' },
    ];
    return (
        <div style={{
            background: '#fff', borderRadius: 24, padding: 24,
            boxShadow: '0 30px 80px -30px rgba(15,14,14,.25), 0 1px 0 rgba(15,14,14,.04)',
            border: `1px solid ${LINE}`,
            display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 1fr', gap: 20,
        }} className="aa-dashboard">
            {/* Side: profile + week */}
            <div style={{
                background: WARM, borderRadius: 16, padding: 22,
                display: 'flex', flexDirection: 'column', gap: 22,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: '50%', background: '#E8DCC8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: '#7A5A3A'
                    }}>N</div>
                    <div>
                        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK }}>Nia's Studio</div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase' }}>Stylist · Atlanta</div>
                    </div>
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 500, color: INK }}>This week</span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: MUTED }}>SEP</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                        {days.map((d, i) => (
                            <div key={i} style={{
                                textAlign: 'center', padding: '10px 0',
                                borderRadius: 8,
                                background: i === today ? INK : 'transparent',
                                color: i === today ? WARM : INK,
                                fontFamily: SANS, fontSize: 12, fontWeight: 600,
                            }}>
                                <div style={{ fontSize: 10, opacity: .6, marginBottom: 2 }}>{d}</div>
                                <div>{15 + i}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                        {[3, 5, 2, 6, 4, 1, 0].map((n, i) => (
                            <span key={i} style={{
                                flex: 1, height: 4, borderRadius: 2,
                                background: n === 0 ? LINE : i === today ? RED : '#D9C9B0',
                                opacity: i === today ? 1 : .55 + n * .05,
                            }} />
                        ))}
                    </div>
                    <div style={{
                        fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.12em',
                        textTransform: 'uppercase', marginTop: 6
                    }}>Bookings density</div>
                </div>

                <div style={{ marginTop: 'auto', padding: 14, borderRadius: 12, background: '#fff', border: `1px solid ${LINE}` }}>
                    <div style={{
                        fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.14em',
                        textTransform: 'uppercase', marginBottom: 6
                    }}>Next opening</div>
                    <div style={{ fontFamily: SERIF, fontSize: 18, color: INK, fontWeight: 500 }}>Tue · 11:30 am</div>
                </div>
            </div>

            {/* Center: today's appointments */}
            <div style={{ padding: '4px 4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '.14em',
                            textTransform: 'uppercase', marginBottom: 4
                        }}>Thursday · today</div>
                        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: INK, letterSpacing: '-.01em' }}>
                            3 sittings booked
                        </div>
                    </div>
                    <span style={{
                        fontFamily: SANS, fontSize: 11, fontWeight: 600, color: RED,
                        background: 'rgba(252,97,97,.1)', padding: '6px 10px', borderRadius: 999,
                    }}>$495 expected</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {appts.map((a, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: 12, borderRadius: 12,
                            background: i === 0 ? '#FBF7EE' : 'transparent',
                            border: `1px solid ${i === 0 ? '#EDE3CD' : LINE}`,
                        }}>
                            <div style={{
                                width: 4, alignSelf: 'stretch', borderRadius: 2,
                                background: i === 0 ? RED : '#D9C9B0'
                            }} />
                            <div style={{ fontFamily: MONO, fontSize: 11, color: INK, fontWeight: 600, minWidth: 44 }}>{a.time}</div>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: a.tone === 'warm' ? '#E8DCC8' : a.tone === 'rose' ? '#F2C8C8' : '#E8CFA0',
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: INK }}>{a.name}</div>
                                <div style={{
                                    fontFamily: SANS, fontSize: 11, color: MUTED, whiteSpace: 'nowrap',
                                    overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>{a.service}</div>
                            </div>
                            <div style={{ fontFamily: SERIF, fontSize: 16, color: INK, fontWeight: 500 }}>{a.amt}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: earnings */}
            <div className="aa-dashboard-earnings" style={{
                background: INK, color: WARM, borderRadius: 16, padding: 22,
                display: 'flex', flexDirection: 'column', gap: 18,
            }}>
                <div>
                    <div style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: '.14em',
                        textTransform: 'uppercase', color: 'rgba(250,247,242,.55)', marginBottom: 8
                    }}>This month</div>
                    <div style={{ fontFamily: SERIF, fontSize: 38, fontWeight: 400, letterSpacing: '-.02em', color: WARM }}>
                        $4,820
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: '#7BD8A0', marginTop: 4, fontWeight: 500 }}>
                        ↑ 18% vs August
                    </div>
                </div>

                {/* Mini bar chart */}
                <div style={{ display: 'flex', alignItems: 'end', gap: 6, height: 80 }}>
                    {[35, 52, 41, 68, 48, 72, 58, 84, 62, 90, 76, 95].map((h, i) => (
                        <div key={i} style={{
                            flex: 1, height: `${h}%`, borderRadius: 3,
                            background: i === 11 ? RED : `rgba(250,247,242,${.15 + h / 200})`,
                        }} />
                    ))}
                </div>

                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: 14, borderTop: '1px solid rgba(250,247,242,.1)'
                }}>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 9, letterSpacing: '.12em',
                            textTransform: 'uppercase', color: 'rgba(250,247,242,.5)'
                        }}>Deposits</div>
                        <div style={{ fontFamily: SERIF, fontSize: 18, color: WARM, marginTop: 4 }}>$960</div>
                    </div>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 9, letterSpacing: '.12em',
                            textTransform: 'uppercase', color: 'rgba(250,247,242,.5)'
                        }}>Clients</div>
                        <div style={{ fontFamily: SERIF, fontSize: 18, color: WARM, marginTop: 4 }}>34</div>
                    </div>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 9, letterSpacing: '.12em',
                            textTransform: 'uppercase', color: 'rgba(250,247,242,.5)'
                        }}>Repeat</div>
                        <div style={{ fontFamily: SERIF, fontSize: 18, color: WARM, marginTop: 4 }}>71%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PROBLEM SECTION (dark)
// ─────────────────────────────────────────────────────────────
function Problem() {
    return (
        <section className="aa-section" style={{ background: DARK, color: WARM, padding: '120px 56px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'rgba(250,247,242,.5)', marginBottom: 32,
                }}>
                    <span style={{ color: RED }}>02</span> &nbsp; The problem
                </div>
                <h2 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(40px, 5.2vw, 68px)', lineHeight: 1.02,
                    letterSpacing: '-.025em', margin: 0, color: WARM, maxWidth: 1000,
                    textWrap: 'balance',
                }}>
                    You've got the talent. The<br />
                    algorithm wasn't <em style={{ fontStyle: 'italic', color: GOLD }}>built for you.</em>
                </h2>

                <div className="aa-problem-grid" style={{
                    marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80,
                    fontFamily: SERIF, fontSize: 21, lineHeight: 1.55, color: 'rgba(250,247,242,.82)',
                    fontWeight: 400,
                }}>
                    <p style={{ margin: 0, textWrap: 'pretty' }}>
                        Search for "stylist near me" in Athens, Madison, or any college town
                        and you'll see ten of the same salons — none of them yours. Black beauty
                        pros are doing extraordinary work in cities that pretend they aren't there.
                        The discovery layer has been broken for a long time, and platforms built
                        for the "general market" have never seriously tried to fix it.
                    </p>
                    <p style={{ margin: 0, textWrap: 'pretty' }}>
                        Meanwhile, you're running a business across DMs, Cash App requests,
                        a screenshot of your hours, and a Notes app full of client preferences.
                        Every booking is a thread. Every deposit is a favor. The tools weren't
                        made for how you actually work — so you've been duct-taping a business
                        together. That stops here.
                    </p>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────────
function Features() {
    const feats = [
        {
            i: ICONS.calendar, t: 'Smart Booking System',
            d: 'Set your hours, services, and buffers once. Clients book themselves — no more DM tag.'
        },
        {
            i: ICONS.card, t: 'Payments & Deposits',
            d: 'Take deposits at booking. Cards, Apple Pay, Cash App. Cancellation policy handled.'
        },
        {
            i: ICONS.chart, t: 'Business Analytics',
            d: 'See what services pay best, who your repeat clients are, and what to raise prices on.'
        },
        {
            i: ICONS.page, t: 'Free Booking Page',
            d: 'Your own page at yourname.afroallure.site. Designed to convert, not to look generic.'
        },
        {
            i: ICONS.bell, t: 'Automated Reminders',
            d: 'Email and SMS reminders go out for you. Less ghosting, fewer empty chairs.'
        },
        {
            i: ICONS.users, t: 'Client Management',
            d: 'Notes on hair history, allergies, preferences — right where you need them, every booking.'
        },
    ];

    return (
        <section className="aa-section" id="features" style={{ background: WARM, padding: '120px 56px' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto' }}>
                <div className="aa-features-header" style={{
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: 48, marginBottom: 64, flexWrap: 'wrap',
                }}>
                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                            color: RED, marginBottom: 24, fontWeight: 600,
                        }}>
                            <span style={{ color: MUTED }}>03 &nbsp;</span> Features
                        </div>
                        <h2 style={{
                            fontFamily: SERIF, fontWeight: 400,
                            fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.02,
                            letterSpacing: '-.025em', margin: 0, color: INK, textWrap: 'balance',
                            maxWidth: 700,
                        }}>
                            Everything you need.<br />
                            <em style={{ fontStyle: 'italic' }}>Nothing you don't.</em>
                        </h2>
                    </div>
                    <p style={{
                        fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: MUTED,
                        maxWidth: 360, margin: 0, fontWeight: 400,
                    }}>
                        Six tools, one platform. Built around the workflow of independent stylists,
                        not the workflow of a venture-backed booking app.
                    </p>
                </div>

                <div className="aa-features-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
                    border: `1px solid ${LINE}`, borderRadius: 24, overflow: 'hidden', background: '#fff',
                }}>
                    {feats.map((f, i) => (
                        <div key={i} className="aa-features-cell" style={{
                            padding: '36px 32px 40px',
                            borderRight: i % 3 !== 2 ? `1px solid ${LINE}` : 'none',
                            borderBottom: i < 3 ? `1px solid ${LINE}` : 'none',
                            minHeight: 220,
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: WARM, color: INK,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 22,
                            }}>
                                <Icon d={f.i} size={22} stroke={1.6} />
                            </div>
                            <div style={{
                                fontFamily: SERIF, fontSize: 22, fontWeight: 500, color: INK,
                                letterSpacing: '-.015em', marginBottom: 10,
                            }}>{f.t}</div>
                            <div style={{
                                fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: MUTED, fontWeight: 400,
                            }}>{f.d}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// MARKETPLACE — search-result list with filters
// ─────────────────────────────────────────────────────────────
function Marketplace({ openWaitlist }: { openWaitlist: () => void }) {
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '120px 56px' }}>
            <div className="aa-marketplace-grid" style={{
                maxWidth: 1240, margin: '0 auto',
                display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 80, alignItems: 'center',
            }}>
                {/* Left: text */}
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(201,151,74,.12)', color: GOLD,
                        fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
                        padding: '7px 12px', borderRadius: 999, fontWeight: 700, marginBottom: 28,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
                        In development
                    </div>

                    <h2 style={{
                        fontFamily: SERIF, fontWeight: 400,
                        fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 1, letterSpacing: '-.025em',
                        margin: 0, color: INK, textWrap: 'balance',
                    }}>
                        Your spot in the<br />
                        Black beauty <em style={{ fontStyle: 'italic' }}>directory.</em>
                    </h2>

                    <div style={{
                        fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: '#3A3532',
                        marginTop: 28, fontWeight: 400, maxWidth: 500,
                    }}>
                        <p style={{ margin: '0 0 18px' }}>
                            Stop settling for whoever shows up on StyleSeat. AfroAllure is building a directory of
                            Black beauty professionals with real specialty filters — locs, knotless, silk press,
                            color, barbering. Find exactly who you&apos;re looking for, exactly where you are.
                        </p>
                        <p style={{ margin: 0 }}>
                            When the marketplace launches, founding members are listed first. Join free during beta
                            and claim your spot before anyone else.
                        </p>
                    </div>

                    <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        <a href="/register" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            fontFamily: SANS, fontWeight: 600, fontSize: 15,
                            padding: '14px 22px', borderRadius: 999, border: '1.5px solid transparent',
                            cursor: 'pointer', textDecoration: 'none',
                            background: RED, color: '#fff',
                        }}>
                            I&apos;m a Stylist — Claim My Spot
                            <Icon d={ICONS.arrow} size={16} stroke={2} />
                        </a>
                        <button onClick={openWaitlist} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            fontFamily: SANS, fontWeight: 600, fontSize: 15,
                            padding: '14px 22px', borderRadius: 999,
                            border: `1.5px solid ${INK}`,
                            cursor: 'pointer', background: 'transparent', color: INK,
                        }}>
                            Notify Me When It Launches
                            <Icon d={ICONS.arrow} size={16} stroke={2} />
                        </button>
                    </div>

                    <div style={{
                        marginTop: 24, fontFamily: MONO, fontSize: 11, letterSpacing: '.12em',
                        textTransform: 'uppercase', color: MUTED,
                    }}>
                        184 founding members so far
                    </div>
                </div>

                {/* Right: marketplace mock */}
                <MarketplaceMock />
            </div>
        </section>
    );
}

function MarketplaceMock() {
    const stylists = [
        { name: 'Imani Braiding Studio', loc: 'Athens, GA · 1.2 mi', tags: ['Knotless', 'Boho', 'Kids'], rating: 4.9, reviews: 142, tone: 'warm', founding: true },
        { name: 'House of Coil', loc: 'Athens, GA · 2.4 mi', tags: ['Locs', 'Twists', 'Color'], rating: 4.8, reviews: 89, tone: 'cocoa', founding: true },
        { name: 'Brielle · Silk Press', loc: 'Watkinsville · 4.1 mi', tags: ['Silk press', 'Trim'], rating: 5.0, reviews: 56, tone: 'rose' },
    ];
    return (
        <div style={{ position: 'relative' }}>
            {/* "Coming soon" tag */}
            <div className="aa-marketplace-coming" style={{
                position: 'absolute', top: -18, right: -18, zIndex: 2,
                background: GOLD, color: '#fff',
                fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                padding: '8px 14px', borderRadius: 999, fontWeight: 700,
                transform: 'rotate(3deg)',
                boxShadow: '0 8px 24px -8px rgba(201,151,74,.5)',
            }}>
                Launching soon
            </div>

            <div className="aa-marketplace-mock" style={{
                background: WARM, borderRadius: 24, padding: 22,
                border: `1px solid ${LINE}`,
                boxShadow: '0 30px 80px -30px rgba(15,14,14,.18)',
                display: 'grid', gridTemplateColumns: '180px 1fr', gap: 18,
                // Slight blur to indicate "coming soon"
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Subtle "in development" overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, transparent 60%, rgba(250,247,242,.6))',
                    pointerEvents: 'none', zIndex: 1,
                }} />

                {/* Filters sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{
                        background: '#fff', borderRadius: 12, padding: '10px 12px',
                        display: 'flex', alignItems: 'center', gap: 8,
                        border: `1px solid ${LINE}`,
                    }}>
                        <span style={{ color: MUTED, display: 'flex' }}><Icon d={ICONS.search} size={14} stroke={2} /></span>
                        <span style={{ fontFamily: SANS, fontSize: 12, color: INK, fontWeight: 500 }}>Athens, GA</span>
                    </div>

                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.16em',
                            textTransform: 'uppercase', marginBottom: 10, fontWeight: 600
                        }}>Specialty</div>
                        {[
                            { l: 'Knotless braids', n: 24, on: true },
                            { l: 'Locs & twists', n: 18, on: false },
                            { l: 'Silk press', n: 12, on: true },
                            { l: 'Color', n: 9, on: false },
                            { l: 'Barbering', n: 31, on: false },
                        ].map((f, i) => (
                            <label key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                                fontFamily: SANS, fontSize: 12, color: INK, cursor: 'pointer',
                            }}>
                                <span style={{
                                    width: 14, height: 14, borderRadius: 4,
                                    border: `1.5px solid ${f.on ? RED : '#C9C2B5'}`,
                                    background: f.on ? RED : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {f.on && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
                                </span>
                                <span style={{ flex: 1 }}>{f.l}</span>
                                <span style={{ color: MUTED, fontSize: 10 }}>{f.n}</span>
                            </label>
                        ))}
                    </div>

                    <div>
                        <div style={{
                            fontFamily: MONO, fontSize: 9, color: MUTED, letterSpacing: '.16em',
                            textTransform: 'uppercase', marginBottom: 10, fontWeight: 600
                        }}>Distance</div>
                        <div style={{
                            height: 4, background: LINE, borderRadius: 2, position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', left: 0, width: '40%', height: '100%',
                                background: INK, borderRadius: 2,
                            }} />
                            <div style={{
                                position: 'absolute', left: '40%', top: -4, width: 12, height: 12,
                                borderRadius: '50%', background: RED, transform: 'translateX(-50%)',
                            }} />
                        </div>
                        <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, marginTop: 6 }}>Within 5 mi</div>
                    </div>
                </aside>

                {/* Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontFamily: SERIF, fontSize: 16, color: INK, fontWeight: 500 }}>
                            <em style={{ fontStyle: 'italic' }}>3</em> stylists in Athens, GA
                        </div>
                        <div style={{
                            fontFamily: MONO, fontSize: 10, color: MUTED, letterSpacing: '.12em',
                            textTransform: 'uppercase'
                        }}>Sort · Top rated</div>
                    </div>

                    {stylists.map((s, i) => (
                        <div key={i} style={{
                            background: '#fff', borderRadius: 12, padding: 14,
                            display: 'flex', gap: 14, alignItems: 'center',
                            border: `1px solid ${i === 0 ? '#EDE3CD' : LINE}`,
                            position: 'relative',
                        }}>
                            {s.founding && (
                                <span style={{
                                    position: 'absolute', top: 10, right: 12,
                                    fontFamily: MONO, fontSize: 8, letterSpacing: '.16em',
                                    textTransform: 'uppercase', fontWeight: 700, color: GOLD,
                                }}>★ Founding</span>
                            )}
                            <Placeholder label="" h={64} tone={s.tone} radius={10} style={{ width: 64, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: SERIF, fontSize: 16, color: INK, fontWeight: 500, marginBottom: 2 }}>
                                    {s.name}
                                </div>
                                <div style={{ fontFamily: SANS, fontSize: 11, color: MUTED, marginBottom: 6 }}>{s.loc}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: GOLD }}>
                                        <Icon d={ICONS.star} size={11} fill="currentColor" />
                                        <span style={{ fontFamily: SANS, fontSize: 11, color: INK, fontWeight: 600 }}>{s.rating}</span>
                                        <span style={{ fontFamily: SANS, fontSize: 10, color: MUTED }}>({s.reviews})</span>
                                    </span>
                                    {s.tags.map((t, j) => (
                                        <span key={j} style={{
                                            fontFamily: SANS, fontSize: 10, color: INK, fontWeight: 500,
                                            padding: '3px 8px', borderRadius: 999,
                                            background: '#F4EFE3',
                                        }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// BETA CTA SECTION
// ─────────────────────────────────────────────────────────────
function BetaCTA() {
    return (
        <section className="aa-section" style={{ background: RED, color: '#fff', padding: '120px 56px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                <div style={{
                    fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,.7)', marginBottom: 28,
                }}>
                    <span style={{ color: '#fff' }}>05</span> &nbsp; The offer
                </div>

                <h2 style={{
                    fontFamily: SERIF, fontWeight: 400,
                    fontSize: 'clamp(42px, 5.5vw, 72px)', lineHeight: 1, letterSpacing: '-.025em',
                    margin: 0, color: '#fff', textWrap: 'balance',
                }}>
                    The beta is free.<br />
                    The founding spots <em style={{ fontStyle: 'italic' }}>won't be.</em>
                </h2>

                <p style={{
                    fontFamily: SANS, fontSize: 17, lineHeight: 1.55,
                    color: 'rgba(255,255,255,.88)',
                    margin: '24px auto 40px', maxWidth: 540, fontWeight: 400,
                }}>
                    Full Growth-plan access during beta. Founding member listing in the
                    marketplace at launch. Direct line to the team building this. No card required.
                </p>

                {/* Email + button */}
                <form className="aa-cta-form" style={{
                    display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto',
                    background: '#fff', borderRadius: 999, padding: 6,
                    boxShadow: '0 20px 60px -20px rgba(15,14,14,.4)',
                }} onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="you@studio.com"
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            padding: '0 18px', fontFamily: SANS, fontSize: 15, color: INK,
                        }}
                    />
                    <button style={{
                        border: 'none', background: INK, color: '#fff',
                        fontFamily: SANS, fontWeight: 600, fontSize: 14,
                        padding: '12px 22px', borderRadius: 999, cursor: 'pointer',
                    }}>Claim Your Spot</button>
                </form>

                <a style={{
                    display: 'inline-block', marginTop: 22,
                    fontFamily: SANS, fontSize: 14, color: '#fff',
                    borderBottom: '1px solid rgba(255,255,255,.5)', paddingBottom: 2,
                }}>Or create your account now →</a>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer className="aa-section" style={{ background: DARK, color: WARM, padding: '64px 56px 48px' }}>
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
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>Instagram</a></li>
                        <li><a style={{ color: 'rgba(250,247,242,.85)' }}>hello@afroallure.com</a></li>
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
                <span>Made with care · Atlanta &amp; everywhere</span>
            </div>
        </footer>
    );
}

// ─────────────────────────────────────────────────────────────
// WAITLIST FORM
// ─────────────────────────────────────────────────────────────
function WaitlistForm({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || loading) return
        setLoading(true)
        try {
            const res = await joinClientWaitlist(email, city || undefined)
            setResult(res.duplicate ? 'duplicate' : 'success')
        } catch {
            setResult('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '8px 0' }}>
            <div style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase',
                color: RED, marginBottom: 16, fontWeight: 700,
            }}>Client Waitlist</div>
            <h3 style={{
                fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.1,
                letterSpacing: '-.02em', margin: '0 0 10px', color: INK,
            }}>
                Be first to find Black beauty professionals near you
            </h3>
            <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.6, color: MUTED, margin: '0 0 24px' }}>
                We'll notify you when the AfroAllure marketplace launches in your area.
            </p>

            {result === 'success' ? (
                <div style={{
                    background: 'rgba(201,151,74,.1)', border: `1px solid ${GOLD}`,
                    borderRadius: 12, padding: '18px 20px',
                    fontFamily: SANS, fontSize: 14, color: INK,
                }}>
                    You&apos;re on the list! We&apos;ll reach out when AfroAllure launches in your area.
                </div>
            ) : result === 'duplicate' ? (
                <div style={{
                    background: 'rgba(201,151,74,.1)', border: `1px solid ${GOLD}`,
                    borderRadius: 12, padding: '18px 20px',
                    fontFamily: SANS, fontSize: 14, color: INK,
                }}>
                    You&apos;re already on the list — we&apos;ll let you know when we launch near you.
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        type="email" required
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: `1px solid ${LINE}`, borderRadius: 10,
                            fontFamily: SANS, fontSize: 14, color: INK,
                            background: '#fff', outline: 'none',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Your city (optional)"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px',
                            border: `1px solid ${LINE}`, borderRadius: 10,
                            fontFamily: SANS, fontSize: 14, color: INK,
                            background: '#fff', outline: 'none',
                        }}
                    />
                    {result === 'error' && (
                        <p style={{ fontFamily: SANS, fontSize: 13, color: RED, margin: 0 }}>
                            Something went wrong. Please try again.
                        </p>
                    )}
                    <button type="submit" disabled={loading} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: RED, color: '#fff', border: 'none',
                        padding: '14px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: SANS, fontWeight: 600, fontSize: 15, opacity: loading ? 0.7 : 1,
                    }}>
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Notify Me
                    </button>
                </form>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────────
function AfroAllureLanding({ waitlistCount = 0 }: { waitlistCount?: number }) {
    const [waitlistOpen, setWaitlistOpen] = useState(false)
    const openWaitlist = () => setWaitlistOpen(true)

    useEffect(() => {
        const cleanup = () => {
            document.body.style.pointerEvents = ''
            document.body.removeAttribute('data-scroll-locked')
            document.body.removeAttribute('aria-hidden')
            setWaitlistOpen(false)
        }
        const handlePageShow = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload() }
        window.addEventListener('pageshow', handlePageShow)
        cleanup()
        return () => window.removeEventListener('pageshow', handlePageShow)
    }, [])

    return (
        <div className="aa-landing-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
            <MobileNav />
            <div className="aa-desktop-nav"><Nav /></div>
            <Hero openWaitlist={openWaitlist} />
            <Problem />
            <Features />
            <Marketplace openWaitlist={openWaitlist} />
            <BetaCTA />
            {waitlistCount > 0 && (
                <div style={{ textAlign: 'center', padding: '32px', background: WARM }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: MUTED, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                        {waitlistCount.toLocaleString()} clients waiting to find their stylist
                    </span>
                </div>
            )}
            <Footer />

            <Dialog open={waitlistOpen} onOpenChange={setWaitlistOpen}>
                <DialogContent style={{ maxWidth: 440 }}>
                    <WaitlistForm onClose={() => setWaitlistOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AfroAllureLanding;
