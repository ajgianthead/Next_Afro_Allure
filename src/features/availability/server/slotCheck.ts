import type { SupabaseClient } from '@supabase/supabase-js'
import { DateTime } from 'luxon'
import { resolveTimezone } from '@/lib/timezone'
import { isBookableStart } from '../slots'

/**
 * Server check: is `start` one of the times the booking page offers for this
 * service's schedule? Same rules as the page, in the business's timezone,
 * against the appointments near that time.
 */
export async function isSlotOpen(supabase: SupabaseClient<any, any, any>, opts: {
    businessId: string
    availabilityId: string
    start: string
    durationMinutes: number
    /** The appointment being moved, so it doesn't block itself. */
    excludeAppointmentId?: string
}): Promise<boolean> {
    const start = DateTime.fromISO(opts.start, { setZone: true })
    if (!start.isValid) return false

    const [{ data: availability }, { data: business }] = await Promise.all([
        supabase.from('availabilities').select('availability_data').eq('id', opts.availabilityId).eq('business_id', opts.businessId).maybeSingle(),
        supabase.from('business_users').select('account_settings').eq('business_id', opts.businessId).maybeSingle(),
    ])
    if (!availability?.availability_data) return false

    let busyQuery = supabase
        .from('appointments')
        .select('start, end')
        .eq('business', opts.businessId)
        .neq('status', 'CANCELLED')
        .gt('end', start.minus({ days: 2 }).toUTC().toISO()!)
        .lt('start', start.plus({ minutes: opts.durationMinutes, days: 2 }).toUTC().toISO()!)
    if (opts.excludeAppointmentId) busyQuery = busyQuery.neq('id', opts.excludeAppointmentId)
    const { data: busy, error } = await busyQuery
    if (error) throw new Error(error.message)

    return isBookableStart({
        schedule: availability.availability_data as any,
        busy: busy ?? [],
        tz: resolveTimezone((business?.account_settings as any)?.timezone),
        durationMinutes: opts.durationMinutes,
        start: opts.start,
    })
}
