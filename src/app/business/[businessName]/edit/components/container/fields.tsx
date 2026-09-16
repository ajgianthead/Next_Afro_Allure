import type { Fields } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { ColumnSpacingIcon, DotIcon, RowSpacingIcon, ViewHorizontalIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { Container } from "../types";
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives";
import { BorderField, MarginField, PaddingField, PositionField, RadiusField, SimpleBorderField, SizePresetField, usePropsUpdater } from "../compoundFields";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ImageModal } from "../image/fields";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { OpacityField } from "../compoundFields";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const GradientField = ({ value, onChange }: { value: string; onChange: (v: any) => void }) => {
    const isGradient = typeof value === 'string' && value.startsWith('linear-gradient')

    const parseGradient = (v: string) => {
        const m = v.match(/linear-gradient\((\d+(?:\.\d+)?)deg,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*(.+?)\s+(\d+(?:\.\d+)?)%\)/)
        return m
            ? { angle: parseFloat(m[1]), c1: m[2].trim(), p1: parseFloat(m[3]), c2: m[4].trim(), p2: parseFloat(m[5]) }
            : { angle: 135, c1: value || '#f7f7f7', p1: 0, c2: '#1A1818', p2: 100 }
    }

    const build = (angle: number, c1: string, p1: number, c2: string, p2: number) =>
        `linear-gradient(${angle}deg, ${c1} ${p1}%, ${c2} ${p2}%)`

    const g = parseGradient(value)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Fill</span>
                <SegToggle
                    value={isGradient ? 'gradient' : 'solid'}
                    onChange={(mode) => {
                        if (mode === 'gradient') {
                            onChange(build(135, isGradient ? g.c1 : (value || '#f7f7f7'), 0, '#1A1818', 100))
                        } else {
                            onChange(isGradient ? g.c1 : (value || '#f7f7f7'))
                        }
                    }}
                    options={[
                        { label: 'Solid', value: 'solid' },
                        { label: 'Gradient', value: 'gradient' },
                    ]}
                    className="flex-1"
                />
            </div>
            {isGradient ? (
                <>
                    <div style={{ height: 24, borderRadius: 3, background: value, border: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...lbl, minWidth: 40 }}>Angle</span>
                        <NumInput value={g.angle} onChange={(a) => onChange(build(a, g.c1, g.p1, g.c2, g.p2))} step={1} className="flex-1" />
                        <span style={{ ...lbl, flexShrink: 0 }}>°</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ColorPicker value={g.c1} onChange={(c) => onChange(build(g.angle, c, g.p1, g.c2, g.p2))} className="flex-1" />
                        <NumInput value={g.p1} onChange={(p) => onChange(build(g.angle, g.c1, p, g.c2, g.p2))} step={1} allowNegative={false} className="w-12" />
                        <span style={{ ...lbl, flexShrink: 0 }}>%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ColorPicker value={g.c2} onChange={(c) => onChange(build(g.angle, g.c1, g.p1, c, g.p2))} className="flex-1" />
                        <NumInput value={g.p2} onChange={(p) => onChange(build(g.angle, g.c1, g.p1, g.c2, p))} step={1} allowNegative={false} className="w-12" />
                        <span style={{ ...lbl, flexShrink: 0 }}>%</span>
                    </div>
                </>
            ) : (
                <ColorPicker value={value} onChange={onChange} className="w-full" />
            )}
        </div>
    )
}

const GradientBody = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const parseGradient = (v: string) => {
        const m = v.match(/linear-gradient\((\d+(?:\.\d+)?)deg,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*(.+?)\s+(\d+(?:\.\d+)?)%\)/)
        return m
            ? { angle: parseFloat(m[1]), c1: m[2].trim(), p1: parseFloat(m[3]), c2: m[4].trim(), p2: parseFloat(m[5]) }
            : { angle: 135, c1: '#f7f7f7', p1: 0, c2: '#1A1818', p2: 100 }
    }
    const build = (angle: number, c1: string, p1: number, c2: string, p2: number) =>
        `linear-gradient(${angle}deg, ${c1} ${p1}%, ${c2} ${p2}%)`
    const g = parseGradient(value)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
            <div style={{ height: 24, borderRadius: 3, background: value, border: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 40 }}>Angle</span>
                <NumInput value={g.angle} onChange={(a) => onChange(build(a, g.c1, g.p1, g.c2, g.p2))} step={1} className="flex-1" />
                <span style={{ ...lbl, flexShrink: 0 }}>°</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ColorPicker value={g.c1} onChange={(c) => onChange(build(g.angle, c, g.p1, g.c2, g.p2))} className="flex-1" />
                <NumInput value={g.p1} onChange={(p) => onChange(build(g.angle, g.c1, p, g.c2, g.p2))} step={1} allowNegative={false} className="w-12" />
                <span style={{ ...lbl, flexShrink: 0 }}>%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ColorPicker value={g.c2} onChange={(c) => onChange(build(g.angle, g.c1, g.p1, c, g.p2))} className="flex-1" />
                <NumInput value={g.p2} onChange={(p) => onChange(build(g.angle, g.c1, g.p1, g.c2, p))} step={1} allowNegative={false} className="w-12" />
                <span style={{ ...lbl, flexShrink: 0 }}>%</span>
            </div>
        </div>
    )
}

type BgType = 'none' | 'color' | 'image' | 'gradient'

const inferBgType = (backgroundColor: string, backgroundImageUrl: string): BgType => {
    if (backgroundImageUrl) return 'image'
    if (typeof backgroundColor === 'string' && (backgroundColor.startsWith('linear-gradient') || backgroundColor.startsWith('radial-gradient'))) return 'gradient'
    if (!backgroundColor || backgroundColor === 'transparent') return 'none'
    return 'color'
}

// The single Background control — None / Color / Image / Gradient. Only the
// active type's CSS is actually applied by render(); switching types here
// just changes which fields are populated (backgroundColor vs backgroundImageUrl).
export const BackgroundField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const { props, update } = usePropsUpdater()
    const backgroundImageUrl = props.backgroundImageUrl ?? ''
    const type = inferBgType(value, backgroundImageUrl)
    const [imageModalOpen, setImageModalOpen] = useState(false)

    const setType = (next: BgType) => {
        if (next === type) return
        if (next === 'none') {
            onChange('transparent')
            update({ backgroundImageUrl: '' })
        } else if (next === 'color') {
            onChange('#F7F5F2')
            update({ backgroundImageUrl: '' })
        } else if (next === 'gradient') {
            onChange('linear-gradient(135deg, #f7f7f7 0%, #1A1818 100%)')
            update({ backgroundImageUrl: '' })
        } else if (next === 'image') {
            setImageModalOpen(true)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Background</span>
                <SegToggle
                    value={type}
                    onChange={setType}
                    options={[
                        { label: 'None', value: 'none' },
                        { label: 'Color', value: 'color' },
                        { label: 'Image', value: 'image' },
                        { label: 'Gradient', value: 'gradient' },
                    ]}
                    className="flex-1"
                />
            </div>
            {type === 'color' && (
                <div style={{ marginTop: 6 }}>
                    <ColorPicker value={value} onChange={onChange} className="w-full" />
                </div>
            )}
            {type === 'gradient' && <GradientBody value={value} onChange={onChange} />}
            {type === 'image' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <ImageModal
                        open={imageModalOpen}
                        onClose={() => setImageModalOpen(false)}
                        onChange={(v) => update({ backgroundImageUrl: v ?? '' })}
                        value={backgroundImageUrl || null}
                    />
                    <Button size="sm" variant="outline" onClick={() => setImageModalOpen(true)} style={{ flex: 1, height: 26, fontSize: 11 }}>
                        {backgroundImageUrl ? 'Change Image' : 'Select Image'}
                    </Button>
                    {backgroundImageUrl && (
                        <button
                            type="button"
                            title="Remove background image"
                            onClick={() => update({ backgroundImageUrl: '' })}
                            style={{ width: 22, height: 22, border: 'none', background: '#F4F1EC', borderRadius: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#A09790' }}
                        >
                            <X size={11} />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

const AlignBtns = ({ value, onChange, options }: {
    value: string
    onChange: (v: string) => void
    options: { v: string; icon: string; title: string }[]
}) => (
    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {options.map(({ v, icon, title }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                title={title}
                style={{
                    flex: 1, height: 26, borderRadius: 3, fontSize: 12,
                    background: value === v ? '#FC6161' : '#F4F1EC',
                    color: value === v ? '#fff' : '#A09790',
                    border: 'none', cursor: 'pointer',
                }}
            >
                {icon}
            </button>
        ))}
    </div>
)

export const defaultFields: Fields<Container, {}> = {
    content: { type: "slot" },

    // ── Layout ────────────────────────────────────────────────────────────────
    flexDirection: {
        type: 'custom',
        visible: true,
        label: 'Direction',
        render: ({ onChange, value }) => (
            <div className="grid grid-cols-4 items-center gap-1.5">
                <p style={{ ...lbl, gridColumn: 'span 2' }}>Direction</p>
                <SegToggle value={value} onChange={onChange} className="col-span-2 col-start-3" options={[
                    { label: <div className="flex justify-center"><ViewHorizontalIcon className="my-0.5" /></div>, value: 'flex-col' },
                    { label: <div className="flex justify-center"><ViewVerticalIcon className="my-0.5 mr-0.5" /></div>, value: 'flex-row' },
                ]} />
            </div>
        )
    },
    mainAxisLayout: {
        visible: true,
        type: 'custom',
        label: 'Arrange items',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Arrange</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '←', title: 'Start' },
                    { v: 'center', icon: '⊙', title: 'Center' },
                    { v: 'end', icon: '→', title: 'End' },
                    { v: 'space-between', icon: '↔', title: 'Spread evenly' },
                    { v: 'space-evenly', icon: '≡', title: 'Perfectly even' },
                    { v: 'space-around', icon: '∿', title: 'Equal spacing' },
                ]} />
            </div>
        )
    },
    altAxisLayout: {
        visible: true,
        type: 'custom',
        label: 'Align items',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Align</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '↑', title: 'Start' },
                    { v: 'center', icon: '⊙', title: 'Center' },
                    { v: 'end', icon: '↓', title: 'End' },
                    { v: 'baseline', icon: '≡', title: 'Baseline' },
                    { v: 'stretch', icon: '↕', title: 'Fill space' },
                ]} />
            </div>
        )
    },
    grow: {
        type: 'custom',
        label: 'Grow',
        render: ({ value, onChange }) => (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                <span style={lbl}>Grow</span>
            </label>
        )
    },
    responsiveDirection: {
        type: 'custom',
        label: 'Resp. Dir',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Resp. Dir</span>
                <StrSelect value={value} onChange={onChange} options={['none', 'col-to-row', 'row-to-col']} className="flex-1" />
            </div>
        )
    },
    hideBelow: {
        type: 'custom',
        label: 'Hide on mobile',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Hide on mobile</span>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="flex-1" />
            </div>
        )
    },
    hideAbove: {
        type: 'custom',
        label: 'Hide on desktop',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Hide on desktop</span>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="flex-1" />
            </div>
        )
    },

    // ── Gap ───────────────────────────────────────────────────────────────────
    gapX: {
        label: 'Gap X',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Gap X</span>
                <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
            </div>
        )
    },
    gapY: {
        label: 'Gap Y',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Gap Y</span>
                <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
            </div>
        )
    },

    // ── Padding (compound) ────────────────────────────────────────────────────
    paddingExpanded: {
        type: 'custom',
        label: 'Padding',
        render: ({ value, onChange }) => <PaddingField value={value ?? 'false'} onChange={onChange} />
    },
    padding: { visible: false, type: 'number' },
    paddingTop: { visible: false, type: 'number' },
    paddingBottom: { visible: false, type: 'number' },
    paddingLeft: { visible: false, type: 'number' },
    paddingRight: { visible: false, type: 'number' },

    // ── Margin (compound) ─────────────────────────────────────────────────────
    marginExpanded: {
        type: 'custom',
        label: 'Margin',
        render: ({ value, onChange }) => <MarginField value={value ?? 'false'} onChange={onChange} />
    },
    margin: { visible: false, type: 'number' },
    marginTop: { visible: false, type: 'number' },
    marginBottom: { visible: false, type: 'number' },
    marginLeft: { visible: false, type: 'number' },
    marginRight: { visible: false, type: 'number' },

    // ── Background (None / Color / Image / Gradient) ────────────────────────────
    backgroundColor: {
        type: 'custom',
        label: 'Background',
        render: ({ onChange, value }) => <BackgroundField value={value} onChange={onChange} />,
    },
    backgroundImageUrl: { visible: false, type: 'text' },
    // Cover/center are correct for the vast majority of background images —
    // no longer panel-editable, but render() still reads whatever's stored
    // (existing customized values keep working; new components get the
    // type defaults).
    backgroundObjectFit: { visible: false, type: 'text' },
    backgroundPosition: { visible: false, type: 'text' },

    // ── Border (simple on/off, folds in radius) ─────────────────────────────────
    borderWidth: {
        type: 'custom',
        label: 'Border',
        render: ({ value, onChange }) => <SimpleBorderField value={value ?? 0} onChange={onChange} />
    },
    borderColor: { visible: false, type: 'text' },
    borderType: { visible: false, type: 'text' },
    borderRadius: { visible: false, type: 'number' },

    // ── Border / Radius (advanced, per-side) ────────────────────────────────────
    borderExpanded: {
        type: 'custom',
        label: 'Border (per side)',
        render: ({ value, onChange }) => <BorderField value={value ?? 'false'} onChange={onChange} />
    },
    borderTop: { visible: false, type: 'number' },
    borderBottom: { visible: false, type: 'number' },
    borderLeft: { visible: false, type: 'number' },
    borderRight: { visible: false, type: 'number' },
    borderRadiusExpanded: {
        type: 'custom',
        label: 'Radius (per corner)',
        render: ({ value, onChange }) => <RadiusField value={value ?? 'false'} onChange={onChange} />
    },
    borderRadiusTopLeft: { visible: false, type: 'number' },
    borderRadiusTopRight: { visible: false, type: 'number' },
    borderRadiusBottomLeft: { visible: false, type: 'number' },
    borderRadiusBottomRight: { visible: false, type: 'number' },

    // ── Position (compound) ───────────────────────────────────────────────────
    positionType: {
        type: 'custom',
        label: 'Positioning',
        render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
    },
    top: { visible: false, type: 'number' },
    bottom: { visible: false, type: 'number' },
    left: { visible: false, type: 'number' },
    right: { visible: false, type: 'number' },

    // ── Width / Height ────────────────────────────────────────────────────────
    width: {
        type: 'custom',
        label: 'Width',
        render: () => <SizePresetField label="Width" valueProp="width" unitProp="widthUnit" />
    },
    widthUnit: { visible: false, type: 'text' },
    height: {
        type: 'custom',
        label: 'Height',
        render: () => <SizePresetField label="Height" valueProp="height" unitProp="heightUnit" includeHalf={false} />
    },
    heightUnit: { visible: false, type: 'text' },

    // ── Sizing ────────────────────────────────────────────────────────────────
    // minHeight is no longer panel-editable — render() still reads whatever's
    // stored, so existing content (e.g. hero sections with an explicit
    // minHeight) is unaffected; new components just get the 0/auto default.
    minHeight: { visible: false, type: 'number' },
    maxWidth: {
        type: 'custom',
        label: 'Max W',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Max W (rem)</span>
                <NumInput value={value} onChange={onChange} step={0.5} className="flex-1" />
            </div>
        )
    },
    aspectRatio: {
        type: 'custom',
        label: 'Aspect Ratio',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Aspect Ratio</span>
                <Input
                    className="flex-1 !h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none !ring-0 rounded-[3px]"
                    placeholder="e.g. 4/5"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    // Almost never intentionally changed — no longer panel-editable, render()
    // still reads whatever's stored (existing content keeps its current
    // overflow behavior, e.g. hover-scale/shadow effects that rely on
    // overflow:visible aren't clipped).
    overflow: { visible: false, type: 'text' },
    gridTemplateColumns: {
        visible: false,
        type: 'custom',
        label: 'Grid Columns',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Grid Cols</span>
                <Input
                    className="flex-1 !h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none !ring-0 rounded-[3px]"
                    placeholder="1fr 1fr 1fr"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        )
    },
    // Removed from the panel — it conflicted with gapX/gapY (two systems
    // controlling similar-sounding spacing at once); gapX/gapY are now the
    // single source of truth. render() still reads whatever's stored.
    spacing: { visible: false, type: 'text' },

    // ── Opacity ───────────────────────────────────────────────────────────────
    opacity: {
        type: 'custom',
        label: 'Opacity',
        render: ({ value, onChange }) => <OpacityField value={value ?? 100} onChange={onChange} />
    },

    // ── Advanced ──────────────────────────────────────────────────────────────
    rotation: {
        type: 'custom',
        label: 'Rotation',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Rotation</span>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} className="flex-1" />
            </div>
        )
    },
    zIndex: {
        type: 'custom',
        label: 'Layer order',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl} title="Higher numbers appear in front of lower numbers">Layer order</span>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} className="flex-1" />
            </div>
        )
    },
}

export const containerResolvedFields: (data: any) => {} = (data) => {
    const fields: Fields<Container, {}> = { ...defaultFields }

    if (data.props.flexDirection === 'grid') {
        fields.gridTemplateColumns = {
            type: 'custom',
            visible: true,
            label: 'Grid Columns',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#A09790', minWidth: 56, whiteSpace: 'nowrap' }}>Grid Cols</span>
                    <Input
                        className="flex-1 !h-[26px] text-[11px] !bg-[#F4F1EC] !border-0 !shadow-none !ring-0 rounded-[3px]"
                        placeholder="1fr 1fr 1fr"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        }
    }

    return fields
}
