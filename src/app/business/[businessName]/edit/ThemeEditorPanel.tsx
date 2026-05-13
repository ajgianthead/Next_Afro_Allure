'use client'

import React, { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { saveThemeData } from '@/app/utils/editor_actions'
import { BookingTheme } from '@/features/automatedBooking/types/theme'

const FONT_OPTIONS = [
    'Inter', 'Fraunces', 'Roboto', 'Lato', 'Playfair Display',
    'Montserrat', 'Poppins', 'DM Sans', 'Nunito', 'Open Sans',
]

const COLOR_FIELDS: { key: keyof BookingTheme; label: string }[] = [
    { key: 'primaryColor', label: 'Primary (buttons)' },
    { key: 'primaryTextColor', label: 'Button text' },
    { key: 'backgroundColor', label: 'Page background' },
    { key: 'cardColor', label: 'Card background' },
    { key: 'borderColor', label: 'Borders' },
    { key: 'textColor', label: 'Text' },
    { key: 'mutedColor', label: 'Muted / labels' },
    { key: 'accentColor', label: 'Accent' },
]

const RADIUS_FIELDS: { key: keyof BookingTheme; label: string }[] = [
    { key: 'buttonRadius', label: 'Button radius' },
    { key: 'inputRadius', label: 'Input radius' },
    { key: 'cardRadius', label: 'Card radius' },
]

function parseRadius(v: string): number {
    return Math.min(32, Math.max(0, parseInt(v) || 0))
}

function ColorRow({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (v: string) => void
}) {
    const [hex, setHex] = useState(value)

    const syncFromHex = (raw: string) => {
        const cleaned = raw.startsWith('#') ? raw : '#' + raw
        setHex(raw)
        if (/^#[0-9A-Fa-f]{6}$/.test(cleaned)) onChange(cleaned)
    }

    const syncFromPicker = (v: string) => {
        setHex(v)
        onChange(v)
    }

    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-xs" style={{ color: '#6F6863', minWidth: 120 }}>{label}</span>
            <div className="flex items-center gap-2">
                <div className="relative" style={{ width: 28, height: 28 }}>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => syncFromPicker(e.target.value)}
                        style={{
                            width: 28, height: 28, padding: 0, border: 'none',
                            borderRadius: 6, cursor: 'pointer', opacity: 0,
                            position: 'absolute', inset: 0,
                        }}
                    />
                    <div
                        style={{
                            width: 28, height: 28, borderRadius: 6,
                            backgroundColor: value,
                            border: '1.5px solid #E8E2D6',
                            pointerEvents: 'none',
                        }}
                    />
                </div>
                <input
                    type="text"
                    value={hex}
                    onChange={(e) => syncFromHex(e.target.value)}
                    onBlur={() => setHex(value)}
                    maxLength={7}
                    className="text-xs font-mono rounded-md px-2 py-1 outline-none"
                    style={{
                        width: 80, border: '1px solid #E8E2D6',
                        backgroundColor: '#FDFCFA', color: '#1A1818',
                    }}
                />
            </div>
        </div>
    )
}

export function ThemeEditorPanel({
    businessId,
    initialTheme,
    onClose,
}: {
    businessId: string
    initialTheme: BookingTheme
    onClose: () => void
}) {
    const [theme, setTheme] = useState<BookingTheme>(initialTheme)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const set = (key: keyof BookingTheme, value: string) => {
        setTheme((prev) => ({ ...prev, [key]: value }))
        setSaved(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await saveThemeData(businessId, theme)
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)', zIndex: 49,
                }}
            />

            {/* Panel */}
            <div
                style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0,
                    width: 340, backgroundColor: '#FFFFFF',
                    borderLeft: '1px solid #E8E2D6',
                    zIndex: 50,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid #E8E2D6' }}
                >
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A1818' }}>Booking Flow Theme</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6F6863' }}>Customize how your booking page looks</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center rounded-lg transition-colors hover:bg-[#FAF7F2]"
                        style={{ width: 32, height: 32, color: '#6F6863' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                    {/* Colors */}
                    <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>Colors</p>
                        <div className="space-y-3">
                            {COLOR_FIELDS.map(({ key, label }) => (
                                <ColorRow
                                    key={key}
                                    label={label}
                                    value={theme[key] as string}
                                    onChange={(v) => set(key, v)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Typography */}
                    <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>Typography</p>
                        <div className="space-y-3">
                            {([
                                { key: 'fontFamily' as const, label: 'Heading font' },
                                { key: 'bodyFontFamily' as const, label: 'Body font' },
                            ] as { key: keyof BookingTheme; label: string }[]).map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between gap-3">
                                    <span className="text-xs" style={{ color: '#6F6863', minWidth: 100 }}>{label}</span>
                                    <select
                                        value={theme[key] as string}
                                        onChange={(e) => set(key, e.target.value)}
                                        className="text-xs rounded-md px-2 py-1.5 outline-none flex-1"
                                        style={{
                                            border: '1px solid #E8E2D6',
                                            backgroundColor: '#FDFCFA',
                                            color: '#1A1818',
                                        }}
                                    >
                                        {FONT_OPTIONS.map((f) => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Shapes */}
                    <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>Shape</p>
                        <div className="space-y-4">
                            {RADIUS_FIELDS.map(({ key, label }) => {
                                const num = parseRadius(theme[key] as string)
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs" style={{ color: '#6F6863' }}>{label}</span>
                                            <span className="text-xs font-mono" style={{ color: '#1A1818' }}>{num}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={32}
                                            value={num}
                                            onChange={(e) => set(key, `${e.target.value}px`)}
                                            className="w-full accent-[#FC6161]"
                                        />
                                        <div className="flex justify-between text-[10px] mt-0.5" style={{ color: '#C9B89A' }}>
                                            <span>Square</span>
                                            <span>Rounded</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Preview */}
                    <section>
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#6F6863' }}>Preview</p>
                        <div
                            className="rounded-xl p-4 space-y-2"
                            style={{ backgroundColor: theme.backgroundColor, border: `1px solid ${theme.borderColor}` }}
                        >
                            <div
                                className="rounded-lg p-3 space-y-2"
                                style={{ backgroundColor: theme.cardColor, border: `1px solid ${theme.borderColor}`, borderRadius: theme.cardRadius }}
                            >
                                <p className="text-sm font-semibold" style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>Booking Preview</p>
                                <p className="text-xs" style={{ color: theme.mutedColor, fontFamily: theme.bodyFontFamily }}>This is how your booking flow will look</p>
                                <input
                                    readOnly
                                    placeholder="Your name"
                                    className="w-full text-xs px-3 py-2 outline-none"
                                    style={{
                                        borderRadius: theme.inputRadius,
                                        border: `1px solid ${theme.borderColor}`,
                                        backgroundColor: theme.cardColor,
                                        color: theme.textColor,
                                    }}
                                />
                            </div>
                            <button
                                className="w-full text-xs font-medium py-2 transition-opacity hover:opacity-90"
                                style={{
                                    backgroundColor: theme.primaryColor,
                                    color: theme.primaryTextColor,
                                    borderRadius: theme.buttonRadius,
                                    border: 'none',
                                }}
                            >
                                Book Now
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ borderTop: '1px solid #E8E2D6' }}
                >
                    <button
                        onClick={onClose}
                        className="text-sm px-4 py-2 rounded-xl transition-colors hover:bg-[#FAF7F2]"
                        style={{ color: '#6F6863', border: '1px solid #E8E2D6' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                    >
                        {saving && <Loader2 size={13} className="animate-spin" />}
                        {saved && <Check size={13} />}
                        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Theme'}
                    </button>
                </div>
            </div>
        </>
    )
}
