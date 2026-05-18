// templates/rouge-maison.jsx — Editorial bold MUA
// Black + blush + rouge. Playfair + DM Sans.
// Vibe: Vogue beauty editorial, oversized type, hard color blocks.

import { useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox } from "./shared";

const T_ROUGE = {
    name: 'Rouge Maison',
    tagline: 'Editorial bold MUA',
    description: 'Big editorial type, full-bleed beauty imagery, dramatic color blocks. For makeup artists who shoot lookbooks.',
    theme: {
        bg: '#f4d9d4',
        fg: '#0a0a0a',
        accent: '#a82847',
        accentFg: '#f4d9d4',
        muted: 'rgba(10,10,10,.6)',
        border: 'rgba(10,10,10,.15)',
        fieldBg: 'rgba(10,10,10,.05)',
        font: '"DM Sans", "Inter", system-ui, sans-serif',
        serif: '"Playfair Display", "Bodoni Moda", Georgia, serif',
        radius: 0,
        ctaRadius: 0,
        ctaLetter: '.14em',
        ctaTransform: 'uppercase',
    },
    stylist: {
        firstName: 'Zara',
        lastName: 'Mensah',
        title: 'Editorial Makeup Artist',
        city: 'Atlanta, GA',
        bio: "Zara's work has appeared in Essence, Allure, and on the runways at NYFW. She specializes in skin-first beauty across deep complexions — soft glam for everyday, theatrical builds for lookbooks and brides.",
        years: 11,
    },
    services: [
        { name: 'Bridal · Trial', duration: '2 hr', price: 175, desc: 'Full glam dress rehearsal' },
        { name: 'Bridal · Day-of', duration: '2.5 hr', price: 350, desc: 'On-site, lashes included' },
        { name: 'Soft Glam', duration: '90 min', price: 140, desc: 'Photoshoot or event' },
        { name: 'Editorial / Creative', duration: '3 hr', price: 280, desc: 'Lookbook, runway, theatrical' },
        { name: 'Lesson · 1:1', duration: '2 hr', price: 165, desc: 'Learn on your own face' },
    ],
    gallery: [
        { label: 'Bridal · Soft glam', tone: 'rouge' },
        { label: 'Editorial · Red lip', tone: 'dark' },
        { label: 'Glow · Natural', tone: 'rouge' },
        { label: 'Smoke · Bronze', tone: 'gold' },
        { label: 'Cover · Cobalt liner', tone: 'cool' },
        { label: 'Color block · Rose', tone: 'rouge' },
    ],
    reviews: [
        { name: 'Tola O. (bride)', stars: 5, body: "Zara made my skin look like skin — luminous, not painted on. Eight hours of dancing and it didn't budge." },
        { name: 'Kerry M.', stars: 5, body: "She nailed a 1970s editorial look I'd been chasing for years. The photographer wouldn't stop talking about her." },
        { name: 'Jada A.', stars: 5, body: "Took a lesson with Zara and finally learned how to do my own brows. Worth every penny." },
    ],
};

export function RougeMaison({ device = 'mobile', onBook }: any) {
    const t = T_ROUGE.theme;
    const s = T_ROUGE.stylist;
    const isDesktop = device === 'desktop';
    const [galleryIdx, setGalleryIdx] = useState<(number | null)>(null);
    const [bookingOpen, setBookingOpen] = useState(false);
    const openBooking = () => { setBookingOpen(true); onBook?.(); };

    const pad = isDesktop ? '88px 80px' : '56px 22px';

    const Display = ({ children, size = 'lg', italic = false, style = {} }: any) => (
        <span style={{
            fontFamily: t.serif, fontWeight: 500, letterSpacing: '-.02em',
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: size === 'xl' ? (isDesktop ? 144 : 64)
                : size === 'lg' ? (isDesktop ? 88 : 44)
                    : size === 'md' ? (isDesktop ? 48 : 30) : 22,
            lineHeight: .95, ...style,
        }}>{children}</span>
    );

    const Eyebrow = ({ children, color = t.accent }: any) => (
        <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase',
            color, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
        }}>
            <span style={{ width: 30, height: 1, background: color }} />
            {children}
        </div>
    );

    const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
        <button onClick={onClick} style={{
            fontFamily: t.font, fontSize: size === 'lg' ? 13 : 11, fontWeight: 700,
            letterSpacing: '.18em', textTransform: 'uppercase',
            padding: size === 'lg' ? '18px 32px' : '12px 22px',
            background: variant === 'solid' ? t.fg : variant === 'rouge' ? t.accent : 'transparent',
            color: variant === 'ghost' ? t.fg : t.bg,
            border: variant === 'ghost' ? `1.5px solid ${t.fg}` : 'none',
            borderRadius: 0, cursor: 'pointer', transition: 'all .15s',
        }}>{children}</button>
    );

    return (
        <div style={{ fontFamily: t.font, color: t.fg, background: t.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isDesktop ? '24px 80px' : '20px 22px',
                borderBottom: `1px solid ${t.fg}`,
            }}>
                <div style={{ fontFamily: t.serif, fontSize: isDesktop ? 26 : 20, letterSpacing: '-.02em' }}>
                    ROUGE <em style={{ color: t.accent, fontStyle: 'italic' }}>Maison</em>
                </div>
                {isDesktop && (
                    <nav style={{ display: 'flex', gap: 28, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
                        <a>Services</a><a>Lookbook</a><a>Press</a><a>Contact</a>
                    </nav>
                )}
                <CTA onClick={openBooking}>Book Zara</CTA>
            </header>

            {/* HERO — magazine cover */}
            <section style={{ position: 'relative' }}>
                <div style={{ display: isDesktop ? 'grid' : 'block', gridTemplateColumns: '1.2fr 1fr' }}>
                    {/* Left: editorial type */}
                    <div style={{ padding: pad, position: 'relative', minHeight: isDesktop ? 720 : 'auto' }}>
                        <div style={{
                            fontFamily: t.serif, fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase',
                            marginBottom: isDesktop ? 56 : 32, display: 'flex', justifyContent: 'space-between',
                        }}>
                            <span>Vol. 11 · No. 4</span>
                            <span style={{ color: t.accent }}>Spring '26</span>
                        </div>
                        <Display size="xl" style={{ display: 'block', marginBottom: 12 }}>
                            ROUGE
                        </Display>
                        <Display size="xl" italic style={{ display: 'block', marginBottom: 24, color: t.accent }}>
                            Maison.
                        </Display>
                        <div style={{ height: 1, background: t.fg, marginBottom: 24, maxWidth: 320 }} />
                        <p style={{ fontSize: isDesktop ? 18 : 15, lineHeight: 1.5, maxWidth: 420, marginBottom: 32 }}>
                            Editorial-trained makeup artistry from <em style={{ fontStyle: 'italic' }}>{s.firstName} {s.lastName}</em>. Skin-first beauty, deep complexion expertise, and the kind of lookbook photos clients frame on their walls.
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <CTA onClick={openBooking} size="lg" variant="rouge">Book a sitting →</CTA>
                            <CTA variant="ghost" size="lg">View lookbook</CTA>
                        </div>
                        {/* Mag-style metadata strip */}
                        {isDesktop && (
                            <div style={{
                                position: 'absolute', bottom: 56, left: 80, right: 0,
                                display: 'flex', gap: 24, fontSize: 11, letterSpacing: '.14em',
                                textTransform: 'uppercase', color: t.muted, fontWeight: 600,
                            }}>
                                <span>Featured · Essence</span><span>· Allure</span><span>· NYFW '24</span>
                            </div>
                        )}
                    </div>
                    {/* Right: image */}
                    <div style={{ position: 'relative', minHeight: isDesktop ? 720 : 420, background: t.accent }}>
                        <ImgPlaceholder tone="rouge" label="Cover · Skin-first beauty" style={{ width: '100%', height: '100%' }} />
                        <div style={{
                            position: 'absolute', top: 24, right: 24, padding: '8px 12px',
                            background: t.fg, color: t.bg, fontFamily: t.serif, fontStyle: 'italic',
                            fontSize: 14,
                        }}>"Skin like silk." — Allure</div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section style={{ padding: pad, background: t.fg, color: t.bg }}>
                <Eyebrow color={t.accent}>The work</Eyebrow>
                <Display size="lg" style={{ display: 'block', marginBottom: 40 }}>
                    Five services.<br />
                    <em style={{ fontStyle: 'italic', color: t.accent }}>One face at a time.</em>
                </Display>
                <div>
                    {T_ROUGE.services.map((svc, i) => (
                        <button key={i} onClick={openBooking} style={{
                            width: '100%', display: 'grid',
                            gridTemplateColumns: isDesktop ? '60px 1.4fr 1fr 100px 100px' : '40px 1fr auto',
                            gap: 16, alignItems: 'center',
                            padding: isDesktop ? '24px 0' : '20px 0',
                            borderTop: `1px solid rgba(244,217,212,.2)`,
                            background: 'transparent', border: 'none', borderTopColor: 'rgba(244,217,212,.2)',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: t.bg,
                        }}>
                            <span style={{ fontFamily: t.serif, fontStyle: 'italic', color: t.accent, fontSize: 18 }}>
                                №{i + 1}
                            </span>
                            <Display size="md" style={{ display: 'block', color: t.bg }}>{svc.name}</Display>
                            {isDesktop && <span style={{ fontSize: 13, color: 'rgba(244,217,212,.6)' }}>{svc.desc}</span>}
                            {isDesktop && <span style={{ fontSize: 12, color: 'rgba(244,217,212,.6)', letterSpacing: '.08em' }}>{svc.duration}</span>}
                            <Display size="md" italic style={{ color: t.accent, textAlign: 'right' }}>${svc.price}</Display>
                        </button>
                    ))}
                </div>
            </section>

            {/* LOOKBOOK */}
            <section style={{ padding: pad }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
                    <div>
                        <Eyebrow>Lookbook · '24–'25</Eyebrow>
                        <Display size="lg">Recent <em style={{ fontStyle: 'italic', color: t.accent }}>faces.</em></Display>
                    </div>
                    <a style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', borderBottom: `2px solid ${t.fg}`, paddingBottom: 4 }}>
                        View all →
                    </a>
                </div>
                <div style={{
                    display: 'grid', gap: isDesktop ? 12 : 6,
                    gridTemplateColumns: isDesktop ? 'repeat(6, 1fr)' : 'repeat(3, 1fr)',
                }}>
                    {T_ROUGE.gallery.map((g, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} style={{
                            padding: 0, border: 'none', cursor: 'pointer', overflow: 'hidden',
                            aspectRatio: i === 0 ? '4/5' : '1/1',
                            gridColumn: isDesktop && i === 0 ? 'span 2' : 'span 1',
                            gridRow: isDesktop && i === 0 ? 'span 2' : 'span 1',
                        }}>
                            <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
                        </button>
                    ))}
                </div>
            </section>

            {/* ABOUT */}
            <section style={{ padding: pad, background: t.accent, color: t.bg }}>
                <div style={{
                    display: 'grid', gap: 60,
                    gridTemplateColumns: isDesktop ? '1fr 1.2fr' : '1fr', alignItems: 'center',
                }}>
                    <div style={{ aspectRatio: '4/5' }}>
                        <ImgPlaceholder tone="rouge" label="Zara · Backstage" style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div>
                        <Eyebrow color={t.bg}>The artist</Eyebrow>
                        <Display size="lg" style={{ display: 'block', marginBottom: 24 }}>
                            Eleven years.<br />Three magazines.<br /><em style={{ fontStyle: 'italic' }}>Countless faces.</em>
                        </Display>
                        <p style={{ fontSize: isDesktop ? 17 : 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, opacity: .9 }}>
                            {s.bio}
                        </p>
                        <div style={{ display: 'flex', gap: 32, paddingTop: 24, borderTop: `1px solid rgba(244,217,212,.4)`, flexWrap: 'wrap' }}>
                            {[{ l: 'Years', v: '11' }, { l: 'Brides served', v: '140+' }, { l: 'Editorials', v: '42' }].map((m, i) => (
                                <div key={i}>
                                    <Display size="md" italic>{m.v}</Display>
                                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 4 }}>{m.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            <section style={{ padding: pad }}>
                <Eyebrow>Words on the work</Eyebrow>
                <Display size="lg" style={{ display: 'block', marginBottom: 40 }}>Press & <em style={{ fontStyle: 'italic', color: t.accent }}>letters.</em></Display>
                <div style={{ display: 'grid', gap: 0, gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr' }}>
                    {T_ROUGE.reviews.map((r, i) => (
                        <div key={i} style={{
                            padding: isDesktop ? '32px 28px' : '28px 0',
                            borderTop: `1px solid ${t.fg}`,
                            borderRight: isDesktop && i < 2 ? `1px solid ${t.fg}` : 'none',
                        }}>
                            <div style={{ fontFamily: t.serif, fontSize: 56, lineHeight: 0.5, color: t.accent, marginBottom: 12 }}>"</div>
                            <p style={{ fontFamily: t.serif, fontSize: isDesktop ? 22 : 19, lineHeight: 1.3, fontStyle: 'italic', margin: '0 0 18px' }}>
                                {r.body}
                            </p>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase' }}>— {r.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BOOKING CTA */}
            <section style={{ padding: 0, background: t.fg, color: t.bg }}>
                <div style={{ padding: isDesktop ? '120px 80px' : '72px 22px', textAlign: 'center' }}>
                    <Display size="xl" style={{ display: 'block', marginBottom: 12 }}>SIT FOR</Display>
                    <Display size="xl" italic style={{ display: 'block', marginBottom: 24, color: t.accent }}>Zara.</Display>
                    <p style={{ fontSize: isDesktop ? 17 : 15, color: 'rgba(244,217,212,.7)', maxWidth: 460, margin: '0 auto 32px' }}>
                        Bridal books eight months out. Editorial & lookbook projects, by quote.
                    </p>
                    <CTA onClick={openBooking} size="lg" variant="rouge">Reserve a sitting →</CTA>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                padding: isDesktop ? '40px 80px' : '36px 22px',
                background: t.bg, color: t.fg, borderTop: `1px solid ${t.fg}`,
                display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', gap: 32,
            }}>
                <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
                    <div style={{ fontFamily: t.serif, fontSize: 22 }}>ROUGE <em style={{ color: t.accent, fontStyle: 'italic' }}>Maison</em></div>
                    <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.7, marginTop: 8 }}>
                        Studio · Atlanta, GA<br />zara@rougemaison.studio
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 32, fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                    <span>Bridal</span><span>Editorial</span><span>Press</span><span>@rougemaison</span>
                </div>
            </footer>

            <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} theme={t}
                services={T_ROUGE.services} stylistName={`${s.firstName}`} />
            <Lightbox open={galleryIdx !== null} items={T_ROUGE.gallery} idx={galleryIdx ?? 0}
                onClose={() => setGalleryIdx(null)}
                onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_ROUGE.gallery.length) % T_ROUGE.gallery.length)}
                onNext={() => setGalleryIdx((galleryIdx! + 1) % T_ROUGE.gallery.length)} theme={t} />
        </div>
    );
}

