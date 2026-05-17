import type { Fields } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { ColumnSpacingIcon, DotIcon, RowSpacingIcon, ViewHorizontalIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { Container } from "../types";
import { NumInput, SegToggle, ColorPicker, StrSelect } from "../fieldPrimitives";
import { BorderField, MarginField, PaddingField, PositionField, RadiusField } from "../compoundFields";
import { Input } from "@/components/ui/input";
import { SPACING_OPTIONS } from "@/features/editor/lib/responsive";

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

const AlignBtns = ({ value, onChange, options }: {
    value: string
    onChange: (v: string) => void
    options: { v: string; icon: string }[]
}) => (
    <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {options.map(({ v, icon }) => (
            <button
                key={v}
                type="button"
                onClick={() => onChange(v)}
                title={v}
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
        label: 'Main Axis',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Main</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '←' },
                    { v: 'center', icon: '⊙' },
                    { v: 'end', icon: '→' },
                    { v: 'space-between', icon: '↔' },
                    { v: 'space-evenly', icon: '≡' },
                    { v: 'space-around', icon: '∿' },
                ]} />
            </div>
        )
    },
    altAxisLayout: {
        visible: true,
        type: 'custom',
        label: 'Cross Axis',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Cross</span>
                <AlignBtns value={value} onChange={onChange as (v: string) => void} options={[
                    { v: 'start', icon: '↑' },
                    { v: 'center', icon: '⊙' },
                    { v: 'end', icon: '↓' },
                    { v: 'baseline', icon: '≡' },
                    { v: 'stretch', icon: '↕' },
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
    responsive: { visible: false, type: 'text' },
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
        label: 'Hide Below',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Hide Below</span>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="flex-1" />
            </div>
        )
    },
    hideAbove: {
        type: 'custom',
        label: 'Hide Above',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 56 }}>Hide Above</span>
                <StrSelect value={value} onChange={onChange} options={['none', 'sm', 'md', 'lg']} className="flex-1" />
            </div>
        )
    },

    // ── Gap ───────────────────────────────────────────────────────────────────
    gapX: {
        label: 'Gap X',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<ColumnSpacingIcon />} />
    },
    gapY: {
        label: 'Gap Y',
        visible: true,
        type: 'custom',
        render: ({ value, onChange }) => <NumInput value={value} onChange={onChange} icon={<RowSpacingIcon />} />
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

    // ── Colors ────────────────────────────────────────────────────────────────
    backgroundColor: {
        type: 'custom',
        label: 'Color',
        render: ({ onChange, value }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Color</span>
                <ColorPicker value={value} onChange={onChange} className="flex-1" />
            </div>
        )
    },

    // ── Border (compound) ─────────────────────────────────────────────────────
    borderExpanded: {
        type: 'custom',
        label: 'Border',
        render: ({ value, onChange }) => <BorderField value={value ?? 'false'} onChange={onChange} />
    },
    borderWidth: { visible: false, type: 'number' },
    borderTop: { visible: false, type: 'number' },
    borderBottom: { visible: false, type: 'number' },
    borderLeft: { visible: false, type: 'number' },
    borderRight: { visible: false, type: 'number' },
    borderColor: { visible: false, type: 'text' },
    borderType: { visible: false, type: 'text' },

    // ── Radius (compound) ─────────────────────────────────────────────────────
    borderRadiusExpanded: {
        type: 'custom',
        label: 'Radius',
        render: ({ value, onChange }) => <RadiusField value={value ?? 'false'} onChange={onChange} />
    },
    borderRadius: { visible: false, type: 'number' },
    borderRadiusTopLeft: { visible: false, type: 'number' },
    borderRadiusTopRight: { visible: false, type: 'number' },
    borderRadiusBottomLeft: { visible: false, type: 'number' },
    borderRadiusBottomRight: { visible: false, type: 'number' },

    // ── Position (compound) ───────────────────────────────────────────────────
    positionType: {
        type: 'custom',
        label: 'Position',
        render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
    },
    top: { visible: false, type: 'number' },
    bottom: { visible: false, type: 'number' },
    left: { visible: false, type: 'number' },
    right: { visible: false, type: 'number' },

    // ── Sizing ────────────────────────────────────────────────────────────────
    minHeight: {
        type: 'custom',
        label: 'Min H',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Min H (rem)</span>
                <NumInput value={value} onChange={onChange} step={0.5} className="flex-1" />
            </div>
        )
    },
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
    overflow: {
        type: 'custom',
        label: 'Overflow',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Overflow</span>
                <StrSelect value={value} onChange={onChange} options={['visible', 'hidden', 'scroll', 'auto']} className="flex-1" />
            </div>
        )
    },
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
    spacing: {
        type: 'custom',
        label: 'Spacing',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ ...lbl, minWidth: 44 }}>Spacing</span>
                <select
                    value={value ?? 'none'}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                >
                    {SPACING_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>
        )
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
        label: 'Z-Index',
        render: ({ value, onChange }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={lbl}>Z-Index</span>
                <NumInput value={value} onChange={onChange} icon={<DotIcon />} className="flex-1" />
            </div>
        )
    },
    draggable: { type: 'number' },
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
