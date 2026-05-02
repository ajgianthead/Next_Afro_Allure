// templates/maison-tresse.jsx — Editorial luxury braider
// Cream + ink + gold. Fraunces serif headlines, Inter for everything else.
// Vibe: French atelier meets Black hair artistry.
'use client'
import { useEffect, useState } from "react";
import { BookingModal, ImgPlaceholder, Lightbox, Stars } from "./shared";

const T_MAISON = {
  name: 'Maison Tresse',
  tagline: 'Editorial luxury braider',
  description: 'For high-end braiders who treat hair as couture. Quiet confidence, generous whitespace, serif-driven hierarchy.',
  theme: {
    bg: '#f4ede2',
    fg: '#1a1410',
    accent: '#1a1410',
    accentFg: '#f4ede2',
    muted: 'rgba(26,20,16,.55)',
    border: 'rgba(26,20,16,.14)',
    fieldBg: 'rgba(26,20,16,.04)',
    font: '"Inter", system-ui, sans-serif',
    serif: '"Fraunces", "Times New Roman", serif',
    ctaRadius: 0,
    ctaLetter: '.08em',
    ctaTransform: 'uppercase',
    radius: 0,
  },
  stylist: {
    firstName: 'Amani',
    lastName: 'Okonkwo',
    title: 'Luxury Braiding Atelier',
    city: 'Portland, OR',
    bio: "Trained in Lagos and Paris, Amani has spent twelve years perfecting the architecture of the braid — from feather-light micros to sculptural goddess locs. Each appointment is private, single-booking, and treated as a sitting.",
    years: 12,
    clients: 480,
    rating: 4.9,
  },
  services: [
    { name: 'Knotless Box Braids', duration: '5–7 hr', price: 320, desc: 'Mid-back length included' },
    { name: 'Feed-In Cornrows', duration: '2–3 hr', price: 180, desc: 'Custom pattern consultation' },
    { name: 'Goddess Locs', duration: '6–8 hr', price: 380, desc: 'Boho or sleek finish' },
    { name: 'Fulani Braids', duration: '4–5 hr', price: 240, desc: 'Beads & cuffs included' },
    { name: 'Style Consultation', duration: '30 min', price: 40, desc: 'Virtual or in-studio' },
  ],
  gallery: [
    { label: 'Knotless · Mid-back', tone: 'gold' },
    { label: 'Fulani · Beaded', tone: 'warm' },
    { label: 'Goddess Locs', tone: 'dark' },
    { label: 'Cornrows · Feed-in', tone: 'gold' },
    { label: 'Box braids · Waist', tone: 'warm' },
    { label: 'Tribal · Updo', tone: 'dark' },
  ],
  reviews: [
    { name: 'Imani T.', stars: 5, body: "Amani didn't just braid my hair — she sculpted it. The room smelled like tea and rosewood. I felt seen in a way salons rarely do." },
    { name: 'Kemi A.', stars: 5, body: "Worth every dollar. She booked me for the full day, no overlap. My braids were still flawless eight weeks in." },
    { name: 'Sade B.', stars: 5, body: "I drove three hours and would do it again. Quiet, focused, breathtaking work." },
  ],
};

export function MaisonTresse({ device = 'mobile', onBook }: any) {
  const t = T_MAISON.theme;
  const s = T_MAISON.stylist;
  const isDesktop = device === 'desktop';
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);

  const openBooking = (svc: any) => {
    setBookingService(svc || null);
    setBookingOpen(true);
    onBook?.();
  };

  // Pre-select service if user clicked on one
  useEffect(() => {
    if (bookingOpen && bookingService) {
      // Booking modal accepts services list — preselected handled by ordering
    }
  }, [bookingOpen]);

  const containerStyle = {
    fontFamily: t.font, color: t.fg, background: t.bg,
    minHeight: '100%', position: 'relative', overflow: 'hidden',
  };

  // Section pad — wider on desktop
  const pad = isDesktop ? '88px 80px' : '56px 22px';
  const heroPad = isDesktop ? '120px 80px 100px' : '28px 22px 56px';

  const Heading = ({ children, size = 'lg', style = {} }: any) => (
    <span style={{
      fontFamily: t.serif, fontWeight: 400, letterSpacing: '-.02em',
      fontSize: size === 'xl' ? (isDesktop ? 88 : 44)
        : size === 'lg' ? (isDesktop ? 64 : 34)
          : size === 'md' ? (isDesktop ? 40 : 26) : 20,
      lineHeight: 1.05, ...style,
    }}>{children}</span>
  );

  const Eyebrow = ({ children }: any) => (
    <div style={{
      fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase',
      color: t.muted, marginBottom: 18, fontWeight: 500,
    }}>{children}</div>
  );

  const CTA = ({ children, onClick, variant = 'solid', size = 'md' }: any) => (
    <button onClick={onClick} style={{
      fontFamily: t.font, fontSize: size === 'lg' ? 13 : 12, fontWeight: 600,
      letterSpacing: '.16em', textTransform: 'uppercase',
      padding: size === 'lg' ? '18px 32px' : '14px 24px',
      background: variant === 'solid' ? t.fg : 'transparent',
      color: variant === 'solid' ? t.bg : t.fg,
      border: variant === 'solid' ? 'none' : `1px solid ${t.fg}`,
      borderRadius: 0, cursor: 'pointer', transition: 'all .2s',
    }}>{children}</button>
  );

  return (
    <div style={{ ...containerStyle, position: 'relative' }}>
      {/* ── Top Nav ─────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isDesktop ? '24px 80px' : '20px 22px',
        borderBottom: `1px solid ${t.border}`, position: 'relative', zIndex: 5,
      }}>
        <div style={{ fontFamily: t.serif, fontSize: isDesktop ? 22 : 18, letterSpacing: '-.02em' }}>
          Maison <em style={{ fontStyle: 'italic' }}>Tresse</em>
        </div>
        {isDesktop ? (
          <nav style={{ display: 'flex', gap: 32, fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            <a style={{ color: t.fg }}>Atelier</a>
            <a style={{ color: t.fg }}>Services</a>
            <a style={{ color: t.fg }}>Portfolio</a>
            <a style={{ color: t.fg }}>Contact</a>
          </nav>
        ) : (
          <div style={{ width: 22, height: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ height: 1, background: t.fg }} />
            <div style={{ height: 1, background: t.fg }} />
          </div>
        )}
        <CTA size="md">{isDesktop ? 'Book a sitting' : 'Book'}</CTA>
      </header>

      {/* ── HERO ────────────────────────────── */}
      <section style={{ padding: heroPad, position: 'relative' }}>
        <div style={{
          display: isDesktop ? 'grid' : 'block',
          gridTemplateColumns: isDesktop ? '1fr 1fr' : 'none',
          gap: isDesktop ? 60 : 0, alignItems: 'center',
        }}>
          <div>
            <Eyebrow>Est. 2014 · By appointment</Eyebrow>
            <Heading size="xl" style={{ display: 'block', marginBottom: 24 }}>
              The art of<br />
              <em style={{ fontStyle: 'italic' }}>quiet </em>
              <span style={{ borderBottom: `2px solid ${t.fg}`, paddingBottom: 2 }}>luxury</span><br />
              braiding.
            </Heading>
            <p style={{
              fontSize: isDesktop ? 17 : 15, lineHeight: 1.55, color: t.muted,
              maxWidth: 440, marginBottom: 32, marginTop: 0,
            }}>
              {s.firstName} {s.lastName} accepts a single client per day. Every braid is hand-installed in a private studio in {s.city}, with no rush and no overlap.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <CTA onClick={() => { }} size="lg">Book a sitting</CTA>
              <CTA variant="ghost" size="lg">View portfolio</CTA>
            </div>
            {/* Trust strip */}
            <div style={{
              display: 'flex', gap: isDesktop ? 40 : 24, marginTop: isDesktop ? 56 : 40,
              paddingTop: isDesktop ? 32 : 24, borderTop: `1px solid ${t.border}`,
            }}>
              {[
                { v: `${s.years} yrs`, l: 'Atelier practice' },
                { v: `${s.rating}/5`, l: `${s.clients}+ clients` },
                { v: 'By referral', l: 'New & returning' },
              ].map((m, i) => (
                <div key={i}>
                  <div style={{ fontFamily: t.serif, fontSize: isDesktop ? 28 : 22, marginBottom: 4 }}>{m.v}</div>
                  <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: t.muted }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Hero image */}
          <div style={{
            marginTop: isDesktop ? 0 : 36,
            aspectRatio: isDesktop ? '4/5' : '4/5',
            position: 'relative',
          }}>
            <ImgPlaceholder tone="gold" label="Portrait · Featured client" style={{ width: '100%', height: '100%' }} />
            <div style={{
              position: 'absolute', bottom: -1, right: -1,
              padding: '14px 18px', background: t.bg,
              fontFamily: t.serif, fontSize: 13, fontStyle: 'italic',
              borderTop: `1px solid ${t.fg}`, borderLeft: `1px solid ${t.fg}`,
            }}>
              "She braids like she's drawing." — Vogue, '24
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────── */}
      <section style={{ padding: pad, borderTop: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Eyebrow>I · Services</Eyebrow>
            <Heading size="lg">The menu.</Heading>
          </div>
          <div style={{ fontSize: 12, color: t.muted, maxWidth: 260 }}>
            Pricing reflects a single-client day, premium hair, and aftercare kit. Tax included.
          </div>
        </div>
        <div>
          {T_MAISON.services.map((svc, i) => (
            <button key={i} onClick={() => openBooking(svc)} style={{
              width: '100%', display: 'grid',
              gridTemplateColumns: isDesktop ? '60px 1.4fr 1fr 1fr auto' : '24px 1fr auto',
              gap: 16, alignItems: 'center',
              padding: isDesktop ? '28px 0' : '20px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${t.border}`,
              background: 'transparent', border: 'none', borderTopColor: t.border,
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              color: t.fg,
            }}>
              <span style={{ fontFamily: t.serif, fontSize: 14, color: t.muted, fontStyle: 'italic' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Heading size="md" style={{ display: 'block' }}>{svc.name}</Heading>
              {isDesktop && <span style={{ fontSize: 13, color: t.muted }}>{svc.desc}</span>}
              {isDesktop && <span style={{ fontSize: 12, color: t.muted, letterSpacing: '.08em' }}>{svc.duration}</span>}
              <span style={{
                fontFamily: t.serif, fontSize: isDesktop ? 24 : 18, fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ${svc.price}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO ───────────────────────── */}
      <section style={{ padding: pad, borderTop: `1px solid ${t.border}`, background: '#ebe2d3' }}>
        <Eyebrow>II · Portfolio</Eyebrow>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <Heading size="lg" style={{ maxWidth: 520 }}>
            Selected <em style={{ fontStyle: 'italic' }}>sittings</em>, '23–'25.
          </Heading>
          <a style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: t.fg, paddingBottom: 4, borderBottom: `1px solid ${t.fg}` }}>
            Full archive →
          </a>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: isDesktop ? 16 : 8,
        }}>
          {T_MAISON.gallery.map((g: any, i: number) => (
            <button key={i} onClick={() => setGalleryIdx(i)} style={{
              padding: 0, border: 'none', cursor: 'pointer',
              aspectRatio: i === 0 ? '4/5' : '3/4',
              gridRow: isDesktop && i === 0 ? 'span 2' : 'auto',
              gridColumn: isDesktop && i === 0 ? 'span 1' : 'auto',
            }}>
              <ImgPlaceholder tone={g.tone} label={g.label} style={{ width: '100%', height: '100%' }} />
            </button>
          ))}
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────── */}
      <section style={{ padding: pad, borderTop: `1px solid ${t.border}` }}>
        <div style={{
          display: isDesktop ? 'grid' : 'block',
          gridTemplateColumns: isDesktop ? '1fr 1.2fr' : 'none', gap: 60, alignItems: 'start',
        }}>
          <div style={{ aspectRatio: '4/5', position: 'relative', marginBottom: isDesktop ? 0 : 32 }}>
            <ImgPlaceholder tone="warm" label="Portrait · Amani in studio" style={{ width: '100%', height: '100%' }} />
          </div>
          <div>
            <Eyebrow>III · About</Eyebrow>
            <Heading size="lg" style={{ display: 'block', marginBottom: 24 }}>
              Twelve years.<br />
              Four hundred<br />
              <em style={{ fontStyle: 'italic' }}>eighty </em>sittings.
            </Heading>
            <p style={{ fontSize: isDesktop ? 16 : 14, lineHeight: 1.65, color: t.muted, marginBottom: 24, maxWidth: 480 }}>
              {s.bio}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              {[
                'Trained — Lagos, then Paris (École Atelier)',
                'Featured — Vogue, Essence, hair stories',
                'Studio — Private, single-booking, in NW Portland',
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, fontSize: 13, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: t.serif, fontStyle: 'italic', color: t.muted, fontSize: 12 }}>—</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ───────────────────────── */}
      <section style={{ padding: pad, borderTop: `1px solid ${t.border}`, background: '#1a1410', color: '#f4ede2' }}>
        <Eyebrow>IV · Words</Eyebrow>
        <Heading size="lg" style={{ display: 'block', marginBottom: isDesktop ? 56 : 40, maxWidth: 600 }}>
          From those who've sat.
        </Heading>
        <div style={{
          display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: isDesktop ? 32 : 24,
        }}>
          {T_MAISON.reviews.map((r, i) => (
            <div key={i} style={{ borderTop: `1px solid rgba(244,237,226,.2)`, paddingTop: 20 }}>
              <Stars n={r.stars} color="#f4ede2" size={11} />
              <p style={{
                fontFamily: t.serif, fontSize: isDesktop ? 22 : 18, lineHeight: 1.35, fontStyle: 'italic',
                margin: '14px 0 24px', color: '#f4ede2',
              }}>"{r.body}"</p>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,237,226,.6)' }}>
                — {r.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING CTA ─────────────────────── */}
      <section style={{ padding: isDesktop ? '120px 80px' : '72px 22px', textAlign: 'center', borderTop: `1px solid ${t.border}` }}>
        <Eyebrow>V</Eyebrow>
        <Heading size="xl" style={{ display: 'block', marginBottom: 24 }}>
          The chair<br />
          <em style={{ fontStyle: 'italic' }}>is yours.</em>
        </Heading>
        <p style={{ fontSize: isDesktop ? 17 : 15, color: t.muted, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.5 }}>
          One client per day. Booking opens six weeks out and tends to fill within forty-eight hours.
        </p>
        <CTA onClick={() => { }} size="lg">Reserve your sitting</CTA>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer style={{
        padding: isDesktop ? '48px 80px' : '40px 22px',
        borderTop: `1px solid ${t.border}`, background: t.bg,
        display: isDesktop ? 'flex' : 'block', justifyContent: 'space-between', gap: 40,
      }}>
        <div style={{ marginBottom: isDesktop ? 0 : 32 }}>
          <div style={{ fontFamily: t.serif, fontSize: 22, marginBottom: 12 }}>Maison <em style={{ fontStyle: 'italic' }}>Tresse</em></div>
          <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.7 }}>
            2104 NW Lovejoy St<br />
            Portland, OR 97210<br />
            By appointment only
          </div>
        </div>
        <div style={{ display: 'flex', gap: isDesktop ? 56 : 32, flexWrap: 'wrap' }}>
          {[
            { h: 'Studio', items: ['amani@maisontresse.co', '+1 503 555 0142'] },
            { h: 'Hours', items: ['Tue–Sat by booking', 'Sun & Mon: closed'] },
            { h: 'Follow', items: ['Instagram', 'TikTok'] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: t.muted, marginBottom: 12 }}>{col.h}</div>
              {col.items.map((item, j) => (
                <div key={j} style={{ fontSize: 13, marginBottom: 6 }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </footer>

      <BookingModal
        open={bookingOpen} onClose={() => setBookingOpen(false)}
        theme={t}
        services={T_MAISON.services}
        stylistName={`${s.firstName} ${s.lastName}`}
      />
      <Lightbox
        open={galleryIdx !== null} items={T_MAISON.gallery} idx={galleryIdx ?? 0}
        onClose={() => setGalleryIdx(null)}
        onPrev={() => setGalleryIdx((galleryIdx! - 1 + T_MAISON.gallery.length) % T_MAISON.gallery.length)}
        onNext={() => setGalleryIdx((galleryIdx! + 1) % T_MAISON.gallery.length)}
        theme={t}
      />
    </div>
  );
}

// window.MaisonTresse = MaisonTresse;
// window.T_MAISON = T_MAISON;
