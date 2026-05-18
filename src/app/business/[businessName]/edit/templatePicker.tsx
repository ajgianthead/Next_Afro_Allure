'use client'

import { useState } from 'react'
import { createUsePuck } from '@puckeditor/core'
import { templates, Template } from '@/features/editor/templates'
import { LayoutTemplate, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const SERIF = '"Fraunces", "Times New Roman", serif'

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { bg: string; accent: string; headline: string; tag: string }> = {
    luxury: { bg: '#1a1410', accent: '#c9974a', headline: '#f4ede2', tag: 'rgba(201,151,74,0.15)' },
    modern: { bg: '#0f0e0e', accent: '#FC6161', headline: '#ffffff', tag: 'rgba(252,97,97,0.15)' },
    minimal: { bg: '#f4ede2', accent: '#6F6863', headline: '#1A1818', tag: 'rgba(26,20,16,0.08)' },
}

const CATEGORY_LABELS: Record<string, string> = {
    luxury: 'Luxury',
    modern: 'Modern',
    minimal: 'Minimal',
}

// ─── Template card mockup ─────────────────────────────────────────────────────

function TemplateMockup({ category }: { category: string }) {
    const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.minimal
    return (
        <div style={{
            width: '100%', height: 120, borderRadius: 8, overflow: 'hidden',
            backgroundColor: style.bg, position: 'relative',
            display: 'flex', flexDirection: 'column', padding: 12, gap: 6,
        }}>
            {/* Simulated nav bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                <div style={{ width: 32, height: 5, borderRadius: 3, backgroundColor: style.headline }} />
                <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 16, height: 4, borderRadius: 2, backgroundColor: style.headline, opacity: 0.4 }} />
                    ))}
                </div>
            </div>
            {/* Simulated hero text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
                <div style={{ width: '70%', height: 8, borderRadius: 3, backgroundColor: style.headline, opacity: 0.9 }} />
                <div style={{ width: '50%', height: 5, borderRadius: 3, backgroundColor: style.headline, opacity: 0.4 }} />
                <div style={{ width: 40, height: 14, borderRadius: 4, backgroundColor: style.accent, marginTop: 4 }} />
            </div>
            {/* Simulated section */}
            <div style={{ display: 'flex', gap: 5 }}>
                {[1, 0.7, 0.5].map((op, i) => (
                    <div key={i} style={{ flex: 1, height: 20, borderRadius: 4, backgroundColor: style.headline, opacity: op * 0.25 }} />
                ))}
            </div>
        </div>
    )
}

// ─── Single template card ─────────────────────────────────────────────────────

function TemplateCard({ template, onSelect }: { template: Template; onSelect: (t: Template) => void }) {
    const [hovered, setHovered] = useState(false)
    const style = CATEGORY_STYLE[template.category] ?? CATEGORY_STYLE.minimal

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                border: '1.5px solid #E8E2D6',
                borderRadius: 12, overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                boxShadow: hovered ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
                borderColor: hovered ? '#C9B89A' : '#E8E2D6',
                cursor: 'pointer',
            }}
        >
            <div style={{ position: 'relative' }}>
                <TemplateMockup category={template.category} />
                {/* Hover overlay with "Use Template" */}
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(15,14,14,0.55)',
                    opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
                }}>
                    <button
                        type="button"
                        onClick={() => onSelect(template)}
                        style={{
                            backgroundColor: '#FC6161', color: '#FFFFFF',
                            fontSize: 12, fontWeight: 600,
                            padding: '6px 14px', borderRadius: 9999,
                        }}
                    >
                        Use Template
                    </button>
                </div>
            </div>
            <div style={{ padding: '10px 12px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 14, color: '#1A1818', fontWeight: 400 }}>
                        {template.name}
                    </p>
                    <span style={{
                        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 9999,
                        backgroundColor: CATEGORY_STYLE[template.category]?.tag ?? 'rgba(0,0,0,0.06)',
                        color: '#6F6863',
                    }}>
                        {CATEGORY_LABELS[template.category] ?? template.category}
                    </span>
                </div>
                <p style={{ fontSize: 11, color: '#6F6863', lineHeight: 1.45 }}>
                    {template.description}
                </p>
            </div>
        </div>
    )
}

// ─── TemplateCardList — shared between editor + dashboard ─────────────────────

export function TemplateCardList({ onSelect }: { onSelect: (t: Template) => void }) {
    const [search, setSearch] = useState('')
    const query = search.toLowerCase()
    const visible = query
        ? templates.filter(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query) || t.category.includes(query))
        : templates

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
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
            {/* Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 16, overflowY: 'auto', flex: 1,
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

function InnerPicker({ onClose }: { onClose: () => void }) {
    const usePuck = createUsePuck()
    const dispatch = usePuck(s => s.dispatch)
    const [pending, setPending] = useState<Template | null>(null)

    const apply = (template: Template) => {
        dispatch({ type: 'setData', data: () => template.data })
        onClose()
    }

    return (
        <>
            <TemplateCardList onSelect={t => setPending(t)} />

            <AlertDialog open={!!pending} onOpenChange={open => { if (!open) setPending(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Replace current content?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will replace everything on your page with the{' '}
                            <strong>{pending?.name}</strong> template. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPending(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => { if (pending) apply(pending) }}
                            style={{ backgroundColor: '#FC6161' }}
                        >
                            Replace
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

// ─── TemplatePicker — the button + sheet ─────────────────────────────────────

export const TemplatePicker = () => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 9999, fontSize: 13,
                    border: '1px solid rgba(250,247,242,0.2)',
                    color: 'rgba(250,247,242,0.75)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(250,247,242,0.45)'
                    el.style.color = '#FAF7F2'
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'rgba(250,247,242,0.2)'
                    el.style.color = 'rgba(250,247,242,0.75)'
                }}
            >
                <LayoutTemplate size={13} />
                <span className="aa-header-templates-label">Templates</span>
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" style={{ width: 520, maxWidth: '90vw', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SheetHeader style={{ flexShrink: 0 }}>
                        <SheetTitle style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 400, color: '#1A1818' }}>
                            Choose a Template
                        </SheetTitle>
                        <p style={{ fontSize: 13, color: '#6F6863', marginTop: 4 }}>
                            Starting from a template replaces your current content. This cannot be undone.
                        </p>
                    </SheetHeader>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <InnerPicker onClose={() => setOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
