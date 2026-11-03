import 'server-only'

import { DateTime } from 'luxon'
import type { createAdminClient } from '@/app/utils/supabase/admin'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import { getBusyIntervals } from '@/features/shared/appointments/busyIntervals'
import { Availability } from '@/features/availability/server/models/Availability'
import { freeWindows } from '@/features/availability/slots'
import { startTimesInWindows } from '../openings'

export interface OpenTime {
    /** yyyy-mm-dd (business timezone) */
    date: string
    /** ISO start, business timezone */
    start: string
}

/**
 * Open start times for one service over the next `days` days, in the
 * business's timezone, using the same availability and busy-time rules as
 * the booking page. `perDay` caps the times listed per day.
 */
export async function computeOpenings(
    supabase: ReturnType<typeof createAdminClient>,
    businessId: string,
    serviceId: string,
    days: number,
    perDay = 4,
): Promise<{ times: OpenTime[]; timezone: string } | null> {
    const span = Math.min(Math.max(1, Math.round(days)), 14)
    const { data: service } = await supabase
        .from('services').select('id, length, availability').eq('id', serviceId).eq('business', businessId).maybeSingle()
    if (!service) return null

    const tz = await getBusinessTimezone(businessId)
    const availabilities = (await Availability.fetch(supabase as any, businessId)) as Availability[]
    const availability = (Array.isArray(availabilities) ? availabilities : []).map(a => a.toClient()).find(a => a.id === service.availability)
    if (!availability) return { times: [], timezone: tz }

    // From an hour from now (no one can book the next few minutes) to the end of the span.
    const from = DateTime.now().setZone(tz).plus({ hours: 1 }).startOf('hour')
    const to = from.startOf('day').plus({ days: span }).endOf('day')
    const busy = await getBusyIntervals(supabase, businessId)
    const minutes = Number(service.length) || 60

    // Free windows grouped by day in the business's timezone.
    const windowsByDay: Record<string, [string, string][]> = {}
    for (const w of freeWindows(availability, busy, from.toISO()!, to.toISO()!, tz)) {
        const start = DateTime.fromMillis(Math.max(w.start, from.toMillis()), { zone: tz })
        const end = DateTime.fromMillis(Math.min(w.end, to.toMillis()), { zone: tz })
        if (end <= start) continue
        ;(windowsByDay[start.toISODate()!] ??= []).push([start.toISO()!, end.toISO()!])
    }

    const times: OpenTime[] = []
    for (const date of Object.keys(windowsByDay).sort()) {
        for (const d of startTimesInWindows(windowsByDay[date], minutes, perDay)) {
            times.push({ date, start: DateTime.fromJSDate(d).setZone(tz).toISO()! })
        }
    }
    return { times, timezone: tz }
}
