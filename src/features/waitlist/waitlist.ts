// Cancellation waitlist rules. Pure — shared by the booking site, the
// dashboard and the server.

export type TimeOfDay = 'any' | 'morning' | 'afternoon' | 'evening'

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
    any: 'Any time',
    morning: 'Mornings (before noon)',
    afternoon: 'Afternoons (noon – 5pm)',
    evening: 'Evenings (after 5pm)',
}

export interface WaitlistInput {
    businessId: string
    serviceId?: string | null
    firstName: string
    lastName: string
    email: string
    phone: string
    /** yyyy-mm-dd */
    fromDate: string
    /** yyyy-mm-dd */
    toDate: string
    timeOfDay: TimeOfDay
    note?: string
}

export interface WaitlistEntry {
    id: string
    serviceId: string | null
    serviceName: string | null
    firstName: string
    lastName: string
    email: string
    phone: string
    fromDate: string
    toDate: string
    timeOfDay: TimeOfDay
    note: string | null
    status: 'waiting' | 'booked' | 'removed'
    notifiedCount: number
    lastNotifiedAt: string | null
    createdAt: string
}

/** Longest stretch a client can wait for, in days. */
export const MAX_WAIT_DAYS = 90

const DATE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const dayNumber = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000)

/** First problem with a sign-up, or null. `today` is the business-local date (yyyy-mm-dd). */
export function waitlistProblem(input: WaitlistInput, today: string): string | null {
    if (!input.firstName?.trim()) return 'Please enter your first name.'
    if (!EMAIL.test(input.email?.trim() ?? '')) return 'Please enter a valid email.'
    if (!DATE.test(input.fromDate) || !DATE.test(input.toDate) || Number.isNaN(dayNumber(input.fromDate)) || Number.isNaN(dayNumber(input.toDate)))
        return 'Please choose your dates.'
    if (input.toDate < input.fromDate) return 'The last day must be on or after the first day.'
    if (input.toDate < today) return 'Those dates have already passed.'
    if (dayNumber(input.toDate) - dayNumber(today) > MAX_WAIT_DAYS) return `Please choose dates within the next ${MAX_WAIT_DAYS} days.`
    if (!(input.timeOfDay in TIME_OF_DAY_LABELS)) return 'Please choose a time of day.'
    if ((input.note?.length ?? 0) > 300) return 'Please keep the note under 300 characters.'
    return null
}

/** Which part of the day a (local) hour falls in. */
export function partOfDay(hour: number): Exclude<TimeOfDay, 'any'> {
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
}

/**
 * Whether a freed-up time suits a waitlist entry.
 * `opening.date` / `opening.hour` are in the business's timezone.
 */
export function matchesOpening(
    entry: Pick<WaitlistEntry, 'fromDate' | 'toDate' | 'timeOfDay' | 'serviceId' | 'status'>,
    opening: { date: string; hour: number; serviceId: string | null }
): boolean {
    if (entry.status !== 'waiting') return false
    if (opening.date < entry.fromDate || opening.date > entry.toDate) return false
    if (entry.timeOfDay !== 'any' && entry.timeOfDay !== partOfDay(opening.hour)) return false
    // A client waiting for a specific service hears about openings left by that
    // service; others hear about any opening (the booking page shows what fits).
    if (entry.serviceId && opening.serviceId && entry.serviceId !== opening.serviceId) return false
    return true
}

/** How many waiting clients get each opening — first come, first served. */
export const NOTIFY_PER_OPENING = 5

export function entryFromRow(row: any, serviceName: string | null = null): WaitlistEntry {
    return {
        id: row.id,
        serviceId: row.service_id ?? null,
        serviceName,
        firstName: row.first_name ?? '',
        lastName: row.last_name ?? '',
        email: row.email ?? '',
        phone: row.phone ?? '',
        fromDate: row.from_date,
        toDate: row.to_date,
        timeOfDay: (row.time_of_day in TIME_OF_DAY_LABELS ? row.time_of_day : 'any') as TimeOfDay,
        note: row.note ?? null,
        status: row.status,
        notifiedCount: Number(row.notified_count ?? 0),
        lastNotifiedAt: row.last_notified_at ?? null,
        createdAt: row.created_at,
    }
}
