'use client'

import { useState } from 'react'
import { createUsePuck } from '@puckeditor/core'
import { templates } from '@/features/editor/templates'
import { LayoutTemplate, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CATEGORY_LABELS: Record<string, string> = {
    luxury: 'Luxury',
    modern: 'Modern',
    minimal: 'Minimal',
}

const InnerPicker = ({ onClose }: { onClose: () => void }) => {
    const usePuck = createUsePuck()
    const dispatch = usePuck((s) => s.dispatch)

    const apply = (data: any) => {
        if (!confirm('Replace the current canvas with this template? This cannot be undone.')) return
        dispatch({ type: 'setData', data: () => data })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-base font-semibold text-slate-800">Choose a starting template</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                    {templates.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => apply(t.data)}
                            className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors group flex items-start gap-4"
                        >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                <LayoutTemplate className="size-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{t.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                                <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                                    {CATEGORY_LABELS[t.category] ?? t.category}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="px-6 py-3 border-t bg-slate-50 text-xs text-slate-400">
                    Selecting a template replaces all current content. This action cannot be undone after saving.
                </div>
            </div>
        </div>
    )
}

export const TemplatePicker = () => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                className="gap-2"
                onClick={() => setOpen(true)}
            >
                <LayoutTemplate className="size-4" />
                Templates
            </Button>

            {open && <InnerPicker onClose={() => setOpen(false)} />}
        </>
    )
}
