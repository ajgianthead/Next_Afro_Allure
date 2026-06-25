'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DemoCard } from './DemoCard'

const SANS = "'Inter', system-ui, sans-serif"

type Phase = 'empty' | 'typing' | 'message' | 'fading'

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

export function DmInboxDemo() {
  const [phase, setPhase] = useState<Phase>('empty')
  const reduced = usePrefersReducedMotion()
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (reduced) { setPhase('message'); return }

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
    const at = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)) }

    function cycle() {
      setPhase('empty')
      at(() => setPhase('typing'), 500)
      at(() => setPhase('message'), 1200)
      at(() => setPhase('fading'), 3500)
      at(cycle, 4000)
    }
    cycle()
    return clear
  }, [reduced])

  return (
    <DemoCard ariaLabel="Demo showing a client sending a DM booking request on Instagram">
      {/* IG-style header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px 8px',
        borderBottom: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        {/* IG story-ring avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
          padding: 2,
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: '#E3CABB', border: '2px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#5C3317',
          }}>S</div>
        </div>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 13, color: '#1A1818', lineHeight: 1.2 }}>Client</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: '#6F6863', lineHeight: 1 }}>Active now</div>
        </div>
      </div>

      {/* Chat area */}
      <motion.div
        animate={{ opacity: phase === 'fading' ? 0 : 1 }}
        transition={{ duration: 0.45 }}
        style={{
          flex: 1,
          background: '#F7F7F7',
          padding: '14px 12px 10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        {/* Previous faint messages for context */}
        <div style={{ opacity: 0.38, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            alignSelf: 'flex-end',
            background: '#3797F0',
            borderRadius: '16px 16px 4px 16px',
            padding: '7px 11px',
            fontFamily: SANS, fontSize: 12, color: '#fff', lineHeight: 1.4, maxWidth: '72%',
          }}>Hey! 👋</div>
          <div style={{
            alignSelf: 'flex-start',
            background: '#E5E5E5',
            borderRadius: '16px 16px 16px 4px',
            padding: '7px 11px',
            fontFamily: SANS, fontSize: 12, color: '#1A1818', lineHeight: 1.4, maxWidth: '72%',
          }}>Hey, what's good!</div>
        </div>

        {/* Typing indicator or message */}
        <AnimatePresence mode="wait">
          {phase === 'typing' && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                alignSelf: 'flex-start',
                background: '#E5E5E5',
                borderRadius: '16px 16px 16px 4px',
                padding: '10px 14px',
                display: 'flex', gap: 5, alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#999', display: 'block', flexShrink: 0 }}
                />
              ))}
            </motion.div>
          )}

          {(phase === 'message' || phase === 'fading') && (
            <motion.div
              key="message"
              initial={{ opacity: 0, x: -18, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              style={{
                alignSelf: 'flex-start',
                background: '#E5E5E5',
                borderRadius: '16px 16px 16px 4px',
                padding: '9px 13px',
                fontFamily: SANS,
                fontSize: 13,
                color: '#1A1818',
                lineHeight: 1.45,
                maxWidth: '82%',
              }}
            >
              Hey! Are you available Saturday? 🖤
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reply bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        borderTop: '1px solid #F0F0F0',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1, background: '#F0F0F0', borderRadius: 999,
          padding: '7px 12px',
          fontFamily: SANS, fontSize: 12, color: '#999',
        }}>Message…</div>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3797F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </div>
      </div>
    </DemoCard>
  )
}
