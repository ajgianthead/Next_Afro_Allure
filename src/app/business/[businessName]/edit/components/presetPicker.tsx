'use client'

import React, { useState } from 'react'
import { CONTAINER_PRESETS, SECTION_PRESETS, ContainerPreset, SectionPreset } from './presets'

// Floating panel shown right after a Container or Section is dropped onto
// the canvas — lets the stylist start from a sensible configuration instead
// of a blank box. Applying a preset just pre-fills props/content; nothing
// about it is locked, the component is exactly as editable afterward as if
// the stylist had set every value by hand.
//
// Puck's canvas renders inside an iframe, so there's no reliable way to
// anchor this panel to the exact drop point from the parent document —
// it floats at a fixed position near the bottom of the canvas instead.

function PresetCard({ name, bg, onClick }: { name: string; bg: string; onClick: () => void }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                border: `2px solid ${hovered ? '#FC6161' : 'transparent'}`,
                borderRadius: 8, padding: 4, background: 'none', cursor: 'pointer',
                transform: hovered ? 'scale(1.02)' : 'none', transition: 'transform 0.1s, border-color 0.1s',
            }}
        >
            <div style={{ width: 80, height: 60, borderRadius: 6, backgroundColor: bg, border: '1px solid rgba(0,0,0,0.08)' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#1A1818' }}>{name}</span>
        </button>
    )
}

interface PresetPickerProps {
    kind: 'Container' | 'Section'
    onApplyContainer: (preset: ContainerPreset) => void
    onApplySection: (preset: SectionPreset) => void
    onSkip: () => void
}

export function PresetPicker({ kind, onApplyContainer, onApplySection, onSkip }: PresetPickerProps) {
    return (
        <div
            style={{
                position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                width: 320, padding: 16, borderRadius: 16, zIndex: 20,
                backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                animation: 'aa-color-popover-in 150ms ease-out',
            }}
        >
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6F6863', marginBottom: 10 }}>
                Start from a preset
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {kind === 'Container'
                    ? CONTAINER_PRESETS.map(p => (
                        <PresetCard key={p.id} name={p.name} bg={p.preview.bg} onClick={() => onApplyContainer(p)} />
                    ))
                    : SECTION_PRESETS.map(p => (
                        <PresetCard key={p.id} name={p.name} bg={p.preview.bg} onClick={() => onApplySection(p)} />
                    ))}
            </div>
            <button
                type="button"
                onClick={onSkip}
                style={{
                    display: 'block', width: '100%', textAlign: 'center', marginTop: 12,
                    fontSize: 12, color: '#A09790', background: 'none', border: 'none', cursor: 'pointer',
                }}
            >
                Skip — start blank
            </button>
        </div>
    )
}
