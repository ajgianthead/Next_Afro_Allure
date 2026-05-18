// templates/coil-crown.jsx — Vibrant expressive loctician
// Aubergine + marigold + rose. DM Serif Display + Inter.
// Vibe: gallery exhibition poster meets afro-futurist zine.

import { useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox, Stars } from "./shared";

const T_COIL = {
    name: 'Coil & Crown',
    tagline: 'Vibrant expressive loctician',
    description: 'Maximalist color, sculptural type, layered shapes. For locticians and creative stylists who want personality on the page.',
    theme: {
        bg: '#fdf3e3',
        fg: '#3d1a3d',
        accent: '#e8a534',
        accentFg: '#3d1a3d',
        muted: 'rgba(61,26,61,.6)',
        border: 'rgba(61,26,61,.18)',
        fieldBg: 'rgba(61,26,61,.06)',
        font: '"Inter", system-ui, sans-serif',
        serif: '"DM Serif Display", "Playfair Display", Georgia, serif',
        rose: '#d96479',
        radius: 20,
        ctaRadius: 999,
        ctaLetter: '0',
        ctaTransform: 'none',
    },
    stylist: {
        firstName: 'Imani',
        lastName: 'Bello',
        title: 'Loctician & Creative Stylist',
        city: 'Brooklyn, NY',
        bio: "Imani has been growing locs for fifteen years and styling them like sculpture for ten. Each appointment includes a scalp consultation, herbal tea, and a Polaroid for the wall.",
        years: 15,
    },
    services: [
        { name: 'Loc Starter Set', duration: '4 hr', price: 220, desc: 'Comb-coil or two-strand' },
        { name: 'Retwist & Style', duration: '2.5 hr', price: 130, desc: 'Roots + finishing style' },
        { name: 'Loc Detox', duration: '90 min', price: 90, desc: 'Deep cleanse + tea rinse' },
        { name: 'Updo · Special Event', duration: '2 hr', price: 160, desc: 'Wedding, photoshoot' },
        { name: 'Color Treatment', duration: '3 hr', price: 200, desc: 'Henna or semi-permanent' },
    ],
    gallery: [
        { label: 'Sister locs · Auburn', tone: 'aubergine' },
        { label: 'Updo · Goldwrap', tone: 'gold' },
        { label: 'Starter coils', tone: 'rouge' },
        { label: 'Wraps + cowries', tone: 'aubergine' },
        { label: 'Henna copper', tone: 'gold' },
        { label: 'Sculpted braid-out', tone: 'rouge' },
    ],
    reviews: [
        { name: 'Khadija L.', stars: 5, body: "Imani treated my crown like an installation. I left feeling like a whole exhibition." },
        { name: 'Folake A.', stars: 5, body: "Five years deep on my loc journey with her. I trust no one else with my hair." },
        { name: 'Renée S.', stars: 5, body: "She braided gold thread through my locs for my wedding. Photos still going viral." },
    ],
};

export function CoilCrown({ device = 'mobile', onBook }: any) {
    const t = T_COIL.theme;
    const s = T_COIL.stylist;
    const isDesktop = device === 'desktop';
    const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const openBooking = () => { setBookingOpen(true); onBook?.(); };

    const pad = isDesktop ? '96px 80px' : '60px 22px';

    const Heading = ({ children, size = 'lg', style = {} }: any) => (
        <span style={{
            fontFamily: t.serif, fontWeight: 400, letterSpacing: '-.01em',
            fontSize: size === 'xl' ? (isDesktop ? 96 : 48)
                : size === 'lg' ? (isDesktop ? 64 : 34)
                    : size === 'md' ? (isDesktop ? 36 : 24) : 18,
            lineHeight: 1.0, ...style,
        }}>{children}</span>
    );

    const Eyebrow = ({ children, color = t.rose }: any) => (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 700, letterSpacing: '.18em',
            textTransform: 'uppercase', color, marginBottom: 16,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {children}
        </div>
    );

    const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
        <button onClick={onClick} style={{
            fontFamily: t.font, fontSize: size === 'lg' ? 15 : 13, fontWeight: 600,
            padding: size === 'lg' ? '16px 28px' : '10px 18px',
            background: variant === 'solid' ? t.fg : variant === 'accent' ? t.accent : 'transparent',
            color: variant === 'solid' ? t.bg : t.fg,
            border: variant === 'ghost' ? `1.5px solid ${t.fg}` : 'none',
            borderRadius: 999, cursor: 'pointer', transition: 'all .15s',
        }}>{children}</button>
    );

    return (
        <div style={{ fontFamily: t.font, color: t.fg, background: t.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isDesktop ? '24px 80px' : '20px 22px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: t.rose }} />
                    </div>
                    <div style={{ fontFamily: t.serif, fontSize: isDesktop ? 22 : 19 }}>
                        Coil <span style={{ fontStyle: 'italic', color: t.rose }}>&</span> Crown
                    </div>
                </div>
                {isDesktop && (
                    <nav style={{ display: 'flex', gap: 28, fontSize: 13, fontWeight: 500 }}>
                        <a>Services</a><a>Journey</a><a>Studio</a><a>Visit</a>
                    </nav>
                )}
                <CTA onClick={openBooking}>Book</CTA>
            </header>

            {/* HERO — collage */}
            <section style={{ padding: isDesktop ? '40px 80px 80px' : '24px 22px 60px', position: 'relative' }}>
                <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
                    {/* Big sun decoration */}
                    <div style={{
                        position: 'absolute', top: isDesktop ? -40 : -20, right: isDesktop ? 40 : -20,
                        width: isDesktop ? 200 : 110, height: isDesktop ? 200 : 110,
                        borderRadius: '50%', background: t.accent,
                        zIndex: 0,
                    }} />
                    <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
                        <Eyebrow>Brooklyn · Est. 2011</Eyebrow>
                        <Heading size="xl" style={{ display: 'block', marginBottom: 24 }}>
                            Your <span style={{ fontStyle: 'italic', color: t.rose }}>crown</span>,<br />
                            cared for by <span style={{ background: t.accent, padding: '0 12px', borderRadius: 12 }}>hand</span>.
                        </Heading>
                        <p style={{ fontSize: isDesktop ? 18 : 15, lineHeight: 1.55, color: t.muted, maxWidth: 480, marginBottom: 28 }}>
                            {s.firstName} has been growing, twisting, and sculpting locs in Brooklyn for fifteen years. Sit, sip something herbal, and let your roots breathe.
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <CTA onClick={openBooking} size="lg">Book a session →</CTA>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: t.muted }}>
                                <Stars n={5} size={12} color={t.fg} /> 4.9 · 320+ reviews
                            </div>
                        </div>
                    </div>

                    {/* Collage of images */}
                    <div style={{
                        marginTop: isDesktop ? 60 : 40,
                        display: 'grid',
                        gridTemplateColumns: isDesktop ? 'repeat(12, 1fr)' : 'repeat(6, 1fr)',
                        gap: isDesktop ? 16 : 8,
                    }}>
                        <div style={{ gridColumn: isDesktop ? 'span 5' : 'span 4', aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden', transform: isDesktop ? 'rotate(-1.5deg)' : 'none' }}>
                            <ImgPlaceholder tone="aubergine" label="Hero · Sister locs" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ gridColumn: isDesktop ? 'span 4' : 'span 2', aspectRatio: isDesktop ? '3/4' : '3/5', borderRadius: 24, overflow: 'hidden', alignSelf: 'center' }}>
                            <ImgPlaceholder tone="rouge" label="Detail · Cowries" style={{ width: '100%', height: '100%' }} />
                        </div>
                        {isDesktop && (
                            <div style={{ gridColumn: 'span 3', aspectRatio: '3/4', borderRadius: 24, overflow: 'hidden', transform: 'rotate(2deg)' }}>
                                <ImgPlaceholder tone="gold" label="Goldwrap" style={{ width: '100%', height: '100%' }} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SERVICES — colored cards */}
            <section style={{ padding: pad, background: t.fg, color: t.bg }}>
                <Eyebrow color={t.accent}>The menu</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 32, color: t.bg }}>
                    Five rituals.<br />
                    <span style={{ fontStyle: 'italic', color: t.rose }}>One crown.</span>
                </Heading>
                <div style={{
                    display: 'grid', gap: 12,
                    gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
                }}>
                    {T_COIL.services.map((svc, i) => {
                        const colors = [t.accent, t.rose, '#5db995', t.accent, t.rose];
                        const c = colors[i % colors.length];
                        return (
                            <button key={i} onClick={openBooking} style={{
                                padding: 24, background: c, color: t.fg, border: 'none', borderRadius: 20,
                                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                minHeight: isDesktop ? 200 : 160, transition: 'transform .2s',
                            }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <div>
                                    <div style={{ fontFamily: t.serif, fontSize: 32, opacity: .4 }}>0{i + 1}</div>
                                    <Heading size="md" style={{ display: 'block', marginTop: 12, marginBottom: 6 }}>{svc.name}</Heading>
                                    <div style={{ fontSize: 13, opacity: .8 }}>{svc.desc} · {svc.duration}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 }}>
                                    <Heading size="md" style={{ fontSize: 28 }}>${svc.price}</Heading>
                                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: t.fg, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>→</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* PORTFOLIO */}
            <section style={{ padding: pad }}>
                <Eyebrow>Recent work</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 32 }}>
                    A field of <span style={{ fontStyle: 'italic', color: t.rose }}>crowns.</span>
                </Heading>
                <div style={{
                    display: 'grid', gap: isDesktop ? 16 : 10,
                    gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                }}>
                    {T_COIL.gallery.map((g, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} style={{
                            padding: 0, border: 'none', cursor: 'pointer', borderRadius: 16, overflow: 'hidden',
                            aspectRatio: i % 3 === 0 ? '3/4' : '1/1',
                            gridRow: isDesktop && i === 0 ? 'span 2' : 'auto',
                            gridColumn: isDesktop && i === 0 ? 'span 2' : 'auto',
                        }}>
                            <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
                        </button>
                    ))}
                </div>
            </section>

            {/* ABOUT */}
            <section style={{ padding: pad, background: t.accent }}>
                <div style={{
                    display: 'grid', gap: 60,
                    gridTemplateColumns: isDesktop ? '1fr 1.2fr' : '1fr', alignItems: 'center',
                }}>
                    <div style={{ aspectRatio: '4/5', borderRadius: 24, overflow: 'hidden' }}>
                        <ImgPlaceholder tone="aubergine" label="Imani · Studio" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                        <Eyebrow color={t.fg}>About Imani</Eyebrow>
                        <Heading size="lg" style={{ display: 'block', marginBottom: 24 }}>
                            Fifteen years on the<br />journey with you.
                        </Heading>
                        <p style={{ fontSize: isDesktop ? 17 : 15, lineHeight: 1.6, color: t.fg, marginBottom: 24, maxWidth: 480 }}>
                            {s.bio}
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {['Loc journey expert', 'Herbal scalp care', 'Editorial styling', 'Bridal updos'].map((tag, i) => (
                                <span key={i} style={{
                                    padding: '8px 14px', background: t.fg, color: t.bg,
                                    borderRadius: 999, fontSize: 12, fontWeight: 500,
                                }}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            <section style={{ padding: pad }}>
                <Eyebrow>Words from the chair</Eyebrow>
                <Heading size="lg" style={{ display: 'block', marginBottom: 32 }}>What folks say.</Heading>
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr' }}>
                    {T_COIL.reviews.map((r, i) => {
                        const bgs = [t.rose, t.accent, '#5db995'];
                        return (
                            <div key={i} style={{
                                padding: 24, background: bgs[i], borderRadius: 20, color: t.fg,
                                position: 'relative',
                            }}>
                                <div style={{ fontFamily: t.serif, fontSize: 64, position: 'absolute', top: 8, right: 18, opacity: .25 }}>"</div>
                                <Stars n={r.stars} size={12} color={t.fg} />
                                <p style={{ fontSize: 15, lineHeight: 1.55, margin: '12px 0 18px' }}>{r.body}</p>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>— {r.name}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* BOOKING CTA */}
            <section style={{ padding: isDesktop ? '120px 80px' : '72px 22px', textAlign: 'center', background: t.rose, color: t.fg }}>
                <Heading size="xl" style={{ display: 'block', marginBottom: 20 }}>
                    Ready to <span style={{ fontStyle: 'italic' }}>sit?</span>
                </Heading>
                <p style={{ fontSize: isDesktop ? 17 : 15, maxWidth: 460, margin: '0 auto 28px', lineHeight: 1.5 }}>
                    Sessions release Sunday at 8pm for the following week. Tea will be ready.
                </p>
                <button onClick={openBooking} style={{
                    fontFamily: t.font, fontSize: 15, fontWeight: 600, padding: '16px 32px',
                    background: t.fg, color: t.bg, border: 'none', borderRadius: 999, cursor: 'pointer',
                }}>Book a session →</button>
            </section>

            {/* FOOTER */}
            <footer style={{
                padding: isDesktop ? '40px 80px' : '36px 22px',
                background: t.fg, color: t.bg,
                display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', gap: 32,
            }}>
                <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
                    <div style={{ fontFamily: t.serif, fontSize: 22 }}>Coil & Crown</div>
                    <div style={{ fontSize: 12, opacity: .7, lineHeight: 1.7, marginTop: 8 }}>
                        218 Lefferts Pl · Brooklyn, NY 11238<br />imani@coilandcrown.studio
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 13, opacity: .8 }}>
                    <span>Wed–Sun by appt.</span><span>@coilandcrown</span>
                </div>
            </footer>

            <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={t}
                services={T_COIL.services} stylistName={`${s.firstName}`} />
            <Lightbox open={galleryIdx !== null} items={T_COIL.gallery} idx={galleryIdx ?? 0}
                onClose={() => setGalleryIdx(null)}
                onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_COIL.gallery.length) % T_COIL.gallery.length)}
                onNext={() => setGalleryIdx((galleryIdx! + 1) % T_COIL.gallery.length)} theme={t} />
        </div>
    );
}

