/**
 * A link a business typed (Custom Builder buttons and text), made safe to put
 * in an href: web, email and phone links, and paths/anchors on this site.
 * Anything else — javascript:, data:, vbscript:, … — becomes '#'. React 19
 * already refuses javascript: URLs; this keeps it that way regardless.
 */
export function safeHref(raw: unknown): string {
    if (typeof raw !== 'string') return '#'
    // Browsers ignore whitespace and control characters inside a scheme ("java\tscript:").
    const url = raw.trim()
    const squashed = url.replace(/[\u0000- ]/g, '').toLowerCase()
    if (!squashed) return '#'
    if (/^(https?:|mailto:|tel:)/.test(squashed)) return url
    if (url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//'))) return url
    // "instagram.com/kay" — no scheme at all: treat as a web address.
    if (!/^[a-z][a-z0-9+.-]*:/.test(squashed) && !url.startsWith('//')) return `https://${url}`
    return '#'
}
