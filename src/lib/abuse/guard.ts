import { headers } from 'next/headers'
import { Ratelimit, type Duration } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Bot check + rate limits for public actions anyone can call without signing
 * in (booking, sign-up, waitlists…), so a script can't flood a business's
 * calendar or use our emails to spam people.
 *
 * - Cloudflare Turnstile: the form sends a token (see useTurnstile); checked
 *   here when TURNSTILE_SECRET_KEY is set.
 * - Upstash rate limits: per visitor IP and, optionally, per key (e.g. the
 *   business being booked); active when UPSTASH_REDIS_REST_URL/TOKEN are set.
 *
 * Either service being unset or briefly unreachable lets the request through
 * (logged): a Cloudflare or Upstash outage must not cost a business a booking.
 * Returns null when allowed, or a message to show the person.
 */

export interface Limit {
    max: number
    window: Duration
}

export interface GuardOptions {
    /** Token from the form's Turnstile widget. */
    turnstileToken?: string | null
    /** Requests per visitor IP. */
    perIp?: Limit
    /** Requests per key, across all visitors, e.g. bookings per business. */
    perKey?: Limit & { key: string }
}

export const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.'
export const FAILED_CHECK = "We couldn't confirm you're not a bot. Please refresh the page and try again."

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function clientIp(): Promise<string> {
    const h = await headers()
    return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip')?.trim() || 'unknown'
}

async function verifyTurnstile(token: string | null | undefined, ip: string): Promise<'ok' | 'failed' | 'unavailable'> {
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) return 'ok'
    if (!token) return 'failed'
    try {
        const body = new URLSearchParams({ secret, response: token })
        if (ip !== 'unknown') body.set('remoteip', ip)
        const res = await fetch(TURNSTILE_VERIFY, { method: 'POST', body, signal: AbortSignal.timeout(5000) })
        if (!res.ok) return 'unavailable'
        const data = (await res.json()) as { success?: boolean }
        return data.success === true ? 'ok' : 'failed'
    } catch {
        return 'unavailable'
    }
}

let redis: Redis | null | undefined
function getRedis(): Redis | null {
    if (redis !== undefined) return redis
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN
    redis = url && token ? new Redis({ url, token }) : null
    return redis
}

const limiters = new Map<string, Ratelimit>()
function limiter(name: string, limit: Limit, redisClient: Redis): Ratelimit {
    const id = `${name}:${limit.max}/${limit.window}`
    let l = limiters.get(id)
    if (!l) {
        l = new Ratelimit({ redis: redisClient, limiter: Ratelimit.slidingWindow(limit.max, limit.window), prefix: `aa:rl:${name}` })
        limiters.set(id, l)
    }
    return l
}

export async function guardPublicAction(action: string, opts: GuardOptions): Promise<string | null> {
    const ip = await clientIp()

    const check = await verifyTurnstile(opts.turnstileToken, ip)
    if (check === 'failed') return FAILED_CHECK
    if (check === 'unavailable') console.error(`[guard] Turnstile unreachable for ${action}; allowing`)

    const r = getRedis()
    if (r) {
        try {
            const checks: Promise<{ success: boolean }>[] = []
            if (opts.perIp) checks.push(limiter(`${action}:ip`, opts.perIp, r).limit(ip))
            if (opts.perKey) checks.push(limiter(`${action}:key`, opts.perKey, r).limit(opts.perKey.key))
            const results = await Promise.all(checks)
            if (results.some(x => !x.success)) return TOO_MANY
        } catch (err: any) {
            console.error(`[guard] rate limit unavailable for ${action}; allowing:`, err?.message)
        }
    }
    return null
}
