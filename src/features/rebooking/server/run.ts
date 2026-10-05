// The daily rebooking-reminder job. Relative imports only: this runs inside
// the Trigger.dev bundle (see src/trigger/rebook.ts) as well as in tests.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Resend } from 'resend'
import RebookReminderEmail from '../../../../emails/rebook-reminder'
import { bookingUrl } from '../../../lib/bookingUrl'
import { isRebookReminderDue, oldestVisitToCheck } from '../rebook'

const FROM = 'notifications <noreply@reminder.afroallure.co>'
const BATCH = 1000

export interface RebookRunResult {
    checked: number
    sent: number
    alreadyRebooked: number
}

/**
 * Finds completed visits whose service has a rebooking cycle, and emails each
 * client who's due and hasn't booked again since. Each visit is claimed before
 * sending, so a re-run (or two overlapping runs) never emails twice.
 */
export async function runRebookReminders(supabase: SupabaseClient<any, any, any>, resend: Resend, now: Date = new Date()): Promise<RebookRunResult> {
    const result: RebookRunResult = { checked: 0, sent: 0, alreadyRebooked: 0 }

    const { data: visits, error } = await supabase
        .from('appointments')
        .select('id, business, end, client_metadata, service_data')
        .eq('status', 'COMPLETED')
        .is('rebook_nudged_at', null)
        .gte('end', oldestVisitToCheck(now).toISOString())
        .lte('end', new Date(now.getTime() - 7 * 86400000).toISOString())
        .order('end', { ascending: true })
        .limit(BATCH)
    if (error) throw new Error(error.message)
    if (!visits?.length) return result

    const serviceIds = [...new Set(visits.map(v => (v.service_data as any)?.id).filter(Boolean))] as string[]
    const services = new Map<string, { name: string; weeks: number; business: string }>()
    for (let i = 0; i < serviceIds.length; i += 200) {
        const { data } = await supabase
            .from('services')
            .select('id, name, business, rebook_weeks')
            .in('id', serviceIds.slice(i, i + 200))
            .not('rebook_weeks', 'is', null)
        for (const s of data ?? []) services.set(s.id, { name: s.name, weeks: s.rebook_weeks, business: s.business })
    }

    const businesses = new Map<string, { name: string; urlName: string } | null>()
    const businessFor = async (id: string) => {
        if (!businesses.has(id)) {
            const { data } = await supabase.from('business_users').select('business_name, url_name').eq('business_id', id).maybeSingle()
            businesses.set(id, data ? { name: data.business_name, urlName: data.url_name } : null)
        }
        return businesses.get(id)!
    }

    for (const visit of visits) {
        const serviceId = (visit.service_data as any)?.id as string | undefined
        const service = serviceId ? services.get(serviceId) : undefined
        if (!service || service.business !== visit.business) continue
        if (!isRebookReminderDue(new Date(visit.end), service.weeks, now)) continue
        result.checked++

        const client = (visit.client_metadata ?? {}) as { firstName?: string; email?: string }
        const email = String(client.email ?? '').trim()

        // Already came back or booked again (any service) since this visit?
        let rebooked = !email
        if (email) {
            const { count } = await supabase
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .eq('business', visit.business)
                .ilike('client_metadata->>email', email.replace(/[\\%_]/g, c => `\\${c}`))
                .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED', 'PROCESSING'])
                .gt('start', visit.end)
            rebooked = (count ?? 0) > 0
        }

        const { data: claimed } = await supabase
            .from('appointments')
            .update({ rebook_nudged_at: now.toISOString() })
            .eq('id', visit.id)
            .is('rebook_nudged_at', null)
            .select('id')
        if (!claimed?.length) continue
        if (rebooked) { result.alreadyRebooked++; continue }

        const business = await businessFor(visit.business)
        if (!business) continue
        const { error: sendError } = await resend.emails.send({
            from: FROM,
            to: email,
            subject: `Time for your next ${service.name}?`,
            react: RebookReminderEmail({
                clientFirstName: client.firstName || 'there',
                businessName: business.name,
                serviceName: service.name,
                sinceText: `${service.weeks} weeks`,
                bookingUrl: bookingUrl(business.urlName, `/book?service=${encodeURIComponent(serviceId!)}`),
            }),
        })
        if (sendError) {
            console.error('Rebook reminder failed:', sendError.message)
            // Let tomorrow's run try again.
            await supabase.from('appointments').update({ rebook_nudged_at: null }).eq('id', visit.id)
            continue
        }
        result.sent++
    }
    return result
}
