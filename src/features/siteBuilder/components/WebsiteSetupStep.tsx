'use client'

import { useRef } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { IconWorld } from '@tabler/icons-react'
import { BRAND, StepHeader, inputStyle } from '@/features/welcomeSetup/components/shared'
import { LIMITS, MAX_GALLERY, type SiteData, type SiteInfo } from '../siteData'
import { MediaSlot, IMAGE_ACCEPT, MEDIA_ACCEPT, type useSiteUploads } from './MediaPanel'
import { SchemeSwatches } from './ColorsFontPanel'
import { TemplatePicker } from './TemplatePicker'

type Uploads = ReturnType<typeof useSiteUploads>

/**
 * The welcome modal's website step: a template, a color scheme, a logo and
 * some photos/videos. The first photo or video becomes the cover; the rest
 * fill the gallery.
 */
export function WebsiteSetupStep({ info, site, onChange, uploads, addMedia }: {
    info: SiteInfo | null
    site: SiteData
    onChange: (patch: Partial<SiteData>) => void
    uploads: Uploads
    addMedia: (files: File[]) => void
}) {
    const input = useRef<HTMLInputElement>(null)
    const media = [site.media.cover, ...site.media.gallery].filter(Boolean)
    const room = MAX_GALLERY + 1 - media.length - uploads.galleryUploads.length - (uploads.progress.cover !== undefined ? 1 : 0)
    const busy = uploads.galleryUploads.length + (uploads.progress.cover !== undefined ? 1 : 0)

    return (
        <div className="flex flex-col gap-5">
            <StepHeader icon={IconWorld} eyebrow="Optional" title="Make your website">
                Pick a look. It already shows your services, hours, policies and reviews. Add your logo and a few photos or videos and
                you&apos;re live. You can change everything later.
            </StepHeader>

            <section className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.warm }}>1. Template</p>
                {info ? (
                    <TemplatePicker info={info} site={site} selected={site.templateId} onPick={id => onChange({ templateId: id, scheme: '', fontPairing: '' })} layout="row" previewHeight={250} />
                ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-2xl" style={{ backgroundColor: BRAND.cream }}>
                        <Loader2 className="animate-spin" color={BRAND.warm} />
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.warm }}>2. Colors</p>
                <SchemeSwatches site={site} onChange={onChange} showCustom={false} />
            </section>

            <section className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.warm }}>3. Logo, photos & videos</p>
                <div className="grid grid-cols-[96px_1fr] gap-3">
                    <MediaSlot
                        label="Logo"
                        media={site.media.logo}
                        accept={IMAGE_ACCEPT}
                        aspect="1 / 1"
                        contain
                        progress={uploads.progress.logo}
                        error={uploads.errors.logo}
                        onFile={f => uploads.setSingle('logo', f)}
                        onRemove={() => uploads.removeSingle('logo')}
                    />
                    <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold" style={{ color: BRAND.ink }}>Photos & videos</span>
                        <button
                            type="button"
                            onClick={() => input.current?.click()}
                            disabled={room <= 0}
                            className="flex min-h-[96px] flex-1 flex-col items-center justify-center gap-1.5 rounded-xl px-3 text-center text-xs font-medium disabled:opacity-50"
                            style={{ border: `1.5px dashed ${BRAND.border}`, backgroundColor: BRAND.cream, color: BRAND.warm }}
                        >
                            {busy > 0 ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={22} />}
                            {busy > 0 ? `Uploading ${busy}…` : media.length ? 'Add more' : 'Add from your camera roll'}
                            <span className="text-[11px] font-normal">The first one becomes your cover</span>
                        </button>
                    </div>
                </div>
                {media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                        {media.map((m, i) => (
                            <div key={m!.url} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg" style={{ border: `1px solid ${BRAND.border}` }}>
                                {m!.kind === 'video'
                                    ? <video src={m!.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                    // eslint-disable-next-line @next/next/no-img-element
                                    : <img src={m!.url} alt="" className="h-full w-full object-cover" />}
                                {i === 0 && <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center text-[9px] font-semibold uppercase text-white">Cover</span>}
                                <button
                                    type="button"
                                    onClick={() => (i === 0 ? uploads.removeSingle('cover') : uploads.removeFromGallery(m!.url))}
                                    className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center text-sm text-white"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,.6)' }}
                                    aria-label="Remove"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {[uploads.errors.cover, uploads.errors.gallery, ...Object.entries(uploads.errors).filter(([k]) => k.startsWith('gallery-')).map(([, v]) => v)]
                    .filter(Boolean).slice(0, 1).map(e => <p key={e} role="alert" className="text-xs" style={{ color: BRAND.error }}>{e}</p>)}
                <input
                    ref={input}
                    type="file"
                    accept={MEDIA_ACCEPT}
                    multiple
                    className="sr-only"
                    tabIndex={-1}
                    onChange={e => {
                        const files = Array.from(e.target.files ?? [])
                        e.target.value = ''
                        if (files.length) addMedia(files.slice(0, Math.max(0, room)))
                    }}
                />
            </section>

            <section className="flex flex-col gap-1">
                <label htmlFor="welcome-site-bio" className="text-xs font-semibold uppercase tracking-widest" style={{ color: BRAND.warm }}>
                    4. A line about you (optional)
                </label>
                <textarea
                    id="welcome-site-bio"
                    value={site.content.bio}
                    maxLength={LIMITS.bio}
                    rows={2}
                    placeholder={info?.fallbackBio ?? 'What you do and who you love working with'}
                    onChange={e => onChange({ content: { ...site.content, bio: e.target.value } })}
                    className="w-full resize-y rounded-xl px-3 py-2 text-base outline-none sm:text-sm"
                    style={inputStyle()}
                />
            </section>
        </div>
    )
}
