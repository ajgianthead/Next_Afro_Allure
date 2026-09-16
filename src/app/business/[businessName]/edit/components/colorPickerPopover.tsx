'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { HexColorPicker } from 'react-colorful'
import { Check, Copy } from 'lucide-react'

// ─── Color helpers ────────────────────────────────────────────────────────────
// Values flow through the app as plain hex strings — #RRGGBB, or #RRGGBBAA
// when alpha < 100% — so every other field/component that already expects a
// hex-ish color string keeps working unmodified.

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n))
}

function parseValue(value: any): { hex6: string; alphaPct: number } {
    const v = typeof value === 'string' ? value.trim() : ''
    const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/.exec(v)
    if (!m) return { hex6: '#000000', alphaPct: 100 }
    const alphaPct = m[2] ? Math.round((parseInt(m[2], 16) / 255) * 100) : 100
    return { hex6: `#${m[1]}`, alphaPct }
}

function toValue(hex6: string, alphaPct: number): string {
    if (alphaPct >= 100) return hex6
    const a = Math.round(clamp(alphaPct, 0, 100) / 100 * 255).toString(16).padStart(2, '0')
    return `${hex6}${a}`
}

function hexToRgb(hex6: string): { r: number; g: number; b: number } {
    const n = parseInt(hex6.slice(1), 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
    const c = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
    return `#${c(r)}${c(g)}${c(b)}`
}

function rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): { h: number; s: number; l: number } {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    const d = max - min
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1))
        switch (max) {
            case r: h = ((g - b) / d) % 6; break
            case g: h = (b - r) / d + 2; break
            default: h = (r - g) / d + 4; break
        }
        h *= 60
        if (h < 0) h += 360
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToRgb({ h, s, l }: { h: number; s: number; l: number }): { r: number; g: number; b: number } {
    s /= 100; l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0, g = 0, b = 0
    if (h < 60) [r, g, b] = [c, x, 0]
    else if (h < 120) [r, g, b] = [x, c, 0]
    else if (h < 180) [r, g, b] = [0, c, x]
    else if (h < 240) [r, g, b] = [0, x, c]
    else if (h < 300) [r, g, b] = [x, 0, c]
    else [r, g, b] = [c, 0, x]
    return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

// ─── Brand swatches (persisted per-browser) ──────────────────────────────────

const BRAND_SWATCHES = ['#FC6161', '#C9974A', '#0F0E0E', '#FAF7F2', '#FFFFFF']
const SAVED_SWATCHES_KEY = 'aa-editor-saved-swatches'
const EMPTY_SLOTS = 5
const LONG_PRESS_MS = 500

function loadSavedSwatches(): (string | null)[] {
    try {
        const raw = localStorage.getItem(SAVED_SWATCHES_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        const arr = Array.isArray(parsed) ? parsed : []
        return Array.from({ length: EMPTY_SLOTS }, (_, i) => arr[i] ?? null)
    } catch {
        return Array(EMPTY_SLOTS).fill(null)
    }
}

function persistSavedSwatches(slots: (string | null)[]) {
    try {
        localStorage.setItem(SAVED_SWATCHES_KEY, JSON.stringify(slots))
    } catch {
        // Private browsing / storage disabled — swatches just won't persist.
    }
}

// ─── Checkerboard background for transparency ────────────────────────────────

const CHECKERBOARD: React.CSSProperties = {
    backgroundImage:
        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
}

// ─── Swatch cell (brand or saved) ─────────────────────────────────────────────

function SwatchCell({ color, onClick, onLongPress, title }: {
    color: string | null
    onClick: () => void
    onLongPress?: () => void
    title: string
}) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const firedRef = useRef(false)

    const start = () => {
        if (!onLongPress) return
        firedRef.current = false
        timerRef.current = setTimeout(() => {
            firedRef.current = true
            onLongPress()
        }, LONG_PRESS_MS)
    }
    const cancel = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
    }

    return (
        <button
            type="button"
            title={title}
            onClick={() => { if (!firedRef.current) onClick() }}
            onPointerDown={start}
            onPointerUp={cancel}
            onPointerLeave={cancel}
            style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                border: color ? '1px solid rgba(0,0,0,0.08)' : '1px dashed #D4CFC8',
                backgroundColor: color ?? 'transparent',
                cursor: 'pointer',
                ...(color ? {} : CHECKERBOARD),
            }}
        />
    )
}

// ─── Format tabs + value row ─────────────────────────────────────────────────

type Format = 'hex' | 'rgb' | 'hsl'

function NumField({ value, onChange, max, suffix }: { value: number; onChange: (v: number) => void; max: number; suffix?: string }) {
    const [display, setDisplay] = useState(String(Math.round(value)))
    useEffect(() => { setDisplay(String(Math.round(value))) }, [value])
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={(e) => setDisplay(e.target.value)}
                onBlur={() => {
                    const n = clamp(parseInt(display, 10) || 0, 0, max)
                    setDisplay(String(n))
                    onChange(n)
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                style={{
                    width: '100%', height: 26, borderRadius: 6, textAlign: 'center',
                    fontSize: 11, fontFamily: 'monospace', color: '#1A1818',
                    background: '#F9F8F6', border: '1px solid #E8E2D6', outline: 'none',
                }}
            />
            {suffix && <span style={{ fontSize: 10, color: '#A09790', width: 10, flexShrink: 0 }}>{suffix}</span>}
        </div>
    )
}

function HexField({ value, onCommit }: { value: string; onCommit: (hex6: string) => void }) {
    const [display, setDisplay] = useState(value)
    useEffect(() => { setDisplay(value) }, [value])
    const commit = (raw: string) => {
        const m = /^#?([0-9a-fA-F]{6})$/.exec(raw.trim())
        if (m) onCommit(`#${m[1]}`)
        else setDisplay(value)
    }
    return (
        <input
            type="text"
            value={display}
            onChange={(e) => setDisplay(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            style={{
                width: '100%', height: 28, borderRadius: 8, padding: '0 10px',
                fontSize: 12, fontFamily: 'monospace', color: '#1A1818',
                background: '#F9F8F6', border: '1px solid #E8E2D6', outline: 'none',
            }}
        />
    )
}

// ─── Main popover ─────────────────────────────────────────────────────────────

export const ColorPickerPopover = ({ value, onChange, className, compact = false }: {
    value: any
    onChange: (v: string) => void
    className?: string
    /** Swatch-only trigger, no hex text/copy button — for tight inline rows. */
    compact?: boolean
}) => {
    const [open, setOpen] = useState(false)
    const [format, setFormat] = useState<Format>('hex')
    const [slots, setSlots] = useState<(string | null)[]>(() => Array(EMPTY_SLOTS).fill(null))
    const [copied, setCopied] = useState(false)

    useEffect(() => { if (open) setSlots(loadSavedSwatches()) }, [open])

    const { hex6, alphaPct } = parseValue(value)
    const rgb = useMemo(() => hexToRgb(hex6), [hex6])
    const hsl = useMemo(() => rgbToHsl(rgb), [rgb])

    const setColor = (nextHex6: string, nextAlpha = alphaPct) => onChange(toValue(nextHex6, nextAlpha))

    const saveToSlot = (i: number) => {
        const next = [...slots]
        next[i] = toValue(hex6, alphaPct)
        setSlots(next)
        persistSavedSwatches(next)
    }

    const displayValue = toValue(hex6, alphaPct)

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', minWidth: 0 }}>
                    <div
                        title="Edit color"
                        style={{
                            width: 24, height: 24, borderRadius: 8, flexShrink: 0,
                            border: '1px solid rgba(0,0,0,0.08)',
                            position: 'relative', overflow: 'hidden',
                            ...(alphaPct < 100 ? CHECKERBOARD : { backgroundColor: hex6 }),
                        }}
                    >
                        {alphaPct < 100 && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: hex6, opacity: alphaPct / 100 }} />
                        )}
                    </div>
                    {!compact && (
                        <>
                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#A09790', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayValue}
                            </span>
                            <button
                                type="button"
                                title="Copy hex"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard?.writeText(displayValue).then(() => {
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 1200)
                                    })
                                }}
                                style={{
                                    width: 20, height: 20, borderRadius: 4, border: 'none', background: 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    color: '#A09790', cursor: 'pointer',
                                }}
                            >
                                {copied ? <Check size={11} /> : <Copy size={11} />}
                            </button>
                        </>
                    )}
                </div>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="z-[9999]"
                    style={{
                        width: 240, padding: 12, borderRadius: 12,
                        backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        display: 'flex', flexDirection: 'column', gap: 10,
                        animation: 'aa-color-popover-in 150ms ease-out',
                    }}
                >
                    <HexColorPicker
                        color={hex6}
                        onChange={(next) => setColor(next)}
                        style={{ width: '100%', height: 140 }}
                    />

                    {/* Alpha slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ position: 'relative', flex: 1, height: 12, borderRadius: 6, overflow: 'hidden', ...CHECKERBOARD }}>
                            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent, ${hex6})`, borderRadius: 6 }} />
                            <input
                                type="range"
                                min={0} max={100} step={1}
                                value={alphaPct}
                                onChange={(e) => setColor(hex6, Number(e.target.value))}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer', accentColor: '#FC6161', opacity: 0.9 }}
                            />
                        </div>
                        <span style={{ fontSize: 11, color: '#6F6863', width: 34, textAlign: 'right', flexShrink: 0 }}>{alphaPct}%</span>
                    </div>

                    {/* Format tabs */}
                    <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 8, background: '#F5F6F8' }}>
                        {(['hex', 'rgb', 'hsl'] as Format[]).map(f => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFormat(f)}
                                style={{
                                    flex: 1, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 600,
                                    textTransform: 'uppercase', letterSpacing: '0.02em',
                                    background: format === f ? '#FC6161' : 'transparent',
                                    color: format === f ? '#fff' : '#6F6863',
                                    border: 'none', cursor: 'pointer',
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Value row per format */}
                    {format === 'hex' && (
                        <HexField value={hex6} onCommit={(next) => setColor(next)} />
                    )}
                    {format === 'rgb' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                            <NumField value={rgb.r} max={255} onChange={(r) => setColor(rgbToHex({ ...rgb, r }))} />
                            <NumField value={rgb.g} max={255} onChange={(g) => setColor(rgbToHex({ ...rgb, g }))} />
                            <NumField value={rgb.b} max={255} onChange={(b) => setColor(rgbToHex({ ...rgb, b }))} />
                        </div>
                    )}
                    {format === 'hsl' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                            <NumField value={hsl.h} max={360} suffix="°" onChange={(h) => setColor(rgbToHex(hslToRgb({ ...hsl, h })))} />
                            <NumField value={hsl.s} max={100} suffix="%" onChange={(s) => setColor(rgbToHex(hslToRgb({ ...hsl, s })))} />
                            <NumField value={hsl.l} max={100} suffix="%" onChange={(l) => setColor(rgbToHex(hslToRgb({ ...hsl, l })))} />
                        </div>
                    )}

                    {/* Swatches */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid #F0EDE8' }}>
                        <div style={{ display: 'flex', gap: 5 }}>
                            {BRAND_SWATCHES.map(c => (
                                <SwatchCell key={c} color={c} title={c} onClick={() => setColor(c, 100)} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 5 }}>
                            {slots.map((c, i) => (
                                <SwatchCell
                                    key={i}
                                    color={c}
                                    title={c ?? 'Empty — hold to save current color'}
                                    onClick={() => { if (c) onChange(c) }}
                                    onLongPress={() => saveToSlot(i)}
                                />
                            ))}
                        </div>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
