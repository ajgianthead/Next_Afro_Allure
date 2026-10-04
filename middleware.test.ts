import { beforeAll, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

let middleware: (req: NextRequest) => Promise<Response>

beforeAll(async () => {
    process.env.NEXT_PUBLIC_BOOKING_ROOT_DOMAIN = 'afroallure.co'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://beta.afroallure.co'
    vi.resetModules()
    middleware = (await import('./middleware')).middleware
})

const req = (url: string, method = 'GET') => new NextRequest(url, { method, headers: { host: new URL(url).host } })
const rewrite = (res: Response) => res.headers.get('x-middleware-rewrite')
const location = (res: Response) => res.headers.get('location')

describe('business subdomain middleware', () => {
    it('serves the booking site from the subdomain', async () => {
        expect(rewrite(await middleware(req('https://kayla.afroallure.co/')))).toBe('https://kayla.afroallure.co/business/kayla')
        expect(rewrite(await middleware(req('https://kayla.afroallure.co/book?service=1')))).toBe('https://kayla.afroallure.co/business/kayla/book?service=1')
    })

    it('leaves the app (beta) and other reserved subdomains alone', async () => {
        const res = await middleware(req('https://beta.afroallure.co/dashboard'))
        expect(rewrite(res)).toBeNull()
        expect(location(res)).toBeNull()
        expect(rewrite(await middleware(req('https://reminder.afroallure.co/')))).toBeNull()
    })

    it('sends app pages on a business subdomain back to the app', async () => {
        expect(location(await middleware(req('https://kayla.afroallure.co/dashboard')))).toBe('https://beta.afroallure.co/dashboard')
        expect(location(await middleware(req('https://kayla.afroallure.co/business/kayla/edit')))).toBe('https://beta.afroallure.co/business/kayla/edit')
    })

    it('does not rewrite static files or API calls', async () => {
        const res = await middleware(req('https://kayla.afroallure.co/images/logo.png'))
        expect(rewrite(res)).toBeNull()
        expect(rewrite(await middleware(req('https://kayla.afroallure.co/api/account')))).toBeNull()
    })

    it('cleans up /business/<self> paths on the subdomain', async () => {
        expect(location(await middleware(req('https://kayla.afroallure.co/business/kayla/book')))).toBe('https://kayla.afroallure.co/book')
    })

    it('redirects old app-domain links to the subdomain (GET only, not the editor)', async () => {
        expect(location(await middleware(req('https://beta.afroallure.co/business/kayla/book')))).toBe('https://kayla.afroallure.co/book')
        expect(location(await middleware(req('https://beta.afroallure.co/business/kayla/book', 'POST')))).toBeNull()
        expect(location(await middleware(req('https://beta.afroallure.co/business/kayla/edit')))).toBeNull()
    })
})
