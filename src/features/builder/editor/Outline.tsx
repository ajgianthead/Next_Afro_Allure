'use client'

import { ArrowDown, ArrowUp, Copy, EyeOff, Plus, Trash2 } from 'lucide-react'
import { SECTION_BY_TYPE } from '../sections'
import { ROOT_ZONE, usePuck } from './EditorContext'
import { wireframeSection } from './Wireframe'

/** The page's sections in order: select, move, copy, delete, and add. */
export function Outline({ onAdd, onPicked }: { onAdd: (at: number) => void; onPicked?: () => void }) {
    const content = usePuck(s => s.appState.data.content)
    const selected = usePuck(s => s.appState.ui.itemSelector?.index ?? -1)
    const dispatch = usePuck(s => s.dispatch)
    // With nothing selected, new sections go above the footer.
    const footerIndex = content.findIndex(c => c.type === 'Footer')
    const select = (index: number) => {
        dispatch({ type: 'setUi', ui: { itemSelector: { index, zone: ROOT_ZONE } } })
        const id = (content[index]?.props as { id?: string })?.id
        const frame = document.querySelector<HTMLIFrameElement>('.bld iframe')
        const el = id ? (frame?.contentDocument ?? document).querySelector(`[data-puck-component="${id}"]`) : null
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        onPicked?.()
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center justify-between px-3.5 py-3" style={{ borderBottom: '1px solid var(--b-line)' }}>
                <h2 className="text-[14px] font-semibold">Sections</h2>
                <span className="text-[11.5px]" style={{ color: 'var(--b-muted)' }}>{content.length}</span>
            </header>
            <ol className="grid min-h-0 flex-1 content-start gap-1 overflow-y-auto p-2">
                {content.map((item, i) => {
                    const def = SECTION_BY_TYPE[item.type as keyof typeof SECTION_BY_TYPE]
                    const p = item.props as { id: string; layout?: number; style?: { visibility?: { hideMobile?: boolean; hideDesktop?: boolean } } }
                    const layoutName = def ? wireframeSection(def.wireframeId)?.layouts[(p.layout ?? 1) - 1]?.name : undefined
                    const hidden = p.style?.visibility?.hideMobile || p.style?.visibility?.hideDesktop
                    const Icon = def?.icon
                    const active = i === selected
                    return (
                        <li key={p.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5"
                            style={{ background: active ? 'var(--b-coral-soft)' : undefined, outline: active ? '1.5px solid var(--b-coral)' : undefined }}>
                            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => select(i)} aria-current={active || undefined}>
                                {Icon && <Icon size={15} className="flex-none" style={{ color: active ? 'var(--b-coral)' : 'var(--b-muted)' }} />}
                                <span className="min-w-0">
                                    <span className="block truncate text-[13px] font-semibold">{def?.label ?? item.type}</span>
                                    {layoutName && <span className="block truncate text-[11px]" style={{ color: 'var(--b-muted)' }}>{p.layout}. {layoutName}</span>}
                                </span>
                                {hidden && <EyeOff size={12} className="flex-none" style={{ color: 'var(--b-faint)' }} aria-label="Hidden on some screens" />}
                            </button>
                            <span className={`flex flex-none ${active ? '' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'}`}>
                                <button type="button" className="bld-icon-btn !h-6 !w-6" aria-label="Move up" disabled={i === 0}
                                    onClick={() => dispatch({ type: 'reorder', sourceIndex: i, destinationIndex: i - 1, destinationZone: ROOT_ZONE })}><ArrowUp size={13} /></button>
                                <button type="button" className="bld-icon-btn !h-6 !w-6" aria-label="Move down" disabled={i === content.length - 1}
                                    onClick={() => dispatch({ type: 'reorder', sourceIndex: i, destinationIndex: i + 1, destinationZone: ROOT_ZONE })}><ArrowDown size={13} /></button>
                                {!def?.single && <button type="button" className="bld-icon-btn !h-6 !w-6" aria-label="Duplicate"
                                    onClick={() => dispatch({ type: 'duplicate', sourceIndex: i, sourceZone: ROOT_ZONE })}><Copy size={13} /></button>}
                                <button type="button" className="bld-icon-btn !h-6 !w-6" aria-label="Delete"
                                    onClick={() => dispatch({ type: 'remove', index: i, zone: ROOT_ZONE })}><Trash2 size={13} /></button>
                            </span>
                        </li>
                    )
                })}
                {!content.length && <li className="px-2 py-6 text-center text-[12.5px]" style={{ color: 'var(--b-muted)' }}>No sections yet.</li>}
            </ol>
            <div className="p-2.5" style={{ borderTop: '1px solid var(--b-line)' }}>
                <button type="button" className="bld-btn w-full" data-primary="" onClick={() => onAdd(selected >= 0 ? selected + 1 : footerIndex >= 0 ? footerIndex : content.length)}>
                    <Plus size={15} /> Add section
                </button>
            </div>
        </div>
    )
}
