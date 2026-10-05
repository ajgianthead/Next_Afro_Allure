'use client'

import { gridKey, type StyleOption, type StyleOptions, type StyleSelection } from '@/features/services/pricing'

function Choice({ label, selected, disabled, onClick, sub }: {
    label: string
    selected: boolean
    disabled?: boolean
    onClick: () => void
    sub?: string
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={onClick}
            className="flex flex-col items-start text-left px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed"
            style={{
                borderRadius: 'var(--t-input-r)',
                border: selected ? '2px solid var(--t-primary)' : '1px solid var(--t-border)',
                backgroundColor: selected ? 'var(--t-primary)' : 'var(--t-card)',
                color: selected ? 'var(--t-primary-text)' : 'var(--t-text)',
                opacity: disabled ? 0.4 : 1,
            }}
        >
            <span className="font-medium">{label}</span>
            {sub && <span className="text-[11px]" style={{ opacity: 0.8 }}>{sub}</span>}
        </button>
    )
}

const money = (cents: number) => `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`

/**
 * Size / length / hair picker for services with style options. Combinations
 * the stylist doesn't offer are disabled, and each choice shows its price
 * where that's unambiguous.
 */
export function StylePicker({ options, selection, onChange }: {
    options: StyleOptions
    selection: StyleSelection
    onChange: (next: StyleSelection) => void
}) {
    const offered = (sizeId?: string | null, lengthId?: string | null) => {
        const cell = options.grid[gridKey(sizeId, lengthId)]
        return cell && cell.available ? cell : null
    }
    // A size is selectable if it works with the chosen length (or any length, if none chosen yet).
    const sizeOk = (s: StyleOption) => options.lengths.length === 0
        ? !!offered(s.id, null)
        : selection.lengthId ? !!offered(s.id, selection.lengthId) : options.lengths.some(l => offered(s.id, l.id))
    const lengthOk = (l: StyleOption) => options.sizes.length === 0
        ? !!offered(null, l.id)
        : selection.sizeId ? !!offered(selection.sizeId, l.id) : options.sizes.some(s => offered(s.id, l.id))

    const priceHint = (sizeId: string | null, lengthId: string | null) => {
        const cell = offered(sizeId, lengthId)
        return cell ? money(cell.price) : undefined
    }

    const pickSize = (s: StyleOption) => {
        const next: StyleSelection = { ...selection, sizeId: s.id }
        // Drop a length that doesn't exist for the new size.
        if (next.lengthId && !offered(s.id, next.lengthId)) next.lengthId = null
        onChange(next)
    }
    const pickLength = (l: StyleOption) => {
        const next: StyleSelection = { ...selection, lengthId: l.id }
        if (next.sizeId && !offered(next.sizeId, l.id)) next.sizeId = null
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-4">
            {options.sizes.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>Size</p>
                    <div className="flex flex-wrap gap-2">
                        {options.sizes.map(s => (
                            <Choice
                                key={s.id}
                                label={s.label}
                                selected={selection.sizeId === s.id}
                                disabled={!sizeOk(s)}
                                onClick={() => pickSize(s)}
                                sub={options.lengths.length === 0 ? priceHint(s.id, null) : selection.lengthId ? priceHint(s.id, selection.lengthId) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {options.lengths.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>Length</p>
                    <div className="flex flex-wrap gap-2">
                        {options.lengths.map(l => (
                            <Choice
                                key={l.id}
                                label={l.label}
                                selected={selection.lengthId === l.id}
                                disabled={!lengthOk(l)}
                                onClick={() => pickLength(l)}
                                sub={options.sizes.length === 0 ? priceHint(null, l.id) : selection.sizeId ? priceHint(selection.sizeId, l.id) : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {options.hair.mode === 'optional' && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>Braiding hair</p>
                    <div className="flex flex-wrap gap-2">
                        <Choice label="I'll bring my own" selected={!selection.addHair} onClick={() => onChange({ ...selection, addHair: false })} />
                        <Choice label="Stylist supplies it" sub={`+${money(options.hair.price)}`} selected={!!selection.addHair} onClick={() => onChange({ ...selection, addHair: true })} />
                    </div>
                    {options.hair.note && (
                        <p className="text-xs" style={{ color: 'var(--t-muted)' }}>{options.hair.note}</p>
                    )}
                </div>
            )}
            {(options.hair.mode === 'included' || options.hair.mode === 'client_brings') && (
                <p className="text-xs rounded-md px-3 py-2" style={{ color: 'var(--t-text)', backgroundColor: 'var(--t-bg)', border: '1px solid var(--t-border)' }}>
                    <strong>{options.hair.mode === 'included' ? 'Hair included.' : 'Please bring your own hair.'}</strong>
                    {options.hair.note ? ` ${options.hair.note}` : ''}
                </p>
            )}
        </div>
    )
}
