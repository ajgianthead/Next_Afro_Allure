import type { SupabaseClient } from "@supabase/supabase-js"
import { DateTime } from "luxon"

/**
 * What the public booking/reschedule pages need to know about existing
 * appointments: only when the business is busy. Never client names,
 * contact details or payment info — those pages are visible to anyone.
 */
export interface BusyInterval {
    start: string
    end: string
}

export async function getBusyIntervals(supabase: SupabaseClient<any, any, any>, businessId: string): Promise<BusyInterval[]> {
    const { data, error } = await supabase
        .from('appointments')
        .select('start, end')
        .eq('business', businessId)
        .neq('status', 'CANCELLED')
        // Past appointments can't block a future slot.
        .gte('end', DateTime.now().minus({ days: 1 }).toUTC().toISO()!)
    if (error) throw new Error(error.message)
    return (data ?? []).map(a => ({ start: a.start, end: a.end }))
}
