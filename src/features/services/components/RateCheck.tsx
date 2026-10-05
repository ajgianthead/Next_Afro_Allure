'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { StyleOptions } from '../pricing'
import { rateCheckRows, type RateRow } from '../rateCheck'

// Per-browser convenience: the stylist's target rate and usual costs.
const STORAGE_KEY = 'aa.rateCheck'
const DEFAULTS = { target: '40', supplies: '10', hair: '30' }

function loadSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
    } catch {
        return DEFAULTS
    }
}

const dollars = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`
const hours = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}
const toCents = (v: string) => Math.max(0, Math.round((parseFloat(v) || 0) * 100))

const VERDICT = {
    low: { color: '#B42318', bg: 'rgba(252,97,97,0.08)', text: 'Under your rate' },
    ok: { color: '#6F6863', bg: 'transparent', text: 'On target' },
    good: { color: '#15803D', bg: 'rgba(34,197,94,0.06)', text: 'Above your rate' },
} as const

/**
 * "Am I charging enough?" — shows what each style pays per hour after
 * supplies (and hair, when it's included), against the stylist's own target,
 * and can raise under-priced combinations to the suggested price.
 */
export function RateCheck({ price, minutes, styleOptions, onStyleOptionsChange, onPriceChange }: {
    /** Base price (cents) — used when the service has no size × length pricing. */
    price: number
    minutes: number
    styleOptions: StyleOptions
    onStyleOptionsChange: (next: StyleOptions) => void
    onPriceChange: (cents: number) => void
}) {
    const [open, setOpen] = useState(false)
    const [inputs, setInputs] = useState(DEFAULTS)
    useEffect(() => { setInputs(loadSaved()) }, [])
    const update = (patch: Partial<typeof DEFAULTS>) => {
        const next = { ...inputs, ...patch }
        setInputs(next)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* private mode */ }
    }

    const target = toCents(inputs.target)
    const hairIncluded = styleOptions.enabled && styleOptions.hair.mode === 'included'
    const rows = useMemo(
        () => rateCheckRows({ price, length: minutes, style_options: styleOptions }, target,
            { suppliesCents: toCents(inputs.supplies), hairCents: toCents(inputs.hair) }),
        [price, minutes, styleOptions, target, inputs.supplies, inputs.hair]
    )
    const low = rows.filter(r => r.suggestedCents != null)

    const raiseAll = () => {
        if (!styleOptions.enabled) {
            if (low[0]?.suggestedCents) onPriceChange(low[0].suggestedCents)
            return
        }
        const grid = { ...styleOptions.grid }
        for (const r of low) if (grid[r.key]) grid[r.key] = { ...grid[r.key], price: r.suggestedCents! }
        onStyleOptionsChange({ ...styleOptions, grid })
    }

    if (!minutes || rows.length === 0) return null

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
            <button type="button" className="flex items-center justify-between gap-2 text-left" onClick={() => setOpen(o => !o)}>
                <span className="flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    <span className="text-sm font-medium">Am I charging enough?</span>
                    {target > 0 && low.length > 0 && (
                        <span className="text-xs rounded-full px-2 py-0.5" style={{ color: VERDICT.low.color, backgroundColor: VERDICT.low.bg }}>
                            {low.length} under {dollars(target)}/hr
                        </span>
                    )}
                </span>
                {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            {open && (
                <>
                    <p className="text-xs text-muted-foreground -mt-1">
                        What you take home per hour of chair time after supplies{hairIncluded ? ' and hair' : ''}. Long styles often pay less than they look.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        <label className="flex flex-col gap-1 text-xs">
                            Your hourly goal ($)
                            <Input type="number" min="0" className="h-8" value={inputs.target} onChange={e => update({ target: e.target.value })} />
                        </label>
                        <label className="flex flex-col gap-1 text-xs">
                            Supplies per visit ($)
                            <Input type="number" min="0" className="h-8" value={inputs.supplies} onChange={e => update({ supplies: e.target.value })} />
                        </label>
                        {hairIncluded && (
                            <label className="flex flex-col gap-1 text-xs">
                                Hair cost ($)
                                <Input type="number" min="0" className="h-8" value={inputs.hair} onChange={e => update({ hair: e.target.value })} />
                            </label>
                        )}
                    </div>

                    <div className="flex flex-col divide-y rounded-md border">
                        {rows.map(r => <Row key={r.key} row={r} />)}
                    </div>

                    {low.length > 0 && (
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                Suggested prices are rounded up to the next $5. Nothing changes until you save.
                            </p>
                            <Button type="button" size="sm" variant="outline" onClick={raiseAll}>
                                Use suggested {low.length === 1 ? 'price' : 'prices'}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function Row({ row }: { row: RateRow }) {
    const v = VERDICT[row.verdict]
    return (
        <div className="flex items-center gap-3 px-3 py-2 text-sm" style={{ backgroundColor: v.bg }}>
            <span className="flex-1 min-w-0 truncate">{row.label}</span>
            <span className="text-xs text-muted-foreground w-24 text-right">{dollars(row.priceCents)} · {hours(row.minutes)}</span>
            <span className="w-20 text-right font-medium" style={{ color: v.color }}>
                {row.hourlyCents > 0 ? `${dollars(row.hourlyCents)}/hr` : '—'}
            </span>
            <span className="w-20 text-right text-xs" style={{ color: v.color }}>
                {row.suggestedCents != null ? `→ ${dollars(row.suggestedCents)}` : v.text}
            </span>
        </div>
    )
}
