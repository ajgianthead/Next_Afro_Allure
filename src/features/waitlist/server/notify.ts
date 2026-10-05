import { Resend } from 'resend'
import { DateTime } from 'luxon'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { bookingUrl } from '@/lib/bookingUrl'
import { getBusinessTimezone } from '@/lib/businessTimezone'
import WaitlistOpeningEmail from '../../../../emails/waitlist-opening'
import { entryFromRow, matchesOpening, NOTIFY_PER_OPENING } from '../waitlist'

const FROM = 'notifications <noreply@reminder.afroallure.co>'

/**
 * After an appointment is cancelled, emails the first few waitlisted clients
 * whose dates and time of day fit the freed-up time. Runs at most once per
 * appointment (claimed on the appointment row) and never throws — a
 * cancellation must not fail because of the waitlist.
 */
export async function notifyWaitlistOfOpening(appointmentId: string): Promise<number> {
    try {
        const supabase = createAdminClient()
        const { data: claimed } = await supabase
            .from('appointments')
            .update({ waitlist_notified_at: new Date().toISOString() })
            .eq('id', appointmentId)
            .eq('status', 'CANCELLED')
            .is('waitlist_notified_at', null)
            .select('id, business, start, service_data')
        const appt = claimed?.[0]
        if (!appt) return 0

        // Only worth telling anyone about a time that's still a while away.
        const start = DateTime.fromISO(appt.start)
        if (start < DateTime.now().plus({ hours: 2 })) return 0

        const { data: business } = await supabase
            .from('business_users')
            .select('business_name, url_name, waitlist_enabled')
            .eq('business_id', appt.business)
            .maybeSingle()
        if (!business?.waitlist_enabled) return 0

        const tz = await getBusinessTimezone(appt.business)
        const local = start.setZone(tz)
        const date = local.toISODate()!
        const serviceId = (appt.service_data as any)?.id ?? null

        const { data: rows } = await supabase
            .from('booking_waitlist')
            .select('*')
            .eq('business_id', appt.business)
            .eq('status', 'waiting')
            .lte('from_date', date)
            .gte('to_date', date)
            .order('created_at', { ascending: true })
            .limit(50)

        const candidates = (rows ?? [])
            .map(r => entryFromRow(r))
            .filter(e => matchesOpening(e, { date, hour: local.hour, serviceId }))

        // Skip anyone who already has an upcoming booking with this business.
        const { data: upcoming } = await supabase
            .from('appointments')
            .select('client_metadata')
            .eq('business', appt.business)
            .in('status', ['PENDING', 'CONFIRMED'])
            .gte('start', new Date().toISOString())
        const booked = new Set((upcoming ?? []).map(a => String((a.client_metadata as any)?.email ?? '').trim().toLowerCase()).filter(Boolean))

        const toNotify = candidates.filter(e => !booked.has(e.email.trim().toLowerCase())).slice(0, NOTIFY_PER_OPENING)
        if (!toNotify.length) return 0

        const resend = new Resend(process.env.RESEND_API_KEY)
        const businessName = business.business_name ?? 'Your stylist'
        const link = bookingUrl(business.url_name ?? '', serviceId ? `/book?service=${encodeURIComponent(serviceId)}` : '/book')
        let sent = 0
        for (const entry of toNotify) {
            const { error } = await resend.emails.send({
                from: FROM,
                to: entry.email,
                subject: `A spot opened with ${businessName} — ${local.toFormat('ccc, LLL d')} at ${local.toFormat('h:mm a')}`,
                react: WaitlistOpeningEmail({
                    clientFirstName: entry.firstName || 'there',
                    businessName,
                    date: local.toFormat('cccc, LLLL d'),
                    time: local.toFormat('h:mm a'),
                    bookingUrl: link,
                }),
            })
            if (error) { console.error('Waitlist email failed:', error.message); continue }
            sent++
            await supabase
                .from('booking_waitlist')
                .update({ notified_count: entry.notifiedCount + 1, last_notified_at: new Date().toISOString() })
                .eq('id', entry.id)
        }

        if (sent) {
            await supabase.from('notifications').insert({
                business_id: appt.business,
                title: 'Waitlist notified',
                body: `${sent} client${sent === 1 ? '' : 's'} on your waitlist ${sent === 1 ? 'was' : 'were'} told about the ${local.toFormat('LLL d, h:mm a')} opening.`,
                type: 'waitlist',
                read: false,
                appointment_id: appt.id,
            })
        }
        return sent
    } catch (err: any) {
        console.error('notifyWaitlistOfOpening failed:', err?.message)
        return 0
    }
}
