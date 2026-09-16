'use client'

import React from 'react'
import { LayoutTemplate } from 'lucide-react'

export function EmptyCanvasOverlay({ onBrowseTemplates }: { onBrowseTemplates: () => void }) {
    return (
        <div
            style={{
                position: 'absolute', inset: 24, zIndex: 5,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 14, borderRadius: 16, border: '2px dashed #E8E2D6',
                backgroundColor: 'rgba(255,255,255,0.6)', pointerEvents: 'none',
            }}
        >
            <LayoutTemplate size={28} style={{ color: '#C9B89A' }} />
            <p style={{ fontSize: 13, color: '#6F6863', textAlign: 'center', maxWidth: 260 }}>
                Start with a template or drag elements from the left
            </p>
            <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
                <button
                    type="button"
                    onClick={onBrowseTemplates}
                    style={{
                        padding: '7px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                        backgroundColor: '#FC6161', color: '#FFFFFF', border: 'none', cursor: 'pointer',
                    }}
                >
                    Browse templates
                </button>
                <span
                    style={{
                        padding: '7px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                        backgroundColor: 'transparent', color: '#A09790', border: '1px solid #E8E2D6',
                    }}
                >
                    Start from scratch
                </span>
            </div>
        </div>
    )
}
