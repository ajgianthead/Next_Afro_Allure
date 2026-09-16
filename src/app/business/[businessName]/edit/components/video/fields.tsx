import { Fields } from "@puckeditor/core"
import { VideoComponent } from "../types"
import { NumInput } from "../fieldPrimitives"
import { BorderField, OpacityField, PositionField, RadiusField, SimpleBorderField } from "../compoundFields"

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const videoResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<VideoComponent, {}> = {
        // Cover is correct for nearly every background-video use case — no
        // longer panel-editable, render() still reads whatever's stored.
        objectFit: { visible: false, type: 'text' },
        opacity: {
            type: 'custom',
            label: 'Opacity',
            render: ({ value, onChange }) => <OpacityField value={value ?? 100} onChange={onChange} />
        },
        url: {
            type: 'custom',
            label: 'URL',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>URL</span>
                    <input
                        style={{ flex: 1, height: 26, borderRadius: 3, padding: '0 8px', fontSize: 11, background: '#F4F1EC', border: 'none', color: '#1A1818' }}
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )
        },

        // ── Playback ──────────────────────────────────────────────────────────
        loop: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                    <span style={lbl}>Loop</span>
                </label>
            )
        },
        controls: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                    <span style={lbl}>Controls</span>
                </label>
            )
        },
        autoPlay: {
            type: 'custom',
            label: undefined,
            render: ({ value, onChange }) => (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 13, height: 13 }} />
                    <span style={lbl}>AutoPlay</span>
                </label>
            )
        },
        // Almost never changed — no longer panel-editable, render() still
        // reads whatever's stored (default 1x).
        speed: { visible: false, type: 'number' },

        // ── Size ──────────────────────────────────────────────────────────────
        width: {
            type: 'custom',
            label: 'Width',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>Width</span>
                    <NumInput value={value} onChange={onChange} className="flex-1" allowNegative={false} />
                </div>
            )
        },
        // ── Border (simple on/off, folds in radius) ─────────────────────────────
        borderWidth: {
            type: 'custom',
            label: 'Border',
            render: ({ value, onChange }) => <SimpleBorderField value={value ?? 0} onChange={onChange} />
        },
        borderColor: { visible: false, type: 'text' },
        borderType: { visible: false, type: 'text' },
        borderRadius: { visible: false, type: 'number' },

        // ── Border / Radius (advanced, per-side) ─────────────────────────────────
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

        // ── Position (compound) ───────────────────────────────────────────────
        positionType: {
            type: 'custom',
            label: 'Position',
            render: ({ value, onChange }) => <PositionField value={value ?? 'relative'} onChange={onChange as (v: string) => void} />
        },
        top: { visible: false, type: 'number' },
        bottom: { visible: false, type: 'number' },
        left: { visible: false, type: 'number' },
        right: { visible: false, type: 'number' },
    }

    return fields
}
