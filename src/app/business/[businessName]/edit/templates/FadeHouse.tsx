// templates/fade-house.jsx — Bold urban barber
// Dark charcoal + blood red. Condensed display headlines (Anton/Bebas), Inter body.
// Vibe: Detroit barbershop meets boxing gym poster.
'use client'
import { useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox, Stars } from "./shared";

const T_FADE = {
    name: 'Fade House',
    tagline: 'Bold urban barber',
    description: 'Heavy condensed type, hard edges, big numbers. For barbers who run a tight chair and want bookings done fast.',
    theme: {
        bg: '#0e0e0e',
        fg: '#ebe8e3',
        accent: '#c4361f',
        accentFg: '#ebe8e3',
        muted: 'rgba(235,232,227,.55)',
        border: 'rgba(235,232,227,.14)',
        fieldBg: 'rgba(235,232,227,.06)',
        font: '"Inter", system-ui, sans-serif',
        display: '"Anton", "Oswald", "Bebas Neue", Impact, sans-serif',
        ctaRadius: 2,
        ctaLetter: '.12em',
        ctaTransform: 'uppercase',
        radius: 2,
    },
    stylist: {
        firstName: 'Marcus',
        lastName: 'Reed',
        title: 'Master Barber',
        city: 'Columbus, OH',
        bio: "Eight years in the chair. Trained in Detroit, sharpened in Atlanta, posted up in Columbus. Crisp lineups, low-fade specialist, beard sculpting that actually fits your face. Walk-ins welcome but appointments get the chair on time.",
        years: 8,
        cuts: 4200,
    },
    services: [
        { name: 'The Cut', duration: '30 min', price: 45, desc: 'Skin / low / mid fade + lineup' },
        { name: 'Cut + Beard', duration: '45 min', price: 65, desc: 'Hot towel, oil finish' },
        { name: 'The Full Service', duration: '60 min', price: 90, desc: 'Cut, beard, brow, hot towel' },
        { name: 'Kid\'s Cut (under 12)', duration: '25 min', price: 30, desc: 'Snacks on the house' },
        { name: 'Beard Only', duration: '25 min', price: 30, desc: 'Shape + line + hot towel' },
    ],
    gallery: [
        { label: 'Skin fade · Taper', tone: 'dark' },
        { label: 'Lineup · Sharp', tone: 'dark' },
        { label: 'Beard sculpt', tone: 'dark' },
        { label: 'Mid fade · Curls', tone: 'dark' },
        { label: 'Burst · Mohawk', tone: 'dark' },
        { label: 'Bald fade', tone: 'dark' },
    ],
    reviews: [
        { name: 'D. Wallace', stars: 5, body: "Marcus is the only one in Columbus who gets a 4-blade fade right. Booked solid for a reason." },
        { name: 'Jamal R.', stars: 5, body: "Fast, clean, no BS. In and out in 30 with the freshest cut I've had in years." },
        { name: 'Tony C.', stars: 5, body: "Brought my 8-year-old in scared, left him in love with the chair. That's the move." },
    ],
};

export function FadeHouse({ device = 'mobile', onBook }: any) {
    const t = T_FADE.theme;
    const s = T_FADE.stylist;
    const isDesktop = device === 'desktop';
    const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
    const [bookingOpen, setBookingOpen] = useState<boolean | null>(null);

    const openBooking = () => { setBookingOpen(true); onBook?.(); };

    const Display = ({ children, size = 'lg', style = {} }: any) => (
        <span style={{
            fontFamily: t.display, fontWeight: 400,
            letterSpacing: '.005em', textTransform: 'uppercase', lineHeight: .92,
            fontSize: size === 'xl' ? (isDesktop ? 160 : 72)
                : size === 'lg' ? (isDesktop ? 96 : 52)
                    : size === 'md' ? (isDesktop ? 56 : 36) : 24,
            ...style,
        }}>{children}</span>
    );

    const Eyebrow = ({ children, style = {} }: any) => (
        <div style={{
            fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
            color: t.accent, marginBottom: 14, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            ...style,
        }}>
            <span style={{ width: 24, height: 1, background: t.accent }} />
            {children}
        </div>
    );

    const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
        <button onClick={onClick} style={{
            fontFamily: t.display, fontSize: size === 'lg' ? (isDesktop ? 22 : 18) : 14,
            letterSpacing: '.08em', textTransform: 'uppercase',
            padding: size === 'lg' ? '20px 36px' : '14px 24px',
            background: variant === 'solid' ? t.accent : 'transparent',
            color: t.fg,
            border: variant === 'solid' ? 'none' : `2px solid ${t.fg}`,
            borderRadius: 0, cursor: 'pointer', transition: 'all .15s',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        }}>{children}</button>
    );

    const pad = isDesktop ? '88px 80px' : '56px 22px';

    return (
        <div style={{ fontFamily: t.font, color: t.fg, background: t.bg, minHeight: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* ── Top Nav ── */}
            <header style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: isDesktop ? '20px 80px' : '18px 22px',
                borderBottom: `1px solid ${t.border}`, position: 'relative', zIndex: 5,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 22, height: 22, background: t.accent, color: t.fg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: t.display, fontSize: 16,
                    }}>F</div>
                    <div style={{ fontFamily: t.display, fontSize: isDesktop ? 22 : 18, letterSpacing: '.05em' }}>
                        FADE HOUSE
                    </div>
                </div>
                {isDesktop && (
                    <nav style={{ display: 'flex', gap: 28, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: 600 }}>
                        <a>Cuts</a><a>Work</a><a>Crew</a><a>Shop</a>
                    </nav>
                )}
                <CTA onClick={openBooking} size="md">{isDesktop ? 'Book a chair' : 'Book'}</CTA>
            </header>

            {/* ── HERO — full bleed poster ── */}
            <section style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', minHeight: isDesktop ? 720 : 560, padding: pad }}>
                    {/* Background image */}
                    <div style={{ position: 'absolute', inset: 0, opacity: .35 }}>
                        <ImgPlaceholder tone="dark" style={{ width: '100%', height: '100%' }} />
                    </div>
                    {/* Vertical bars decor */}
                    <div style={{
                        position: 'absolute', top: 0, bottom: 0, left: 0, width: 6,
                        background: t.accent,
                    }} />
                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 2, paddingTop: isDesktop ? 80 : 30 }}>
                        <Eyebrow>EST. 2017 · COLUMBUS, OH</Eyebrow>
                        <Display size="xl" style={{ display: 'block', maxWidth: '12ch' }}>
                            IN. OUT.<br />
                            <span style={{ color: t.accent }}>FRESH.</span>
                        </Display>
                        <p style={{ fontSize: isDesktop ? 18 : 15, lineHeight: 1.5, maxWidth: 460, margin: '32px 0', color: t.muted }}>
                            Master barber {s.firstName} {s.lastName}. Single-chair shop. No double-booking. Walk in clean — leave cleaner.
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                            <CTA onClick={openBooking} size="lg">Book my cut →</CTA>
                            <div style={{ fontSize: 12, color: t.muted, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                                Or text 614-555-0188
                            </div>
                        </div>
                    </div>
                    {/* Big stat callouts */}
                    {isDesktop && (
                        <div style={{
                            position: 'absolute', right: 80, bottom: 60, display: 'flex', gap: 56,
                            borderTop: `1px solid ${t.border}`, paddingTop: 24,
                        }}>
                            {[
                                { v: '8', l: 'Years cutting' },
                                { v: '4.2K+', l: 'Cuts in the books' },
                                { v: '4.9', l: 'Avg. rating' },
                            ].map((m, i) => (
                                <div key={i}>
                                    <Display size="md">{m.v}</Display>
                                    <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: t.muted, marginTop: 4 }}>{m.l}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* Marquee strip */}
                <div style={{
                    background: t.accent, color: t.fg, padding: '14px 0', overflow: 'hidden',
                    fontFamily: t.display, fontSize: isDesktop ? 22 : 16, letterSpacing: '.1em',
                    borderTop: `2px solid ${t.fg}`, borderBottom: `2px solid ${t.fg}`,
                    whiteSpace: 'nowrap',
                }}>
                    <div style={{ animation: 'fh-marq 25s linear infinite', display: 'inline-block', paddingLeft: '100%' }}>
                        FADES · LINEUPS · BEARDS · HOT TOWELS · KID'S CUTS · WALK-INS · FADES · LINEUPS · BEARDS · HOT TOWELS · KID'S CUTS · WALK-INS ·&nbsp;
                    </div>
                    <style>{`@keyframes fh-marq{from{transform:translateX(0)}to{transform:translateX(-100%)}}`}</style>
                </div>
            </section>

            {/* ── SERVICES — big number list ── */}
            <section style={{ padding: pad }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <Eyebrow>THE MENU</Eyebrow>
                        <Display size="lg">Cuts &<br />Prices.</Display>
                    </div>
                    <div style={{ fontSize: 12, color: t.muted, maxWidth: 240, textAlign: isDesktop ? 'right' : 'left' }}>
                        All cuts include lineup, eyebrow detail & a hot towel finish.
                    </div>
                </div>
                <div>
                    {T_FADE.services.map((svc, i) => (
                        <button key={i} onClick={openBooking} style={{
                            width: '100%', display: 'grid',
                            gridTemplateColumns: isDesktop ? '70px 1fr 1fr 110px 110px' : '50px 1fr auto',
                            gap: 16, alignItems: 'center',
                            padding: isDesktop ? '24px 0' : '20px 0',
                            borderTop: `1px solid ${t.border}`,
                            background: 'transparent', border: 'none', borderTopColor: t.border,
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: t.fg,
                            transition: 'background .15s',
                        }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,54,31,.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                            <Display size="md" style={{ color: t.accent }}>{String(i + 1).padStart(2, '0')}</Display>
                            <Display size="md" style={{ display: 'block' }}>{svc.name}</Display>
                            {isDesktop && <span style={{ fontSize: 13, color: t.muted }}>{svc.desc}</span>}
                            {isDesktop && <span style={{ fontFamily: t.display, fontSize: 16, color: t.muted, letterSpacing: '.05em' }}>{svc.duration}</span>}
                            <Display size="md" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                                ${svc.price}
                            </Display>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── PORTFOLIO ── */}
            <section style={{ padding: pad, borderTop: `1px solid ${t.border}`, background: '#070707' }}>
                <Eyebrow>THE WORK</Eyebrow>
                <Display size="lg" style={{ display: 'block', marginBottom: 32 }}>FRESH OFF<br />THE CHAIR.</Display>
                <div style={{
                    display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                    gap: isDesktop ? 14 : 8,
                }}>
                    {T_FADE.gallery.map((g, i) => (
                        <button key={i} onClick={() => setGalleryIdx(i)} style={{
                            padding: 0, border: 'none', cursor: 'pointer',
                            aspectRatio: '1/1', position: 'relative', overflow: 'hidden',
                        }}>
                            <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
                            <div style={{
                                position: 'absolute', top: 8, left: 8, padding: '4px 8px', background: t.accent, color: t.fg,
                                fontFamily: t.display, fontSize: 12, letterSpacing: '.08em',
                            }}>#{String(i + 1).padStart(2, '0')}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section style={{ padding: pad, borderTop: `1px solid ${t.border}` }}>
                <div style={{
                    display: isDesktop ? 'grid' : 'block',
                    gridTemplateColumns: isDesktop ? '1.2fr 1fr' : 'none', gap: 60,
                }}>
                    <div>
                        <Eyebrow>THE BARBER</Eyebrow>
                        <Display size="lg" style={{ display: 'block', marginBottom: 24 }}>
                            MARCUS<br />BUILT THIS.
                        </Display>
                        <p style={{ fontSize: isDesktop ? 17 : 15, lineHeight: 1.55, color: t.muted, marginBottom: 28, maxWidth: 480 }}>
                            {s.bio}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                            {[
                                { l: 'Trained', v: 'Detroit · ATL' },
                                { l: 'Specialty', v: 'Skin fade, lineup' },
                                { l: 'Hours', v: 'Tue–Sat 9–7' },
                                { l: 'Walk-ins', v: 'Welcome' },
                            ].map((m, i) => (
                                <div key={i} style={{ borderLeft: `2px solid ${t.accent}`, paddingLeft: 14 }}>
                                    <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: t.muted, marginBottom: 4 }}>{m.l}</div>
                                    <div style={{ fontFamily: t.display, fontSize: 18 }}>{m.v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ aspectRatio: '4/5', position: 'relative', marginTop: isDesktop ? 0 : 32 }}>
                        <ImgPlaceholder tone="dark" label="Portrait · Marcus" style={{ width: '100%', height: '100%' }} />
                        <div style={{
                            position: 'absolute', bottom: 16, left: 16, right: 16,
                            padding: 14, background: t.accent, color: t.fg,
                        }}>
                            <Display size="md">"BARBER OF THE YEAR"</Display>
                            <div style={{ fontSize: 11, marginTop: 4, letterSpacing: '.12em', textTransform: 'uppercase' }}>Columbus Magazine, 2024</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── REVIEWS ── */}
            <section style={{ padding: pad, borderTop: `1px solid ${t.border}`, background: t.accent, color: t.fg }}>
                <Eyebrow style={{ color: t.fg }}>WORD ON THE STREET</Eyebrow>
                <Display size="lg" style={{ display: 'block', marginBottom: 40 }}>4.9 / 5.<br />FROM 320+ REVIEWS.</Display>
                <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: 24 }}>
                    {T_FADE.reviews.map((r, i) => (
                        <div key={i} style={{ background: '#0e0e0e', padding: 24, position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, padding: '4px 10px', background: t.fg, color: t.accent, fontFamily: t.display, fontSize: 14 }}>
                                #{String(i + 1).padStart(2, '0')}
                            </div>
                            <div style={{ marginTop: 18 }}>
                                <Stars n={r.stars} color={t.accent} size={12} />
                            </div>
                            <p style={{ fontSize: 15, lineHeight: 1.5, margin: '14px 0 18px' }}>"{r.body}"</p>
                            <div style={{ fontFamily: t.display, fontSize: 14, letterSpacing: '.08em' }}>— {r.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── BOOKING CTA ── */}
            <section style={{ padding: isDesktop ? '120px 80px' : '72px 22px', textAlign: 'center', borderTop: `1px solid ${t.border}` }}>
                <Display size="xl" style={{ display: 'block', marginBottom: 24 }}>
                    BOOK<br /><span style={{ color: t.accent }}>THE CHAIR.</span>
                </Display>
                <p style={{ fontSize: isDesktop ? 17 : 15, color: t.muted, maxWidth: 420, margin: '0 auto 32px' }}>
                    Slots open Sunday night for the week. Get in early — the 5pm Fridays go fast.
                </p>
                <CTA onClick={openBooking} size="lg">Reserve a chair →</CTA>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{
                padding: isDesktop ? '40px 80px' : '36px 22px',
                borderTop: `1px solid ${t.border}`,
                display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', gap: 40, alignItems: 'flex-start',
            }}>
                <div style={{ marginBottom: isDesktop ? 0 : 24 }}>
                    <Display size="md">FADE HOUSE</Display>
                    <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.7, marginTop: 8 }}>
                        418 N High Street<br />Columbus, OH 43215<br />614 · 555 · 0188
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                    {[
                        { h: 'Hours', items: ['Tue–Fri 9–7', 'Sat 8–6', 'Sun & Mon: closed'] },
                        { h: 'Follow', items: ['Instagram @fadehouse', 'TikTok @fadehouse'] },
                    ].map((col, i) => (
                        <div key={i}>
                            <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: t.muted, marginBottom: 10, fontWeight: 600 }}>{col.h}</div>
                            {col.items.map((it, j) => <div key={j} style={{ fontSize: 13, marginBottom: 6 }}>{it}</div>)}
                        </div>
                    ))}
                </div>
            </footer>

            <BookingModal
                open={bookingOpen} onClose={() => setBookingOpen(false)}
                theme={t} services={T_FADE.services}
                stylistName={`${s.firstName} ${s.lastName}`}
            />
            <Lightbox
                open={galleryIdx !== null} items={T_FADE.gallery} idx={galleryIdx ?? 0}
                onClose={() => setGalleryIdx(null)}
                onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_FADE.gallery.length) % T_FADE.gallery.length)}
                onNext={() => setGalleryIdx((galleryIdx! + 1) % T_FADE.gallery.length)}
                theme={t}
            />
        </div>
    );
}

