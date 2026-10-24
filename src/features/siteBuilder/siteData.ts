import { parseStyleOptions, startingPrice } from '@/features/services/pricing'
import { formatDuration, formatPrice } from '@/features/services/utils'
import { isHexColor, TEMPLATE_IDS, type SchemeColors, type TemplateId } from './themes'

/**
 * A template site's settings (web_editors.site_data) and the public data the
 * templates show. Pure module: safe on server and client. Everything read
 * from site_data goes through parseSiteData, because a browser wrote it.
 */

export type MediaKind = 'image' | 'video'

export interface SiteMedia {
    url: string
    /** Path in the site-media bucket ('' for media hosted elsewhere, e.g. imported from the old editor). */
    path: string
    kind: MediaKind
}

export interface SiteContent {
    tagline: string
    bio: string
    phone: string
    email: string
    instagram: string
    tiktok: string
}

export interface SiteData {
    templateId: TemplateId
    /** A preset id from the template's schemes, or 'custom'. */
    scheme: string
    customColors: SchemeColors | null
    fontPairing: string
    media: {
        logo: SiteMedia | null
        cover: SiteMedia | null
        about: SiteMedia | null
        gallery: SiteMedia[]
    }
    content: SiteContent
}

export const MAX_GALLERY = 12
export const LIMITS = { tagline: 120, bio: 1200, phone: 30, email: 120, handle: 40 }
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export const EMPTY_CONTENT: SiteContent = { tagline: '', bio: '', phone: '', email: '', instagram: '', tiktok: '' }

export function defaultSiteData(templateId: TemplateId = 'quickstart'): SiteData {
    return {
        templateId,
        scheme: '',
        customColors: null,
        fontPairing: '',
        media: { logo: null, cover: null, about: null, gallery: [] },
        content: { ...EMPTY_CONTENT },
    }
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const isTemplateId = (v: unknown): v is TemplateId => typeof v === 'string' && (TEMPLATE_IDS as readonly string[]).includes(v)

function parseMedia(raw: unknown): SiteMedia | null {
    if (!raw || typeof raw !== 'object') return null
    const m = raw as Record<string, unknown>
    const url = typeof m.url === 'string' ? m.url.trim() : ''
    if (!/^https:\/\/[^\s"'<>]+$/i.test(url) || url.length > 1000) return null
    const path = typeof m.path === 'string' && /^[0-9a-f-]{36}\/[\w.-]+$/i.test(m.path) ? m.path : ''
    return { url, path, kind: m.kind === 'video' ? 'video' : 'image' }
}

/** Instagram/TikTok handle without the @ or a URL around it. */
export function cleanHandle(v: unknown): string {
    let h = str(v, 200)
    h = h.replace(/^https?:\/\/(www\.)?(instagram\.com|tiktok\.com)\//i, '').replace(/^@/, '').split(/[/?#]/)[0]
    return /^[\w.]{1,40}$/.test(h) ? h : ''
}

export function parseSiteData(raw: unknown): SiteData {
    const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>
    const media = (d.media && typeof d.media === 'object' ? d.media : {}) as Record<string, unknown>
    const content = (d.content && typeof d.content === 'object' ? d.content : {}) as Record<string, unknown>
    const custom = d.customColors && typeof d.customColors === 'object' ? d.customColors : null
    const gallery = Array.isArray(media.gallery) ? media.gallery.map(parseMedia).filter((m): m is SiteMedia => !!m).slice(0, MAX_GALLERY) : []
    const email = str(content.email, LIMITS.email)
    return {
        templateId: isTemplateId(d.templateId) ? d.templateId : 'quickstart',
        scheme: str(d.scheme, 40),
        customColors: custom && isHexColor(custom.bg) && isHexColor(custom.fg) && isHexColor(custom.accent)
            ? { bg: custom.bg, fg: custom.fg, accent: custom.accent }
            : null,
        fontPairing: str(d.fontPairing, 40),
        media: {
            logo: parseMedia(media.logo),
            cover: parseMedia(media.cover),
            about: parseMedia(media.about),
            gallery,
        },
        content: {
            tagline: str(content.tagline, LIMITS.tagline),
            bio: str(content.bio, LIMITS.bio),
            phone: str(content.phone, LIMITS.phone).replace(/[^\d+()\-. ]/g, ''),
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
            instagram: cleanHandle(content.instagram),
            tiktok: cleanHandle(content.tiktok),
        },
    }
}

// ─── Public data shown on the site ───────────────────────────────────────────

export interface SiteService {
    id: string
    name: string
    description: string
    price: string
    duration: string
}

export interface HoursLine {
    days: string
    hours: string
}

export interface SiteReview {
    name: string
    rating: number
    text: string
}

/** Everything about the business a template shows, besides its own settings. */
export interface SiteInfo {
    businessName: string
    urlName: string
    /** "Brooklyn, NY", or null without a fixed location. */
    place: string | null
    travels: boolean
    services: SiteService[]
    hours: HoursLine[]
    policies: { cancelDays: number; rescheduleDays: number; readBeforeBooking: string }
    reviews: SiteReview[]
    rating: { average: number; count: number } | null
    /** Bio to fall back on when the site has none (marketplace bio, else generated). */
    fallbackBio: string
}

export function priceLabel(service: { price: number; length: number; style_options?: unknown }): { price: string; duration: string } {
    const options = parseStyleOptions(service.style_options)
    const from = startingPrice(service)
    const varies = !!options && Object.values(options.grid).some(c => c.available && c.extraMinutes > 0)
    return {
        price: from > 0 ? `${options ? 'from ' : ''}${formatPrice(from)}` : '',
        duration: service.length > 0 ? `${formatDuration(service.length)}${varies ? '+' : ''}` : '',
    }
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function clock(t: { hour: number; minute: number }): string {
    const suffix = t.hour >= 12 && t.hour < 24 ? 'pm' : 'am'
    const h = t.hour % 12 === 0 ? 12 : t.hour % 12
    return t.minute ? `${h}:${String(t.minute).padStart(2, '0')}${suffix}` : `${h}${suffix}`
}

/** A weekly schedule as "Mon–Fri · 9am–5pm" lines, grouping consecutive days with the same hours. */
export function formatHours(week: unknown): HoursLine[] {
    const days = Array.isArray(week) ? week.slice(0, 7) : []
    const perDay = days.map((day: any) => {
        if (!day?.isChecked || !Array.isArray(day.timeRanges)) return ''
        return day.timeRanges
            .filter((r: any) => r?.start && r?.end && Number.isFinite(Number(r.start.hour)) && Number.isFinite(Number(r.end.hour)))
            .map((r: any) => `${clock({ hour: Number(r.start.hour), minute: Number(r.start.minute ?? 0) })}–${clock({ hour: Number(r.end.hour), minute: Number(r.end.minute ?? 0) })}`)
            .join(', ')
    })
    const lines: HoursLine[] = []
    let i = 0
    while (i < perDay.length) {
        if (!perDay[i]) { i++; continue }
        let j = i
        while (j + 1 < perDay.length && perDay[j + 1] === perDay[i]) j++
        lines.push({ days: i === j ? DAY_SHORT[i] : `${DAY_SHORT[i]}–${DAY_SHORT[j]}`, hours: perDay[i] })
        i = j + 1
    }
    return lines
}

/** "Kayla's Braids offers knotless braids, silk presses and more in Atlanta, GA." */
export function fallbackBio(businessName: string, serviceNames: string[], place: string | null): string {
    const names = serviceNames.map(n => n.trim()).filter(Boolean).slice(0, 3).map(n => n.toLowerCase())
    const list = names.length === 0 ? 'beauty services'
        : names.length === 1 ? names[0]
            : `${names.slice(0, -1).join(', ')}${serviceNames.length > 3 ? ', ' : ' and '}${names[names.length - 1]}${serviceNames.length > 3 ? ' and more' : ''}`
    return `${businessName} offers ${list}${place ? ` in ${place}` : ''}. Book online in a few taps.`
}

export function ratingSummary(reviews: SiteReview[]): SiteInfo['rating'] {
    const rated = reviews.filter(r => r.rating >= 1 && r.rating <= 5)
    if (!rated.length) return null
    const average = Math.round((rated.reduce((s, r) => s + r.rating, 0) / rated.length) * 10) / 10
    return { average, count: rated.length }
}

/** Instagram/TikTok/phone/email links, ready to render. */
export function contactLinks(content: SiteContent): { label: string; href: string; display: string }[] {
    const links: { label: string; href: string; display: string }[] = []
    if (content.instagram) links.push({ label: 'Instagram', href: `https://instagram.com/${content.instagram}`, display: `@${content.instagram}` })
    if (content.tiktok) links.push({ label: 'TikTok', href: `https://www.tiktok.com/@${content.tiktok}`, display: `@${content.tiktok}` })
    if (content.phone) links.push({ label: 'Phone', href: `tel:${content.phone.replace(/[^\d+]/g, '')}`, display: content.phone })
    if (content.email) links.push({ label: 'Email', href: `mailto:${content.email}`, display: content.email })
    return links
}

/** "KB" from "Kayla's Braids". */
export function monogram(name: string): string {
    const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean)
    return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? 'A').slice(0, 2)).toUpperCase()
}

// ─── Import from the old Section Editor ──────────────────────────────────────

const stripHtml = (html: unknown) => (typeof html === 'string' ? html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '')

/** Text and photos from a Section Editor site, to start a template site with. */
export function importFromSections(sections: unknown): { content: Partial<SiteContent>; images: string[] } {
    const list = Array.isArray(sections) ? sections : []
    const content: Partial<SiteContent> = {}
    const images: string[] = []
    const addImage = (url: unknown) => {
        if (typeof url === 'string' && /^https:\/\//i.test(url) && !images.includes(url)) images.push(url)
    }
    for (const section of list as any[]) {
        const data = section?.data ?? {}
        switch (section?.type) {
            case 'hero':
                if (!content.tagline && data.headline) content.tagline = stripHtml(data.headline).slice(0, LIMITS.tagline)
                addImage(data.image_url)
                break
            case 'about':
                if (!content.bio && data.bio) content.bio = stripHtml(data.bio).slice(0, LIMITS.bio)
                addImage(data.image_url)
                break
            case 'contact':
                if (data.phone) content.phone = String(data.phone).slice(0, LIMITS.phone)
                if (data.email) content.email = String(data.email).slice(0, LIMITS.email)
                if (data.instagram) content.instagram = cleanHandle(data.instagram)
                break
            case 'image':
                addImage(section.url)
                break
            case 'text':
                if (!content.bio) {
                    const text = stripHtml(section.html)
                    if (text.length > 60) content.bio = text.slice(0, LIMITS.bio)
                }
                break
        }
    }
    return { content, images: images.slice(0, MAX_GALLERY) }
}
