'use client'

import { useState } from 'react'
import { createUsePuck, Render } from '@puckeditor/core'
import { templates, Template } from '@/features/editor/templates'
import { config } from './constants'
import { saveDraftData } from '@/app/utils/editor_actions'
import { useWebBuilderEditorTour } from '@/features/tour/tours/WebBuilderEditorTour'
import { LayoutTemplate, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const SERIF = '"Fraunces", "Times New Roman", serif'

// ─── Category colors ──────────────────────────────────────────────────────────

type Category = Template['category']

const CATEGORY_STYLE: Record<Category, { accent: string; tag: string }> = {
    luxury: { accent: '#c9974a', tag: 'rgba(201,151,74,0.15)' },
    modern: { accent: '#FC6161', tag: 'rgba(252,97,97,0.15)' },
    minimal: { accent: '#6F6863', tag: 'rgba(26,20,16,0.08)' },
    bold: { accent: '#FF3D7F', tag: 'rgba(255,61,127,0.15)' },
    clean: { accent: '#A9714A', tag: 'rgba(169,113,74,0.15)' },
}

const CATEGORY_LABELS: Record<Category, string> = {
    luxury: 'Luxury',
    modern: 'Modern',
    minimal: 'Minimal',
    bold: 'Bold',
    clean: 'Clean',
}

const CATEGORY_FILTERS: (Category | 'all')[] = ['all', 'luxury', 'modern', 'minimal', 'bold', 'clean']

// ─── Live scaled thumbnail — reuses the same config/Render as the public page ──

function TemplateThumbnail({ template, designWidth = 1400, cardWidth = 220, cardHeight = 130 }: {
    template: Template
    designWidth?: number
    cardWidth?: number
    cardHeight?: number
}) {
    const scale = cardWidth / designWidth
    return (
        <div style={{ width: '100%', height: cardHeight, overflow: 'hidden', position: 'relative', backgroundColor: '#FAF7F2' }}>
            <div style={{ width: designWidth, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                <Render config={config} data={template.data} />
            </div>
        </div>
    )
}

// ─── Single template card ─────────────────────────────────────────────────────

function TemplateCard({ template, onSelect }: { template: Template; onSelect: (t: Template) => void }) {
    const [hovered, setHovered] = useState(false)
    const style = CATEGORY_STYLE[template.category]

    return (
        <button
            type="button"
            onClick={() => onSelect(template)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                border: '1.5px solid #E8E2D6',
                borderRadius: 12, overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.15s',
                boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.08)' : 'none',
                borderColor: hovered ? '#FC6161' : '#E8E2D6',
                transform: hovered ? 'translateY(-2px)' : 'none',
                cursor: 'pointer', textAlign: 'left', display: 'block', width: '100%',
            }}
        >
            <TemplateThumbnail template={template} />
            <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818', fontWeight: 400 }}>
                        {template.name}
                    </p>
                    <span style={{
                        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 9999,
                        backgroundColor: CATEGORY_STYLE[template.category].tag,
                        color: '#6F6863',
                    }}>
                        {CATEGORY_LABELS[template.category]}
                    </span>
                </div>
                <p style={{ fontSize: 11, color: '#6F6863', lineHeight: 1.45 }}>
                    {template.description}
                </p>
            </div>
        </button>
    )
}

// ─── TemplateCardList — shared between editor + dashboard ─────────────────────

export function TemplateCardList({ onSelect }: { onSelect: (t: Template) => void }) {
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState<Category | 'all'>('all')
    const query = search.toLowerCase()

    const visible = templates.filter(t => {
        const matchesQuery = !query || t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        const matchesCategory = category === 'all' || t.category === category
        return matchesQuery && matchesCategory
    })

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: '1 1 0', minHeight: 0 }}>
            {/* Search */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid #E8E2D6', borderRadius: 8,
                padding: '0 10px', height: 36, backgroundColor: '#FAF7F2', flexShrink: 0,
            }}>
                <Search size={13} style={{ color: '#6F6863' }} />
                <input
                    placeholder="Search templates…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: '#1A1818', backgroundColor: 'transparent' }}
                />
            </div>

            {/* Category filter tabs */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, overflowX: 'auto' }}>
                {CATEGORY_FILTERS.map(c => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        style={{
                            padding: '5px 12px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                            whiteSpace: 'nowrap', flexShrink: 0,
                            backgroundColor: category === c ? '#FC6161' : '#F5F6F8',
                            color: category === c ? '#FFFFFF' : '#6F6863',
                            border: 'none', cursor: 'pointer', transition: 'background-color 0.1s, color 0.1s',
                        }}
                    >
                        {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 16, overflowY: 'auto', flex: '1 1 0', minHeight: 0,
            }}>
                {visible.length === 0 ? (
                    <p style={{ gridColumn: '1/-1', fontSize: 13, color: '#6F6863', textAlign: 'center', paddingTop: 24 }}>
                        No templates found
                    </p>
                ) : visible.map(t => (
                    <TemplateCard key={t.id} template={t} onSelect={onSelect} />
                ))}
            </div>
        </div>
    )
}

// ─── InnerPicker — must render inside Puck context ────────────────────────────

function InnerPicker({ businessId, onClose }: { businessId?: string; onClose: () => void }) {
    const usePuck = createUsePuck()
    const dispatch = usePuck(s => s.dispatch)
    const state = usePuck(s => s.appState)
    const [previewing, setPreviewing] = useState<Template | null>(null)
    const [confirming, setConfirming] = useState<Template | null>(null)
    const [applying, setApplying] = useState(false)
    const { trigger: triggerEditorTour } = useWebBuilderEditorTour()

    const apply = async (template: Template) => {
        setApplying(true)
        try {
            // Save whatever the stylist currently has as a draft first, so
            // switching templates is never a destructive, unrecoverable action.
            if (businessId) {
                await saveDraftData(JSON.stringify(state.data), businessId)
            }
            dispatch({ type: 'setData', data: () => template.data })
            onClose()
            triggerEditorTour()
        } finally {
            setApplying(false)
            setConfirming(null)
        }
    }

    if (previewing) {
        return (
            <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: '1 1 0', minHeight: 0 }}>
                    <button
                        type="button"
                        onClick={() => setPreviewing(null)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6F6863', background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}
                    >
                        <ArrowLeft size={14} /> Back to templates
                    </button>
                    <div style={{
                        flex: '1 1 0', minHeight: 0, borderRadius: 12, overflow: 'hidden',
                        border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2',
                    }}>
                        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                            <div style={{ width: 1400, transform: 'scale(0.5)', transformOrigin: 'top left', pointerEvents: 'none' }}>
                                <Render config={config} data={previewing.data} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div>
                            <p style={{ fontFamily: SERIF, fontSize: 16, color: '#1A1818' }}>{previewing.name}</p>
                            <p style={{ fontSize: 12, color: '#6F6863' }}>{previewing.description}</p>
                        </div>
                        <Button
                            onClick={() => setConfirming(previewing)}
                            style={{ backgroundColor: '#FC6161', color: '#fff', borderRadius: 9999 }}
                        >
                            Use this template
                        </Button>
                    </div>
                </div>

                <AlertDialog open={!!confirming} onOpenChange={open => { if (!open) setConfirming(null) }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apply {confirming?.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will replace your current page. Your current design will be saved as a draft first, so nothing is lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={applying}
                                onClick={() => { if (confirming) apply(confirming) }}
                                style={{ backgroundColor: '#FC6161' }}
                            >
                                Apply template
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    }

    return <TemplateCardList onSelect={setPreviewing} />
}

// ─── TemplatePicker — the button + dialog ─────────────────────────────────────

export const TemplatePicker = ({ businessId, open: openProp, onOpenChange }: {
    businessId?: string
    open?: boolean
    onOpenChange?: (open: boolean) => void
} = {}) => {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = openProp ?? internalOpen
    const setOpen = onOpenChange ?? setInternalOpen

    return (
        <>
            <button
                type="button"
                data-tour="editor-templates"
                onClick={() => setOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 9999, fontSize: 13,
                    border: '1px solid #E8E2D6',
                    color: '#6F6863',
                    backgroundColor: 'transparent',
                    cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s, background-color 0.15s',
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#C9B89A'
                    el.style.color = '#1A1818'
                    el.style.backgroundColor = '#FAF7F2'
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#E8E2D6'
                    el.style.color = '#6F6863'
                    el.style.backgroundColor = 'transparent'
                }}
            >
                <LayoutTemplate size={13} />
                <span className="aa-header-templates-label">Templates</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent
                    style={{ width: 760, maxWidth: '92vw', height: '82vh', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                    <DialogHeader style={{ flexShrink: 0 }}>
                        <DialogTitle style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#1A1818' }}>
                            Choose a Template
                        </DialogTitle>
                        <p style={{ fontSize: 13, color: '#6F6863', marginTop: 4 }}>
                            Browse a template, preview it, then apply it — your current page is saved as a draft first.
                        </p>
                    </DialogHeader>
                    <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <InnerPicker businessId={businessId} onClose={() => setOpen(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
