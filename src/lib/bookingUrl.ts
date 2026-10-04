/**
 * Public URL of a business's booking site.
 *
 * With NEXT_PUBLIC_BOOKING_ROOT_DOMAIN set (e.g. "afroallure.co") this is the
 * business subdomain — https://kayla.afroallure.co/book. Without it (preview
 * deployments, or before the wildcard domain is live) it falls back to the
 * path on the app domain — https://beta.afroallure.co/business/kayla/book.
 *
 * Use relative links (`/book`) *inside* the booking site so they work on
 * either host; use this helper anywhere the link is shared or shown.
 */
export function bookingUrl(urlName: string, path: string = ''): string {
    const suffix = path && !path.startsWith('/') ? `/${path}` : path
    const root = process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN
    if (!root) return `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/business/${urlName}${suffix}`
    const protocol = root.startsWith('localhost') ? 'http' : 'https'
    return `${protocol}://${urlName}.${root}${suffix}`
}

/** Host shown in the dashboard's URL editor ("afroallure.co" or "beta.afroallure.co/business"). */
export function bookingUrlDisplayParts(): { prefix: string; suffix: string } {
    const root = process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN
    if (!root) {
        const base = (process.env.NEXT_PUBLIC_BASE_URL ?? '').replace(/^https?:\/\//, '')
        return { prefix: `${base}/business/`, suffix: '' }
    }
    return { prefix: '', suffix: `.${root}` }
}
