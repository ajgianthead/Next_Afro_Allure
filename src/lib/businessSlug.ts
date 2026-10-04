/**
 * Business URL names double as subdomains (kayla.afroallure.co), so they
 * must be valid DNS labels: lowercase a–z, 0–9 and single hyphens, no
 * leading/trailing hyphen, at most 63 characters.
 */
export const SLUG_MAX_LENGTH = 63
export const SLUG_MIN_LENGTH = 3

/**
 * Subdomains that belong to AfroAllure itself (the app, email sending,
 * future products). No business may ever use these.
 */
export const RESERVED_SUBDOMAINS = new Set([
    'beta', 'www', 'app', 'api', 'admin', 'reminder', 'reminders', 'mail', 'email', 'notifications',
    'dashboard', 'support', 'help', 'status', 'blog', 'book', 'booking', 'send', 'smtp', 'ftp',
    'dev', 'staging', 'preview', 'test', 'demo', 'docs', 'cdn', 'assets', 'static', 'images',
    'login', 'register', 'auth', 'account', 'billing', 'pay', 'payments', 'stripe', 'marketplace',
    'afroallure', 'aa', 'business', 'businesses', 'for-businesses', 'founding-members', 'waitlist',
])

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

/** Turns a business name into a subdomain-safe slug ("Kayla's Braids & Co." → "kaylas-braids-co"). */
export function slugify(input: string): string {
    return input
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')       // strip accents
        .toLowerCase()
        .replace(/['’]/g, '')                  // "kayla's" → "kaylas"
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, SLUG_MAX_LENGTH)
        .replace(/-+$/g, '')
}

/** Returns an error message, or null if the slug can be used as a business URL/subdomain. */
export function validateSlug(slug: string): string | null {
    if (slug.length < SLUG_MIN_LENGTH) return `Use at least ${SLUG_MIN_LENGTH} characters`
    if (slug.length > SLUG_MAX_LENGTH) return `Use at most ${SLUG_MAX_LENGTH} characters`
    if (!SLUG_PATTERN.test(slug) || slug.includes('--')) {
        return 'Use lowercase letters, numbers and single hyphens (not at the start or end)'
    }
    if (RESERVED_SUBDOMAINS.has(slug)) return 'That name is reserved. Please pick another.'
    return null
}
