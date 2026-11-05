'use client'

// The website builder. Puck holds the page and the undo history and draws the
// canvas; everything around it (section list, the three tabs, theme, top bar)
// is ours and drives Puck through dispatch.

import '@puckeditor/core/puck.css'
import './editor.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Puck, type Data } from '@puckeditor/core'
import { ArrowLeft, Check, ExternalLink, Layers, LayoutTemplate, Loader2, Monitor, Redo2, SlidersHorizontal, Smartphone, Tablet, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpgrade } from '@/features/billing/components/UpgradeDialog'
import type { SiteData, SiteInfo } from '@/features/siteBuilder/siteData'
import { buildConfig, type BuilderData } from '../config'
import type { PlanType } from '../gating'
import { presetPage, templateToBuilder } from '../presets'
import type { BuilderMetadata } from '../render/context'
import { publishBuilderPageAction, saveBuilderDraftAction } from '../server/actions'
import { EditorProvider, usePuck } from './EditorContext'
import { Inspector } from './Inspector'
import { Outline } from './Outline'
import { SectionPicker } from './SectionPicker'
import { TemplatesDialog } from './TemplatesDialog'
import { WebsiteBuilderTour } from '@/features/tour/tours/WebsiteBuilderTour'

const VIEWPORTS = [
    { width: 390, height: 'auto' as const, label: 'Phone', icon: Smartphone },
    { width: 820, height: 'auto' as const, label: 'Tablet', icon: Tablet },
    { width: 1280, height: 'auto' as const, label: 'Computer', icon: Monitor },
]
const AUTOSAVE_MS = 1500

type SaveState = { kind: 'saved'; at: Date | null } | { kind: 'dirty' } | { kind: 'saving' } | { kind: 'error'; message: string }

export function BuilderEditor({ page, site, metadata, info, businessId, plan, siteUrl, backHref = '/dashboard', publishedAt }: {
    /** The saved page, or null to start from the template site in `site` (or the Quickstart starter page). */
    page: unknown
    site: SiteData | null
    metadata: BuilderMetadata
    info: SiteInfo
    businessId: string
    plan: PlanType
    /** The live site, for "View site". */
    siteUrl: string
    backHref?: string
    publishedAt: string | null
}) {
    const config = useMemo(() => buildConfig(), [])
    const [initialData] = useState<BuilderData>(() => (page as BuilderData | null) ?? (site ? templateToBuilder(site, info) : presetPage('quickstart', info)))
    const { openUpgrade } = useUpgrade()
    const [save, setSave] = useState<SaveState>({ kind: 'saved', at: null })
    const [published, setPublished] = useState<string | null>(publishedAt)
    const latest = useRef<Data>(initialData as Data)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const saving = useRef<Promise<unknown> | null>(null)

    const flush = useCallback(async () => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
        setSave({ kind: 'saving' })
        const run = saveBuilderDraftAction(latest.current)
        saving.current = run
        const r = await run
        if (saving.current === run) saving.current = null
        setSave(r.ok ? { kind: 'saved', at: new Date() } : { kind: 'error', message: r.error })
        return r.ok
    }, [])

    const onChange = useCallback((data: Data) => {
        if (JSON.stringify(data) === JSON.stringify(latest.current)) return
        latest.current = data
        setSave({ kind: 'dirty' })
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(flush, AUTOSAVE_MS)
    }, [flush])

    // Unsaved edits: save on the way out, and warn if the save can't finish.
    useEffect(() => {
        const onLeave = (e: BeforeUnloadEvent) => {
            if (!timer.current && !saving.current) return
            void flush()
            e.preventDefault()
        }
        window.addEventListener('beforeunload', onLeave)
        return () => window.removeEventListener('beforeunload', onLeave)
    }, [flush])

    const publish = useCallback(async () => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
        setSave({ kind: 'saving' })
        const r = await publishBuilderPageAction(latest.current)
        if (!r.ok) {
            setSave({ kind: 'error', message: r.error })
            toast.error(r.error)
            return
        }
        setSave({ kind: 'saved', at: new Date() })
        setPublished(r.data.publishedAt)
        toast.success('Your site is live.')
    }, [])

    const askUpgrade = useCallback(() => openUpgrade(), [openUpgrade])

    return (
        <EditorProvider value={{ info, site, businessId, plan, askUpgrade }}>
            <div className="bld fixed inset-0 z-40 overflow-hidden">
                <Puck
                    config={config}
                    data={initialData as Data}
                    metadata={metadata as unknown as Record<string, unknown>}
                    onChange={onChange}
                    viewports={VIEWPORTS.map(({ width, height, label }) => ({ width, height, label }))}
                    iframe={{ enabled: true, waitForStyles: true }}
                    ui={{ viewports: { current: { width: 1280, height: 'auto' }, controlsVisible: false, options: [] } }}
                >
                    <EditorLayout save={save} published={published} siteUrl={siteUrl} backHref={backHref} onPublish={publish} onRetry={flush} />
                </Puck>
            </div>
        </EditorProvider>
    )
}

function EditorLayout({ save, published, siteUrl, backHref, onPublish, onRetry }: {
    save: SaveState
    published: string | null
    siteUrl: string
    backHref: string
    onPublish: () => void
    onRetry: () => void
}) {
    const [adding, setAdding] = useState<number | null>(null)
    const [templates, setTemplates] = useState(false)
    // Phones: the canvas fills the screen; sections and settings open as sheets.
    const [sheet, setSheet] = useState<'none' | 'sections' | 'settings'>('none')
    const selected = usePuck(s => s.appState.ui.itemSelector?.index ?? -1)
    useEffect(() => { if (selected >= 0 && sheet === 'sections') setSheet('settings') }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden">
            <WebsiteBuilderTour />
            <TopBar save={save} published={published} siteUrl={siteUrl} backHref={backHref} onPublish={onPublish} onRetry={onRetry} onTemplates={() => setTemplates(true)} />
            <div className="relative flex min-h-0 flex-1">
                <aside className="hidden w-[248px] flex-none flex-col lg:flex" style={{ background: '#fff', borderRight: '1px solid var(--b-line)' }}>
                    <Outline onAdd={setAdding} />
                </aside>
                <main data-tour="builder-canvas" className="relative min-w-0 flex-1 overflow-hidden" style={{ background: '#EFEAE2' }}>
                    <Puck.Preview />
                </main>
                <aside className="hidden w-[340px] flex-none flex-col lg:flex" style={{ background: 'var(--b-bg)', borderLeft: '1px solid var(--b-line)' }}>
                    <Inspector />
                </aside>

                {sheet !== 'none' && (
                    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 lg:hidden" onClick={() => setSheet('none')}>
                        <div className="flex h-[72dvh] flex-col overflow-hidden rounded-t-2xl" style={{ background: sheet === 'sections' ? '#fff' : 'var(--b-bg)' }} onClick={e => e.stopPropagation()}>
                            {sheet === 'sections'
                                ? <Outline onAdd={at => { setSheet('none'); setAdding(at) }} onPicked={() => setSheet('settings')} />
                                : <Inspector onClose={() => setSheet('none')} />}
                        </div>
                    </div>
                )}
            </div>
            <nav className="flex flex-none gap-2 p-2 lg:hidden" style={{ background: '#fff', borderTop: '1px solid var(--b-line)' }}>
                <button type="button" className="bld-btn flex-1" onClick={() => setSheet('sections')}><Layers size={15} /> Sections</button>
                <button type="button" className="bld-btn flex-1" data-dark="" onClick={() => setSheet('settings')}><SlidersHorizontal size={15} /> {selected >= 0 ? 'Edit section' : 'Site look'}</button>
            </nav>
            {adding !== null && <SectionPicker at={adding} onClose={() => setAdding(null)} />}
            {templates && <TemplatesDialog onClose={() => setTemplates(false)} />}
        </div>
    )
}

function TopBar({ save, published, siteUrl, backHref, onPublish, onRetry, onTemplates }: {
    save: SaveState
    published: string | null
    siteUrl: string
    backHref: string
    onPublish: () => void
    onRetry: () => void
    onTemplates: () => void
}) {
    const dispatch = usePuck(s => s.dispatch)
    const width = usePuck(s => s.appState.ui.viewports.current.width)
    const history = usePuck(s => s.history)
    const busy = save.kind === 'saving'

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement
            if (t.closest('input, textarea, select, [contenteditable]')) return
            if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return
            e.preventDefault()
            if (e.shiftKey) history.forward(); else history.back()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [history])

    return (
        <header className="flex h-14 flex-none items-center gap-2 px-2 sm:px-3" style={{ background: '#fff', borderBottom: '1px solid var(--b-line)' }}>
            <Link href={backHref} className="bld-icon-btn" aria-label="Back to the dashboard"><ArrowLeft size={18} /></Link>
            <div className="hidden min-w-0 sm:block">
                <p className="text-[14px] font-semibold leading-tight">Website</p>
                <SaveStatus save={save} onRetry={onRetry} />
            </div>

            <div className="mx-auto hidden items-center gap-0.5 rounded-lg p-0.5 md:flex" style={{ background: '#F3EFE8' }} role="group" aria-label="Preview size">
                {VIEWPORTS.map(v => {
                    const Icon = v.icon
                    const active = width === v.width
                    return (
                        <button key={v.width} type="button" title={v.label} aria-label={v.label} aria-pressed={active}
                            onClick={() => dispatch({ type: 'setUi', ui: ui => ({ viewports: { ...ui.viewports, current: { width: v.width, height: 'auto' } } }) })}
                            className="flex h-8 w-9 items-center justify-center rounded-md"
                            style={{ background: active ? '#fff' : 'transparent', color: active ? 'var(--b-ink)' : 'var(--b-muted)', boxShadow: active ? '0 1px 2px rgba(0,0,0,.08)' : undefined }}>
                            <Icon size={16} />
                        </button>
                    )
                })}
            </div>

            <div className="ml-auto flex items-center gap-1 md:ml-0">
                <button type="button" data-tour="builder-templates" className="bld-btn !px-2.5 sm:!px-3" onClick={onTemplates}><LayoutTemplate size={15} /><span className="hidden sm:inline">Templates</span></button>
                <button type="button" className="bld-icon-btn" aria-label="Undo" disabled={!history.hasPast} onClick={() => history.back()}><Undo2 size={17} /></button>
                <button type="button" className="bld-icon-btn" aria-label="Redo" disabled={!history.hasFuture} onClick={() => history.forward()}><Redo2 size={17} /></button>
                {published && (
                    <a href={siteUrl} target="_blank" rel="noreferrer" className="bld-btn hidden sm:inline-flex"><ExternalLink size={14} /> View site</a>
                )}
                <button type="button" data-tour="builder-publish" className="bld-btn" data-primary="" onClick={onPublish} disabled={busy}>
                    {busy ? <Loader2 size={14} className="animate-spin" /> : null}
                    {published ? 'Publish changes' : 'Publish'}
                </button>
            </div>
        </header>
    )
}

function SaveStatus({ save, onRetry }: { save: SaveState; onRetry: () => void }) {
    const text = save.kind === 'saving' ? 'Saving…'
        : save.kind === 'dirty' ? 'Unsaved changes'
            : save.kind === 'error' ? save.message
                : save.at ? 'Draft saved' : 'Drafts save as you go'
    return (
        <p className="flex items-center gap-1 truncate text-[11.5px]" style={{ color: save.kind === 'error' ? '#B42318' : 'var(--b-muted)' }} aria-live="polite">
            {save.kind === 'saved' && save.at && <Check size={11} />}
            {text}
            {save.kind === 'error' && <button type="button" className="ml-1 font-semibold underline" onClick={onRetry}>Retry</button>}
        </p>
    )
}
