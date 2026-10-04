import { DateTime } from 'luxon'

/**
 * Appointment times are stored as UTC instants. Anything rendered on the
 * server (emails, reminders) has to be shown in the business's own timezone
 * — the server runs in UTC, so formatting there without a zone shows the
 * wrong wall-clock time. The business's IANA zone is kept in
 * business_users.account_settings.timezone (captured from their browser).
 */
export const DEFAULT_TIMEZONE = 'America/New_York'

export function isValidTimezone(tz: unknown): tz is string {
    return typeof tz === 'string' && tz.length > 0 && DateTime.local().setZone(tz).isValid
}

export function resolveTimezone(tz: unknown): string {
    return isValidTimezone(tz) ? tz : DEFAULT_TIMEZONE
}

/** The viewer's timezone, from the browser. Client-side only. */
export function browserTimezone(): string {
    try {
        return resolveTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    } catch {
        return DEFAULT_TIMEZONE
    }
}

/**
 * Re-expresses an instant with the business's UTC offset, e.g.
 * 2026-10-03T21:00:00Z → 2026-10-03T17:00:00.000-04:00. Email templates parse
 * with `{ setZone: true }`, so they print the business's local time.
 */
export function toZonedISO(iso: string, tz: unknown): string {
    const dt = DateTime.fromISO(iso, { setZone: true })
    if (!dt.isValid) return iso
    return dt.setZone(resolveTimezone(tz)).toISO() ?? iso
}
