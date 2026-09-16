'use client'

import React from 'react'
import { createUsePuck, useGetPuck } from '@puckeditor/core'
import { Copy, Trash2 } from 'lucide-react'

export function ElementHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
    const usePuck = createUsePuck()
    const selectedItem = usePuck((s) => s.selectedItem)
    const getPuck = useGetPuck()

    const id: string | undefined = selectedItem?.props?.id

    const withSelector = (fn: (selector: { index: number; zone: string }) => void) => {
        if (!id) return
        const puckState = getPuck()
        const selector = puckState.getSelectorForId(id)
        if (!selector) return
        fn(selector)
    }

    const handleDuplicate = () => withSelector((selector) => {
        getPuck().dispatch({ type: 'duplicate', sourceIndex: selector.index, sourceZone: selector.zone })
    })

    const handleDelete = () => withSelector((selector) => {
        getPuck().dispatch({ type: 'remove', index: selector.index, zone: selector.zone })
    })

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 sticky top-0 z-10"
            style={{ borderBottom: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
        >
            <div
                className="size-5 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#F0EBE3' }}
            >
                {icon}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1818', lineHeight: 1 }}>
                {label}
            </span>
            {id && (
                <span
                    title={id}
                    style={{
                        fontSize: 10, fontFamily: 'monospace', color: '#A09790',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1, minWidth: 0,
                    }}
                >
                    {id}
                </span>
            )}
            <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', flexShrink: 0 }}>
                <button
                    type="button"
                    title="Duplicate"
                    onClick={handleDuplicate}
                    disabled={!id}
                    style={{
                        width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6F6863', cursor: id ? 'pointer' : 'default',
                    }}
                >
                    <Copy size={12} />
                </button>
                <button
                    type="button"
                    title="Delete"
                    onClick={handleDelete}
                    disabled={!id}
                    style={{
                        width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6F6863', cursor: id ? 'pointer' : 'default',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#FC6161' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6F6863' }}
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    )
}
