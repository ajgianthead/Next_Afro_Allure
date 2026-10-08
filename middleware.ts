import { type NextRequest, NextResponse } from 'next/server'
import { RESERVED_SUBDOMAINS } from './src/lib/businessSlug'
import { businessSubdomainFromHost } from './src/lib/businessHost'

/**
 * Business booking sites on their own subdomain:
 *   kayla.afroallure.co/book  →  serves /business/kayla/book
 *
 * Only active when NEXT_PUBLIC_BOOKING_ROOT_DOMAIN is set (e.g.
 * "afroallure.co", or "localhost:3000" for local testing). Reserved
 * subdomains — beta (the app), reminder (email), www, … — pass straight
 * through, so beta.afroallure.co behaves exactly as before.
 */
const ROOT = process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN?.toLowerCase()
const APP_ORIGIN = process.env.NEXT_PUBLIC_BASE_URL

// App pages that must never be served on a business subdomain.
const APP_ONLY = /^\/(dashboard|edit|login|register|forgot-password|onboarding|appointment|auth|admin|set-password|subscriptionResult)(\/|$)/
// Business-site paths that should stay as-is (Next internals, API, static files).
const PASS_THROUGH = /^\/(api|_next|monitoring)(\/|$)|\.[a-z0-9]+$/i

export async function middleware(request: NextRequest) {
    const host = (request.headers.get('host') ?? '').toLowerCase()
    const url = request.nextUrl.clone()
    const sub = businessSubdomainFromHost(host, ROOT)

    if (sub) {
        if (PASS_THROUGH.test(url.pathname)) return NextResponse.next()

        if (APP_ONLY.test(url.pathname) || /^\/business\/[^/]+\/edit(\/|$)/.test(url.pathname)) {
            if (!APP_ORIGIN) return NextResponse.next()
            return NextResponse.redirect(new URL(url.pathname + url.search, APP_ORIGIN))
        }

        // kayla.afroallure.co/business/kayla/book → kayla.afroallure.co/book
        const ownPrefix = `/business/${sub}`
        if (url.pathname === ownPrefix || url.pathname.startsWith(`${ownPrefix}/`)) {
            url.pathname = url.pathname.slice(ownPrefix.length) || '/'
            return NextResponse.redirect(url, 308)
        }

        url.pathname = `${ownPrefix}${url.pathname === '/' ? '' : url.pathname}`
        return NextResponse.rewrite(url)
    }

    // Once subdomains are live, send old app-domain links
    // (beta.afroallure.co/business/kayla/book) to the subdomain. GET only —
    // server actions POST to the page path and must not be redirected.
    if (ROOT && (request.method === 'GET' || request.method === 'HEAD')) {
        const match = url.pathname.match(/^\/business\/([a-z0-9-]+)(\/.*)?$/)
        if (match && !(match[2] ?? '').startsWith('/edit') && !RESERVED_SUBDOMAINS.has(match[1])) {
            const protocol = ROOT.startsWith('localhost') ? 'http' : 'https'
            return NextResponse.redirect(`${protocol}://${match[1]}.${ROOT}${match[2] ?? ''}${url.search}`, 308)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhook).*)'],
}
