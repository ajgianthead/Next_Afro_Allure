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

const CLIENT_NAME = 'Sarah J'

type Phase = 'empty' | 'client' | 'service' | 'datetime' | 'deposit' | 'pressing' | 'success' | 'fading'

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

function FieldLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontFamily: SANS, fontSize: 10, fontWeight: 600,
      color: MUTED, textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 3,
    }}>{text}</div>
  )
}

function FieldBox({ active, children }: { active?: boolean; children?: React.ReactNode }) {
  return (
    <div style={{
      border: `1px solid ${active ? RED : LINE}`,
      borderRadius: 8, padding: '7px 10px',
      background: '#FAFAFA', minHeight: 34,
      display: 'flex', alignItems: 'center',
      fontFamily: SANS, fontSize: 13, color: INK,
      transition: 'border-color 0.18s',
    }}>{children}</div>
  )
}

export function AppointmentCreationDemo() {
  const [phase, setPhase] = useState<Phase>('empty')
  const [typed, setTyped]   = useState('')
  const reduced = usePrefersReducedMotion()
  const timers  = useRef<ReturnType<typeof setTimeout>[]>([])
  const itvRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (reduced) { setPhase('success'); setTyped(CLIENT_NAME); return }

    const clear = () => {
      timers.current.forEach(clearTimeout); timers.current = []
      if (itvRef.current) clearInterval(itvRef.current)
    }
    const at = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

    function cycle() {
      setPhase('empty'); setTyped('')

      at(() => {
        setPhase('client')
        let i = 0
        if (itvRef.current) clearInterval(itvRef.current)
        itvRef.current = setInterval(() => {
          i++
          setTyped(CLIENT_NAME.slice(0, i))
          if (i >= CLIENT_NAME.length && itvRef.current) { clearInterval(itvRef.current); itvRef.current = null }
        }, 85)
      }, 500)

      at(() => setPhase('service'),  1600)
      at(() => setPhase('datetime'), 2600)
      at(() => setPhase('deposit'),  3600)
      at(() => setPhase('pressing'), 4600)
      at(() => setPhase('success'),  5050)
      at(() => setPhase('fading'),   5650)
      at(cycle, 6250)
    }

    cycle()
    return clear
  }, [reduced])

  const showService  = !['empty', 'client'].includes(phase)
  const showDatetime = !['empty', 'client', 'service'].includes(phase)
  const showDeposit  = !['empty', 'client', 'service', 'datetime'].includes(phase)
  const isSuccess    = phase === 'success' || phase === 'fading'

  return (
    <DemoCard ariaLabel="Demo showing how to create an appointment in AfroAllure in under 30 seconds">
      <motion.div
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {/* Header */}
        <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, color: INK, letterSpacing: '-.02em', lineHeight: 1, flexShrink: 0 }}>
          New Appointment
        </div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </motion.div>
              <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: INK, letterSpacing: '-.01em', textAlign: 'center' }}>
                Appointment Created!
              </div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: MUTED, textAlign: 'center' }}>
                Sarah J · Knotless Braids · Sat 2:00 PM
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Client field */}
              <div>
                <FieldLabel text="Client" />
                <FieldBox active={phase === 'client'}>
                  {typed}
                  {phase === 'client' && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.55, repeat: Infinity }}
                      style={{ display: 'inline-block', width: 1.5, height: '1em', background: INK, marginLeft: 1, verticalAlign: 'text-bottom' }}
                    />
                  )}
                </FieldBox>
              </div>

              {/* Service field */}
              <div>
                <FieldLabel text="Service" />
                <FieldBox>
                  <AnimatePresence>
                    {showService && (
                      <motion.span
                        key="service-val"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        Knotless Braids
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span style={{ marginLeft: 'auto', color: MUTED, fontSize: 10 }}>▾</span>
                </FieldBox>
              </div>

              {/* Date/time field */}
              <div>
                <FieldLabel text="Date &amp; Time" />
                <FieldBox>
                  <AnimatePresence>
                    {showDatetime && (
                      <motion.span
                        key="dt-val"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        Saturday, 2:00 PM
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <svg style={{ marginLeft: 'auto', color: MUTED }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </FieldBox>
              </div>

              {/* Deposit field */}
              <div>
                <FieldLabel text="Deposit" />
                <FieldBox>
                  <AnimatePresence>
                    {showDeposit && (
                      <motion.span
                        key="dep-val"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      >
                        $50
                      </motion.span>
                    )}
                  </AnimatePresence>
                </FieldBox>
              </div>

              {/* Create button */}
              <motion.div
                animate={phase === 'pressing' ? { scale: 0.95, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.18)' } : { scale: 1 }}
                transition={{ duration: 0.14 }}
                style={{
                  marginTop: 2,
                  background: RED, color: '#fff',
                  borderRadius: 999, padding: '10px 0',
                  textAlign: 'center',
                  fontFamily: SANS, fontWeight: 600, fontSize: 13,
                  cursor: 'default', userSelect: 'none',
                }}
              >
                Create Appointment
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DemoCard>
  )
}
