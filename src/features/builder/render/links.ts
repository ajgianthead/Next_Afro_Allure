import { safeHref } from '@/lib/safeHref'

/**
 * Where a builder link goes:
 *   'book'            → the booking page
 *   'book:<id>'       → the booking page with that service picked
 *   '#services'       → a section on this page
 *   anything else     → an outside link, made safe (https/mailto/tel only)
 */
export function resolveHref(href: string | undefined, bookHref: (serviceId?: string) => string): string {
    const h = (href ?? '').trim()
    if (!h || h === 'book') return bookHref()
    if (h.startsWith('book:')) return bookHref(h.slice(5))
    if (/^#[a-z0-9-]+$/i.test(h)) return h
    return safeHref(h)
}
