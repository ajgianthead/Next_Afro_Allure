'use client'

import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { maxTipCents, parseTipDollars, presetTipCents, TIP_PRESET_PERCENTS, validateTip } from '../tips'

type Choice = 'none' | 'custom' | (typeof TIP_PRESET_PERCENTS)[number]

function fmt(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

/** Which button a saved tip corresponds to (e.g. after a page reload). */
export function choiceForTip(tipCents: number, baseCents: number): Choice {
    if (tipCents <= 0) return 'none'
    const preset = TIP_PRESET_PERCENTS.find(p => presetTipCents(baseCents, p) === tipCents)
    return preset ?? 'custom'
}

/**
 * Tip buttons for the end-of-appointment payment page. Presentational: the
 * parent saves the tip on the server and passes `saving` while it does, so
 * the buttons lock and only one change is in flight at a time.
 */
export function TipPicker({ baseCents, tipCents, saving, error, onChange }: {
    baseCents: number
    tipCents: number
    saving: boolean
    error: string
    onChange: (tipCents: number) => Promise<boolean>
}) {
    const [choice, setChoice] = useState<Choice>(() => choiceForTip(tipCents, baseCents))
    const [custom, setCustom] = useState(() => choiceForTip(tipCents, baseCents) === 'custom' ? (tipCents / 100).toFixed(2) : '')
    const [customError, setCustomError] = useState('')

    // Keep the highlighted button in step with what the server confirmed.
    useEffect(() => {
        setChoice(prev => (prev === 'custom' && tipCents > 0 ? 'custom' : choiceForTip(tipCents, baseCents)))
    }, [tipCents, baseCents])

    const pick = async (next: Choice) => {
        if (saving) return
        setCustomError('')
        if (next === 'custom') {
            // Start from the current tip so the field matches the total shown.
            setCustom(tipCents > 0 ? (tipCents / 100).toFixed(2) : '')
            setChoice('custom')
            return
        }
        const cents = next === 'none' ? 0 : presetTipCents(baseCents, next)
        const previous = choice
        setChoice(next)
        if (cents === tipCents) return
        const ok = await onChange(cents)
        if (!ok) setChoice(previous)
    }

    const applyCustom = async () => {
        if (saving) return
        const cents = parseTipDollars(custom)
        if (cents === null) { setCustomError('Enter a dollar amount, like 10 or 12.50.'); return }
        const invalid = validateTip(cents, baseCents)
        if (invalid) { setCustomError(invalid); return }
        setCustomError('')
        if (cents === tipCents) return
        await onChange(cents)
    }

    const button = (key: Choice, label: string, sub?: string) => {
        const active = choice === key
        return (
            <button
                key={String(key)}
                type="button"
                onClick={() => pick(key)}
                disabled={saving}
                aria-pressed={active}
                className="flex-1 min-w-[4.5rem] rounded-lg px-2 py-2 text-sm transition-colors disabled:opacity-60"
                style={{
                    border: `1px solid ${active ? '#0F0E0E' : '#E8E2D6'}`,
                    backgroundColor: active ? '#0F0E0E' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#1A1818',
                }}
            >
                <span className="block font-medium">{label}</span>
                {sub && <span className="block text-xs" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#6F6863' }}>{sub}</span>}
            </button>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: '#1A1818' }}>Add a tip</p>
                {saving && <Loader2 className="size-4 animate-spin" style={{ color: '#6F6863' }} aria-label="Updating tip" />}
            </div>
            <div className="flex flex-wrap gap-2">
                {button('none', 'No tip')}
                {TIP_PRESET_PERCENTS.map(p => button(p, `${p}%`, fmt(presetTipCents(baseCents, p))))}
                {button('custom', 'Custom')}
            </div>
            {/* Not a <form>: the picker sits inside the payment form, and a
                nested form would make Enter or "Apply" submit the payment. */}
            {choice === 'custom' && (
                <div className="flex gap-2">
                    <div className="flex-1 flex items-center rounded-lg px-3" style={{ border: '1px solid #E8E2D6' }}>
                        <span className="text-sm" style={{ color: '#6F6863' }}>$</span>
                        <input
                            inputMode="decimal"
                            autoFocus
                            aria-label="Custom tip in dollars"
                            placeholder="0.00"
                            value={custom}
                            onChange={e => setCustom(e.target.value)}
                            onKeyDown={e => {
                                if (e.key !== 'Enter') return
                                e.preventDefault()
                                applyCustom()
                            }}
                            disabled={saving}
                            className="flex-1 bg-transparent px-1 py-2 text-sm outline-none"
                            style={{ color: '#1A1818' }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={applyCustom}
                        disabled={saving}
                        className="rounded-lg px-4 text-sm font-medium disabled:opacity-60"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                    >
                        Apply
                    </button>
                </div>
            )}
            {choice === 'custom' && !customError && (
                <p className="text-xs" style={{ color: '#6F6863' }}>Up to {fmt(maxTipCents(baseCents))}.</p>
            )}
            {(customError || error) && <p className="text-sm" style={{ color: '#FC6161' }}>{customError || error}</p>}
            <p className="text-xs" style={{ color: '#6F6863' }}>AfroAllure takes no cut of your tip.</p>
        </div>
    )
}
