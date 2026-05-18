import { Fields } from "@puckeditor/core"
import { VideoComponent } from "../types"
import { NumInput } from "../fieldPrimitives"
import { BorderField, PositionField, RadiusField } from "../compoundFields"

const lbl = { fontSize: 11, color: '#A09790', whiteSpace: 'nowrap' as const }

export const videoResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<VideoComponent, {}> = {
        objectFit: { visible: false, type: 'text' },
        aspectRatio: { visible: false, type: 'text' },
        mobileVisibility: { visible: false, type: 'text' },

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
        speed: {
            type: 'custom',
            label: 'Speed',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>Speed</span>
                    <NumInput value={value} onChange={onChange} className="flex-1" />
                </div>
            )
        },

        // ── Size ──────────────────────────────────────────────────────────────
        width: {
            type: 'custom',
            label: 'Width',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>Width</span>
                    <NumInput value={value} onChange={onChange} className="flex-1" />
                </div>
            )
        },
        height: {
            type: 'custom',
            label: 'Height',
            render: ({ value, onChange }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={lbl}>Height</span>
                    <NumInput value={value} onChange={onChange} className="flex-1" />
                </div>
            )
        },

        // ── Border (compound) ─────────────────────────────────────────────────
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

        // ── Radius (compound) ─────────────────────────────────────────────────
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
