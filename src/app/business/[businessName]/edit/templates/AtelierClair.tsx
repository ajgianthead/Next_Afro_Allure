// templates/atelier-clair.jsx — Soft minimal modern (multi-service salon)
// Bone + slate + lavender. Manrope sans throughout.
// Vibe: Aesop store meets contemporary salon brochure.
'use client'
import { useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox, Stars } from "./shared";

const T_CLAIR = {
    name: 'Atelier Clair',
    tagline: 'Soft minimal modern',
    description: 'A clean, calm system that lets imagery do the work. Sans-throughout, soft pastels, generous whitespace.',
    theme: {
        bg: '#faf8f4',
        fg: '#2c2826',
        accent: '#a89bb8',
        accentFg: '#2c2826',
        muted: 'rgba(44,40,38,.55)',
        border: 'rgba(44,40,38,.12)',
        fieldBg: 'rgba(44,40,38,.04)',
        font: '"Manrope", "Inter", system-ui, sans-serif',
        ctaRadius: 999,
        ctaLetter: '0',
        ctaTransform: 'none',
        radius: 16,
    },
    stylist: {
        firstName: 'Naomi',
        lastName: 'Asante',
        title: 'Hairstylist & Colorist',
        city: 'Minneapolis, MN',
        bio: "Naomi works across textures with a focus on sustainable color and gentle, low-manipulation styling. The studio is small on purpose — two clients a day, lavender tea on arrival, no rushing.",
        years: 9,
    },
    services: [
        { name: 'Silk Press', duration: '2 hr', price: 140 },
        { name: 'Color · Single Process', duration: '2.5 hr', price: 180 },
        { name: 'Curl Cut & Style', duration: '90 min', price: 110 },
        { name: 'Twist-Out · Refresh', duration: '60 min', price: 75 },
        { name: 'Trim Only', duration: '30 min', price: 50 },
    ],
    gallery: [
        { label: 'Silk press · Layered', tone: 'cool' },
        { label: 'Honey color', tone: 'warm' },
        { label: 'Curl cut · Tapered', tone: 'cool' },
        { label: 'Twist-out · Volume', tone: 'bone' },
        { label: 'Auburn balayage', tone: 'gold' },
        { label: 'Wash day routine', tone: 'cool' },
    ],
    reviews: [
        { name: 'Lauren O.', stars: 5, body: "Calmest salon experience I've had. Naomi listens, works slowly, and the color was exactly what I asked for." },
        { name: 'Priya M.', stars: 5, body: "She gets curls. My hair has never been healthier." },
        { name: 'Ade J.', stars: 5, body: "It feels more like visiting a friend who happens to be a colorist. I leave relaxed every time." },
    ],
};

export function AtelierClair({ device = 'mobile', onBook }: any) {
    const t = T_CLAIR.theme;
    const s = T_CLAIR.stylist;
    const isDesktop = device === 'desktop';
    const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
    const [bookingOpen, setBookingOpen] = useState<boolean>(false);
    const openBooking = () => { setBookingOpen(true); onBook?.(); };

    const pad = isDesktop ? '96px 80px' : '60px 22px';

    const Heading = ({ children, size = 'lg', style = {} }: any) => (
        <span style={{
            fontFamily: t.font, fontWeight: 500, letterSpacing: '-.025em',
            fontSize: size === 'xl' ? (isDesktop ? 76 : 38)
                : size === 'lg' ? (isDesktop ? 52 : 30)
                    : size === 'md' ? (isDesktop ? 32 : 22) : 18,
            lineHeight: 1.1, ...style,
        }}>{children}</span>
    );

    const Eyebrow = ({ children }: any) => (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px',
            background: t.accent, color: t.accentFg, borderRadius: 999,
            fontSize: 11, fontWeight: 600, marginBottom: 18,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.fg }} />
            {children}
        </div>
    );

    const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
        <button onClick={onClick} style={{
            fontFamily: t.font, fontSize: size === 'lg' ? 15 : 13, fontWeight: 600,
            padding: size === 'lg' ? '14px 26px' : '10px 18px',
            background: variant === 'solid' ? t.fg : 'transparent',
            color: variant === 'solid' ? t.bg : t.fg,
            border: variant === 'solid' ? 'none' : `1px solid ${t.fg}`,
            borderRadius: 999, cursor: 'pointer', transition: 'all .15s',
            display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>{children}</button>
    );

    return (
        <div style={{ fontFamily: t.font, color: t.fg, background: t.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isDesktop ? '24px 80px' : '20px 22px',
                position: 'sticky', top: 0, background: 'rgba(250,248,244,.85)', backdropFilter: 'blur(8px)', zIndex: 5,
            }}>
                <div style={{ fontWeight: 600, fontSize: isDesktop ? 18 : 16, letterSpacing: '-.02em' }}>
                    atelier <span style={{ color: t.accent }}>clair</span>
                </div>
                {isDesktop && (
                    <nav style={{ display: 'flex', gap: 32, fontSize: 13 }}>
                        <a>Services</a><a>Work</a><a>About</a><a>Visit</a>
                    </nav>
                )}
                <CTA onClick={openBooking}>Book</CTA>
            </header>

            {/* HERO */}
            <section style={{ padding: isDesktop ? '60px 80px 100px' : '32px 22px 60px' }}>
                <div style={{
                    display: 'grid', gap: isDesktop ? 60 : 32,
                    gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', alignItems: 'center',
                }}>
                    <div>
                        <Eyebrow>Now booking · Spring '26</Eyebrow>
                        <Heading size="xl" style={{ display: 'block', marginBottom: 20 }}>
                            A quieter kind of <span style={{ color: t.accent }}>salon.</span>
                        </Heading>
                        <p style={{ fontSize: isDesktop ? 17 : 15, lineHeight: 1.55, color: t.muted, marginBottom: 28, maxWidth: 440 }}>
                            Two clients a day. Lavender tea on arrival. {s.firstName} works across textures with a focus on healthy color and low-manipulation styling.
                        </p>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <CTA onClick={openBooking} size="lg">Book a chair →</CTA>
                            <CTA variant="ghost" size="lg">View services</CTA>
                        </div>
                    </div>
                    <div style={{ position: 'relative', aspectRatio: '5/6' }}>
                        <ImgPlaceholder tone="cool" label="Hero · Soft natural light"
                            style={{ width: '100%', height: '100%', borderRadius: 24 }} />
                        <div style={{
                            position: 'absolute', bottom: -24, left: -24, padding: 18,
                            background: t.bg, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,.08)',
                            display: 'flex', alignItems: 'center', gap: 12, maxWidth: 220,
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Stars n={5} size={9} color={t.fg} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>4.9 from 187 visits</div>
                                <div style={{ fontSize: 11, color: t.muted }}>Top-rated in {s.city.split(',')[0]}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section style={{ padding: pad }}>
                <Eyebrow>Services</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 40, maxWidth: 580 }}>
                    Care across textures, priced honestly.
                </Heading>
                <div style={{
                    display: 'grid', gap: 12,
                    gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
                }}>
                    {T_CLAIR.services.map((svc, i) => (
                        <button key={i} onClick={openBooking} style={{
                            padding: 24, background: t.fieldBg, borderRadius: 16, border: 'none',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: t.fg,
                            transition: 'background .15s',
                        }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(168,155,184,.18)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = t.fieldBg}>
                            <div>
                                <Heading size="md" style={{ display: 'block', marginBottom: 4 }}>{svc.name}</Heading>
                                <div style={{ fontSize: 13, color: t.muted }}>{svc.duration}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <span style={{ fontSize: 18, fontWeight: 600 }}>${svc.price}</span>
                                <span style={{ width: 36, height: 36, borderRadius: '50%', background: t.fg, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>→</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* PORTFOLIO */}
            <section style={{ padding: pad, borderTop: `1px solid ${t.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                    <div>
                        <Eyebrow>Recent work</Eyebrow>
                        <Heading size="lg">A small archive.</Heading>
                    </div>
                    <div style={{ fontSize: 13, color: t.muted, maxWidth: 240 }}>Tap any image to view in full.</div>
                </div>
                <div style={{
                    display: 'grid', gap: isDesktop ? 16 : 10,
                    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                }}>
                    {T_CLAIR.gallery.map((g, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} style={{
                            padding: 0, border: 'none', cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                            aspectRatio: '4/5',
                        }}>
                            <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
                        </button>
                    ))}
                </div>
            </section>

            {/* ABOUT */}
            <section style={{ padding: pad, background: '#f1ede4' }}>
                <div style={{
                    display: 'grid', gap: 60,
                    gridTemplateColumns: isDesktop ? '1fr 1.2fr' : '1fr', alignItems: 'center',
                }}>
                    <div style={{ aspectRatio: '4/5', borderRadius: 20, overflow: 'hidden' }}>
                        <ImgPlaceholder tone="warm" label="Naomi · Studio portrait" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                        <Eyebrow>About Naomi</Eyebrow>
                        <Heading size="lg" style={{ display: 'block', marginBottom: 24 }}>
                            Hair as a quiet,<br />continuing conversation.
                        </Heading>
                        <p style={{ fontSize: isDesktop ? 16 : 14, lineHeight: 1.65, color: t.muted, marginBottom: 24, maxWidth: 480 }}>
                            {s.bio}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                            {[{ l: 'Years', v: '9' }, { l: 'Textures', v: '1A–4C' }, { l: 'Studio', v: 'Pvt.' }].map((m, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: 24, fontWeight: 600 }}>{m.v}</div>
                                    <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>{m.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            <section style={{ padding: pad }}>
                <Eyebrow>Words</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 40 }}>What clients say.</Heading>
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr' }}>
                    {T_CLAIR.reviews.map((r, i) => (
                        <div key={i} style={{ padding: 28, background: t.fieldBg, borderRadius: 18 }}>
                            <Stars n={r.stars} size={12} color={t.fg} />
                            <p style={{ fontSize: 15, lineHeight: 1.55, margin: '12px 0 18px' }}>"{r.body}"</p>
                            <div style={{ fontSize: 12, color: t.muted, fontWeight: 600 }}>— {r.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BOOKING CTA */}
            <section style={{ padding: isDesktop ? '120px 80px' : '72px 22px' }}>
                <div style={{
                    background: t.fg, color: t.bg, borderRadius: 28, padding: isDesktop ? '72px 60px' : '48px 28px',
                    textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: t.accent, opacity: .4 }} />
                    <div style={{ position: 'relative' }}>
                        <Heading size="xl" style={{ display: 'block', marginBottom: 16 }}>Reserve your chair.</Heading>
                        <p style={{ fontSize: isDesktop ? 16 : 14, color: 'rgba(250,248,244,.7)', maxWidth: 420, margin: '0 auto 28px' }}>
                            Two clients a day. Booking opens four weeks in advance.
                        </p>
                        <button onClick={openBooking} style={{
                            fontFamily: t.font, fontSize: 15, fontWeight: 600, padding: '16px 32px',
                            background: t.bg, color: t.fg, border: 'none', borderRadius: 999, cursor: 'pointer',
                        }}>Book a visit →</button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                padding: isDesktop ? '40px 80px' : '36px 22px', borderTop: `1px solid ${t.border}`,
                display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', gap: 32,
            }}>
                <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>atelier <span style={{ color: t.accent }}>clair</span></div>
                    <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.7, marginTop: 8 }}>
                        812 W Lake St · Minneapolis, MN<br />hello@atelierclair.co
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 13, color: t.muted }}>
                    <span>Tue–Sat 10–6</span><span>Instagram</span><span>Newsletter</span>
                </div>
            </footer>

            <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={t}
                services={T_CLAIR.services} stylistName={`${s.firstName}`} />
            <Lightbox open={galleryIdx !== null} items={T_CLAIR.gallery} idx={galleryIdx ?? 0}
                onClose={() => setGalleryIdx(null)}
                onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_CLAIR.gallery.length) % T_CLAIR.gallery.length)}
                onNext={() => setGalleryIdx((galleryIdx! + 1) % T_CLAIR.gallery.length)} theme={t} />
        </div>
    );
}
