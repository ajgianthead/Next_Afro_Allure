import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let ip = '203.0.113.7'
vi.mock('next/headers', () => ({
    headers: async () => new Map([['x-forwarded-for', `${ip}, 10.0.0.1`]]),
}))

// A fake limiter: counts calls per prefix+identifier.
const counts = new Map<string, number>()
let upstashDown = false
vi.mock('@upstash/redis', () => ({ Redis: class { constructor(public opts: unknown) {} } }))
vi.mock('@upstash/ratelimit', () => {
    class Ratelimit {
        max: number; prefix: string
        constructor(cfg: any) { this.max = cfg.limiter.max; this.prefix = cfg.prefix }
        static slidingWindow(max: number, window: string) { return { max, window } }
        async limit(id: string) {
            if (upstashDown) throw new Error('connection refused')
            const k = `${this.prefix}|${id}`
            counts.set(k, (counts.get(k) ?? 0) + 1)
            return { success: counts.get(k)! <= this.max }
        }
    }
    return { Ratelimit }
})

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)
const turnstileSays = (success: boolean) => fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success }) })

async function load() {
    vi.resetModules()
    return import('./guard')
}

describe('guardPublicAction', () => {
    beforeEach(() => {
        counts.clear(); upstashDown = false; ip = '203.0.113.7'; fetchMock.mockReset()
        process.env.TURNSTILE_SECRET_KEY = 'secret'
        process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io'
        process.env.UPSTASH_REDIS_REST_TOKEN = 'token'
    })
    afterEach(() => { vi.spyOn(console, 'error').mockRestore() })

    it('allows a request with a valid Turnstile token, and sends Cloudflare the visitor IP', async () => {
        const { guardPublicAction } = await load()
        turnstileSays(true)
        expect(await guardPublicAction('booking', { turnstileToken: 't' })).toBeNull()
        const body = fetchMock.mock.calls[0][1].body as URLSearchParams
        expect(body.get('response')).toBe('t')
        expect(body.get('remoteip')).toBe('203.0.113.7')
    })

    it('refuses a missing or rejected token', async () => {
        const { guardPublicAction, FAILED_CHECK } = await load()
        expect(await guardPublicAction('booking', {})).toBe(FAILED_CHECK)
        turnstileSays(false)
        expect(await guardPublicAction('booking', { turnstileToken: 'bad' })).toBe(FAILED_CHECK)
    })

    it('limits each visitor IP separately', async () => {
        const { guardPublicAction, TOO_MANY } = await load()
        turnstileSays(true)
        const opts = { turnstileToken: 't', perIp: { max: 2, window: '10 m' as const } }
        expect(await guardPublicAction('signup', opts)).toBeNull()
        expect(await guardPublicAction('signup', opts)).toBeNull()
        expect(await guardPublicAction('signup', opts)).toBe(TOO_MANY)
        ip = '198.51.100.9'
        expect(await guardPublicAction('signup', opts)).toBeNull()
    })

    it('limits per key (e.g. bookings per business) across visitors', async () => {
        const { guardPublicAction, TOO_MANY } = await load()
        turnstileSays(true)
        const opts = { turnstileToken: 't', perKey: { key: 'biz-1', max: 1, window: '1 h' as const } }
        expect(await guardPublicAction('booking', opts)).toBeNull()
        ip = '198.51.100.9'
        expect(await guardPublicAction('booking', opts)).toBe(TOO_MANY)
        expect(await guardPublicAction('booking', { ...opts, perKey: { ...opts.perKey, key: 'biz-2' } })).toBeNull()
    })

    it('lets requests through while Cloudflare or Upstash is unreachable', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const { guardPublicAction } = await load()
        fetchMock.mockRejectedValue(new Error('network down'))
        upstashDown = true
        expect(await guardPublicAction('booking', { turnstileToken: 't', perIp: { max: 1, window: '1 m' } })).toBeNull()
    })

    it('does nothing until the services are configured', async () => {
        delete process.env.TURNSTILE_SECRET_KEY
        delete process.env.UPSTASH_REDIS_REST_URL
        const { guardPublicAction } = await load()
        expect(await guardPublicAction('booking', { perIp: { max: 0, window: '1 m' } })).toBeNull()
        expect(fetchMock).not.toHaveBeenCalled()
    })
})
