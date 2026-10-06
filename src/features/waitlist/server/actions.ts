'use server'

import { revalidatePath } from 'next/cache'
import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { requireOwnBusinessId } from '@/lib/auth/requireBusinessOwner'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import { entryFromRow, waitlistProblem, type WaitlistEntry, type WaitlistInput } from '../waitlist'

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

/** Open sign-ups one email can hold with a business, and a business's total — spam guards. */
const MAX_PER_CLIENT = 3
const MAX_PER_BUSINESS = 500

/**
 * Public: a client on the booking site asks to hear about openings. Called
 * without a session, so everything is checked here and the row is written
 * with the service role.
 */
export async function joinWaitlist(input: WaitlistInput): Promise<Result> {
    try {
        const supabase = createAdminClient()
        const { data: business } = await supabase
            .from('business_users')
            .select('business_id, business_name, waitlist_enabled')
            .eq('business_id', String(input.businessId ?? ''))
            .maybeSingle()
        if (!business) return { ok: false, error: 'Business not found.' }
        if (!business.waitlist_enabled) return { ok: false, error: "This business isn't taking waitlist requests right now." }

        const tz = await getBusinessTimezone(business.business_id)
        const today = DateTime.now().setZone(tz).toISODate()!
        const problem = waitlistProblem(input, today)
        if (problem) return { ok: false, error: problem }

        let serviceId: string | null = null
        if (input.serviceId) {
            const { data: service } = await supabase
                .from('services').select('id').eq('id', input.serviceId).eq('business', business.business_id).maybeSingle()
            serviceId = service?.id ?? null
        }

        const email = input.email.trim().toLowerCase()
        const [{ count: mine }, { count: total }] = await Promise.all([
            supabase.from('booking_waitlist').select('id', { count: 'exact', head: true })
                .eq('business_id', business.business_id).eq('email', email).eq('status', 'waiting').gte('to_date', today),
            supabase.from('booking_waitlist').select('id', { count: 'exact', head: true })
                .eq('business_id', business.business_id).eq('status', 'waiting').gte('to_date', today),
        ])
        if ((mine ?? 0) >= MAX_PER_CLIENT) return { ok: false, error: "You're already on this waitlist. We'll email you when a time opens up." }
        if ((total ?? 0) >= MAX_PER_BUSINESS) return { ok: false, error: 'The waitlist is full right now. Please check back soon.' }

        const fromDate = input.fromDate < today ? today : input.fromDate
        const { error } = await supabase.from('booking_waitlist').insert({
            business_id: business.business_id,
            service_id: serviceId,
            first_name: input.firstName.trim().slice(0, 80),
            last_name: (input.lastName ?? '').trim().slice(0, 80),
            email,
            phone: (input.phone ?? '').trim().slice(0, 30),
            from_date: fromDate,
            to_date: input.toDate,
            time_of_day: input.timeOfDay,
            note: input.note?.trim().slice(0, 300) || null,
        })
        if (error) return { ok: false, error: 'Could not add you to the waitlist. Please try again.' }

        return { ok: true }
    } catch {
        return { ok: false, error: 'Could not add you to the waitlist. Please try again.' }
    }
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getWaitlist(): Promise<Result<{ enabled: boolean; entries: WaitlistEntry[] }>> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const supabase = createAdminClient()
    const tz = await getBusinessTimezone(businessId)
    const today = DateTime.now().setZone(tz).toISODate()!

    const [{ data: business }, { data: rows, error }, { data: services }] = await Promise.all([
        supabase.from('business_users').select('waitlist_enabled').eq('business_id', businessId).maybeSingle(),
        supabase.from('booking_waitlist').select('*').eq('business_id', businessId).eq('status', 'waiting')
            .gte('to_date', today).order('from_date', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('services').select('id, name').eq('business', businessId),
    ])
    if (error) return { ok: false, error: 'Could not load your waitlist.' }
    const names = new Map((services ?? []).map(s => [s.id, s.name as string]))
    return {
        ok: true,
        enabled: business?.waitlist_enabled ?? true,
        entries: (rows ?? []).map(r => entryFromRow(r, r.service_id ? names.get(r.service_id) ?? null : null)),
    }
}

export async function setWaitlistStatus(entryId: string, status: 'booked' | 'removed'): Promise<Result> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    if (status !== 'booked' && status !== 'removed') return { ok: false, error: 'Invalid status.' }
    const { data, error } = await createAdminClient()
        .from('booking_waitlist').update({ status }).eq('id', entryId).eq('business_id', businessId).select('id')
    if (error || !data?.length) return { ok: false, error: 'Could not update the waitlist.' }
    revalidatePath('/dashboard/waitlist')
    return { ok: true }
}

export async function setWaitlistEnabled(enabled: boolean): Promise<Result> {
    let businessId: string
    try { businessId = await requireOwnBusinessId() } catch { return { ok: false, error: 'Please sign in again.' } }
    const { error } = await createAdminClient()
        .from('business_users').update({ waitlist_enabled: !!enabled }).eq('business_id', businessId)
    if (error) return { ok: false, error: 'Could not save.' }
    revalidatePath('/dashboard/waitlist')
    return { ok: true }
}
