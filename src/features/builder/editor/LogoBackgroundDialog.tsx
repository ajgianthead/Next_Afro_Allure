'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Pipette, X } from 'lucide-react'
import type { SiteMedia } from '@/features/siteBuilder/siteData'
import { uploadSiteMedia, UploadError } from '@/features/siteBuilder/uploads'
import { contentBox, edgeColor, removeBackground, type RGB } from '../logo/removeBackground'
import { Slider, Toggle } from './controls'
import { useEditor } from './EditorContext'

const MAX_EDGE = 1000
const CHECKER = 'repeating-conic-gradient(#e5e1da 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px'
const hex = (c: RGB) => `#${c.map(v => v.toString(16).padStart(2, '0')).join('')}`

/**
 * "Remove background" for the logo: clears a solid background in the browser
 * and uploads the result as a new PNG logo. Undo in the editor brings the old
 * logo back.
 */
export function LogoBackgroundDialog({ logo, siteBg, onApply, onClose }: {
    logo: SiteMedia
    /** The site's background color, for the second preview. */
    siteBg: string
    onApply: (logo: SiteMedia) => void
    onClose: () => void
}) {
    const { businessId } = useEditor()
    const [source, setSource] = useState<ImageData | null>(null)
    const [error, setError] = useState('')
    const [tolerance, setTolerance] = useState(18)
    const [everywhere, setEverywhere] = useState(false)
    const [target, setTarget] = useState<RGB | null>(null)
    const [picking, setPicking] = useState(false)
    const [saving, setSaving] = useState(false)
    const preview = useRef<HTMLCanvasElement>(null)
    const onSite = useRef<HTMLCanvasElement>(null)

    // Load the current logo into pixels (the storage serves it with CORS, so the canvas can read it).
    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const res = await fetch(logo.url, { mode: 'cors' })
                if (!res.ok) throw new Error(String(res.status))
                const bitmap = await createImageBitmap(await res.blob())
                const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
                const c = document.createElement('canvas')
                c.width = Math.max(1, Math.round(bitmap.width * scale))
                c.height = Math.max(1, Math.round(bitmap.height * scale))
                const ctx = c.getContext('2d', { willReadFrequently: true })!
                ctx.drawImage(bitmap, 0, 0, c.width, c.height)
                bitmap.close()
                const data = ctx.getImageData(0, 0, c.width, c.height)
                if (!cancelled) { setSource(data); setTarget(edgeColor(data.data, data.width, data.height)) }
            } catch {
                if (!cancelled) setError('Couldn’t open this logo. Try uploading it again, then remove the background.')
            }
        })()
        return () => { cancelled = true }
    }, [logo.url])

    const result = useResult(source, target, tolerance, everywhere)

    // Draw the result on both previews.
    useEffect(() => {
        if (!result) return
        for (const canvas of [preview.current, onSite.current]) {
            if (!canvas) continue
            canvas.width = result.width
            canvas.height = result.height
            canvas.getContext('2d')!.putImageData(result, 0, 0)
        }
    }, [result])

    const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!picking || !source) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = Math.floor(((e.clientX - r.left) / r.width) * source.width)
        const y = Math.floor(((e.clientY - r.top) / r.height) * source.height)
        const i = (y * source.width + x) * 4
        setTarget([source.data[i], source.data[i + 1], source.data[i + 2]])
        setPicking(false)
    }

    const apply = async () => {
        if (!result) return
        setSaving(true)
        setError('')
        try {
            // Trim the empty margins so the logo's size matches what's visible.
            const box = contentBox(result.data, result.width, result.height) ?? { x: 0, y: 0, w: result.width, h: result.height }
            const full = document.createElement('canvas')
            full.width = result.width
            full.height = result.height
            full.getContext('2d')!.putImageData(result, 0, 0)
            const out = document.createElement('canvas')
            out.width = box.w
            out.height = box.h
            out.getContext('2d')!.drawImage(full, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h)
            const blob = await new Promise<Blob | null>(r => out.toBlob(r, 'image/png'))
            if (!blob) throw new Error('encode')
            const media = await uploadSiteMedia(new File([blob], 'logo.png', { type: 'image/png' }), businessId)
            onApply(media)
            onClose()
        } catch (e) {
            setError(e instanceof UploadError ? e.message : 'Couldn’t save the logo. Please try again.')
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
            <div role="dialog" aria-modal="true" aria-label="Remove the logo’s background" onClick={e => e.stopPropagation()}
                className="bld flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl">
                <header className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-line)', background: '#fff' }}>
                    <div>
                        <h2 className="text-[16px] font-semibold">Remove background</h2>
                        <p className="text-[12px]" style={{ color: 'var(--b-muted)' }}>Works best on logos with a plain background.</p>
                    </div>
                    <button type="button" className="bld-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button>
                </header>
                <div className="grid gap-4 overflow-y-auto p-5">
                    {!source && !error && <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin" style={{ color: 'var(--b-muted)' }} /></div>}
                    {source && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <figure className="grid gap-1.5">
                                <div className="flex h-48 items-center justify-center rounded-lg p-3" style={{ background: CHECKER, border: '1px solid var(--b-line)' }}>
                                    <canvas ref={preview} onClick={pick} className="max-h-full max-w-full" style={{ cursor: picking ? 'crosshair' : 'default' }}
                                        aria-label={picking ? 'Click the color to remove' : 'Preview without the background'} />
                                </div>
                                <figcaption className="text-[11.5px]" style={{ color: 'var(--b-muted)' }}>{picking ? 'Click the color you want removed' : 'Checkerboard = see-through'}</figcaption>
                            </figure>
                            <figure className="grid gap-1.5">
                                <div className="flex h-48 items-center justify-center rounded-lg p-3" style={{ background: siteBg, border: '1px solid var(--b-line)' }}>
                                    <canvas ref={onSite} className="max-h-full max-w-full" aria-label="Preview on your site’s background" />
                                </div>
                                <figcaption className="text-[11.5px]" style={{ color: 'var(--b-muted)' }}>On your site</figcaption>
                            </figure>
                        </div>
                    )}
                    {source && <>
                        <div className="flex items-center gap-3">
                            <span className="h-7 w-7 flex-none rounded-md" style={{ background: target ? hex(target) : 'transparent', border: '1px solid var(--b-line)' }} aria-hidden />
                            <span className="flex-1 text-[13px]">Removing {target ? hex(target) : 'the background'}</span>
                            <button type="button" className="bld-btn" aria-pressed={picking} onClick={() => setPicking(p => !p)}><Pipette size={14} /> {picking ? 'Cancel' : 'Pick a color'}</button>
                        </div>
                        <Slider label="Strength" value={tolerance} min={0} max={60} onChange={setTolerance} help="Raise it if a halo of the old background is left; lower it if parts of the logo disappear." />
                        <Toggle label="Also inside letters and shapes" checked={everywhere} onChange={setEverywhere} help="Clears the color everywhere, like the inside of an O. Leave off if your logo uses that color." />
                    </>}
                    {error && <p role="alert" className="text-[13px]" style={{ color: '#B42318' }}>{error}</p>}
                </div>
                <footer className="flex justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--b-line)', background: '#fff' }}>
                    <button type="button" className="bld-btn" onClick={onClose}>Cancel</button>
                    <button type="button" className="bld-btn" data-primary="" disabled={!result || saving} onClick={apply}>
                        {saving && <Loader2 size={14} className="animate-spin" />}Use this logo
                    </button>
                </footer>
            </div>
        </div>
    )
}

/** The logo with its background removed, recomputed (on the next frame) as the settings change. */
function useResult(source: ImageData | null, target: RGB | null, tolerance: number, everywhere: boolean) {
    const [result, setResult] = useState<ImageData | null>(null)
    useEffect(() => {
        if (!source) return
        const id = requestAnimationFrame(() => {
            const px = removeBackground(source.data, source.width, source.height, { target, tolerance, everywhere })
            setResult(new ImageData(px, source.width, source.height))
        })
        return () => cancelAnimationFrame(id)
    }, [source, target, tolerance, everywhere])
    return result
}
