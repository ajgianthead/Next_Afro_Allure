'use client'

import { CircleDot, X } from "lucide-react"

export function UnpublishedBanner({ onDismiss }: { onDismiss: () => void }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 16px',
            backgroundColor: '#FFF5F5',
            borderBottom: '1px solid rgba(252,97,97,0.25)',
        }}>
            <CircleDot size={13} style={{ color: '#FC6161', flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: 12, color: '#1A1818' }}>
                You have unpublished changes from your last session — <strong>Publish</strong> to make them live.
            </p>
            <button
                type="button"
                onClick={onDismiss}
                style={{ color: 'rgba(111,104,99,0.6)', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
            >
                <X size={13} />
            </button>
        </div>
    )
}
