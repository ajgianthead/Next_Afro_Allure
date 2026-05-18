'use client'

import React from 'react'
import { createUsePuck, useGetPuck } from '@puckeditor/core'
import { NumInput } from './fieldPrimitives'
import { Link2, Unlink2 } from 'lucide-react'
import {
    ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon,
    BorderTopIcon, BorderBottomIcon,
    BorderLeftIcon as BLIcon, BorderRightIcon as BRIcon,
    CornerTopLeftIcon, CornerTopRightIcon, CornerBottomLeftIcon, CornerBottomRightIcon,
    CornersIcon, BorderAllIcon, PaddingIcon,
} from '@radix-ui/react-icons'

// ── usePropsUpdater ──────────────────────────────────────────────────────────

export function usePropsUpdater() {
    const usePuck = createUsePuck()
    const props = usePuck((s) => (s.selectedItem?.props ?? {}) as Record<string, any>)
    const selectedId = props.id as string | undefined
    const getPuck = useGetPuck()

    function update(patch: Record<string, any>) {
        if (!selectedId) return
        const puckState = getPuck()
        const currentItem = puckState.getItemById(selectedId)
        if (!currentItem) return
        const selector = puckState.getSelectorForId(selectedId)
        if (!selector) return
        puckState.dispatch({
            type: 'replace',
            destinationIndex: selector.index,
            destinationZone: selector.zone,
            data: { ...currentItem, props: { ...currentItem.props, ...patch } },
        })
    }

    return { props, update }
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Lbl = ({ children, w = 46 }: { children: React.ReactNode; w?: number }) => (
    <span style={{ fontSize: 11, color: '#A09790', whiteSpace: 'nowrap', minWidth: w, flexShrink: 0 }}>{children}</span>
)

const ChainBtn = ({ linked, onToggle }: { linked: boolean; onToggle: () => void }) => (
    <button
        type="button"
        onClick={onToggle}
        style={{
            width: 22, height: 22, borderRadius: 3, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', color: linked ? '#C9974A' : '#A09790', flexShrink: 0,
        }}
        title={linked ? 'Set each side separately' : 'Set all sides at once'}
    >
        {linked ? <Link2 size={12} /> : <Unlink2 size={12} />}
    </button>
)

const FourInputs = ({ values, onChange, icons }: {
    values: (number | undefined)[]
    onChange: ((v: number) => void)[]
    icons: React.ReactNode[]
}) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, marginTop: 2 }}>
        {icons.map((icon, i) => (
            <NumInput key={i} value={values[i] ?? 0} onChange={onChange[i]} icon={icon} />
        ))}
    </div>
)

const TopRow = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}</div>
)

// ── PaddingField ─────────────────────────────────────────────────────────────

export const PaddingField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const expanded = value === 'true'
    return (
        <div>
            <TopRow>
                <Lbl>Padding</Lbl>
                <ChainBtn linked={!expanded} onToggle={() => onChange(expanded ? 'false' : 'true')} />
                {!expanded && (
                    <NumInput value={props.padding ?? 0} onChange={(v) => update({ padding: v })} icon={<PaddingIcon />} className="flex-1" />
                )}
            </TopRow>
            {expanded && (
                <FourInputs
                    values={[props.paddingTop, props.paddingRight, props.paddingBottom, props.paddingLeft]}
                    onChange={[
                        (v) => update({ paddingTop: v }),
                        (v) => update({ paddingRight: v }),
                        (v) => update({ paddingBottom: v }),
                        (v) => update({ paddingLeft: v }),
                    ]}
                    icons={[<ArrowUpIcon />, <ArrowRightIcon />, <ArrowDownIcon />, <ArrowLeftIcon />]}
                />
            )}
        </div>
    )
}

// ── MarginField ──────────────────────────────────────────────────────────────

export const MarginField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const expanded = value === 'true'
    return (
        <div>
            <TopRow>
                <Lbl>Margin</Lbl>
                <ChainBtn linked={!expanded} onToggle={() => onChange(expanded ? 'false' : 'true')} />
                {!expanded && (
                    <NumInput value={props.margin ?? 0} onChange={(v) => update({ margin: v })} icon={<PaddingIcon />} className="flex-1" />
                )}
            </TopRow>
            {expanded && (
                <FourInputs
                    values={[props.marginTop, props.marginRight, props.marginBottom, props.marginLeft]}
                    onChange={[
                        (v) => update({ marginTop: v }),
                        (v) => update({ marginRight: v }),
                        (v) => update({ marginBottom: v }),
                        (v) => update({ marginLeft: v }),
                    ]}
                    icons={[<ArrowUpIcon />, <ArrowRightIcon />, <ArrowDownIcon />, <ArrowLeftIcon />]}
                />
            )}
        </div>
    )
}

// ── BorderStyleButtons ────────────────────────────────────────────────────────

const BORDER_STYLES = [
    { value: 'solid', label: '—' },
    { value: 'dashed', label: '╌' },
    { value: 'dotted', label: '···' },
]

const BorderStyleButtons = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {BORDER_STYLES.map(({ value: v, label }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                title={v}
                style={{
                    width: 22, height: 22, borderRadius: 3, fontSize: 10,
                    background: value === v ? '#FC6161' : '#F4F1EC',
                    color: value === v ? '#fff' : '#A09790',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {label}
            </button>
        ))}
    </div>
)

// ── BorderField ───────────────────────────────────────────────────────────────

export const BorderField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const expanded = value === 'true'
    return (
        <div>
            <TopRow>
                <Lbl>Border</Lbl>
                <ChainBtn linked={!expanded} onToggle={() => onChange(expanded ? 'false' : 'true')} />
                {!expanded && (
                    <NumInput value={props.borderWidth ?? 0} onChange={(v) => update({ borderWidth: v })} icon={<BorderAllIcon />} className="flex-1" />
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ position: 'relative', width: 22, height: 22, borderRadius: 3, background: '#F4F1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: 14, height: 14, borderRadius: 2, border: '1px solid rgba(0,0,0,0.1)', backgroundColor: props.borderColor ?? '#000000' }} />
                        <input
                            type="color"
                            value={props.borderColor ?? '#000000'}
                            onChange={(e) => update({ borderColor: e.target.value })}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        />
                    </div>
                    <BorderStyleButtons value={props.borderType ?? 'solid'} onChange={(v) => update({ borderType: v })} />
                </div>
            </TopRow>
            {expanded && (
                <FourInputs
                    values={[props.borderTop, props.borderRight, props.borderBottom, props.borderLeft]}
                    onChange={[
                        (v) => update({ borderTop: v }),
                        (v) => update({ borderRight: v }),
                        (v) => update({ borderBottom: v }),
                        (v) => update({ borderLeft: v }),
                    ]}
                    icons={[<BorderTopIcon />, <BRIcon />, <BorderBottomIcon />, <BLIcon />]}
                />
            )}
        </div>
    )
}

// ── RadiusField ───────────────────────────────────────────────────────────────

export const RadiusField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const expanded = value === 'true'
    return (
        <div>
            <TopRow>
                <Lbl>Radius</Lbl>
                <ChainBtn linked={!expanded} onToggle={() => onChange(expanded ? 'false' : 'true')} />
                {!expanded && (
                    <NumInput value={props.borderRadius ?? 0} onChange={(v) => update({ borderRadius: v })} icon={<CornersIcon />} className="flex-1" />
                )}
            </TopRow>
            {expanded && (
                <FourInputs
                    values={[props.borderRadiusTopLeft, props.borderRadiusTopRight, props.borderRadiusBottomRight, props.borderRadiusBottomLeft]}
                    onChange={[
                        (v) => update({ borderRadiusTopLeft: v }),
                        (v) => update({ borderRadiusTopRight: v }),
                        (v) => update({ borderRadiusBottomRight: v }),
                        (v) => update({ borderRadiusBottomLeft: v }),
                    ]}
                    icons={[<CornerTopLeftIcon />, <CornerTopRightIcon />, <CornerBottomRightIcon />, <CornerBottomLeftIcon />]}
                />
            )}
        </div>
    )
}

// ── PositionField ─────────────────────────────────────────────────────────────

export const PositionField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const isAbsolute = value === 'absolute'
    return (
        <div>
            <TopRow>
                <Lbl>Position</Lbl>
                <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 4, background: '#EEEBE4', flex: 1 }}>
                    {[{ v: 'relative', l: 'Relative' }, { v: 'absolute', l: 'Absolute' }].map(({ v, l }) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onChange(v)}
                            style={{
                                flex: 1, height: 22, borderRadius: 3, fontSize: 11,
                                background: value === v ? '#FC6161' : 'transparent',
                                color: value === v ? '#fff' : '#A09790',
                                border: 'none', cursor: 'pointer',
                            }}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </TopRow>
            {isAbsolute && (
                <FourInputs
                    values={[props.top, props.right, props.bottom, props.left]}
                    onChange={[
                        (v) => update({ top: v }),
                        (v) => update({ right: v }),
                        (v) => update({ bottom: v }),
                        (v) => update({ left: v }),
                    ]}
                    icons={[<ArrowUpIcon />, <ArrowRightIcon />, <ArrowDownIcon />, <ArrowLeftIcon />]}
                />
            )}
        </div>
    )
}
