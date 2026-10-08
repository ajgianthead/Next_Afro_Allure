/**
 * Where to send someone after an auth link (`?next=`). Only a path on this
 * site is allowed: anything else ("//evil.com", "@evil.com", "https://…")
 * would turn the link into a redirect to another site.
 */
export function safeNext(next: string | null | undefined, fallback = '/dashboard'): string {
    if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback
    return next
}
