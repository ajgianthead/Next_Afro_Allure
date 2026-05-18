// templates/quickstart.jsx — Simple starter
// Single-color accent, neutral palette, Inter throughout. Fast setup, sturdy defaults.
// Vibe: clean, friendly, functional — for stylists just getting online.

import { useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox, Stars } from "./shared";

const T_QUICK = {
    name: 'Quickstart',
    tagline: 'Simple starter',
    description: 'Sensible defaults for stylists setting up their first site. Clean, friendly, scannable, and easy to customize.',
    theme: {
        bg: '#ffffff',
        fg: '#171717',
        accent: '#c4593a',
        accentFg: '#ffffff',
        muted: 'rgba(23,23,23,.6)',
        border: 'rgba(23,23,23,.12)',
        fieldBg: 'rgba(23,23,23,.04)',
        font: '"Inter", system-ui, sans-serif',
        radius: 12,
        ctaRadius: 10,
        ctaLetter: '0',
        ctaTransform: 'none',
    },
    stylist: {
        firstName: 'Aaliyah',
        lastName: 'James',
        title: 'Hair Stylist',
        city: 'Charlotte, NC',
        bio: "Hi, I'm Aaliyah! I've been doing hair for six years out of a cozy home studio in South End. I love color, healthy hair routines, and a good laugh in the chair.",
        years: 6,
    },
    services: [
        { name: 'Wash, Cut & Style', duration: '90 min', price: 85 },
        { name: 'Box Braids · Medium', duration: '5 hr', price: 200 },
        { name: 'Silk Press', duration: '2 hr', price: 100 },
        { name: 'Color Refresh', duration: '2 hr', price: 130 },
        { name: 'Trim Only', duration: '30 min', price: 40 },
    ],
    gallery: [
        { label: 'Recent · Box braids', tone: 'warm' },
        { label: 'Recent · Silk press', tone: 'gold' },
        { label: 'Recent · Color', tone: 'warm' },
        { label: 'Recent · Cut', tone: 'gold' },
    ],
    reviews: [
        { name: 'Brianna', stars: 5, body: "Aaliyah is the sweetest. She listens, takes her time, and my hair has been thriving since I switched to her." },
        { name: 'Kendra', stars: 5, body: "Best braids I've had in Charlotte. Lasted 8 weeks looking fresh!" },
        { name: 'Maya', stars: 5, body: "She really cares about hair health. My ends have never looked better." },
    ],
};

export function Quickstart({ device = 'mobile', onBook }: any) {
    const t = T_QUICK.theme;
    const s = T_QUICK.stylist;
    const isDesktop = device === 'desktop';
    const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const openBooking = () => { setBookingOpen(true); onBook?.(); };

    const pad = isDesktop ? '72px 80px' : '48px 22px';

    const Heading = ({ children, size = 'lg', style = {} }: any) => (
        <span style={{
            fontFamily: t.font, fontWeight: 700, letterSpacing: '-.025em',
            fontSize: size === 'xl' ? (isDesktop ? 60 : 36)
                : size === 'lg' ? (isDesktop ? 40 : 26)
                    : size === 'md' ? (isDesktop ? 22 : 18) : 16,
            lineHeight: 1.15, ...style,
        }}>{children}</span>
    );

    const Eyebrow = ({ children }: any) => (
        <div style={{
            fontSize: 12, fontWeight: 600, color: t.accent, marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: '.08em',
        }}>{children}</div>
    );

    const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
        <button onClick={onClick} style={{
            fontFamily: t.font, fontSize: size === 'lg' ? 15 : 14, fontWeight: 600,
            padding: size === 'lg' ? '14px 24px' : '10px 18px',
            background: variant === 'solid' ? t.accent : 'transparent',
            color: variant === 'solid' ? t.accentFg : t.fg,
            border: variant === 'solid' ? 'none' : `1px solid ${t.border}`,
            borderRadius: 10, cursor: 'pointer', transition: 'all .15s',
        }}>{children}</button>
    );

    return (
        <div style={{ fontFamily: t.font, color: t.fg, background: t.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isDesktop ? '20px 80px' : '16px 22px',
                borderBottom: `1px solid ${t.border}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accent, color: t.accentFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>AJ</div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Aaliyah James</div>
                </div>
                {isDesktop && (
                    <nav style={{ display: 'flex', gap: 28, fontSize: 14, color: t.fg }}>
                        <a>Services</a><a>Gallery</a><a>About</a><a>Contact</a>
                    </nav>
                )}
                <CTA onClick={openBooking}>Book now</CTA>
            </header>

            {/* HERO — clean centered */}
            <section style={{ padding: isDesktop ? '80px 80px 60px' : '48px 22px 40px', textAlign: 'center' }}>
                <Eyebrow>Hair Stylist · {s.city}</Eyebrow>
                <Heading size="xl" style={{ display: 'block', marginBottom: 18, maxWidth: 720, margin: '0 auto 18px' }}>
                    Healthy hair, made simple.
                </Heading>
                <p style={{ fontSize: isDesktop ? 17 : 15, color: t.muted, lineHeight: 1.55, maxWidth: 520, margin: '0 auto 28px' }}>
                    {s.bio}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                    <CTA onClick={openBooking} size="lg">Book an appointment</CTA>
                    <CTA variant="ghost" size="lg">See my work</CTA>
                </div>
                {/* Trust badges */}
                <div style={{
                    display: 'inline-flex', gap: 24, padding: '12px 20px',
                    background: t.fieldBg, borderRadius: 999, fontSize: 13, color: t.muted,
                    flexWrap: 'wrap', justifyContent: 'center',
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Stars n={5} size={11} color={t.fg} /> 4.9
                    </span>
                    <span>·</span>
                    <span>120+ clients</span>
                    <span>·</span>
                    <span>{s.years} yrs experience</span>
                </div>
            </section>

            {/* HERO IMAGE */}
            <section style={{ padding: isDesktop ? '0 80px' : '0 22px' }}>
                <div style={{ borderRadius: 16, overflow: 'hidden', aspectRatio: isDesktop ? '16/8' : '4/3' }}>
                    <ImgPlaceholder tone="warm" label="Featured · Recent client" style={{ width: '100%', height: '100%' }} />
                </div>
            </section>

            {/* SERVICES */}
            <section style={{ padding: pad }}>
                <Eyebrow>Services</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 28 }}>What I do.</Heading>
                <div style={{
                    display: 'grid', gap: 12,
                    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
                }}>
                    {T_QUICK.services.map((svc, i) => (
                        <div key={i} style={{
                            padding: 20, border: `1px solid ${t.border}`, borderRadius: 12,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                        }}>
                            <div>
                                <Heading size="md" style={{ display: 'block', marginBottom: 4 }}>{svc.name}</Heading>
                                <div style={{ fontSize: 13, color: t.muted }}>{svc.duration}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                <span style={{ fontSize: 18, fontWeight: 700 }}>${svc.price}</span>
                                <button onClick={openBooking} style={{
                                    padding: '8px 14px', background: t.accent, color: t.accentFg,
                                    fontFamily: t.font, fontSize: 13, fontWeight: 600,
                                    border: 'none', borderRadius: 8, cursor: 'pointer',
                                }}>Book</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* GALLERY */}
            <section style={{ padding: pad, background: t.fieldBg }}>
                <Eyebrow>Recent work</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 24 }}>Gallery.</Heading>
                <div style={{
                    display: 'grid', gap: 12,
                    gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                }}>
                    {T_QUICK.gallery.map((g, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} style={{
                            padding: 0, border: 'none', cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                            aspectRatio: '1/1',
                        }}>
                            <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
                        </button>
                    ))}
                </div>
            </section>

            {/* ABOUT */}
            <section style={{ padding: pad }}>
                <div style={{
                    display: 'grid', gap: 40,
                    gridTemplateColumns: isDesktop ? '1fr 1.4fr' : '1fr', alignItems: 'center',
                }}>
                    <div style={{ aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden' }}>
                        <ImgPlaceholder tone="gold" label="Aaliyah · Studio" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                        <Eyebrow>About me</Eyebrow>
                        <Heading size="lg" style={{ display: 'block', marginBottom: 16 }}>Hi, I'm Aaliyah!</Heading>
                        <p style={{ fontSize: isDesktop ? 16 : 15, lineHeight: 1.6, color: t.muted, marginBottom: 20 }}>
                            I've been doing hair for {s.years} years and I love every part of it — from helping a new client find their first protective style to getting curls back on track after years of damage. My studio is small, calm, and welcoming.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                'Licensed cosmetologist (NC, 2018)',
                                'Certified in healthy hair color',
                                'Specializes in natural & relaxed textures',
                            ].map((line, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14 }}>
                                    <span style={{
                                        width: 18, height: 18, borderRadius: '50%', background: t.accent, color: t.accentFg,
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                    }}>
                                        <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
                                    </span>
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            <section style={{ padding: pad, background: t.fieldBg }}>
                <Eyebrow>Reviews</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 28 }}>What clients say.</Heading>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr' }}>
                    {T_QUICK.reviews.map((r, i) => (
                        <div key={i} style={{ padding: 20, background: t.bg, borderRadius: 12, border: `1px solid ${t.border}` }}>
                            <Stars n={r.stars} size={12} color={t.fg} />
                            <p style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 14px' }}>"{r.body}"</p>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>— {r.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CONTACT + CTA */}
            <section style={{ padding: pad }}>
                <div style={{
                    padding: isDesktop ? '48px 56px' : '32px 24px',
                    background: t.fg, color: t.bg, borderRadius: 20, textAlign: 'center',
                }}>
                    <Heading size="lg" style={{ display: 'block', marginBottom: 12 }}>
                        Ready to book?
                    </Heading>
                    <p style={{ fontSize: isDesktop ? 16 : 14, color: 'rgba(255,255,255,.7)', maxWidth: 400, margin: '0 auto 24px' }}>
                        Pick a time that works for you. I'll send a confirmation right after.
                    </p>
                    <button onClick={openBooking} style={{
                        fontFamily: t.font, fontSize: 15, fontWeight: 600, padding: '14px 28px',
                        background: t.accent, color: t.accentFg, border: 'none', borderRadius: 10, cursor: 'pointer',
                    }}>Book an appointment →</button>
                    <div style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,.6)' }}>
                        Or reach me at <span style={{ color: t.bg, fontWeight: 600 }}>(704) 555-0177</span>
                    </div>
                </div>
                {/* Map placeholder */}
                <div style={{
                    marginTop: 24, padding: 20, border: `1px solid ${t.border}`, borderRadius: 12,
                    display: isDesktop ? 'grid' : 'block', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'center',
                }}>
                    <div style={{ marginBottom: isDesktop ? 0 : 16 }}>
                        <Heading size="md" style={{ display: 'block', marginBottom: 8 }}>Visit the studio</Heading>
                        <div style={{ fontSize: 14, color: t.muted, lineHeight: 1.6 }}>
                            812 South Blvd, Suite 4<br />Charlotte, NC 28203<br />Tue–Sat · 9am–6pm
                        </div>
                    </div>
                    <div style={{ aspectRatio: isDesktop ? '3/1' : '2/1', borderRadius: 8, overflow: 'hidden', background: '#e8e3db', position: 'relative' }}>
                        {/* Stylized map placeholder */}
                        <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                            <rect width="300" height="100" fill="#e8e3db" />
                            <path d="M0 30 L120 30 L120 70 L300 70" stroke="#d2cabc" strokeWidth="6" fill="none" />
                            <path d="M60 0 L60 100" stroke="#d2cabc" strokeWidth="3" fill="none" />
                            <path d="M200 0 L200 60 L260 60 L260 100" stroke="#d2cabc" strokeWidth="3" fill="none" />
                            <circle cx="150" cy="50" r="8" fill={t.accent} />
                            <circle cx="150" cy="50" r="3" fill="#fff" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                padding: isDesktop ? '32px 80px' : '28px 22px',
                borderTop: `1px solid ${t.border}`, fontSize: 13, color: t.muted,
                display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
                <div>© Aaliyah James, 2026 · Built on AfroAllure</div>
                <div style={{ display: 'flex', gap: 16 }}><span>Instagram</span><span>TikTok</span></div>
            </footer>

            <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={t}
                services={T_QUICK.services} stylistName={`${s.firstName}`} />
            <Lightbox open={galleryIdx !== null} items={T_QUICK.gallery} idx={galleryIdx ?? 0}
                onClose={() => setGalleryIdx(null)}
                onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_QUICK.gallery.length) % T_QUICK.gallery.length)}
                onNext={() => setGalleryIdx((galleryIdx! + 1) % T_QUICK.gallery.length)} theme={t} />
        </div>
    );
}


