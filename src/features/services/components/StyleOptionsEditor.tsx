'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fillGrid, gridKey, type HairMode, type ServicePrep, type StyleCell, type StyleOption, type StyleOptions } from '../pricing'
import { applyTemplate, newOptionId, STYLE_TEMPLATES } from './styleTemplates'
import { formatDuration } from '../utils'

export const EMPTY_STYLE_OPTIONS: StyleOptions = {
    enabled: false,
    sizes: [],
    lengths: [],
    grid: {},
    hair: { mode: 'none', price: 0, note: '' },
}

const dollars = (cents: number | undefined) => (cents === undefined || Number.isNaN(cents) ? '' : String(cents / 100))
const toCents = (v: string) => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN
}

/** Problems that would stop a client booking; shown under the grid and checked before saving. */
export function styleOptionProblems(options: StyleOptions): string[] {
    if (!options.enabled) return []
    const problems: string[] = []
    if (options.sizes.length === 0 && options.lengths.length === 0) problems.push('Add at least one size or length.')
    const labels = (list: StyleOption[]) => list.map(o => o.label.trim().toLowerCase())
    for (const [name, list] of [['size', options.sizes], ['length', options.lengths]] as const) {
        if (list.some(o => !o.label.trim())) problems.push(`Every ${name} needs a name.`)
        const l = labels(list)
        if (new Set(l).size !== l.length) problems.push(`Two ${name}s have the same name.`)
    }
    const sizeIds = options.sizes.length ? options.sizes.map(s => s.id) : [null]
    const lengthIds = options.lengths.length ? options.lengths.map(l => l.id) : [null]
    let bookable = 0
    let missing = 0
    for (const s of sizeIds) for (const l of lengthIds) {
        const cell = options.grid[gridKey(s, l)]
        if (cell?.available === false) continue
        if (!cell || !Number.isFinite(cell.price) || cell.price <= 0) missing++
        else bookable++
    }
    if (missing) problems.push(`${missing} combination${missing === 1 ? ' has' : 's have'} no price — add one or switch it off.`)
    if (!missing && bookable === 0) problems.push('Switch on at least one combination.')
    if (options.hair.mode === 'optional' && !(options.hair.price > 0)) problems.push('Set a price for supplying hair.')
    return problems
}

function OptionListEditor({ label, placeholder, items, onChange }: {
    label: string
    placeholder: string
    items: StyleOption[]
    onChange: (items: StyleOption[]) => void
}) {
    const [draft, setDraft] = useState('')
    const add = () => {
        const name = draft.trim()
        if (!name) return
        onChange([...items, { id: newOptionId(), label: name }])
        setDraft('')
    }
    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <Label className="text-xs">{label}</Label>
            <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                    <span key={item.id} className="inline-flex items-center gap-1 rounded-md border bg-background pl-2 pr-1 py-0.5">
                        <input
                            aria-label={`${label} ${i + 1}`}
                            value={item.label}
                            onChange={(e) => onChange(items.map(o => o.id === item.id ? { ...o, label: e.target.value } : o))}
                            className="w-24 bg-transparent text-sm outline-none"
                        />
                        <button type="button" aria-label={`Remove ${item.label}`} onClick={() => onChange(items.filter(o => o.id !== item.id))} className="text-muted-foreground hover:text-foreground">
                            <X className="size-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-1.5">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
                    placeholder={placeholder}
                    className="h-8 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
                    <Plus className="size-3.5" /> Add
                </Button>
            </div>
        </div>
    )
}

function GridCellEditor({ cell, baseMinutes, onChange }: {
    cell: StyleCell | undefined
    baseMinutes: number
    onChange: (cell: StyleCell) => void
}) {
    const current: StyleCell = cell ?? { price: NaN, extraMinutes: 0, available: true }
    const off = current.available === false
    return (
        <div className={`flex flex-col gap-1 rounded-md border p-1.5 min-w-[112px] ${off ? 'opacity-50 bg-muted/40' : ''}`}>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">$</span>
                <input
                    type="number" min="0" step="1" inputMode="decimal"
                    aria-label="Price"
                    disabled={off}
                    value={dollars(Number.isNaN(current.price) ? undefined : current.price)}
                    onChange={(e) => onChange({ ...current, price: toCents(e.target.value) })}
                    className="w-full min-w-0 bg-transparent text-sm outline-none"
                    placeholder="—"
                />
            </div>
            <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">+</span>
                <input
                    type="number" min="0" step="15" inputMode="numeric"
                    aria-label="Extra minutes"
                    disabled={off}
                    value={current.extraMinutes || ''}
                    onChange={(e) => onChange({ ...current, extraMinutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full min-w-0 bg-transparent text-xs outline-none"
                    placeholder="0"
                />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">min</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{off ? 'Not offered' : formatDuration(baseMinutes + (current.extraMinutes || 0)) || '—'}</p>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={!off} onChange={(e) => onChange({ ...current, available: e.target.checked })} />
                Offered
            </label>
        </div>
    )
}

export function StyleOptionsEditor({ value, onChange, baseMinutes, onApplyTemplate }: {
    value: StyleOptions
    onChange: (next: StyleOptions) => void
    baseMinutes: number
    /** A template also sets prep instructions and the base duration. */
    onApplyTemplate: (applied: { styleOptions: StyleOptions; prep: ServicePrep; baseMinutes: number }) => void
}) {
    const [fill, setFill] = useState({ basePrice: '', sizeStep: '', lengthStep: '', lengthMinutes: '' })
    const problems = styleOptionProblems(value)
    const sizeRows: (StyleOption | null)[] = value.sizes.length ? value.sizes : [null]
    const lengthCols: (StyleOption | null)[] = value.lengths.length ? value.lengths : [null]

    const setCell = (sizeId: string | undefined, lengthId: string | undefined, cell: StyleCell) =>
        onChange({ ...value, grid: { ...value.grid, [gridKey(sizeId, lengthId)]: cell } })

    const pickTemplate = (id: string) => {
        const template = STYLE_TEMPLATES.find(t => t.id === id)
        if (!template) return
        const hasWork = value.sizes.length > 0 || value.lengths.length > 0
        if (hasWork && !window.confirm(`Replace your current sizes, lengths and prices with the ${template.name} template?`)) return
        onApplyTemplate(applyTemplate(template))
    }

    const applyFill = () => {
        const basePrice = toCents(fill.basePrice)
        if (!Number.isFinite(basePrice) || basePrice <= 0) return
        const num = (v: string) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : 0)
        const filled = fillGrid(value.sizes, value.lengths, {
            basePrice,
            sizeStep: Math.round(num(fill.sizeStep) * 100),
            lengthStep: Math.round(num(fill.lengthStep) * 100),
            lengthMinutesStep: Math.max(0, num(fill.lengthMinutes)),
        })
        // Keep combinations the stylist already switched off.
        Object.keys(filled).forEach(k => { if (value.grid[k]?.available === false) filled[k].available = false })
        onChange({ ...value, grid: filled })
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-start gap-2">
                <Checkbox
                    id="style-options-enabled"
                    checked={value.enabled}
                    onCheckedChange={(checked) => onChange({ ...value, enabled: checked === true })}
                />
                <div className="flex flex-col gap-0.5">
                    <label htmlFor="style-options-enabled" className="text-sm font-medium cursor-pointer select-none">
                        Price by size and length
                    </label>
                    <p className="text-xs text-muted-foreground">
                        Clients pick a size and length when booking, and the price and time update to match.
                    </p>
                </div>
            </div>

            {value.enabled && (
                <>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Start from a template (optional)</Label>
                        <Select onValueChange={pickTemplate}>
                            <SelectTrigger className="w-full h-9"><SelectValue placeholder="Choose a style…" /></SelectTrigger>
                            <SelectContent>
                                {STYLE_TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">Fills in sizes, lengths, example prices and prep. Change anything after.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <OptionListEditor label="Sizes" placeholder="e.g. Smedium" items={value.sizes} onChange={(sizes) => onChange({ ...value, sizes })} />
                        <OptionListEditor label="Lengths" placeholder="e.g. Waist" items={value.lengths} onChange={(lengths) => onChange({ ...value, lengths })} />
                    </div>

                    {(value.sizes.length > 0 || value.lengths.length > 0) && (
                        <>
                            <details className="rounded-md bg-muted/40 px-2.5 py-2">
                                <summary className="text-xs font-medium cursor-pointer select-none">Quick fill prices</summary>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                        Price of the first box ($)
                                        <Input type="number" min="0" className="h-8" value={fill.basePrice} onChange={(e) => setFill({ ...fill, basePrice: e.target.value })} placeholder="300" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                        Change per size ($, can be −)
                                        <Input type="number" className="h-8" value={fill.sizeStep} onChange={(e) => setFill({ ...fill, sizeStep: e.target.value })} placeholder="-40" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                        Change per length ($)
                                        <Input type="number" className="h-8" value={fill.lengthStep} onChange={(e) => setFill({ ...fill, lengthStep: e.target.value })} placeholder="40" />
                                    </label>
                                    <label className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                                        Extra minutes per length
                                        <Input type="number" min="0" className="h-8" value={fill.lengthMinutes} onChange={(e) => setFill({ ...fill, lengthMinutes: e.target.value })} placeholder="60" />
                                    </label>
                                </div>
                                <Button type="button" size="sm" variant="outline" className="mt-2" onClick={applyFill} disabled={!(toCents(fill.basePrice) > 0)}>
                                    Fill all prices
                                </Button>
                            </details>

                            <div className="flex flex-col gap-1">
                                <Label className="text-xs">Price and time for each combination</Label>
                                <p className="text-[11px] text-muted-foreground">
                                    Time is your base duration ({formatDuration(baseMinutes) || 'not set'}) plus any extra minutes.
                                </p>
                                <div className="overflow-x-auto -mx-1 px-1 pb-1">
                                    <table className="border-separate border-spacing-1.5 text-xs">
                                        <thead>
                                            <tr>
                                                <th />
                                                {lengthCols.map((l) => (
                                                    <th key={l?.id ?? 'any'} className="font-medium text-left text-muted-foreground whitespace-nowrap">{l?.label ?? 'Price'}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sizeRows.map((s) => (
                                                <tr key={s?.id ?? 'any'}>
                                                    <th className="font-medium text-left text-muted-foreground whitespace-nowrap pr-1">{s?.label ?? ''}</th>
                                                    {lengthCols.map((l) => (
                                                        <td key={l?.id ?? 'any'}>
                                                            <GridCellEditor
                                                                cell={value.grid[gridKey(s?.id, l?.id)]}
                                                                baseMinutes={baseMinutes}
                                                                onChange={(cell) => setCell(s?.id, l?.id, cell)}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs">Braiding hair</Label>
                        <Select value={value.hair.mode} onValueChange={(mode) => onChange({ ...value, hair: { ...value.hair, mode: mode as HairMode } })}>
                            <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Not applicable</SelectItem>
                                <SelectItem value="included">Included in the price</SelectItem>
                                <SelectItem value="optional">Client chooses: bring their own, or I supply it for a fee</SelectItem>
                                <SelectItem value="client_brings">Client brings their own hair</SelectItem>
                            </SelectContent>
                        </Select>
                        {value.hair.mode === 'optional' && (
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                Fee if I supply hair ($)
                                <Input
                                    type="number" min="0" className="h-8 w-28"
                                    value={dollars(value.hair.price || undefined)}
                                    onChange={(e) => onChange({ ...value, hair: { ...value.hair, price: toCents(e.target.value) || 0 } })}
                                />
                            </label>
                        )}
                        {value.hair.mode !== 'none' && (
                            <Input
                                className="h-8 text-sm"
                                value={value.hair.note}
                                onChange={(e) => onChange({ ...value, hair: { ...value.hair, note: e.target.value } })}
                                placeholder={value.hair.mode === 'included' ? 'e.g. Pre-stretched hair in 1, 1B, 2 or 4' : 'e.g. 6 packs of 1B pre-stretched hair'}
                            />
                        )}
                    </div>

                    {problems.length > 0 && (
                        <ul className="flex flex-col gap-0.5 rounded-md bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                            {problems.map(p => <li key={p}>• {p}</li>)}
                        </ul>
                    )}
                </>
            )}
        </div>
    )
}
