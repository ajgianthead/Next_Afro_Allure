'use client'

import React from 'react'

// 9-point visual position picker (top-left … bottom-right), used for
// object-position / background-position style fields. `value` is a CSS
// position keyword pair, e.g. "center", "top left", "bottom right".

const POINTS: { value: string; row: number; col: number }[] = [
    { value: 'top left', row: 0, col: 0 },
    { value: 'top', row: 0, col: 1 },
    { value: 'top right', row: 0, col: 2 },
    { value: 'left', row: 1, col: 0 },
    { value: 'center', row: 1, col: 1 },
    { value: 'right', row: 1, col: 2 },
    { value: 'bottom left', row: 2, col: 0 },
    { value: 'bottom', row: 2, col: 1 },
    { value: 'bottom right', row: 2, col: 2 },
]

export function PositionGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const current = value ?? 'center'
    return (
        <div
            style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
                gap: 3, width: 54, height: 54, padding: 4, borderRadius: 6, background: '#EEEBE4', flexShrink: 0,
            }}
        >
            {POINTS.map(({ value: v }) => (
                <button
                    key={v}
                    type="button"
                    title={v}
                    onClick={() => onChange(v)}
                    style={{
                        borderRadius: 2, border: 'none', cursor: 'pointer', padding: 0,
                        background: current === v ? '#FC6161' : '#FFFFFF',
                    }}
                />
            ))}
        </div>
    )
}
