'use client'

import { useEffect, useRef, useState } from 'react'

/** Steps 0..count-1 on a timer, looping. Stays on `restAt` when the device asks for reduced motion. */
export function useCycle(count: number, ms: number, restAt = count - 1): number {
    const [step, setStep] = useState(restAt)
    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
        setStep(0)
        const id = setInterval(() => setStep(s => (s + 1) % count), ms)
        return () => clearInterval(id)
    }, [count, ms])
    return step
}

export function PhoneFrame({ children, dark = false, height = 520 }: { children: React.ReactNode; dark?: boolean; height?: number }) {
    return (
        <div style={{
            width: 270, height, margin: '0 auto', borderRadius: 40, padding: 10,
            background: '#0F0E0E', boxShadow: '0 30px 60px rgba(15,14,14,.28), inset 0 0 0 2px #2A2727',
        }}>
            <div style={{
                position: 'relative', width: '100%', height: '100%', borderRadius: 31, overflow: 'hidden',
                background: dark ? '#141212' : '#FAF7F2',
            }}>
                <div aria-hidden style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 84, height: 22, borderRadius: 12, background: '#0F0E0E', zIndex: 2 }} />
                {children}
            </div>
        </div>
    )
}

export function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
    return (
        <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 30px 60px rgba(15,14,14,.18)', border: '1px solid #E8E2D6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F3EFE8', borderBottom: '1px solid #E8E2D6' }}>
                <span style={{ display: 'flex', gap: 6 }}>
                    {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </span>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#6F6863', background: '#fff', borderRadius: 8, padding: '4px 10px', border: '1px solid #E8E2D6' }}>
                    {url}
                </span>
            </div>
            {children}
        </div>
    )
}

/**
 * A laptop with a 16:10 screen. `canvas` content is drawn at a fixed
 * 1280 × 800 and scaled to fit, so a dashboard demo looks the same at any
 * width; videos and images fill the screen directly.
 */
export function LaptopFrame({ children, canvas = false }: { children: React.ReactNode; canvas?: boolean }) {
    const screenRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(0.7)
    useEffect(() => {
        if (!canvas || !screenRef.current) return
        const el = screenRef.current
        const fit = () => setScale(el.clientWidth / 1280)
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(el)
        return () => ro.disconnect()
    }, [canvas])
    return (
        <div style={{ width: '100%', maxWidth: 1080, margin: '0 auto' }}>
            <div style={{ background: '#0F0E0E', borderRadius: '18px 18px 0 0', padding: '2.2% 2.2% 2.6%', boxShadow: '0 40px 80px rgba(15,14,14,.28), inset 0 0 0 2px #2A2727', position: 'relative' }}>
                <span aria-hidden style={{ position: 'absolute', top: '0.9%', left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#2A2727' }} />
                <div ref={screenRef} style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', overflow: 'hidden', borderRadius: 6, background: '#FAF7F2' }}>
                    {canvas ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 1280, height: 800, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                            {children}
                        </div>
                    ) : children}
                </div>
            </div>
            <div aria-hidden style={{ height: 14, margin: '0 -4%', background: 'linear-gradient(#D9D4CC, #B8B2A9)', borderRadius: '0 0 18px 18px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '14%', height: 5, background: '#A39D94', borderRadius: '0 0 8px 8px' }} />
            </div>
        </div>
    )
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #E8E2D6', borderRadius: 20, boxShadow: '0 24px 50px rgba(15,14,14,.14)', ...style }}>
            {children}
        </div>
    )
}

export const money = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`
