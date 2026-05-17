// shared.jsx — primitives shared across all 6 AfroAllure templates
// Image placeholders, booking flow, gallery lightbox, star icons, etc.

import { useEffect, useState } from "react";

// ─── Image placeholder ──────────────────────────────────────
// Striped diagonal placeholder with optional mono label.
// kind: 'portrait' | 'work' | 'hero' | 'abstract'
export function ImgPlaceholder({ label, kind = 'work', tone = 'warm', style = {}, children }: any) {
    const palettes = {
        warm: { a: '#d4c5b0', b: '#c4b09a', text: 'rgba(40,30,20,.6)' },
        dark: { a: '#2a2520', b: '#1f1b17', text: 'rgba(255,255,255,.5)' },
        cool: { a: '#cdc8d4', b: '#b9b3c2', text: 'rgba(40,40,60,.55)' },
        rouge: { a: '#e8c8c8', b: '#d4b0b0', text: 'rgba(80,30,40,.6)' },
        gold: { a: '#e2c894', b: '#c9a86a', text: 'rgba(60,40,20,.65)' },
        aubergine: { a: '#5a3759', b: '#3d1f3d', text: 'rgba(255,220,200,.65)' },
        bone: { a: '#ebe6dd', b: '#dcd5c8', text: 'rgba(40,40,40,.55)' },
        plum: { a: '#3d1a3d', b: '#2a0f2a', text: 'rgba(255,200,180,.6)' },
    } as any;
    const p = palettes[tone] || palettes.warm;
    return (
        <div style={{
            position: 'relative', overflow: 'hidden',
            backgroundImage: `repeating-linear-gradient(135deg, ${p.a} 0 14px, ${p.b} 14px 28px)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...style,
        }}>
            {children}
            {label && (
                <span style={{
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                    fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
                    color: p.text, padding: '4px 8px',
                    background: 'rgba(255,255,255,.35)', borderRadius: 2, mixBlendMode: 'multiply',
                }}>{label}</span>
            )}
        </div>
    );
}

// ─── Star rating ────────────────────────────────────────────
export function Stars({ n = 5, size = 12, color = '#1a1410' }) {
    return (
        <div style={{ display: 'inline-flex', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 12 12">
                    <path d="M6 1l1.5 3.2 3.5.5-2.5 2.4.6 3.4L6 8.9 2.9 10.5l.6-3.4L1 4.7l3.5-.5L6 1z"
                        fill={i < n ? color : 'transparent'} stroke={color} strokeWidth=".5" />
                </svg>
            ))}
        </div>
    );
}

// ─── Booking flow modal ─────────────────────────────────────
// 4 steps: Service → Date/Time → Contact → Confirmation
// Theme: { bg, fg, accent, accentFg, muted, border, font, radius }
export function BookingModal({ open, onClose, theme, services = [], stylistName = 'Studio' }: any) {
    const [step, setStep] = useState(0);
    const [service, setService] = useState<any>(null);
    const [date, setDate] = useState<any>(null);
    const [time, setTime] = useState<any>(null);
    const [contact, setContact] = useState<any>({ name: '', email: '', phone: '', notes: '' });

    useEffect(() => {
        if (open) { setStep(0); setService(null); setDate(null); setTime(null); setContact({ name: '', email: '', phone: '', notes: '' }); }
    }, [open]);

    if (!open) return null;

    const t = theme;
    const days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        return d;
    });
    const times = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
    const canNext = [service, date && time, contact.name && contact.email && contact.phone][step];

    const stepLabel = ['Choose service', 'Date & time', 'Your details', 'Confirmed'];

    return (
        <div onClick={onClose} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100,
            backdropFilter: 'blur(3px)', cursor: 'pointer',
        }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                width: '100%', maxHeight: '92%', background: t.bg, color: t.fg,
                borderTopLeftRadius: t.radius || 18, borderTopRightRadius: t.radius || 18,
                fontFamily: t.font, display: 'flex', flexDirection: 'column',
                animation: 'bk-slide .26s cubic-bezier(.2,.8,.3,1)',
            }}>
                <style>{`@keyframes bk-slide{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
                {/* Header */}
                <div style={{ padding: '14px 18px 10px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {step > 0 && step < 3 ? (
                        <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: t.fg, cursor: 'pointer', padding: 4, fontSize: 18, lineHeight: 1 }}>‹</button>
                    ) : <div style={{ width: 18 }} />}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: t.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                            {step < 3 ? `Step ${step + 1} of 3` : 'Booking confirmed'}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{stepLabel[step]}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', padding: 4, fontSize: 18, lineHeight: 1 }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {services.map((s: any, i: number) => (
                                <button key={i} onClick={() => setService(s)} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                                    padding: 14, background: service?.name === s.name ? t.accent : 'transparent',
                                    color: service?.name === s.name ? t.accentFg : t.fg,
                                    border: `1px solid ${service?.name === s.name ? t.accent : t.border}`,
                                    borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                                    transition: 'all .15s',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, opacity: .7, marginTop: 4 }}>{s.duration}{s.desc ? ' · ' + s.desc : ''}</div>
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: 14 }}>${s.price}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <div style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Pick a date</div>
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 18 }}>
                                {days.map((d, i) => {
                                    const sel = date && d.toDateString() === date.toDateString();
                                    return (
                                        <button key={i} onClick={() => setDate(d)} style={{
                                            flexShrink: 0, padding: '10px 14px', minWidth: 56,
                                            background: sel ? t.accent : 'transparent',
                                            color: sel ? t.accentFg : t.fg,
                                            border: `1px solid ${sel ? t.accent : t.border}`,
                                            borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                        }}>
                                            <span style={{ fontSize: 10, textTransform: 'uppercase', opacity: .7, letterSpacing: '.06em' }}>
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                                            </span>
                                            <span style={{ fontSize: 16, fontWeight: 600 }}>{d.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Available times</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {times.map((tm, i) => (
                                    <button key={i} disabled={!date} onClick={() => setTime(tm)} style={{
                                        padding: '10px 8px', fontSize: 13, fontFamily: 'inherit',
                                        background: time === tm ? t.accent : 'transparent',
                                        color: time === tm ? t.accentFg : (date ? t.fg : t.muted),
                                        border: `1px solid ${time === tm ? t.accent : t.border}`,
                                        borderRadius: 8, cursor: date ? 'pointer' : 'not-allowed',
                                        opacity: date ? 1 : .5,
                                    }}>{tm}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { k: 'name', label: 'Full name', placeholder: 'Your name' },
                                { k: 'email', label: 'Email', placeholder: 'you@email.com' },
                                { k: 'phone', label: 'Phone', placeholder: '(555) 555-1234' },
                            ].map((f: any) => (
                                <label key={f.k} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    <span style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.label}</span>
                                    <input value={contact[f.k]} onChange={(e) => setContact({ ...contact, [f.k]: e.target.value })}
                                        placeholder={f.placeholder}
                                        style={{
                                            padding: '11px 12px', fontSize: 14, fontFamily: 'inherit',
                                            background: t.fieldBg || 'rgba(0,0,0,.04)',
                                            color: t.fg, border: `1px solid ${t.border}`, borderRadius: 8, outline: 'none',
                                        }} />
                                </label>
                            ))}
                            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <span style={{ fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Notes (optional)</span>
                                <textarea value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                                    placeholder="Hair length, style references, anything we should know"
                                    rows={3}
                                    style={{
                                        padding: '11px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'none',
                                        background: t.fieldBg || 'rgba(0,0,0,.04)',
                                        color: t.fg, border: `1px solid ${t.border}`, borderRadius: 8, outline: 'none',
                                    }} />
                            </label>
                            {/* Summary */}
                            <div style={{
                                marginTop: 6, padding: 14, background: t.fieldBg || 'rgba(0,0,0,.04)',
                                borderRadius: 10, fontSize: 12,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: t.muted }}>Service</span><span style={{ fontWeight: 600 }}>{service?.name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ color: t.muted }}>When</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {time}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, marginTop: 8, borderTop: `1px solid ${t.border}` }}>
                                    <span style={{ color: t.muted }}>Total</span><span style={{ fontWeight: 700 }}>${service?.price}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', background: t.accent, color: t.accentFg,
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                            }}>
                                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                    <path d="M6 14.5l5 5 11-12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You're booked!</div>
                            <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.5, marginBottom: 18, maxWidth: 280, margin: '0 auto 18px' }}>
                                A confirmation is on its way to <strong style={{ color: t.fg }}>{contact.email}</strong>. {stylistName} will reach out 24h before to confirm.
                            </div>
                            <div style={{
                                margin: '0 auto', maxWidth: 280, padding: 14, background: t.fieldBg || 'rgba(0,0,0,.04)',
                                borderRadius: 10, fontSize: 12, textAlign: 'left',
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>{service?.name}</div>
                                <div style={{ color: t.muted }}>
                                    {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}<br />
                                    {time} · {service?.duration}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step < 3 && (
                    <div style={{ padding: 14, borderTop: `1px solid ${t.border}` }}>
                        <button disabled={!canNext} onClick={() => setStep(step + 1)} style={{
                            width: '100%', padding: '14px', fontSize: 14, fontWeight: 600,
                            fontFamily: 'inherit', letterSpacing: t.ctaLetter || '.02em',
                            textTransform: t.ctaTransform || 'none',
                            background: canNext ? t.accent : t.border, color: canNext ? t.accentFg : t.muted,
                            border: 'none', borderRadius: t.ctaRadius ?? 10, cursor: canNext ? 'pointer' : 'not-allowed',
                            transition: 'transform .12s',
                        }}>{step === 2 ? 'Confirm booking' : 'Continue'}</button>
                    </div>
                )}
                {step === 3 && (
                    <div style={{ padding: 14, borderTop: `1px solid ${t.border}` }}>
                        <button onClick={onClose} style={{
                            width: '100%', padding: '14px', fontSize: 14, fontWeight: 600,
                            fontFamily: 'inherit',
                            background: 'transparent', color: t.fg,
                            border: `1px solid ${t.border}`, borderRadius: t.ctaRadius ?? 10, cursor: 'pointer',
                        }}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Lightbox for gallery ───────────────────────────────────
export function Lightbox({ open, items, idx, onClose, onPrev, onNext, theme }: any) {
    if (!open) return null;
    const t = theme;
    const item = items[idx];
    return (
        <div onClick={onClose} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 14,
            cursor: 'pointer',
        }}>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
                position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,.1)',
                border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%',
                cursor: 'pointer', fontSize: 16,
            }}>✕</button>
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18,
            }}>‹</button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 18,
            }}>›</button>
            <div onClick={(e) => e.stopPropagation()} style={{
                width: '100%', maxWidth: 360, aspectRatio: '3/4',
                borderRadius: 12, overflow: 'hidden',
            }}>
                <ImgPlaceholder label={item?.label} tone={item?.tone || 'warm'}
                    style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{
                position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center',
                color: 'rgba(255,255,255,.7)', fontFamily: t?.font || 'system-ui',
                fontSize: 12, letterSpacing: '.08em',
            }}>
                {idx + 1} / {items.length} · {item?.label}
            </div>
        </div>
    );
}

// Object.assign(window, { ImgPlaceholder, Stars, BookingModal, Lightbox });
