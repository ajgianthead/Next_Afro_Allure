'use server'

import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import { getBusyIntervals } from '@/features/shared/appointments/busyIntervals'
import { Availability } from '@/features/availability/server/models/Availability'
import { freeWindows } from '@/features/availability/slots'
import { startTimesInWindows, type OpeningDay } from '../openings'

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

/**
 * Open start times for one service over the next `days` days, in the
 * business's timezone — what the openings graphic shows. Uses the same
 * availability and busy-time rules as the booking page.
 */
export async function getOpenings(serviceId: string, days: number): Promise<Result<{ days: OpeningDay[]; timezone: string }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const span = Math.min(Math.max(1, Math.round(days)), 14)

    try {
        const supabase = createAdminClient()
        const { data: service } = await supabase
            .from('services').select('id, length, availability').eq('id', serviceId).eq('business', businessId).maybeSingle()
        if (!service) return { ok: false, error: 'Service not found.' }

        const tz = await getBusinessTimezone(businessId)
        const availabilities = (await Availability.fetch(supabase as any, businessId)) as Availability[]
        const availability = (Array.isArray(availabilities) ? availabilities : []).map(a => a.toClient()).find(a => a.id === service.availability)
        if (!availability) return { ok: true, days: [], timezone: tz }

        // From an hour from now (no one can book the next few minutes) to the end of the span.
        const from = DateTime.now().setZone(tz).plus({ hours: 1 }).startOf('hour')
        const to = from.startOf('day').plus({ days: span }).endOf('day')
        const busy = await getBusyIntervals(supabase, businessId)
        const minutes = Number(service.length) || 60

        // Free windows (same rules as the booking page), grouped by day in the business's timezone.
        const windowsByDay: Record<string, [string, string][]> = {}
        for (const w of freeWindows(availability, busy, from.toISO()!, to.toISO()!, tz)) {
            const start = DateTime.fromMillis(Math.max(w.start, from.toMillis()), { zone: tz })
            const end = DateTime.fromMillis(Math.min(w.end, to.toMillis()), { zone: tz })
            if (end <= start) continue
            ;(windowsByDay[start.toISODate()!] ??= []).push([start.toISO()!, end.toISO()!])
        }

        const result: OpeningDay[] = []
        for (const [date, windows] of Object.entries(windowsByDay)) {
            const starts = startTimesInWindows(windows, minutes)
            if (starts.length) {
                result.push({ date, times: starts.map(d => DateTime.fromJSDate(d).setZone(tz).toFormat('h:mm a').replace(':00', '')) })
            }
        }
        result.sort((a, b) => a.date.localeCompare(b.date))
        return { ok: true, days: result, timezone: tz }
    } catch (err: any) {
        console.error('getOpenings failed:', err?.message)
        return { ok: false, error: 'Could not work out your openings.' }
    }
}
