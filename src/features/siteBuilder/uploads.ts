'use client'

import { createClient } from '@/app/utils/supabase/client'
import { MAX_VIDEO_BYTES, type SiteMedia } from './siteData'

/**
 * Uploads a photo or video for a template site straight from the browser to
 * the site-media bucket (<businessId>/<uuid>.<ext>), with progress. Large
 * phone photos are resized first so pages load fast on mobile data.
 */

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_BYTES = 15 * 1024 * 1024
const MAX_EDGE = 2000

export class UploadError extends Error {}

export function mediaKindOf(file: File): 'image' | 'video' | null {
    if (IMAGE_TYPES.includes(file.type)) return 'image'
    if (VIDEO_TYPES.includes(file.type)) return 'video'
    // Some phones leave the type empty; fall back to the extension.
    if (/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)) return 'image'
    if (/\.(mp4|mov|webm)$/i.test(file.name)) return 'video'
    return null
}

/** Resizes a photo to at most 2000px on its longest side as a JPEG/PNG. GIFs are kept as they are. */
async function prepareImage(file: File): Promise<Blob> {
    if (file.type === 'image/gif') return file
    let bitmap: ImageBitmap
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
    } catch {
        if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
            throw new UploadError('This photo format isn’t supported here. Choose a JPG or PNG, or set your camera to “Most Compatible”.')
        }
        return file
    }
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.size < 1.5 * 1024 * 1024 && file.type !== 'image/heic') {
        bitmap.close()
        return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const keepAlpha = file.type === 'image/png' || file.type === 'image/webp'
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, keepAlpha ? 'image/png' : 'image/jpeg', 0.86))
    return blob && blob.size < file.size ? blob : file
}

const extensionFor = (type: string, kind: 'image' | 'video') =>
    ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm' } as Record<string, string>)[type]
    ?? (kind === 'video' ? 'mp4' : 'jpg')

export async function uploadSiteMedia(file: File, businessId: string, onProgress?: (fraction: number) => void): Promise<SiteMedia> {
    const kind = mediaKindOf(file)
    if (!kind) throw new UploadError('Choose a photo (JPG, PNG, WebP, GIF) or a video (MP4, MOV, WebM).')
    if (kind === 'video' && file.size > MAX_VIDEO_BYTES) throw new UploadError('Videos can be up to 50 MB. Try a shorter clip.')
    if (kind === 'image' && file.size > MAX_IMAGE_BYTES * 2) throw new UploadError('That photo is too large. Try one under 30 MB.')

    const body = kind === 'image' ? await prepareImage(file) : file
    const type = body.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg')
    const path = `${businessId}/${crypto.randomUUID()}.${extensionFor(type, kind)}`

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new UploadError('You are signed out. Please sign in again.')

    // XHR rather than supabase-js so we can show upload progress.
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${base}/storage/v1/object/site-media/${path}`)
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
        xhr.setRequestHeader('apikey', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!)
        xhr.setRequestHeader('Content-Type', type)
        xhr.setRequestHeader('Cache-Control', 'max-age=31536000')
        xhr.setRequestHeader('x-upsert', 'false')
        xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress?.(e.loaded / e.total) }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new UploadError(xhr.status === 413 ? 'That file is too large.' : 'Upload failed. Please try again.')))
        xhr.onerror = () => reject(new UploadError('Upload failed. Check your connection and try again.'))
        xhr.send(body)
    })

    onProgress?.(1)
    return { url: supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl, path, kind }
}
