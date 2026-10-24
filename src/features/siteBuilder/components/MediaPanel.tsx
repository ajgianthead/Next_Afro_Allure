'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Play, Plus, Trash2, Upload } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BRAND } from '@/features/welcomeSetup/components/shared'
import { MAX_GALLERY, type SiteData, type SiteMedia } from '../siteData'
import { uploadSiteMedia, UploadError } from '../uploads'

type SingleSlot = 'logo' | 'cover' | 'about'
type SetSite = (update: (prev: SiteData) => SiteData) => void

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif'
const MEDIA_ACCEPT = `${IMAGE_ACCEPT},video/mp4,video/quicktime,video/webm`

/** Upload state shared by the slots: per-key progress and errors. */
export function useSiteUploads(businessId: string, setSite: SetSite, onRemoved: (paths: string[]) => void) {
    const [progress, setProgress] = useState<Record<string, number>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    const run = async (key: string, file: File, apply: (media: SiteMedia) => void) => {
        setErrors(e => ({ ...e, [key]: '' }))
        setProgress(p => ({ ...p, [key]: 0 }))
        try {
            const media = await uploadSiteMedia(file, businessId, f => setProgress(p => ({ ...p, [key]: f })))
            apply(media)
        } catch (err) {
            setErrors(e => ({ ...e, [key]: err instanceof UploadError ? err.message : 'Upload failed. Please try again.' }))
        } finally {
            setProgress(p => {
                const { [key]: _, ...rest } = p
                return rest
            })
        }
    }

    const setSingle = (slot: SingleSlot, file: File) => run(slot, file, media => setSite(prev => {
        const old = prev.media[slot]
        if (old?.path) onRemoved([old.path])
        return { ...prev, media: { ...prev.media, [slot]: media } }
    }))

    const removeSingle = (slot: SingleSlot) => setSite(prev => {
        const old = prev.media[slot]
        if (old?.path) onRemoved([old.path])
        return { ...prev, media: { ...prev.media, [slot]: null } }
    })

    const addToGallery = (files: File[], room: number) => {
        files.slice(0, Math.max(0, room)).forEach((file, i) => {
            const key = `gallery-${Date.now()}-${i}`
            run(key, file, media => setSite(prev => (
                prev.media.gallery.length >= MAX_GALLERY ? prev : { ...prev, media: { ...prev.media, gallery: [...prev.media.gallery, media] } }
            )))
        })
        if (files.length > room) setErrors(e => ({ ...e, gallery: `Your gallery holds up to ${MAX_GALLERY} photos and videos.` }))
    }

    const removeFromGallery = (url: string) => setSite(prev => {
        const item = prev.media.gallery.find(m => m.url === url)
        if (item?.path) onRemoved([item.path])
        return { ...prev, media: { ...prev.media, gallery: prev.media.gallery.filter(m => m.url !== url) } }
    })

    const galleryUploads = Object.entries(progress).filter(([k]) => k.startsWith('gallery-'))
    return { progress, errors, setSingle, removeSingle, addToGallery, removeFromGallery, galleryUploads }
}

function Thumb({ media }: { media: SiteMedia }) {
    return media.kind === 'video' ? (
        <>
            <video src={media.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            <span className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"><Play size={11} fill="currentColor" /></span>
        </>
    ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.url} alt="" className="h-full w-full object-cover" />
    )
}

export function MediaSlot({ label, hint, media, accept, aspect, progress, error, onFile, onRemove, contain }: {
    label: string
    hint?: string
    media: SiteMedia | null
    accept: string
    aspect: string
    progress?: number
    error?: string
    onFile: (file: File) => void
    onRemove: () => void
    contain?: boolean
}) {
    const input = useRef<HTMLInputElement>(null)
    const uploading = progress !== undefined
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: BRAND.ink }}>{label}</span>
                {hint && <span className="text-[11px]" style={{ color: BRAND.warm }}>{hint}</span>}
            </div>
            <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: aspect, border: `1.5px ${media ? 'solid' : 'dashed'} ${BRAND.border}`, backgroundColor: BRAND.cream }}>
                {media && (contain
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={media.url} alt="" className="h-full w-full object-contain p-3" />
                    : <Thumb media={media} />)}
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    disabled={uploading}
                    className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-xs font-medium ${media ? 'opacity-0 focus-visible:opacity-100 hover:opacity-100' : ''}`}
                    style={{ color: media ? '#FFFFFF' : BRAND.warm, backgroundColor: media ? 'rgba(0,0,0,.45)' : undefined }}
                    aria-label={media ? `Replace ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
                >
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : media ? <Upload size={18} /> : <ImagePlus size={22} />}
                    {uploading ? `Uploading ${Math.round((progress ?? 0) * 100)}%` : media ? 'Replace' : 'Tap to add'}
                </button>
                {uploading && (
                    <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: 'rgba(0,0,0,.1)' }}>
                        <div className="h-full transition-[width]" style={{ width: `${Math.round((progress ?? 0) * 100)}%`, backgroundColor: BRAND.coral }} />
                    </div>
                )}
                {media && !uploading && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
                        aria-label={`Remove ${label.toLowerCase()}`}
                    >
                        <Trash2 size={15} color={BRAND.error} />
                    </button>
                )}
            </div>
            {error && <p role="alert" className="text-xs" style={{ color: BRAND.error }}>{error}</p>}
            <input
                ref={input}
                type="file"
                accept={accept}
                className="sr-only"
                tabIndex={-1}
                onChange={e => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) onFile(file)
                }}
            />
        </div>
    )
}

function SortableTile({ media, onRemove }: { media: SiteMedia; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: media.url })
    return (
        <div
            ref={setNodeRef}
            className="relative aspect-square touch-manipulation overflow-hidden rounded-xl"
            style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : undefined, boxShadow: isDragging ? '0 12px 28px -10px rgba(0,0,0,.4)' : undefined, border: `1px solid ${BRAND.border}` }}
            {...attributes}
            {...listeners}
            aria-label={`${media.kind === 'video' ? 'Video' : 'Photo'}, drag to reorder`}
        >
            <Thumb media={media} />
            <button
                type="button"
                onPointerDown={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onClick={onRemove}
                className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
                aria-label="Remove"
            >
                <Trash2 size={14} color={BRAND.error} />
            </button>
        </div>
    )
}

export function GalleryEditor({ site, setSite, uploads }: { site: SiteData; setSite: SetSite; uploads: ReturnType<typeof useSiteUploads> }) {
    const input = useRef<HTMLInputElement>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        // A short press before dragging, so swiping still scrolls the page on phones.
        useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )
    const gallery = site.media.gallery
    const room = MAX_GALLERY - gallery.length - uploads.galleryUploads.length

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return
        setSite(prev => {
            const from = prev.media.gallery.findIndex(m => m.url === active.id)
            const to = prev.media.gallery.findIndex(m => m.url === over.id)
            if (from < 0 || to < 0) return prev
            return { ...prev, media: { ...prev.media, gallery: arrayMove(prev.media.gallery, from, to) } }
        })
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: BRAND.ink }}>Gallery</span>
                <span className="text-[11px]" style={{ color: BRAND.warm }}>{gallery.length}/{MAX_GALLERY} · hold and drag to reorder</span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={gallery.map(m => m.url)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {gallery.map(m => <SortableTile key={m.url} media={m} onRemove={() => uploads.removeFromGallery(m.url)} />)}
                        {uploads.galleryUploads.map(([key, p]) => (
                            <div key={key} className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-[11px]" style={{ backgroundColor: BRAND.cream, color: BRAND.warm }}>
                                <Loader2 size={18} className="animate-spin" />
                                {Math.round(p * 100)}%
                            </div>
                        ))}
                        {room > 0 && (
                            <button
                                type="button"
                                onClick={() => input.current?.click()}
                                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium"
                                style={{ border: `1.5px dashed ${BRAND.border}`, color: BRAND.warm }}
                            >
                                <Plus size={20} />
                                Add
                            </button>
                        )}
                    </div>
                </SortableContext>
            </DndContext>
            {uploads.errors.gallery && <p role="alert" className="text-xs" style={{ color: BRAND.error }}>{uploads.errors.gallery}</p>}
            {Object.entries(uploads.errors).filter(([k, v]) => k.startsWith('gallery-') && v).slice(0, 1).map(([k, v]) => (
                <p key={k} role="alert" className="text-xs" style={{ color: BRAND.error }}>{v}</p>
            ))}
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
                    if (files.length) uploads.addToGallery(files, room)
                }}
            />
        </div>
    )
}

export function MediaPanel({ site, setSite, uploads }: { site: SiteData; setSite: SetSite; uploads: ReturnType<typeof useSiteUploads> }) {
    return (
        <div className="flex flex-col gap-6">
            <p className="text-xs leading-relaxed" style={{ color: BRAND.warm }}>
                Photos and short videos from your camera roll. Videos play muted on a loop, up to 50 MB each. Anything you leave empty is
                simply left out of your site.
            </p>
            <div className="grid grid-cols-[1fr_2fr] gap-3">
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
                <MediaSlot
                    label="Cover"
                    hint="Photo or video"
                    media={site.media.cover}
                    accept={MEDIA_ACCEPT}
                    aspect="2 / 1"
                    progress={uploads.progress.cover}
                    error={uploads.errors.cover}
                    onFile={f => uploads.setSingle('cover', f)}
                    onRemove={() => uploads.removeSingle('cover')}
                />
            </div>
            <div className="max-w-[50%]">
                <MediaSlot
                    label="About photo"
                    hint="You at work"
                    media={site.media.about}
                    accept={IMAGE_ACCEPT}
                    aspect="4 / 5"
                    progress={uploads.progress.about}
                    error={uploads.errors.about}
                    onFile={f => uploads.setSingle('about', f)}
                    onRemove={() => uploads.removeSingle('about')}
                />
            </div>
            <GalleryEditor site={site} setSite={setSite} uploads={uploads} />
        </div>
    )
}

export { IMAGE_ACCEPT, MEDIA_ACCEPT }
