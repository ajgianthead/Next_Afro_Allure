'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { SECTIONS } from '../sections'
import { ROOT_ZONE, usePuck } from './EditorContext'
import { Wireframe } from './Wireframe'

/** "Add section": every section type as a big card. Inserts at `at` and selects it. */
export function SectionPicker({ at, onClose }: { at: number; onClose: () => void }) {
    const content = usePuck(s => s.appState.data.content)
    const dispatch = usePuck(s => s.dispatch)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const add = (type: string) => {
        dispatch({ type: 'insert', componentType: type, destinationIndex: at, destinationZone: ROOT_ZONE })
        dispatch({ type: 'setUi', ui: { itemSelector: { index: at, zone: ROOT_ZONE } } })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-label="Add a section" onClick={e => e.stopPropagation()}
                className="bld flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
                <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)', background: '#fff' }}>
                    <div>
                        <h2 className="text-[16px] font-semibold">Add a section</h2>
                        <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>Pick one. You can change its layout after.</p>
                    </div>
                    <button type="button" className="bld-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
                </header>
                <div className="grid grid-cols-1 gap-3 overflow-y-auto p-4 min-[480px]:grid-cols-2 md:grid-cols-3">
                    {SECTIONS.map(def => {
                        const taken = def.single && content.some(c => c.type === def.type)
                        const Icon = def.icon
                        return (
                            <button key={def.type} type="button" className="bld-card !p-3" disabled={taken} onClick={() => add(def.type)}
                                style={taken ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
                                <Wireframe section={def.wireframeId} layout={1} />
                                <span className="flex items-center gap-1.5 pt-1">
                                    <Icon size={15} style={{ color: 'var(--b-coral)' }} />
                                    <span className="bld-card-name !text-[14px]">{def.label}</span>
                                </span>
                                <span className="bld-card-sub !text-[12px]">{taken ? 'Already on your page (one per page).' : def.description}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
