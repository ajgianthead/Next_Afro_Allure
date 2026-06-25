'use client'

import './dmBooking.css'
import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import LOGO from '../../../../public/images/logo_transparent_background.png'
import { HeroDemo, DmInboxDemo, AppointmentCreationDemo, DepositLinkDemo, ConfirmationDemo } from '@/components/marketing/demos'

const RED  = '#FC6161'
const DARK = '#0F0E0E'
const WARM = '#FAF7F2'
const GOLD = '#C9974A'
const INK  = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'

const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"
const MONO  = "ui-monospace, 'SF Mono', Menlo, monospace"

const CHECK_PATH = 'M5 12l5 5L20 7'
const ARROW_PATH = 'M5 12h14M13 6l6 6-6 6'
const CROWN_PATH = 'M3 9l3 8h12l3-8-5 3-4-6-4 6-5-3z'

const SvgIcon = ({ d, size = 20, stroke = 1.6, fill = 'none', color = 'currentColor' }: {
  d: string; size?: number; stroke?: number; fill?: string; color?: string
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

// ── Reusable eyebrow ───────────────────────────────────────────────
function Eyebrow({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
      textTransform: 'uppercase', fontWeight: 600, marginBottom: 22,
      color: light ? 'rgba(250,247,242,.55)' : MUTED,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0 }} />
      {text}
    </div>
  )
}

// ── Mobile nav ─────────────────────────────────────────────────────
function MobileNav() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  return (
    <div ref={ref} className="dm-mobile-nav" style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: DARK, borderBottom: '1px solid rgba(250,247,242,.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px' }}>
        <Image src={LOGO} alt="AfroAllure" width={120} style={{ filter: 'brightness(0) invert(1)' }} />
        <button onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: WARM, display: 'flex' }}>
          <Menu size={24} />
        </button>
      </div>
      {open && (
        <div style={{ background: '#1A1818', borderBottom: '1px solid rgba(250,247,242,.08)' }}>
          <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/login" onClick={() => setOpen(false)} style={{
              display: 'block', textAlign: 'center',
              color: WARM, border: '1.5px solid rgba(250,247,242,.3)',
              fontFamily: SANS, fontWeight: 600, fontSize: 15,
              padding: '13px', borderRadius: 999, textDecoration: 'none',
            }}>Login</a>
            <a href="/register"
              onClick={() => { setOpen(false); track('dm_booking_cta_click', { location: 'mobile_nav' }) }}
              style={{
                display: 'block', textAlign: 'center',
                background: RED, color: '#fff',
                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                padding: '14px', borderRadius: 999, textDecoration: 'none',
              }}>Start Free →</a>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Desktop nav ────────────────────────────────────────────────────
function DesktopNav() {
  return (
    <nav className="dm-nav" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 56px',
      borderBottom: '1px solid rgba(250,247,242,.08)',
      position: 'relative', zIndex: 5,
    }}>
      <Image src={LOGO} alt="AfroAllure" width={140} style={{ filter: 'brightness(0) invert(1)' }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <a href="/login" style={{
          fontFamily: SANS, fontWeight: 600, fontSize: 13,
          color: WARM, border: '1.5px solid rgba(250,247,242,.4)',
          padding: '9px 18px', borderRadius: 999, textDecoration: 'none',
        }}>Login</a>
        <a href="/register"
          onClick={() => track('dm_booking_cta_click', { location: 'nav' })}
          style={{
            fontFamily: SANS, fontWeight: 600, fontSize: 13,
            color: '#fff', background: RED,
            padding: '10px 18px', borderRadius: 999, textDecoration: 'none',
          }}>Start Free →</a>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ background: DARK, color: WARM, position: 'relative', overflow: 'hidden' }}>
      {/* Glow gradients */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 55% 70% at 85% 20%, rgba(252,97,97,.16), transparent 60%),
          radial-gradient(ellipse 70% 50% at 5% 95%,  rgba(201,151,74,.12), transparent 55%)
        `,
      }} />
      {/* Concentric circles — same texture as /for-businesses */}
      <svg viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid slice"
        style={{ position: 'absolute', right: -80, top: 40, width: 760, height: 560, opacity: .14, pointerEvents: 'none' }}>
        {[...Array(14)].map((_, i) => (
          <circle key={i} cx="900" cy="300" r={38 + i * 22}
            fill="none" stroke={i % 3 === 0 ? GOLD : WARM} strokeWidth={i % 3 === 0 ? 1.2 : .55} />
        ))}
      </svg>

      <div className="dm-desktop-nav"><DesktopNav /></div>

      <div className="dm-hero-inner" style={{
        maxWidth: 1240, margin: '0 auto', padding: '88px 56px 116px',
        position: 'relative', zIndex: 2,
      }}>
        <div className="dm-hero-split">
          {/* Left: copy */}
          <div className="dm-hero-copy">
            <Eyebrow text="For Black beauty professionals who book by DM" light />

            <h1 style={{
              fontFamily: SERIF, fontWeight: 400,
              fontSize: 'clamp(52px, 8vw, 108px)', lineHeight: .96,
              letterSpacing: '-.04em', margin: '0 0 32px', color: WARM,
            }}>
              Book by DM.<br />
              Get paid like<br />
              <em style={{ fontStyle: 'italic', color: RED }}>a business.</em>
            </h1>

            <p style={{
              fontFamily: SANS, fontSize: 18, lineHeight: 1.55,
              color: 'rgba(250,247,242,.75)', margin: '0 0 44px',
              maxWidth: 520, fontWeight: 400,
            }}>
              AfroAllure adds automatic deposit collection, appointment confirmations,
              and reminders to your existing DM workflow — without forcing you to
              change how clients reach you.
            </p>

            <div className="dm-hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="/register"
                onClick={() => track('dm_booking_cta_click', { location: 'hero_primary' })}
                style={{
                  fontFamily: SANS, fontWeight: 600, fontSize: 15,
                  background: RED, color: '#fff',
                  padding: '16px 26px', borderRadius: 999, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52,
                }}>
                Start Free
                <SvgIcon d={ARROW_PATH} size={15} stroke={2.2} color="#fff" />
              </a>
              <a href="#walkthrough"
                onClick={() => track('dm_booking_cta_click', { location: 'hero_secondary' })}
                style={{
                  fontFamily: SANS, fontWeight: 600, fontSize: 15,
                  color: WARM, border: '1.5px solid rgba(250,247,242,.38)',
                  padding: '14.5px 24px', borderRadius: 999, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', minHeight: 52,
                }}>
                See how it works
              </a>
            </div>
          </div>

          {/* Right: phone demo — desktop only, hidden via CSS on tablet/mobile */}
          <div className="dm-hero-visual">
            <HeroDemo />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Problem ────────────────────────────────────────────────────────
const PROBLEMS = [
  {
    title: 'The Manual Tracking',
    body: 'Every payment lives in a different app. Cash App. Zelle. Venmo. You\'re the one connecting the dots.',
  },
  {
    title: 'The Confirmation Chase',
    body: '"Did you get my deposit?" "Send me a screenshot." "What time was my appointment?" The same DMs every single week.',
  },
  {
    title: 'The Hidden Hours',
    body: 'Hours every week spent on admin instead of doing hair. Time you can\'t bill for.',
  },
]

function Problem() {
  return (
    <section className="dm-section" style={{ background: WARM, padding: '104px 56px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Eyebrow text="The Real Problem" />
        <h2 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.01,
          letterSpacing: '-.03em', margin: '0 0 56px', color: INK,
          maxWidth: 700,
        }}>
          Collecting the deposit is easy.<br />
          <em style={{ fontStyle: 'italic', color: RED }}>Managing it is exhausting.</em>
        </h2>

        <div className="dm-problem-grid">
          {PROBLEMS.map((p, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 20, padding: '32px 28px',
              border: `1px solid ${LINE}`,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '.18em',
                textTransform: 'uppercase', color: RED, fontWeight: 700,
                marginBottom: 14,
              }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 500,
                letterSpacing: '-.015em', color: INK, marginBottom: 12,
                lineHeight: 1.1,
              }}>{p.title}</div>
              <p style={{
                fontFamily: SANS, fontSize: 14, lineHeight: 1.65,
                color: MUTED, margin: 0,
              }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Walkthrough ────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Client DMs you',
    body: 'Same as always. You don\'t change a thing about how clients reach you.',
    demo: <DmInboxDemo />,
  },
  {
    n: '02',
    title: 'You create the appointment',
    body: 'Open AfroAllure. Add the client, service, and deposit amount. Takes 30 seconds.',
    demo: <AppointmentCreationDemo />,
  },
  {
    n: '03',
    title: 'Deposit link sends automatically',
    body: 'AfroAllure sends a professional deposit link directly to your client. No Cash App tag shared. No screenshots.',
    demo: <DepositLinkDemo />,
  },
  {
    n: '04',
    title: 'Client pays. Appointment confirmed.',
    body: 'Calendar updates. Confirmation sends. Reminder schedules. You did none of it.',
    demo: <ConfirmationDemo />,
  },
]

function Walkthrough() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { track('dm_booking_walkthrough_reached'); observer.disconnect() } },
      { threshold: 0.2 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="walkthrough" className="dm-section" style={{ background: WARM, padding: '104px 56px', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Eyebrow text="Here's How It Works" />
        <h2 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.01,
          letterSpacing: '-.03em', margin: '0 0 56px', color: INK,
        }}>
          4 steps to<br />
          <em style={{ fontStyle: 'italic', color: RED }}>professional DM bookings.</em>
        </h2>

        <div className="dm-walkthrough-grid">
          {STEPS.map((s) => (
            <div key={s.n} style={{
              background: '#fff', borderRadius: 20, padding: '32px 28px',
              border: `1px solid ${LINE}`, display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {s.demo}
              <div style={{
                fontFamily: SERIF, fontSize: 48, fontWeight: 400,
                color: RED, lineHeight: 1, letterSpacing: '-.03em',
              }}>{s.n}</div>
              <div style={{
                fontFamily: SERIF, fontSize: 21, fontWeight: 500,
                color: INK, lineHeight: 1.15, letterSpacing: '-.015em',
              }}>{s.title}</div>
              <p style={{
                fontFamily: SANS, fontSize: 14, lineHeight: 1.65,
                color: MUTED, margin: 0,
              }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── What You Get ───────────────────────────────────────────────────
const FEATURES = [
  'Automatic deposit collection',
  'Appointment confirmations sent for you',
  'Reminders scheduled automatically',
  'Client profiles and history',
  'Real-time booking calendar',
  'Stripe Express payment processing',
  'Unlimited bookings, no transaction limits',
]

function WhatYouGet({ foundingMemberCount }: { foundingMemberCount: number }) {
  const remaining = 250 - foundingMemberCount
  return (
    <section className="dm-section" style={{ background: DARK, color: WARM, padding: '104px 56px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Eyebrow text="What You Get Free During Beta" light />
        <h2 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.01,
          letterSpacing: '-.03em', margin: '0 0 56px', color: WARM,
          maxWidth: 800,
        }}>
          A complete booking system.<br />
          Built specifically for<br />
          <em style={{ fontStyle: 'italic', color: RED }}>Black beauty professionals.</em>
        </h2>

        <div className="dm-features-grid">
          {/* Feature list */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: RED, color: '#fff', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SvgIcon d={CHECK_PATH} size={12} stroke={2.5} color="#fff" />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(250,247,242,.9)', fontWeight: 400 }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* Founding member card */}
          <div style={{
            border: `2px solid ${GOLD}`,
            borderRadius: 24, padding: '40px 36px',
            background: 'rgba(201,151,74,.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Ornamental circles */}
            <svg viewBox="0 0 200 200" style={{
              position: 'absolute', top: -50, right: -50, width: 240, height: 240,
              opacity: .15, pointerEvents: 'none',
            }}>
              {[...Array(7)].map((_, i) => (
                <circle key={i} cx="100" cy="100" r={18 + i * 13}
                  fill="none" stroke={GOLD} strokeWidth="1" />
              ))}
            </svg>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: GOLD, color: '#fff',
              fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase',
              padding: '7px 14px', borderRadius: 999, fontWeight: 700, marginBottom: 24,
            }}>
              <SvgIcon d={CROWN_PATH} size={12} stroke={2} color="#fff" />
              Founding Member Offer ✦
            </div>

            <div style={{
              fontFamily: SERIF, fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400,
              color: GOLD, letterSpacing: '-.025em', lineHeight: 1.05, marginBottom: 18,
            }}>
              $25/month<br />
              <span style={{ color: WARM, fontSize: '0.72em' }}>locked forever.</span>
            </div>

            <p style={{
              fontFamily: SANS, fontSize: 15, lineHeight: 1.6,
              color: 'rgba(250,247,242,.75)', margin: '0 0 28px',
            }}>
              The first 250 stylists get founding member pricing for life — plus reserved
              listing in the AfroAllure marketplace when it launches.
            </p>

            <div style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'rgba(250,247,242,.5)', marginBottom: 24,
            }}>
              {foundingMemberCount} of 250 spots claimed · {remaining} remaining
            </div>

            <a href="/register?ref=founding"
              onClick={() => track('dm_booking_cta_click', { location: 'founding_member_card' })}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: SANS, fontWeight: 600, fontSize: 15,
                background: GOLD, color: '#fff',
                padding: '15px 24px', borderRadius: 999, textDecoration: 'none', minHeight: 52,
              }}>
              Claim your spot
              <SvgIcon d={ARROW_PATH} size={14} stroke={2.2} color="#fff" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ──────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="dm-section" style={{ background: WARM, padding: '120px 56px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <Eyebrow text="Get Started" />
        <h2 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: 'clamp(44px, 6.5vw, 88px)', lineHeight: .97,
          letterSpacing: '-.035em', margin: '0 0 18px', color: INK,
        }}>
          Let AfroAllure<br />
          <em style={{ fontStyle: 'italic', color: RED }}>handle the admin.</em>
        </h2>

        <p style={{
          fontFamily: SERIF, fontSize: 'clamp(20px, 2.5vw, 28px)',
          color: MUTED, fontStyle: 'italic', fontWeight: 400,
          margin: '0 0 48px',
        }}>
          You handle the hair.
        </p>

        <a href="/register"
          onClick={() => track('dm_booking_cta_click', { location: 'final_cta' })}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            fontFamily: SANS, fontWeight: 600, fontSize: 17,
            background: RED, color: '#fff',
            padding: '18px 34px', borderRadius: 999, textDecoration: 'none', minHeight: 56,
          }}>
          Start free →
        </a>

        <p style={{
          fontFamily: SANS, fontSize: 13, color: MUTED, marginTop: 18,
          letterSpacing: '.01em',
        }}>
          Free during beta · No credit card required · Set up in 5 minutes
        </p>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="dm-section" style={{
      background: DARK, color: WARM, padding: '64px 56px 48px',
      borderTop: '1px solid rgba(250,247,242,.08)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="dm-footer-grid" style={{ paddingBottom: 48, borderBottom: '1px solid rgba(250,247,242,.1)' }}>
          <div>
            <Image src={LOGO} alt="AfroAllure" width={140} style={{ filter: 'brightness(0) invert(1)', marginBottom: 16 }} />
            <p style={{
              fontFamily: SERIF, fontSize: 17, color: 'rgba(250,247,242,.65)',
              margin: 0, fontStyle: 'italic', maxWidth: 300, lineHeight: 1.4,
            }}>
              The platform Black beauty was waiting for.
            </p>
          </div>
          <div>
            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: '.16em',
              textTransform: 'uppercase', color: 'rgba(250,247,242,.45)', marginBottom: 18,
            }}>Platform</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'For Businesses', href: '/for-businesses' },
                { label: 'Founding Members', href: '/founding-members' },
                { label: 'Register', href: '/register' },
                { label: 'Login', href: '/login' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,247,242,.8)', textDecoration: 'none' }}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: '.16em',
              textTransform: 'uppercase', color: 'rgba(250,247,242,.45)', marginBottom: 18,
            }}>Reach us</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li><a href="https://instagram.com/afroallure_" style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,247,242,.8)', textDecoration: 'none' }}>Instagram</a></li>
              <li><a href="mailto:abijahnesbitt@afroallure.co" style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(250,247,242,.8)', textDecoration: 'none' }}>abijahnesbitt@afroallure.co</a></li>
            </ul>
          </div>
        </div>
        <div className="dm-footer-bottom" style={{
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between',
          fontFamily: MONO, fontSize: 11, color: 'rgba(250,247,242,.38)', letterSpacing: '.08em',
        }}>
          <span>© 2026 AfroAllure, Inc.</span>
          <span>Made with care · Florida &amp; everywhere</span>
        </div>
      </div>
    </footer>
  )
}

// ── Page root ──────────────────────────────────────────────────────
export default function DmBookingClient({ foundingMemberCount }: { foundingMemberCount: number }) {
  return (
    <div className="dm-root" style={{ background: WARM, color: INK, fontFamily: SANS, width: '100%' }}>
      <MobileNav />
      <Hero />
      <Problem />
      <Walkthrough />
      <WhatYouGet foundingMemberCount={foundingMemberCount} />
      <FinalCTA />
      <Footer />
    </div>
  )
}
