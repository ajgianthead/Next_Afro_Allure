'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DemoCard } from './DemoCard'

const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS  = "'Inter', system-ui, sans-serif"
const RED   = '#FC6161'
const INK   = '#1A1818'
const MUTED = '#6F6863'
const LINE  = '#E8E2D6'
const GREEN = '#10B981'
const GOLD  = '#C9974A'

const DAYS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const TIMES = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm']

type Phase = 'empty' | 'appointment' | 'check' | 'confirmed' | 'reminder' | 'fading'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = () => setReduced(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return reduced
}

export function ConfirmationDemo() {
  const [phase, setPhase] = useState<Phase>('empty')
  const reduced = usePrefersReducedMotion()
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (reduced) { setPhase('reminder'); return }

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    const at = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

    function cycle() {
      setPhase('empty')
      at(() => setPhase('appointment'), 500)
      at(() => setPhase('check'),       1500)
      at(() => setPhase('confirmed'),   2500)
      at(() => setPhase('reminder'),    3100)
      at(() => setPhase('fading'),      3900)
      at(cycle, 4400)
    }
    cycle()
    return clear
  }, [reduced])

  const showAppt      = ['appointment', 'check', 'confirmed', 'reminder', 'fading'].includes(phase)
  const showCheck     = ['check', 'confirmed', 'reminder', 'fading'].includes(phase)
  const showConfirmed = ['confirmed', 'reminder', 'fading'].includes(phase)
  const showReminder  = ['reminder', 'fading'].includes(phase)
  const rowH = `${100 / TIMES.length}%`

  return (
    <DemoCard ariaLabel="Demo showing a confirmed appointment appearing in the calendar with an automatic reminder">
      <motion.div
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {/* Calendar header */}
        <div style={{
          fontFamily: SERIF, fontSize: 15, fontWeight: 500,
          color: INK, letterSpacing: '-.01em', lineHeight: 1, flexShrink: 0,
        }}>
          This Week
        </div>

        {/* Day labels */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '26px repeat(7, 1fr)',
          gap: 1, flexShrink: 0,
        }}>
          <div />
          {DAYS.map(d => (
            <div key={d} style={{
              fontFamily: SANS, fontSize: 9.5, fontWeight: 600,
              color: d === 'Sa' ? RED : MUTED,
              textAlign: 'center',
            }}>{d}</div>
          ))}
        </div>

        {/* Grid body */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {TIMES.map((time, ti) => (
            <div
              key={time}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px repeat(7, 1fr)',
                gap: 1,
                height: rowH,
                alignItems: 'stretch',
              }}
            >
              {/* Time label */}
              <div style={{
                fontFamily: SANS, fontSize: 8.5, color: MUTED,
                paddingTop: 2, lineHeight: 1, userSelect: 'none',
              }}>{time}</div>

              {DAYS.map((day, di) => (
                <div
                  key={day}
                  style={{
                    borderTop: `0.5px solid ${LINE}`,
                    borderRight: di === 6 ? 'none' : `0.5px solid ${LINE}`,
                    background: di === 6 ? 'rgba(252,97,97,0.03)' : 'transparent',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {/* Appointment block at Saturday (di=6) 2pm (ti=5) */}
                  {di === 6 && ti === 5 && (
                    <AnimatePresence>
                      {showAppt && (
                        <motion.div
                          key="appt-block"
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 1 }}
                          style={{ transformOrigin: 'top' }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: 1, bottom: -1,
                            left: 0, right: -1,
                            background: '#FFF0F0',
                            borderLeft: `2.5px solid ${RED}`,
                            borderRadius: '0 4px 4px 0',
                            padding: '2px 4px',
                            zIndex: 10,
                          }}>
                            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 7.5, color: RED, lineHeight: 1.25 }}>
                              Sarah J
                            </div>
                            <div style={{ fontFamily: SANS, fontSize: 7, color: MUTED, lineHeight: 1.3 }}>
                              Knotless
                            </div>

                            {/* Green checkmark */}
                            <AnimatePresence>
                              {showCheck && (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ position: 'absolute', top: 2, right: 2 }}
                                >
                                  <div style={{
                                    width: 11, height: 11, borderRadius: '50%',
                                    background: GREEN,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          <AnimatePresence>
            {showConfirmed && (
              <motion.div
                key="confirmed-pill"
                initial={{ opacity: 0, y: 5, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: '#ECFDF5', borderRadius: 999,
                  padding: '4px 10px',
                  fontFamily: SANS, fontSize: 11, fontWeight: 600, color: GREEN,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                Confirmed
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showReminder && (
              <motion.div
                key="reminder-pill"
                initial={{ opacity: 0, y: 5, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: '#FEF3C7', borderRadius: 999,
                  padding: '4px 10px',
                  fontFamily: SANS, fontSize: 11, fontWeight: 600, color: GOLD,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                Reminder set
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </DemoCard>
  )
}
