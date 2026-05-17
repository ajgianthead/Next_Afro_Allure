'use client'

import { createUsePuck, Drawer, Puck, useGetPuck } from "@puckeditor/core";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import type { Config, Data, DefaultComponents, ComponentDataMap, PuckAction } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import "./global.css";
import { GripVertical, LayoutTemplate, Loader2, Redo2, Search, Undo2, X } from "lucide-react";
import { config, drawerItemStyleProps } from "./constants";
import { sendEditorData } from "@/app/utils/editor_actions";
import Settings from "./settings";
import { TemplatePicker } from "./templatePicker";
import { EditorConxtextProps, useEditorContext } from "@/app/utils/context/EditorContext";
import { Components } from "./components/types";
import { Json } from "../../../../../lib/database.types";
import { templates, Template } from "@/features/editor/templates";
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const saveData = async (data: Data<DefaultComponents, any>, businessId: string, currentlyPublished: boolean) => {
    await sendEditorData(JSON.stringify(data), businessId, currentlyPublished)
};

function timeSince(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000)
    if (s < 10) return 'just now'
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m === 1) return '1 min ago'
    if (m < 60) return `${m} min ago`
    return 'a while ago'
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface ServiceType {
    addons: Json[] | null
    availability: string
    business: string
    categories: string[] | null
    created_at: string
    description: string
    id: string
    imagePath: string | null
    length: number
    name: string
    photo_url: string | null
    price: number
    updated_at: string | null
}

interface PageProps {
    businessId: string
    editorData: string
    businessName: string
    services: ServiceType[]
    isPublished: boolean
    preloadedTemplateId?: string | null
}

// ─── EditorHeader (rendered inside Puck context) ─────────────────────────────

interface EditorHeaderProps {
    state: any
    businessId: string
    businessName: string
    isPublished: boolean
    saving: boolean
    setSaving: Dispatch<SetStateAction<boolean>>
    lastSaved: Date | null
    setLastSaved: Dispatch<SetStateAction<Date | null>>
}

function EditorHeader({
    state, businessId, businessName, isPublished,
    saving, setSaving, lastSaved, setLastSaved,
}: EditorHeaderProps) {
    const { editorState } = useEditorContext()
    const getPuck = useGetPuck()
    const store = getPuck()

    const displayName = editorState.businessName || businessName

    const handleSave = async () => {
        setSaving(true)
        try {
            await saveData(state.data, businessId, isPublished)
            setLastSaved(new Date())
        } finally {
            setSaving(false)
        }
    }

    return (
        <header
            className="aa-editor-header"
            style={{
                display: 'flex',
                alignItems: 'center',
                height: 52,
                padding: '0 12px',
                gap: 8,
                backgroundColor: '#0F0E0E',
                borderBottom: '1px solid rgba(250,247,242,0.08)',
                flexShrink: 0,
            }}
        >
            {/* Left — branding */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
                <span className="aa-header-brand" style={{
                    fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'rgba(250,247,242,0.45)', flexShrink: 0,
                }}>
                    AfroAllure
                </span>
                <span className="aa-header-sep" style={{ color: 'rgba(250,247,242,0.15)', fontSize: 14, flexShrink: 0 }}>|</span>
                <span style={{
                    fontFamily: '"Fraunces", "Times New Roman", serif',
                    fontSize: 14, color: '#FAF7F2',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {displayName}
                </span>
            </div>

            {/* Right — templates + save */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 0 }}>
                {lastSaved && (
                    <span className="aa-header-lastsaved" style={{
                        fontFamily: 'monospace', fontSize: 10,
                        color: 'rgba(250,247,242,0.3)',
                        whiteSpace: 'nowrap',
                    }}>
                        {timeSince(lastSaved)}
                    </span>
                )}
                {/* Undo / Redo */}
                <div style={{ display: 'flex', gap: 2 }}>
                    {[
                        { icon: <Undo2 size={14} />, action: () => store.history.back(), enabled: store.history.hasPast, title: 'Undo' },
                        { icon: <Redo2 size={14} />, action: () => store.history.forward(), enabled: store.history.hasFuture, title: 'Redo' },
                    ].map(({ icon, action, enabled, title }) => (
                        <button
                            key={title}
                            type="button"
                            title={title}
                            disabled={!enabled}
                            onClick={action}
                            style={{
                                width: 30, height: 30, borderRadius: 6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'transparent', border: 'none', cursor: enabled ? 'pointer' : 'not-allowed',
                                color: enabled ? 'rgba(250,247,242,0.75)' : 'rgba(250,247,242,0.2)',
                                transition: 'background 0.1s, color 0.1s',
                            }}
                            onMouseEnter={e => { if (enabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(250,247,242,0.08)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
                <TemplatePicker />
                <button
                    type="button"
                    disabled={saving}
                    onClick={handleSave}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        backgroundColor: saving ? '#c44' : '#FC6161',
                        color: '#FFFFFF',
                        borderRadius: 9999, fontSize: 13, fontWeight: 600,
                        padding: '6px 14px', cursor: saving ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.15s',
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span className="aa-header-save-label">{isPublished ? 'Save Changes' : 'Publish Site'}</span>
                    <span className="aa-header-save-short">{isPublished ? 'Save' : 'Publish'}</span>
                </button>
            </div>
        </header>
    )
}

// ─── DrawerContent (component palette with search) ────────────────────────────

function DrawerContent({ children }: { children: React.ReactNode }) {
    const [search, setSearch] = useState('')
    const drawerItems: any = React.Children.toArray(children)

    const query = search.toLowerCase().trim()

    // All component entries from drawerItemStyleProps for search results
    const allEntries = useMemo(() =>
        Array.from(drawerItemStyleProps.entries()).map(([name, meta]) => ({ name, meta })),
        []
    )

    const filteredEntries = query.length > 0
        ? allEntries.filter(({ name, meta }) =>
            name.toLowerCase().includes(query) || meta.label.toLowerCase().includes(query)
        )
        : []

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FAFAFA' }}>
            {/* Search input */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #E8E2D6' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: '1px solid #E8E2D6', borderRadius: 8,
                    padding: '0 8px', height: 32, backgroundColor: '#FFFFFF',
                }}>
                    <Search size={12} style={{ color: '#6F6863', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search components…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: 12,
                            color: '#1A1818', backgroundColor: 'transparent',
                        }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {query.length > 0 ? (
                    /* Search results — flat list using Puck Drawer.Item for drag support */
                    <div>
                        {filteredEntries.length === 0 ? (
                            <p style={{ fontSize: 12, color: '#6F6863', padding: '16px 12px', textAlign: 'center' }}>
                                No components found
                            </p>
                        ) : (
                            <Drawer>
                                {filteredEntries.map(({ name, meta }) => (
                                    <Drawer.Item key={name} name={name}>
                                        {({ children: dragChildren, name: itemName }) => (
                                            <DrawerItemRow label={meta.label} icon={meta.icon}>
                                                {dragChildren}
                                            </DrawerItemRow>
                                        )}
                                    </Drawer.Item>
                                ))}
                            </Drawer>
                        )}
                    </div>
                ) : (
                    /* Normal accordion when not searching */
                    drawerItems[0]?.props?.title === 'layout' ? (
                        <Accordion.Root type="multiple" defaultValue={['layout', 'prebuilt']}>
                            {drawerItems.map((section: any, i: number) => (
                                <Accordion.Item key={i} value={section.props.title}>
                                    <Accordion.Header>
                                        <Accordion.Trigger
                                            className="flex w-full items-center justify-between py-2 px-3 hover:bg-[#FAF7F2] transition-colors [&[data-state=open]>svg]:rotate-180"
                                            style={{ borderBottom: '1px solid #E8E2D6' }}
                                        >
                                            <span style={{
                                                fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
                                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                                color: '#6F6863',
                                            }}>
                                                {section.props.title}
                                            </span>
                                            <ChevronDown size={11} style={{ color: '#C9B89A', transition: 'transform 0.2s' }} />
                                        </Accordion.Trigger>
                                    </Accordion.Header>
                                    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                        <div style={{ padding: '4px 0' }}>
                                            {React.Children.map(section.props.children, (item: any, j: number) => (
                                                <div key={j}>{item}</div>
                                            ))}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            ))}
                        </Accordion.Root>
                    ) : children
                )}
            </div>
        </div>
    )
}

// ─── DrawerItemRow — single palette item ─────────────────────────────────────

function DrawerItemRow({ label, icon, children }: { label: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', cursor: 'grab',
            borderRadius: 8, transition: 'background-color 0.1s',
        }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAF7F2'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
        >
            <GripVertical size={12} style={{ color: '#C9B89A', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#6F6863', flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, color: '#1A1818', userSelect: 'none' }}>{label}</span>
            {children}
        </div>
    )
}

// ─── TemplateBanner ──────────────────────────────────────────────────────────

function TemplateBanner({ template, dispatch, onDismiss }: {
    template: Template
    dispatch: (action: any) => void
    onDismiss: () => void
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 16px',
            backgroundColor: 'rgba(201,151,74,0.14)',
            borderBottom: '1px solid rgba(201,151,74,0.28)',
        }}>
            <LayoutTemplate size={13} style={{ color: '#C9974A', flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: 13, color: '#FAF7F2' }}>
                <span style={{ fontWeight: 600 }}>{template.name}</span> template selected — apply it to load the layout, then customize and save.
            </p>
            <button
                type="button"
                onClick={() => {
                    dispatch({ type: 'setData', data: () => template.data })
                    onDismiss()
                }}
                style={{
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                    padding: '5px 14px', borderRadius: 9999,
                    backgroundColor: '#C9974A', color: '#FFFFFF',
                    cursor: 'pointer', flexShrink: 0,
                }}
            >
                Apply Template
            </button>
            <button
                type="button"
                onClick={onDismiss}
                style={{ color: 'rgba(250,247,242,0.45)', cursor: 'pointer', flexShrink: 0, display: 'flex' }}
            >
                <X size={14} />
            </button>
        </div>
    )
}

// ─── Main Editor ─────────────────────────────────────────────────────────────

function Editor({ businessId, editorData, businessName, services, isPublished, preloadedTemplateId }: PageProps) {
    const { editorState, setEditorState } = useEditorContext()
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [bannerDismissed, setBannerDismissed] = useState(false)

    const preloadedTemplate = preloadedTemplateId
        ? templates.find(t => t.id === preloadedTemplateId) ?? null
        : null

    useEffect(() => {
        setEditorState!(prev => ({ ...prev, businessName, services }))
    }, [businessName, services])

    useEffect(() => {
        if (editorData.length > 0) {
            const data = JSON.parse(editorData)
            data.content.forEach((component: ComponentDataMap<Components>) => {
                if (component.type === 'Section') {
                    setEditorState!(prev => {
                        if (prev.sections.has(component.props.id)) return prev
                        const newSections = new Set(prev.sections)
                        newSections.add(component.props.id)
                        return { ...prev, sections: newSections }
                    })
                }
            })
        }
    }, [])

    // Use useCallback so renderHeader reference is stable between renders where possible
    const renderHeader = useCallback(({ children, dispatch, state }: { children: React.ReactNode; dispatch: (action: PuckAction) => void; state: any }) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <EditorHeader
                state={state}
                businessId={businessId}
                businessName={businessName}
                isPublished={isPublished}
                saving={saving}
                setSaving={setSaving}
                lastSaved={lastSaved}
                setLastSaved={setLastSaved}
            />
            {preloadedTemplate && !bannerDismissed && (
                <TemplateBanner
                    template={preloadedTemplate}
                    dispatch={dispatch}
                    onDismiss={() => setBannerDismissed(true)}
                />
            )}
        </div>
    ), [businessId, businessName, isPublished, saving, lastSaved, preloadedTemplate, bannerDismissed])



    return (
        <Puck
            config={config}
            data={editorData.length > 0 ? JSON.parse(editorData) : undefined}
            renderHeader={renderHeader}
            onAction={(action, state) => {
                if (action.type === 'insert') {
                    const inserted = state.data.content.filter(c => c.type === 'Section').map(c => c.props.id)
                    if (inserted.length) {
                        setEditorState!(prev => {
                            const next = new Set(prev.sections)
                            inserted.forEach((id: string) => next.add(id))
                            return { ...prev, sections: next }
                        })
                    }
                }
                if (action.type === 'remove') {
                    const remaining = new Set(
                        state.data.content.filter(c => c.type === 'Section').map(c => c.props.id)
                    )
                    setEditorState!(prev => ({ ...prev, sections: remaining }))
                }
            }}
            onPublish={async (data) => {
                await saveData(data, businessId, isPublished)
                setLastSaved(new Date())
            }}
            overrides={{
                drawer({ children }) {
                    return <DrawerContent>{children}</DrawerContent>
                },
                drawerItem: ({ name }) => {
                    const meta = drawerItemStyleProps.get(name)
                    return (
                        <DrawerItemRow label={meta?.label ?? name} icon={meta?.icon} />
                    )
                },
                fields: ({ children, isLoading, itemSelector }) => {
                    const usePuck = createUsePuck();
                    const selectedItem = usePuck((s) => s.selectedItem)
                    if (isLoading) return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80, color: '#6F6863', fontSize: 12 }}>
                            Loading…
                        </div>
                    )
                    const fields = React.Children.toArray(children)
                    return <Settings fields={fields} componentName={selectedItem?.type!} />
                }
            }}
        />
    )
}

export default Editor;
