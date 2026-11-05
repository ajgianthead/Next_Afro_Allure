'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { templateMeta, type TemplateId } from '@/features/siteBuilder/themes'
import { presetPage } from '../presets'
import { usePuck, useEditor } from './EditorContext'
import { StarterPicker } from './StarterPicker'

/** "Templates": swap the whole page for one of the six starter pages. Undo brings the old page back. */
export function TemplatesDialog({ onClose }: { onClose: () => void }) {
    const { info, site } = useEditor()
    const dispatch = usePuck(s => s.dispatch)
    const [picked, setPicked] = useState<TemplateId | null>(null)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const apply = () => {
        if (!picked) return
        dispatch({ type: 'setData', data: presetPage(picked, info, site) as any, recordHistory: true })
        dispatch({ type: 'setUi', ui: { itemSelector: null } })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-label="Templates" onClick={e => e.stopPropagation()}
                className="bld flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
                <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)', background: '#fff' }}>
                    <div>
                        <h2 className="text-[16px] font-semibold">Start from a template</h2>
                        <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>Each one is a full page you can change section by section.</p>
                    </div>
                    <button type="button" className="bld-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
                </header>
                <div className="overflow-y-auto p-4"><StarterPicker info={info} site={site} selected={picked} onPick={setPicked} previewHeight={320} /></div>
                <footer className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderTop: '1px solid var(--b-line)', background: '#fff' }}>
                    <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>This replaces the page you’re editing. Undo brings it back.</p>
                    <button type="button" className="bld-btn" data-primary="" disabled={!picked} onClick={apply}>
                        {picked ? `Use ${templateMeta(picked).name}` : 'Pick a template'}
                    </button>
                </footer>
            </div>
        </div>
    )
}
