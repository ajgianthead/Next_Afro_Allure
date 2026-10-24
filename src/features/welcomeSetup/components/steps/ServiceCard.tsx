'use client'

import { useId } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { StyleOptionsEditor } from '@/features/services/components/StyleOptionsEditor'
import { RateCheck } from '@/features/services/components/RateCheck'
import { startingPrice } from '@/features/services/pricing'
import { formatDuration, formatPrice } from '@/features/services/utils'
import type { AvailabilityData } from '@/features/availability/utils'
import type { ServiceDraft } from '../../serviceDrafts'
import { BRAND, INPUT_CLASS, TextField, inputStyle } from '../shared'

export function ServiceCard({
    draft,
    open,
    problem,
    schedules,
    canRemove,
    onToggle,
    onChange,
    onRemove,
}: {
    draft: ServiceDraft
    open: boolean
    problem: string | null
    schedules: AvailabilityData[]
    canRemove: boolean
    onToggle: () => void
    onChange: (draft: ServiceDraft) => void
    onRemove: () => void
}) {
    const id = useId()
    const { form, styleOptions, prep } = draft
    const smart = styleOptions.enabled
    const fromPrice = smart ? startingPrice({ price: form.price, length: form.length, style_options: styleOptions }) : form.price
    const setForm = (patch: Partial<ServiceDraft['form']>) => onChange({ ...draft, form: { ...form, ...patch } })

    const hours = Math.floor(form.length / 60)
    const minutes = form.length % 60
    const setDuration = (h: number, m: number) => setForm({ length: Math.max(0, h) * 60 + Math.max(0, Math.min(59, m)) })

    const summary = [
        fromPrice > 0 ? `${smart ? 'from ' : ''}${formatPrice(fromPrice)}` : null,
        form.length > 0 ? `${formatDuration(form.length)}${smart ? '+' : ''}` : null,
        smart ? 'Smart Pricing' : null,
    ].filter(Boolean).join(' · ')

    return (
        <div className="rounded-xl" style={{ border: `1px solid ${problem && !open ? BRAND.error : BRAND.border}`, backgroundColor: '#FFFFFF' }}>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: BRAND.ink }}>{form.name.trim() || 'New service'}</p>
                    <p className="truncate text-xs" style={{ color: problem && !open ? BRAND.error : BRAND.warm }}>
                        {problem && !open ? problem : summary || 'Add a price and duration'}
                    </p>
                </div>
                <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} color={BRAND.warm} />
            </button>

            {open && (
                <div className="flex flex-col gap-4 px-4 pb-4">
                    <TextField
                        label="Service name"
                        value={form.name}
                        placeholder="e.g. Knotless braids"
                        maxLength={100}
                        onChange={name => setForm({ name })}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {smart ? (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium" style={{ color: BRAND.warm }}>Price</span>
                                <p className="h-10 flex items-center text-sm" style={{ color: BRAND.ink }}>
                                    From&nbsp;<strong>{fromPrice > 0 ? formatPrice(fromPrice) : '—'}</strong>
                                    <span className="text-xs ml-1" style={{ color: BRAND.warm }}>· set per size and length</span>
                                </p>
                            </div>
                        ) : (
                            <TextField
                                label="Price ($)"
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="e.g. 80"
                                value={form.price > 0 ? String(form.price / 100) : ''}
                                onChange={v => {
                                    const n = parseFloat(v)
                                    setForm({ price: Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0 })
                                }}
                            />
                        )}
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-medium" style={{ color: BRAND.warm }}>
                                {smart ? 'Base duration (your quickest combination)' : 'Duration'}
                            </span>
                            <div className="flex items-center gap-2">
                                <input
                                    aria-label="Hours"
                                    type="number"
                                    min="0"
                                    max="24"
                                    inputMode="numeric"
                                    value={hours || (form.length ? '0' : '')}
                                    placeholder="0"
                                    onChange={e => setDuration(parseInt(e.target.value) || 0, minutes)}
                                    className={INPUT_CLASS}
                                    style={inputStyle()}
                                />
                                <span className="text-xs" style={{ color: BRAND.warm }}>h</span>
                                <input
                                    aria-label="Minutes"
                                    type="number"
                                    min="0"
                                    max="59"
                                    step="5"
                                    inputMode="numeric"
                                    value={minutes || (form.length ? '0' : '')}
                                    placeholder="0"
                                    onChange={e => setDuration(hours, parseInt(e.target.value) || 0)}
                                    className={INPUT_CLASS}
                                    style={inputStyle()}
                                />
                                <span className="text-xs" style={{ color: BRAND.warm }}>m</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor={`${id}-description`} className="text-xs font-medium" style={{ color: BRAND.warm }}>
                            Description (optional)
                        </label>
                        <textarea
                            id={`${id}-description`}
                            value={form.description}
                            maxLength={1000}
                            rows={2}
                            placeholder="What's included, who it's for…"
                            onChange={e => setForm({ description: e.target.value })}
                            className="w-full rounded-xl px-3 py-2 text-base sm:text-sm outline-none resize-y"
                            style={inputStyle()}
                        />
                    </div>

                    {schedules.length > 1 && (
                        <div className="flex flex-col gap-1">
                            <label htmlFor={`${id}-schedule`} className="text-xs font-medium" style={{ color: BRAND.warm }}>Bookable during</label>
                            <select
                                id={`${id}-schedule`}
                                value={form.availability}
                                onChange={e => setForm({ availability: e.target.value })}
                                className={`${INPUT_CLASS} px-2`}
                                style={inputStyle()}
                            >
                                {schedules.map(s => <option key={s.id} value={s.id}>{s.name || 'Schedule'}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Smart Pricing: the same size × length grid and hair options as the Services editor. */}
                    <div className="flex flex-col gap-1.5">
                        <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: BRAND.gold }}>Smart Pricing</p>
                        <StyleOptionsEditor
                            value={styleOptions}
                            onChange={next => onChange({ ...draft, styleOptions: next })}
                            baseMinutes={form.length}
                            onApplyTemplate={({ styleOptions: applied, prep: appliedPrep, baseMinutes }) => {
                                onChange({
                                    form: { ...form, length: baseMinutes },
                                    styleOptions: applied,
                                    // Don't overwrite prep the stylist already has.
                                    prep: prep.instructions.trim() || prep.checklist.length ? prep : appliedPrep,
                                })
                            }}
                        />
                    </div>

                    <RateCheck
                        price={form.price}
                        minutes={form.length}
                        styleOptions={styleOptions}
                        onStyleOptionsChange={next => onChange({ ...draft, styleOptions: next })}
                        onPriceChange={price => setForm({ price })}
                    />

                    {problem && <p role="alert" className="text-xs" style={{ color: BRAND.error }}>{problem}</p>}

                    <div className="flex items-center justify-between gap-2">
                        {canRemove ? (
                            <button
                                type="button"
                                onClick={onRemove}
                                className="flex items-center gap-1.5 text-xs font-medium"
                                style={{ color: BRAND.error }}
                            >
                                <Trash2 size={13} /> Remove service
                            </button>
                        ) : <span />}
                        <button
                            type="button"
                            onClick={onToggle}
                            className="h-8 rounded-full px-4 text-xs font-medium"
                            style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
