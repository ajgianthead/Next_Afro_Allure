'use client'

// The website builder. Puck holds the page and the undo history and draws the
// canvas; everything around it (section list, the three tabs, theme, top bar)
// is ours and drives Puck through dispatch.

import '@puckeditor/core/puck.css'
import './editor.css'
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Puck, type Data } from '@puckeditor/core'
import { ArrowLeft, Check, ExternalLink, Layers, LayoutTemplate, Loader2, Monitor, Palette, Pause, Play, Redo2, SlidersHorizontal, Smartphone, Tablet, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpgrade } from '@/features/billing/components/UpgradeDialog'
import type { SiteData, SiteInfo } from '@/features/siteBuilder/siteData'
import { buildConfig, type BuilderData } from '../config'
import type { PlanType } from '../gating'
import { presetPage, templateToBuilder } from '../presets'
import type { BuilderMetadata } from '../render/context'
import { publishBuilderPageAction, saveBuilderDraftAction } from '../server/actions'
import { EditorProvider, usePuck } from './EditorContext'
import { setLivePreview } from './preview'
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
/** Unsaved edits are also kept in this browser until the server confirms them, so a reload or crash mid-save loses nothing. */
const backupKey = (businessId: string) => `aa-builder-unsaved:${businessId}`
const BACKUP_MAX_AGE = 24 * 60 * 60 * 1000
function writeBackup(businessId: string, data: Data) {
    try { localStorage.setItem(backupKey(businessId), JSON.stringify({ at: Date.now(), data })) } catch { /* storage full or blocked */ }
}
function clearBackup(businessId: string) {
    try { localStorage.removeItem(backupKey(businessId)) } catch { /* blocked */ }
}
function readBackup(businessId: string): Data | null {
    try {
        const raw = localStorage.getItem(backupKey(businessId))
        if (!raw) return null
        const b = JSON.parse(raw) as { at: number; data: Data }
        return Date.now() - b.at < BACKUP_MAX_AGE && b.data?.content ? b.data : null
    } catch { return null }
}

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
    // Every change bumps `version`; `savedVersion` is the newest one the server has.
    const version = useRef(0)
    const savedVersion = useRef(0)
    const inflight = useRef<Promise<boolean> | null>(null)
    const dirty = () => version.current !== savedVersion.current

    const schedule = useCallback((ms: number) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => { void flushRef.current() }, ms)
    }, [])

    /** Saves the latest edits. One save at a time; edits made during a save are saved right after it. */
    const flush = useCallback(async (): Promise<boolean> => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
        if (inflight.current) await inflight.current
        if (!dirty()) return true
        const v = version.current
        const data = latest.current
        setSave({ kind: 'saving' })
        const run = (async () => {
            try {
                const r = await saveBuilderDraftAction(data)
                if (!r.ok) {
                    setSave({ kind: 'error', message: r.error })
                    return false
                }
                savedVersion.current = Math.max(savedVersion.current, v)
                if (dirty()) { setSave({ kind: 'dirty' }); schedule(AUTOSAVE_MS) } else { setSave({ kind: 'saved', at: new Date() }); clearBackup(businessId) }
                return true
            } catch {
                // Network down or the request failed: say so (never a stuck "Saving…") and try again soon.
                setSave({ kind: 'error', message: 'Couldn’t save. Check your connection; trying again…' })
                schedule(5000)
                return false
            }
        })()
        inflight.current = run
        try { return await run } finally { if (inflight.current === run) inflight.current = null }
    }, [schedule]) // eslint-disable-line react-hooks/exhaustive-deps
    const flushRef = useRef(flush)
    flushRef.current = flush

    const onChange = useCallback((data: Data) => {
        if (JSON.stringify(data) === JSON.stringify(latest.current)) return
        latest.current = data
        version.current++
        writeBackup(businessId, data)
        setSave({ kind: 'dirty' })
        schedule(AUTOSAVE_MS)
    }, [schedule, businessId])

    // Leaving: switching tabs or apps saves now; closing or reloading sends the last edits with
    // sendBeacon (a normal request is cancelled when the page unloads); leaving the editor inside
    // the app (back button, browser back) saves on the way out.
    useEffect(() => {
        const onHide = () => { if (document.visibilityState === 'hidden' && dirty()) void flushRef.current() }
        const onUnload = (e: BeforeUnloadEvent) => {
            if (!dirty()) return
            const sent = navigator.sendBeacon?.('/api/builder/draft', new Blob([JSON.stringify(latest.current)], { type: 'application/json' }))
            if (!sent) e.preventDefault()
        }
        document.addEventListener('visibilitychange', onHide)
        window.addEventListener('beforeunload', onUnload)
        return () => {
            document.removeEventListener('visibilitychange', onHide)
            window.removeEventListener('beforeunload', onUnload)
            if (timer.current) clearTimeout(timer.current)
            if (dirty()) void saveBuilderDraftAction(latest.current).catch(() => {})
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const publish = useCallback(async () => {
        if (timer.current) { clearTimeout(timer.current); timer.current = null }
        if (inflight.current) await inflight.current
        const v = version.current
        setSave({ kind: 'saving' })
        const r = await publishBuilderPageAction(latest.current).catch(() => ({ ok: false as const, error: 'Couldn’t publish. Check your connection and try again.' }))
        if (!r.ok) {
            setSave({ kind: 'error', message: r.error })
            toast.error(r.error)
            return
        }
        // Publishing saves the draft too.
        savedVersion.current = Math.max(savedVersion.current, v)
        setSave(dirty() ? { kind: 'dirty' } : { kind: 'saved', at: new Date() })
        if (dirty()) schedule(AUTOSAVE_MS); else clearBackup(businessId)
        setPublished(r.data.publishedAt)
        toast.success('Your site is live.')
    }, [schedule]) // eslint-disable-line react-hooks/exhaustive-deps

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
                    {/* Anything that suspends (a font loading, a lazy chunk) waits here, inside the editor,
                        instead of swapping the whole editor for the dashboard's loading screen. */}
                    <RestoreBackup businessId={businessId} initial={initialData as Data} />
                    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--b-muted)' }} /></div>}>
                        <EditorLayout save={save} published={published} siteUrl={siteUrl} backHref={backHref} onPublish={publish} onRetry={flush} onFlush={flush} />
                    </Suspense>
                </Puck>
            </div>
        </EditorProvider>
    )
}

function EditorLayout({ save, published, siteUrl, backHref, onPublish, onRetry, onFlush }: {
    save: SaveState
    published: string | null
    siteUrl: string
    backHref: string
    onPublish: () => void
    onRetry: () => void
    onFlush: () => Promise<boolean>
}) {
    const [adding, setAdding] = useState<number | null>(null)
    const [templates, setTemplates] = useState(false)
    // Phones: the canvas fills the screen; sections and settings open as sheets.
    const [sheet, setSheet] = useState<'none' | 'sections' | 'settings'>('none')
    const selected = usePuck(s => s.appState.ui.itemSelector?.index ?? -1)
    const dispatch = usePuck(s => s.dispatch)
    const [live, setLive] = useState(false)
    useEffect(() => { if (selected >= 0 && sheet === 'sections') setSheet('settings') }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps
    // Open at the size that fits: phone on small screens, tablet on narrow ones.
    useEffect(() => {
        const w = window.innerWidth
        const width = w < 640 ? 390 : w < 1100 ? 820 : 1280
        if (width !== 1280) dispatch({ type: 'setUi', ui: ui => ({ viewports: { ...ui.viewports, current: { width, height: 'auto' } } }) })
    }, [dispatch])
    useEffect(() => { setLivePreview(live) }, [live])
    const openSiteLook = () => {
        dispatch({ type: 'setUi', ui: { itemSelector: null } })
        if (window.matchMedia('(max-width: 1023px)').matches) setSheet('settings')
    }

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden">
            <WebsiteBuilderTour />
            <TopBar save={save} published={published} siteUrl={siteUrl} backHref={backHref} onPublish={onPublish} onRetry={onRetry} onTemplates={() => setTemplates(true)} onFlush={onFlush}
                onSiteLook={openSiteLook} live={live} onToggleLive={() => setLive(v => !v)} />
            <div className="relative flex min-h-0 flex-1">
                <aside className="hidden w-[248px] flex-none flex-col lg:flex" style={{ background: '#fff', borderRight: '1px solid var(--b-line)' }}>
                    <Outline onAdd={setAdding} />
                </aside>
                <main data-tour="builder-canvas" className="relative min-w-0 flex-1 overflow-hidden" style={{ background: '#EFEAE2' }}>
                    <PreviewFrame />
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

/**
 * Opening the editor: if this browser holds edits newer than the saved draft
 * (the page closed or reloaded before the save landed), put them back; the
 * change then saves as usual.
 */
function RestoreBackup({ businessId, initial }: { businessId: string; initial: Data }) {
    const dispatch = usePuck(s => s.dispatch)
    useEffect(() => {
        const backup = readBackup(businessId)
        if (!backup) return
        if (JSON.stringify(backup) === JSON.stringify(initial)) { clearBackup(businessId); return }
        dispatch({ type: 'setData', data: backup as any, recordHistory: true })
        toast('Restored changes that hadn’t finished saving.')
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    return null
}

/**
 * The canvas at the chosen device width (Puck applies it only in its own
 * canvas, which this custom layout doesn't use). Wider than the space it has,
 * it scales down to fit, like Puck's canvas; sections use container queries,
 * so each one switches to its phone or tablet design inside the frame.
 */
function PreviewFrame() {
    const width = usePuck(s => s.appState.ui.viewports.current.width)
    const area = useRef<HTMLDivElement>(null)
    const [box, setBox] = useState({ w: 0, h: 0 })
    useLayoutEffect(() => {
        const el = area.current
        if (!el) return
        const update = () => setBox({ w: el.clientWidth, h: el.clientHeight })
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    const phone = width === 390
    const gap = phone ? 24 : 16
    const target = typeof width === 'number' ? width : Math.max(box.w - gap * 2, 320)
    const room = Math.max(box.w - gap * 2, 1)
    const scale = box.w ? Math.min(1, room / target) : 1
    const height = Math.max((box.h - gap * 2) / scale, 200)
    return (
        <div ref={area} className="absolute inset-0 overflow-hidden">
            {box.w > 0 && (
                <div
                    className="absolute left-1/2 overflow-hidden bg-white"
                    style={{
                        top: gap,
                        width: target,
                        height,
                        transform: `translateX(-50%) scale(${scale})`,
                        transformOrigin: 'top center',
                        transition: 'width 250ms ease-out, transform 250ms ease-out',
                        borderRadius: phone ? 28 : 6,
                        boxShadow: phone ? '0 0 0 8px #1a1818, 0 20px 50px -20px rgba(0,0,0,.45)' : '0 8px 30px -14px rgba(0,0,0,.3)',
                    }}
                >
                    <Puck.Preview />
                </div>
            )}
        </div>
    )
}

function TopBar({ save, published, siteUrl, backHref, onPublish, onRetry, onTemplates, onFlush, onSiteLook, live, onToggleLive }: {
    save: SaveState
    published: string | null
    siteUrl: string
    backHref: string
    onPublish: () => void
    onRetry: () => void
    onTemplates: () => void
    onFlush: () => Promise<boolean>
    onSiteLook: () => void
    live: boolean
    onToggleLive: () => void
}) {
    const dispatch = usePuck(s => s.dispatch)
    const router = useRouter()
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
            <Link href={backHref} className="bld-icon-btn" aria-label="Back to the dashboard" onClick={async e => {
                // Unsaved edits: save first; if that fails, ask before leaving.
                if (save.kind === 'saved') return
                e.preventDefault()
                const ok = await onFlush()
                if (ok || window.confirm('Your latest changes didn’t save. Leave anyway?')) router.push(backHref)
            }}><ArrowLeft size={18} /></Link>
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
                <button type="button" className="bld-btn !px-2.5 sm:!px-3" onClick={onToggleLive} aria-pressed={live} title="Play the animations as visitors see them while you scroll the preview"
                    style={live ? { background: 'var(--b-ink)', color: '#fff', borderColor: 'var(--b-ink)' } : undefined}>
                    {live ? <Pause size={15} /> : <Play size={15} />}<span className="hidden xl:inline">{live ? 'Stop animations' : 'Play animations'}</span>
                </button>
                <button type="button" className="bld-btn !px-2.5 sm:!px-3" onClick={onSiteLook} title="Name, logo, colors and fonts"><Palette size={15} /><span className="hidden xl:inline">Site look</span></button>
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
