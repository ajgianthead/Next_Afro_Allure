'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"
const RED   = '#FC6161'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const GREEN = '#10B981'
const GOLD  = '#C9974A'

type Phase = 'dm' | 'typing' | 'reply' | 'link_sent' | 'paid' | 'calendar' | 'confirmed' | 'fading'

function usePRM() {
  const [r, setR] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setR(mq.matches)
    const h = () => setR(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return r
}

function StatusBar({ bg = '#fff', ink = '#1A1818' }: { bg?: string; ink?: string }) {
  return (
    <div style={{
      height: 22, padding: '0 14px',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 9, color: ink }}>9:41</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
          {[0, 1, 2, 3].map((_, i) => (
            <rect key={i} x={i * 3.5} y={9 - (i + 1) * 2.1} width="2.2" height={(i + 1) * 2.1} rx="0.6"
              fill={ink} opacity={0.25 + i * 0.22} />
          ))}
        </svg>
        <svg width="17" height="9" viewBox="0 0 17 9">
          <rect x="0" y="1.5" width="13" height="6" rx="1.5" stroke={ink} strokeWidth="1" fill="none" opacity="0.7" />
          <rect x="13.5" y="3" width="2" height="3" rx="0.5" fill={ink} opacity="0.7" />
          <rect x="0.8" y="2.2" width="9" height="4.6" rx="0.8" fill={ink} opacity="0.7" />
        </svg>
      </div>
    </div>
  )
}

// ── DM Screen ─────────────────────────────────────────────────────────
function DmScreen({ phase }: { phase: Phase }) {
  const showTyping = phase === 'typing'
  const showReply  = ['reply', 'link_sent', 'paid'].includes(phase)
  const showNotif  = ['link_sent', 'paid'].includes(phase)
  const isPaid     = phase === 'paid'

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <StatusBar />

      {/* IG DM header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px 6px 6px',
        borderBottom: '0.5px solid #E8E8E8', flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        {/* Story-ring avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
          padding: 2,
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: '#E3CABB', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, fontWeight: 700, fontSize: 12, color: '#5C3317',
          }}>S</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: INK, lineHeight: 1.2 }}>Client</div>
          <div style={{ fontFamily: SANS, fontSize: 10, color: '#999', lineHeight: 1 }}>Active now</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, opacity: 0.4 }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: INK }} />)}
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, background: '#F7F7F7',
        padding: '10px 10px 6px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        gap: 5, overflow: 'hidden',
      }}>
        {/* Faint context messages */}
        <div style={{ opacity: 0.28, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ alignSelf: 'flex-end', background: '#3797F0', borderRadius: '13px 13px 3px 13px', padding: '6px 10px', fontFamily: SANS, fontSize: 12, color: '#fff', maxWidth: '68%', lineHeight: 1.4 }}>
            Hey! 👋
          </div>
          <div style={{ alignSelf: 'flex-start', background: '#E5E5E5', borderRadius: '13px 13px 13px 3px', padding: '6px 10px', fontFamily: SANS, fontSize: 12, color: INK, maxWidth: '68%', lineHeight: 1.4 }}>
            Hey, what's good!
          </div>
        </div>

        {/* Client's booking message */}
        <div style={{
          alignSelf: 'flex-start', background: '#E5E5E5',
          borderRadius: '14px 14px 14px 3px', padding: '8px 12px',
          fontFamily: SANS, fontSize: 13, color: INK, maxWidth: '84%', lineHeight: 1.45,
        }}>
          Hey! Are you available Saturday? 🖤
        </div>

        {/* Stylist typing / reply */}
        <AnimatePresence mode="wait">
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                alignSelf: 'flex-end', background: '#3797F0',
                borderRadius: '14px 14px 3px 14px', padding: '9px 13px',
                display: 'flex', gap: 4, alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'block' }}
                />
              ))}
            </motion.div>
          )}
          {showReply && (
            <motion.div
              key="reply"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              style={{
                alignSelf: 'flex-end', background: '#3797F0',
                borderRadius: '14px 14px 3px 14px', padding: '8px 12px',
                fontFamily: SANS, fontSize: 13, color: '#fff', maxWidth: '82%', lineHeight: 1.45,
              }}
            >
              Yes! I'll send your deposit link 🔗
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
        borderTop: '0.5px solid #E8E8E8', background: '#fff', flexShrink: 0,
      }}>
        <div style={{ flex: 1, background: '#F0F0F0', borderRadius: 999, padding: '7px 12px', fontFamily: SANS, fontSize: 12, color: '#999' }}>
          Message…
        </div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3797F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
      </div>

      {/* AfroAllure notification banner */}
      <AnimatePresence>
        {showNotif && (
          <motion.div
            key="notif"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute', top: 28, left: 8, right: 8, zIndex: 30,
              background: 'rgba(18,18,18,0.93)',
              backdropFilter: 'blur(14px)',
              borderRadius: 13, padding: '9px 12px',
              display: 'flex', alignItems: 'center', gap: 9,
            }}
          >
            {/* App icon — animates color between red and green */}
            <motion.div
              animate={{ background: isPaid ? GREEN : RED }}
              transition={{ duration: 0.28 }}
              style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AnimatePresence mode="wait">
                {isPaid ? (
                  <motion.svg key="check-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <path d="M5 12l5 5L20 7" />
                  </motion.svg>
                ) : (
                  <motion.svg key="link-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 8.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.2 }}>
                AfroAllure
              </div>
              {/* Text cross-fades between the two notification states */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPaid ? 'paid-text' : 'sent-text'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{ fontFamily: SANS, fontSize: 10.5, color: '#fff', lineHeight: 1.38 }}
                >
                  {isPaid
                    ? '💳 Sarah paid her $50 deposit'
                    : '⚡ Deposit link sent to Sarah automatically'}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Calendar Screen ────────────────────────────────────────────────────
const CAL_DAYS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const CAL_TIMES = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm']

function CalendarScreen({ phase }: { phase: Phase }) {
  const showAppt  = ['calendar', 'confirmed', 'fading'].includes(phase)
  const showPills = ['confirmed', 'fading'].includes(phase)
  const rowH      = `${100 / CAL_TIMES.length}%`

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#FAF7F2' }}>
      <StatusBar bg="#FAF7F2" />

      <div style={{ padding: '6px 12px 4px', flexShrink: 0 }}>
        <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, color: INK, letterSpacing: '-.01em' }}>This Week</div>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 1, padding: '0 8px 3px', flexShrink: 0 }}>
        <div />
        {CAL_DAYS.map(d => (
          <div key={d} style={{ fontFamily: SANS, fontSize: 9, fontWeight: 600, textAlign: 'center', color: d === 'Sa' ? RED : MUTED }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, padding: '0 8px 4px', overflow: 'hidden', position: 'relative' }}>
        {CAL_TIMES.map((time, ti) => (
          <div key={time} style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 1, height: rowH, alignItems: 'stretch' }}>
            <div style={{ fontFamily: SANS, fontSize: 8, color: MUTED, paddingTop: 2 }}>{time}</div>
            {CAL_DAYS.map((_, di) => (
              <div key={di} style={{
                borderTop: `0.5px solid ${LINE}`,
                background: di === 6 ? 'rgba(252,97,97,0.03)' : 'transparent',
                position: 'relative', overflow: 'visible',
              }}>
                {/* Appointment block: Saturday (di=6) at 2pm (ti=5) */}
                {di === 6 && ti === 5 && (
                  <AnimatePresence>
                    {showAppt && (
                      <motion.div
                        key="appt"
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        style={{ transformOrigin: 'top' }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div style={{
                          position: 'absolute', top: 1, bottom: -1, left: 0, right: -1,
                          background: '#FFF0F0', borderLeft: `2.5px solid ${RED}`,
                          borderRadius: '0 4px 4px 0', padding: '2px 4px', zIndex: 10,
                        }}>
                          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 7.5, color: RED, lineHeight: 1.2 }}>Sarah J</div>
                          <div style={{ fontFamily: SANS, fontSize: 7, color: MUTED, lineHeight: 1.3 }}>Knotless</div>
                          <AnimatePresence>
                            {showPills && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                style={{ position: 'absolute', top: 2, right: 2 }}
                              >
                                <div style={{ width: 11, height: 11, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                                    <path d="M5 12l5 5L20 7" />
                                  </svg>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Confirmed / Reminder pills */}
      <div style={{ padding: '4px 10px 10px', display: 'flex', gap: 5, flexShrink: 0 }}>
        <AnimatePresence>
          {showPills && (
            <>
              <motion.div
                key="pill-confirmed"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                style={{ background: '#ECFDF5', borderRadius: 999, padding: '4px 9px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GREEN, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7" /></svg>
                Confirmed
              </motion.div>
              <motion.div
                key="pill-reminder"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.12 }}
                style={{ background: '#FEF3C7', borderRadius: 999, padding: '4px 9px', fontFamily: SANS, fontSize: 10, fontWeight: 600, color: GOLD, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
                Reminder set
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────
export function HeroDemo() {
  const [phase, setPhase] = useState<Phase>('dm')
  const prm    = usePRM()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (prm) { setPhase('confirmed'); return }

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    const at = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

    function cycle() {
      setPhase('dm')
      at(() => setPhase('typing'),    800)
      at(() => setPhase('reply'),     1900)
      at(() => setPhase('link_sent'), 3200)
      at(() => setPhase('paid'),      4700)
      at(() => setPhase('calendar'),  6300)
      at(() => setPhase('confirmed'), 7300)
      at(() => setPhase('fading'),    8400)
      at(cycle, 9100)
    }
    cycle()
    return clear
  }, [prm])

  const showCal = ['calendar', 'confirmed', 'fading'].includes(phase)

  return (
    <div role="img" aria-label="Demo showing the full DM-to-confirmed booking flow"
      style={{ position: 'relative', flexShrink: 0, perspective: '1400px' }}>
      {/* Glow — shifted left to follow the tilt direction */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        inset: '-70px -50px',
        background: 'radial-gradient(ellipse 90% 80% at 38% 56%, rgba(252,97,97,.26) 0%, rgba(201,151,74,.09) 52%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Phone frame — bigger, tilted in 3D */}
      <motion.div
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 290, height: 560,
          border: '10px solid #111',
          borderRadius: 48,
          overflow: 'hidden',
          position: 'relative',
          rotateY: -16,
          rotateX: 6,
          rotate: -1,
          boxShadow: '-28px 44px 100px rgba(0,0,0,0.62), inset 0 0 0 1px rgba(255,255,255,0.07)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div aria-hidden="true" style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
          {/* Layer 1: DM (base, shown until calendar takes over) */}
          {!showCal && <DmScreen phase={phase} />}

          {/* Layer 2: Calendar (fades in over DM) */}
          <AnimatePresence>
            {showCal && (
              <motion.div
                key="cal-layer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.52 }}
                style={{ position: 'absolute', inset: 0 }}
              >
                <CalendarScreen phase={phase} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
