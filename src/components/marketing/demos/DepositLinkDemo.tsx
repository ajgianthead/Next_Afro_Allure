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

type Phase = 'dm' | 'notification' | 'checkout' | 'paying' | 'success' | 'fading'

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

const PHONE_W = 172
const PHONE_H = 284

export function DepositLinkDemo() {
  const [phase, setPhase] = useState<Phase>('dm')
  const reduced = usePrefersReducedMotion()
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([])

  // Measure the centering container and scale the phone to fit
  const wrapRef   = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const s = Math.min(1, (width * 0.88) / PHONE_W, (height * 0.96) / PHONE_H)
      setScale(s > 0 ? s : 1)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (reduced) { setPhase('success'); return }

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    const at = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

    function cycle() {
      setPhase('dm')
      at(() => setPhase('notification'), 500)
      at(() => setPhase('checkout'),     1500)
      at(() => setPhase('paying'),       2500)
      at(() => setPhase('success'),      3100)
      at(() => setPhase('fading'),       4500)
      at(cycle, 5200)
    }
    cycle()
    return clear
  }, [reduced])

  const showCheckout = ['checkout', 'paying', 'success', 'fading'].includes(phase)
  const showNotif    = ['notification'].includes(phase)

  return (
    <DemoCard ariaLabel="Demo showing a client receiving and paying an automatic deposit link">
      <motion.div
        ref={wrapRef}
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Outer sizer maintains layout space */}
        <div style={{ width: PHONE_W * scale, height: PHONE_H * scale, flexShrink: 0, position: 'relative' }}>
          {/* Inner phone rendered at full size then scaled */}
          <div style={{
            width: PHONE_W,
            height: PHONE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            border: '7px solid #1A1818',
            borderRadius: 30,
            background: '#F7F7F7',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 36px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}>
            {/* Status bar */}
            <div style={{
              height: 20, background: '#F7F7F7',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 10px', flexShrink: 0,
            }}>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 8, color: INK }}>9:41</span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                  <rect x="0" y="2" width="2" height="5" rx="0.5" fill="#1A1818" opacity="0.5"/>
                  <rect x="2.5" y="1.5" width="2" height="5.5" rx="0.5" fill="#1A1818" opacity="0.7"/>
                  <rect x="5" y="0.5" width="2" height="6.5" rx="0.5" fill="#1A1818"/>
                  <rect x="8" y="0" width="2" height="7" rx="0.5" fill="#1A1818"/>
                </svg>
                <svg width="13" height="7" viewBox="0 0 13 7">
                  <rect x="0" y="1" width="10" height="5" rx="1" stroke="#1A1818" strokeWidth="0.8" fill="none"/>
                  <rect x="10.5" y="2.2" width="1.5" height="2.6" rx="0.5" fill="#1A1818"/>
                  <rect x="0.8" y="1.8" width="7" height="3.4" rx="0.5" fill="#1A1818"/>
                </svg>
              </div>
            </div>

            {/* Content area */}
            <div style={{ position: 'relative', flex: 1, height: 'calc(100% - 20px)', overflow: 'hidden' }}>

              {/* DM background layer */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  padding: '6px 8px', background: '#fff',
                  borderBottom: '0.5px solid #E8E8E8',
                  display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#E3CABB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: SANS, fontSize: 8, fontWeight: 700, color: '#5C3317',
                  }}>S</div>
                  <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 9, color: INK }}>Client</span>
                </div>
                <div style={{ flex: 1, padding: '8px 8px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
                  <div style={{
                    alignSelf: 'flex-start', background: '#E5E5E5',
                    borderRadius: '10px 10px 10px 2px', padding: '5px 8px',
                    fontFamily: SANS, fontSize: 8.5, color: INK, maxWidth: '80%', lineHeight: 1.35,
                  }}>Hey! Are you available Saturday? 🖤</div>
                  <div style={{
                    alignSelf: 'flex-end', background: '#3797F0',
                    borderRadius: '10px 10px 2px 10px', padding: '5px 8px',
                    fontFamily: SANS, fontSize: 8.5, color: '#fff', maxWidth: '80%', lineHeight: 1.35,
                  }}>Yes! I'll send your deposit link 🔗</div>
                </div>
              </div>

              {/* Notification banner */}
              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    key="notif"
                    initial={{ y: -56 }}
                    animate={{ y: 6 }}
                    exit={{ y: -56 }}
                    transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute', left: 5, right: 5,
                      background: 'rgba(28,28,28,0.92)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 9, padding: '7px 9px',
                      display: 'flex', alignItems: 'flex-start', gap: 6, zIndex: 10,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, background: RED,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2C7 2 3 6 3 11v3l-2 3h18l-2-3v-3c0-5-4-9-9-9z"/><path d="M9 17v1a3 3 0 006 0v-1"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 8, color: '#fff', lineHeight: 1.3 }}>AfroAllure</div>
                      <div style={{ fontFamily: SANS, fontSize: 7.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
                        Sarah, your deposit link is ready
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checkout sheet */}
              <AnimatePresence>
                {showCheckout && (
                  <motion.div
                    key="checkout"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: 'absolute', inset: 0,
                      background: '#fff',
                      display: 'flex', flexDirection: 'column',
                      padding: '14px 12px 12px',
                    }}
                  >
                    <div style={{ width: 28, height: 3, borderRadius: 999, background: LINE, margin: '0 auto 12px' }} />
                    <div style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 500, color: INK, letterSpacing: '-.01em', marginBottom: 10 }}>
                      Pay Deposit
                    </div>
                    <div style={{ height: 0.5, background: LINE, marginBottom: 10 }} />
                    {[
                      { label: 'Service', value: 'Knotless Braids' },
                      { label: 'Stylist', value: 'Your Business'   },
                      { label: 'Amount', value: '$50.00'           },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontFamily: SANS, fontSize: 8.5, color: MUTED }}>{row.label}</span>
                        <span style={{ fontFamily: SANS, fontSize: 8.5, fontWeight: 600, color: INK }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ flex: 1 }} />
                    <AnimatePresence mode="wait">
                      {phase === 'success' || phase === 'fading' ? (
                        <motion.div
                          key="paid"
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.06, duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                              width: 34, height: 34, borderRadius: '50%', background: GREEN,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          </motion.div>
                          <div style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 500, color: GREEN, textAlign: 'center' }}>
                            Payment Confirmed ✓
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pay-btn"
                          animate={phase === 'paying' ? { scale: 0.94 } : { scale: 1 }}
                          transition={{ duration: 0.14 }}
                          style={{
                            background: RED, borderRadius: 999,
                            padding: '9px 0', textAlign: 'center',
                            fontFamily: SANS, fontWeight: 700, fontSize: 11,
                            color: '#fff', userSelect: 'none',
                          }}
                        >
                          Pay Now
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </DemoCard>
  )
}
