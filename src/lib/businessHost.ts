import { RESERVED_SUBDOMAINS } from './businessSlug'

/**
 * The business url_name when `host` is a business subdomain
 * (kayla.afroallure.co → "kayla"), otherwise null — including for the app
 * itself (beta.afroallure.co) and every other reserved subdomain.
 * Safe to use in middleware, server and client code.
 */
export function businessSubdomainFromHost(
    host: string | null | undefined,
    root: string | undefined = process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN
): string | null {
    const h = (host ?? '').toLowerCase()
    const r = root?.toLowerCase()
    if (!r || !h.endsWith(`.${r}`)) return null
    const sub = h.slice(0, -(r.length + 1))
    if (!sub || sub.includes('.') || RESERVED_SUBDOMAINS.has(sub)) return null
    return sub
}

/**
 * Link to a page of a business's booking site, relative to the current host:
 * "/book" when already on kayla.afroallure.co, "/business/kayla/book" on the
 * app domain. Keeps visitors on whichever host they arrived on.
 */
export function businessSitePath(urlName: string, path: string, host: string | null | undefined): string {
    const suffix = path === '' || path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
    if (businessSubdomainFromHost(host) === urlName) return suffix || '/'
    return `/business/${urlName}${suffix}`
}
