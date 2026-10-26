'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CalendarCheck, Check, Copy, ExternalLink, Eye, Image as ImageIcon, LayoutTemplate, Loader2, Lock, Monitor, Palette, PencilLine, PencilRuler, Smartphone, Type } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PlanGateCard, type GatableBusinessData } from '@/components/dashboard/PlanGate'
import { BRAND, INPUT_CLASS, SERIF, inputStyle } from '@/features/welcomeSetup/components/shared'
import { WebBuilderManageTour } from '@/features/tour/tours/WebBuilderManageTour'
import { WebBuilderTour } from '@/features/tour/tours/WebBuilderTour'
import { bookingUrl, bookingUrlDisplayParts } from '@/lib/bookingUrl'
import { validateSlug } from '@/lib/businessSlug'
import type { PlanType } from '@/lib/beta'
import { isURLNameAvailable, updateBusinessURL } from '@/app/dashboard/(other)/booking-site/actions'
import { MAX_GALLERY, type SiteContent, type SiteData, type SiteInfo } from '../siteData'
import { templateMeta, type TemplateId } from '../themes'
import { customBuilderLinkAction, deleteSiteMediaAction, importSectionContentAction, saveTemplateSiteAction, setSitePublishedAction } from '../server/actions'
import { AboutPanel } from './AboutPanel'
import { BookingThemePanel } from './BookingThemePanel'
import type { BookingTheme } from '@/features/automatedBooking/types/theme'
import { ColorsFontPanel } from './ColorsFontPanel'
import { MediaPanel, useSiteUploads } from './MediaPanel'
import { SitePreview } from './SitePreview'
import { TemplatePicker } from './TemplatePicker'

type Tab = 'template' | 'look' | 'media' | 'about'
type Section = 'website' | 'booking'
/** What the business has today: nothing, a template site, or an older Section Editor / Custom Builder site. */
export type SiteMode = 'new' | 'template' | 'sections' | 'custom'

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
    { id: 'template', label: 'Template', icon: LayoutTemplate },
    { id: 'look', label: 'Colors & font', icon: Palette },
    { id: 'media', label: 'Photos & videos', icon: ImageIcon },
    { id: 'about', label: 'About & contact', icon: Type },
]

export function SiteBuilder({ info, initialSite, mode: initialMode, initialSection = 'website', bookingTheme: initialBookingTheme, businessId, urlName: initialUrlName, published: initialPublished, planType, gatable }: {
    info: SiteInfo
    initialSite: SiteData
    mode: SiteMode
    /** Which part opens first: the website or the booking page (their own sidebar entries). */
    initialSection?: Section
    /** The booking page's saved look (web_editors.theme_data). */
    bookingTheme: BookingTheme | null
    businessId: string
    urlName: string
    published: boolean
    planType: PlanType
    gatable: GatableBusinessData
}) {
    const router = useRouter()
    const [mode, setMode] = useState<SiteMode>(initialMode)
    const [site, setSite] = useState<SiteData>(initialSite)
    const [saved, setSaved] = useState<SiteData>(initialSite)
    const [published, setPublished] = useState(initialPublished)
    const [urlName, setUrlName] = useState(initialUrlName)
    const [tab, setTab] = useState<Tab>(initialMode === 'template' ? 'look' : 'template')
    const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit')
    const [device, setDevice] = useState<'phone' | 'desktop'>('phone')
    const [busy, setBusy] = useState<null | 'save' | 'publish' | 'custom'>(null)
    const [gateOpen, setGateOpen] = useState(false)
    const removedPaths = useRef<Set<string>>(new Set())
    const [bookingTheme, setBookingTheme] = useState<BookingTheme | null>(initialBookingTheme)
    const [section, setSectionState] = useState<Section>(initialSection)
    // Switching keeps unsaved website edits; the URL follows so the sidebar highlights the right entry.
    const setSection = (next: Section) => {
        setSectionState(next)
        window.history.replaceState(null, '', next === 'booking' ? '/dashboard/booking-page' : '/dashboard/booking-site')
    }
    // The booking theme is saved on its own; keep the site's flag in step without marking the site unsaved.
    const onBookingSaved = ({ theme, matchesSite }: { theme: BookingTheme; matchesSite: boolean }) => {
        setBookingTheme(theme)
        setSite(prev => ({ ...prev, bookingMatchesSite: matchesSite }))
        setSaved(prev => ({ ...prev, bookingMatchesSite: matchesSite }))
    }

    const dirty = useMemo(() => JSON.stringify(site) !== JSON.stringify(saved), [site, saved])
    const uploads = useSiteUploads(businessId, update => setSite(prev => update(prev)), paths => paths.forEach(p => removedPaths.current.add(p)))
    const uploading = Object.keys(uploads.progress).length > 0
    const patch = (p: Partial<SiteData>) => setSite(prev => ({ ...prev, ...p }))
    const patchContent = (c: Partial<SiteContent>) => setSite(prev => ({ ...prev, content: { ...prev.content, ...c } }))
    const link = bookingUrl(urlName)

    // Warn before leaving with unsaved changes.
    useEffect(() => {
        if (!dirty) return
        const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [dirty])

    // An old Section Editor site: bring its text and photos over once.
    const imported = useRef(false)
    useEffect(() => {
        if (initialMode !== 'sections' || imported.current) return
        imported.current = true
        importSectionContentAction().then(res => {
            if (!res.ok) return
            const { content, images } = res.data
            setSite(prev => ({
                ...prev,
                content: Object.fromEntries(Object.entries(prev.content).map(([k, v]) => [k, v || (content as any)[k] || ''])) as unknown as SiteContent,
                media: {
                    ...prev.media,
                    gallery: prev.media.gallery.length ? prev.media.gallery : images.slice(0, MAX_GALLERY).map(url => ({ url, path: '', kind: 'image' as const })),
                },
            }))
        }).catch(() => { })
    }, [initialMode])

    const save = async (publish = false): Promise<boolean> => {
        const res = await saveTemplateSiteAction(site, { publish })
        if (!res.ok) {
            toast.error(res.error)
            return false
        }
        setSite(res.data)
        setSaved(res.data)
        setMode('template')
        if (publish) setPublished(true)
        // Files taken out of the site are deleted once the change is saved.
        const stale = [...removedPaths.current].filter(p => !JSON.stringify(res.data).includes(p))
        removedPaths.current.clear()
        if (stale.length) deleteSiteMediaAction(stale).catch(() => { })
        router.refresh()
        return true
    }

    const onSave = async () => {
        setBusy('save')
        if (await save()) toast.success(published ? 'Saved. Your site is updated.' : 'Saved')
        setBusy(null)
    }

    const onPublish = async () => {
        setBusy('publish')
        if (await save(true)) toast.success('Your site is live!')
        setBusy(null)
    }

    const onUnpublish = async () => {
        setBusy('publish')
        const res = await setSitePublishedAction(false)
        if (res.ok) {
            setPublished(false)
            toast.success('Your site is hidden. Your booking link still works.')
        } else toast.error(res.error)
        setBusy(null)
    }

    const openCustomBuilder = async () => {
        if (planType !== 'GROWTH') return setGateOpen(true)
        if (dirty && !window.confirm('You have unsaved changes here. Leave without saving?')) return
        setBusy('custom')
        const res = await customBuilderLinkAction(site.templateId)
        if (res.ok) router.push(res.data)
        else {
            toast.error(res.error)
            setBusy(null)
        }
    }

    const pickFirstTemplate = async (id: TemplateId) => {
        setSite(prev => ({ ...prev, templateId: id, scheme: '', fontPairing: '' }))
        setBusy('save')
        const res = await saveTemplateSiteAction({ ...site, templateId: id, scheme: '', fontPairing: '' })
        setBusy(null)
        if (!res.ok) return toast.error(res.error)
        setSite(res.data)
        setSaved(res.data)
        setMode('template')
        setTab('media')
        router.refresh()
    }

    // ── First visit: choose a template ────────────────────────────────────────
    if (mode === 'new') {
        return (
            <div className="min-h-screen px-4 pb-16 pt-6 sm:px-6 sm:pt-10" style={{ backgroundColor: BRAND.cream }}>
                <WebBuilderTour />
                <div className="mx-auto max-w-5xl">
                    <SectionSwitch section={section} onChange={setSection} className="mx-auto mb-8 max-w-sm" />
                    {section === 'booking' ? (
                        <BookingSection link={link}>
                            <BookingThemePanel site={site} canMatchSite={false} initialTheme={bookingTheme} onSaved={onBookingSaved} />
                        </BookingSection>
                    ) : (<>
                    <div className="mx-auto mb-8 max-w-xl text-center">
                        <h1 className="mb-3 text-2xl sm:text-3xl" style={{ fontFamily: SERIF, color: BRAND.ink }}>Pick a look for your website</h1>
                        <p className="text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                            Each template already shows your services, hours, policies and reviews. Choose one, then add your colors, logo and photos.
                        </p>
                    </div>
                    <div data-tour="builder-templates" className="relative">
                        <TemplatePicker info={info} site={site} selected={null} onPick={pickFirstTemplate} previewHeight={340} />
                        {busy && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60">
                                <Loader2 className="animate-spin" color={BRAND.dark} />
                            </div>
                        )}
                    </div>
                    </>)}
                </div>
            </div>
        )
    }

    // ── Builder ───────────────────────────────────────────────────────────────
    const statusPill = (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={published && mode !== 'sections' && mode !== 'custom'
                ? { backgroundColor: 'rgba(34,197,94,.12)', color: '#15803D' }
                : { backgroundColor: BRAND.border, color: BRAND.warm }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: published && mode === 'template' ? '#22C55E' : BRAND.warm }} />
            {mode === 'template' ? (published ? 'Live' : 'Not published') : 'Not saved yet'}
        </span>
    )

    const primaryButton = mode === 'template' && published
        ? (
            <button type="button" onClick={onSave} disabled={!dirty || !!busy || uploading} className="flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}>
                {busy === 'save' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {dirty ? 'Save changes' : 'Saved'}
            </button>
        ) : (
            <button type="button" onClick={onPublish} disabled={!!busy || uploading} className="flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: BRAND.coral, color: '#FFFFFF' }}>
                {busy === 'publish' && <Loader2 size={14} className="animate-spin" />}
                {mode === 'template' ? 'Publish site' : 'Save & publish'}
            </button>
        )

    return (
        <div className="min-h-screen pb-28 lg:pb-12" style={{ backgroundColor: BRAND.cream }}>
            <WebBuilderManageTour />

            <Dialog open={gateOpen} onOpenChange={setGateOpen}>
                <DialogContent className="max-w-sm">
                    <PlanGateCard featureName="Custom Builder" description="Move, add and restyle anything on your page with the drag-and-drop Custom Builder, available on Growth." businessData={gatable} />
                </DialogContent>
            </Dialog>

            {/* Top bar */}
            <header className="sticky top-0 z-20 border-b px-4 py-3 backdrop-blur sm:px-6" style={{ borderColor: BRAND.border, backgroundColor: 'rgba(250,247,242,.92)' }}>
                <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <h1 className="truncate text-lg sm:text-xl" style={{ fontFamily: SERIF, color: BRAND.ink }}>{section === 'booking' ? 'Booking page' : 'Your website'}</h1>
                        {section === 'website' && statusPill}
                    </div>
                    <div data-tour="builder-publish" className="flex shrink-0 items-center gap-2">
                        <a href={link} target="_blank" rel="noreferrer" className="hidden h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium sm:flex" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }}>
                            <ExternalLink size={14} /> Visit
                        </a>
                        {section === 'website' && <div className="hidden lg:block">{primaryButton}</div>}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6">
                <SectionSwitch section={section} onChange={setSection} className="max-w-sm" />
            </div>

            {section === 'booking' && (
                <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6">
                    <BookingSection link={link}>
                        <BookingThemePanel site={saved} canMatchSite={mode === 'template'} initialTheme={bookingTheme} onSaved={onBookingSaved} />
                    </BookingSection>
                </div>
            )}

            {section === 'website' && mode === 'sections' && (
                <Banner>
                    Your site was made with the old Section Editor, which is being retired. We brought over your text and photos; pick a
                    template and save to switch. Your current site stays up until you do.
                </Banner>
            )}
            {section === 'website' && mode === 'custom' && (
                <Banner>
                    Your live site was made in the Custom Builder. Saving here switches your site to this template; your custom page is kept
                    {planType === 'GROWTH' ? ' and you can go back to it anytime.' : ', but editing it needs Growth.'}
                </Banner>
            )}

            {section === 'website' && <main className="mx-auto grid max-w-[1400px] gap-6 px-4 pt-4 sm:px-6 lg:grid-cols-[minmax(360px,440px)_1fr] lg:gap-8 lg:pt-6">
                {/* Settings */}
                <aside className={`${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col gap-4`}>
                    <nav data-tour="builder-tabs" className="flex flex-wrap gap-1.5" aria-label="Website settings">
                        {TABS.map(t => {
                            const Icon = t.icon
                            const active = tab === t.id
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    aria-pressed={active}
                                    className="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium"
                                    style={active ? { backgroundColor: BRAND.dark, color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', color: BRAND.ink, border: `1px solid ${BRAND.border}` }}
                                >
                                    <Icon size={14} /> {t.label}
                                </button>
                            )
                        })}
                    </nav>

                    <div className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
                        {tab === 'template' && (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs" style={{ color: BRAND.warm }}>Your photos and text carry over when you switch.</p>
                                <TemplatePicker info={info} site={site} selected={site.templateId} onPick={id => patch({ templateId: id, scheme: '', fontPairing: '' })} previewHeight={260} />
                            </div>
                        )}
                        {tab === 'look' && <ColorsFontPanel site={site} onChange={patch} />}
                        {tab === 'media' && <MediaPanel site={site} setSite={u => setSite(prev => u(prev))} uploads={uploads} />}
                        {tab === 'about' && <AboutPanel site={site} info={info} onChange={patchContent} />}
                    </div>

                    <BookingLinkCard businessId={businessId} urlName={urlName} onChanged={setUrlName} published={published && mode === 'template'} onUnpublish={onUnpublish} busy={busy === 'publish'} />

                    <div className="flex items-start gap-3 rounded-2xl p-4 sm:p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(201,151,74,.12)' }}>
                            {planType === 'GROWTH' ? <PencilRuler size={18} color={BRAND.gold} /> : <Lock size={18} color={BRAND.gold} />}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold" style={{ color: BRAND.ink }}>Want to change the layout?</p>
                            <p className="mb-3 text-xs leading-relaxed" style={{ color: BRAND.warm }}>
                                The Custom Builder lets you move, add and restyle anything, starting from {templateMeta(site.templateId).name}.
                                {planType === 'GROWTH' ? '' : ' Part of Growth.'}
                            </p>
                            <button type="button" onClick={openCustomBuilder} disabled={busy === 'custom'} className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium disabled:opacity-60" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                                {busy === 'custom' && <Loader2 size={14} className="animate-spin" />}
                                {planType === 'GROWTH' ? 'Open Custom Builder' : 'See Growth'}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Preview */}
                <section className={`${mobileView === 'edit' ? 'hidden lg:block' : 'block'} min-w-0`} aria-label="Preview">
                    <div className="sticky top-24 flex flex-col gap-3">
                        <div className="hidden items-center justify-between lg:flex">
                            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: BRAND.warm }}>Live preview</p>
                            <div className="flex rounded-full p-1" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
                                {([['phone', Smartphone, 'Phone'], ['desktop', Monitor, 'Desktop']] as const).map(([id, Icon, label]) => (
                                    <button key={id} type="button" onClick={() => setDevice(id)} aria-pressed={device === id} className="flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium" style={device === id ? { backgroundColor: BRAND.dark, color: '#FFFFFF' } : { color: BRAND.warm }}>
                                        <Icon size={13} /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="hidden lg:block"><SitePreview info={info} site={site} device={device} /></div>
                        <div className="-mx-4 overflow-hidden border-y lg:hidden" style={{ borderColor: BRAND.border }}>
                            <SitePreview info={info} site={site} device="phone" fullBleed />
                        </div>
                    </div>
                </section>
            </main>}

            {/* Phone: Edit / Preview switch and save, always in reach */}
            {section === 'website' && <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 lg:hidden" style={{ borderColor: BRAND.border, backgroundColor: 'rgba(255,255,255,.96)' }}>
                <div className="flex flex-1 rounded-full p-1" style={{ backgroundColor: BRAND.cream }}>
                    {([['edit', PencilLine, 'Edit'], ['preview', Eye, 'Preview']] as const).map(([id, Icon, label]) => (
                        <button key={id} type="button" onClick={() => { setMobileView(id); window.scrollTo({ top: 0 }) }} aria-pressed={mobileView === id} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-medium" style={mobileView === id ? { backgroundColor: '#FFFFFF', color: BRAND.ink, boxShadow: '0 1px 3px rgba(0,0,0,.08)' } : { color: BRAND.warm }}>
                            <Icon size={14} /> {label}
                        </button>
                    ))}
                </div>
                {primaryButton}
            </div>}
        </div>
    )
}

/** Website | Booking page: the two things a business styles here. */
function SectionSwitch({ section, onChange, className }: { section: Section; onChange: (s: Section) => void; className?: string }) {
    return (
        <div className={`flex rounded-full p-1 ${className ?? ''}`} style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }} role="tablist" aria-label="What to edit">
            {([['website', LayoutTemplate, 'Website'], ['booking', CalendarCheck, 'Booking page']] as const).map(([id, Icon, label]) => (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={section === id}
                    onClick={() => onChange(id)}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold"
                    style={section === id ? { backgroundColor: BRAND.dark, color: '#FFFFFF' } : { color: BRAND.warm }}
                >
                    <Icon size={15} /> {label}
                </button>
            ))}
        </div>
    )
}

function BookingSection({ link, children }: { link: string; children: React.ReactNode }) {
    const bookLink = `${link.replace(/\/$/, '')}/book`
    return (
        <div className="mx-auto max-w-xl rounded-2xl p-4 sm:p-6" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-lg" style={{ fontFamily: SERIF, color: BRAND.ink }}>Your booking page</h2>
                    <p className="truncate text-xs" style={{ color: BRAND.warm }}>{bookLink.replace(/^https?:\/\//, '')}</p>
                </div>
                <a href={bookLink} target="_blank" rel="noreferrer" className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium" style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink }}>
                    <ExternalLink size={13} /> Open
                </a>
            </div>
            {children}
        </div>
    )
}

function Banner({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto mt-4 max-w-[1400px] px-4 sm:px-6">
            <p className="rounded-2xl px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: 'rgba(201,151,74,.12)', color: BRAND.ink, border: '1px solid rgba(201,151,74,.3)' }}>{children}</p>
        </div>
    )
}

function BookingLinkCard({ businessId, urlName, onChanged, published, onUnpublish, busy }: {
    businessId: string
    urlName: string
    onChanged: (urlName: string) => void
    published: boolean
    onUnpublish: () => void
    busy: boolean
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(urlName)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const link = bookingUrl(urlName)
    const parts = bookingUrlDisplayParts()
    const slugError = draft ? validateSlug(draft) : null

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch { /* clipboard blocked; the link is shown to copy by hand */ }
    }

    const saveUrl = async () => {
        setSaving(true)
        setError(null)
        try {
            if (!(await isURLNameAvailable(draft, businessId))) return setError('This URL name is already taken')
            const res = await updateBusinessURL(businessId, draft)
            if (!res.ok) return setError(res.error)
            onChanged(res.urlName)
            setEditing(false)
            toast.success('Link updated. Old links will redirect to the new one.')
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-2xl p-4 sm:p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BRAND.border}` }}>
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold" style={{ color: BRAND.ink }}>Your link</p>
                <button type="button" onClick={() => { setDraft(urlName); setError(null); setEditing(true) }} className="flex h-9 items-center px-2 text-xs font-medium underline" style={{ color: BRAND.warm }}>Change</button>
            </div>
            <div className="flex items-center gap-2 rounded-xl py-1.5 pl-3 pr-1.5" style={{ border: `1px solid ${BRAND.border}`, backgroundColor: BRAND.cream }}>
                <span className="min-w-0 flex-1 truncate text-sm" style={{ color: BRAND.ink }}>{link.replace(/^https?:\/\//, '')}</span>
                <button type="button" onClick={copy} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium" style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}>
                    {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            {published && (
                <button type="button" onClick={onUnpublish} disabled={busy} className="self-start text-xs underline disabled:opacity-50" style={{ color: BRAND.warm }}>
                    Hide my site (booking still works)
                </button>
            )}

            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Change your link</DialogTitle></DialogHeader>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center overflow-hidden rounded-xl" style={inputStyle(!!(error || slugError))}>
                            {parts.prefix && <span className="shrink-0 pl-3 text-sm" style={{ color: BRAND.warm }}>{parts.prefix}</span>}
                            <input value={draft} onChange={e => { setDraft(e.target.value.toLowerCase().replace(/\s+/g, '-')); setError(null) }} className={`${INPUT_CLASS} !rounded-none !border-0 !bg-transparent`} autoCapitalize="none" autoCorrect="off" aria-label="Link name" />
                            {parts.suffix && <span className="shrink-0 pr-3 text-sm" style={{ color: BRAND.warm }}>{parts.suffix}</span>}
                        </div>
                        {(error || slugError) && <p className="text-xs" style={{ color: BRAND.error }}>{error || slugError}</p>}
                        <p className="text-xs" style={{ color: BRAND.warm }}>Links you already shared keep working.</p>
                        <button type="button" onClick={saveUrl} disabled={saving || !!slugError || !draft || draft === urlName} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}>
                            {saving && <Loader2 size={14} className="animate-spin" />} Save link
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
