'use server'

import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import type { OpeningDay } from '../openings'
import { computeOpenings } from './compute'

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
        const r = await computeOpenings(createAdminClient(), businessId, serviceId, span)
        if (!r) return { ok: false, error: 'Service not found.' }
        const byDay: Record<string, string[]> = {}
        for (const t of r.times) (byDay[t.date] ??= []).push(DateTime.fromISO(t.start, { zone: r.timezone }).toFormat('h:mm a').replace(':00', ''))
        const result: OpeningDay[] = Object.entries(byDay).map(([date, times]) => ({ date, times }))
        return { ok: true, days: result, timezone: r.timezone }
    } catch (err: any) {
        console.error('getOpenings failed:', err?.message)
        return { ok: false, error: 'Could not work out your openings.' }
    }
}
