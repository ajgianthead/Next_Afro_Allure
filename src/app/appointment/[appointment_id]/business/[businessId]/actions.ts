'use server'

import { DateTime } from "luxon"
import { resolveTimezone } from "@/lib/timezone"
import { createAdminClient } from "@/app/utils/supabase/admin"
import { runConfirmationSideEffects } from "@/features/shared/appointments/confirmation"

export type ConfirmAppointmentResult = { ok: true } | { ok: false; error: string }

/**
 * Called only when the client presses "Confirm Appointment" on the
 * confirmation page (no-deposit appointments; deposit appointments are
 * confirmed by the Stripe webhook once the payment succeeds).
 *
 * Returns a plain object: this used to return the Appointment class
 * instance, which can't be serialized across the server-action boundary —
 * the DB update succeeded but the client got an error, so the page only
 * showed "confirmed" after a refresh.
 */
export const confirmAppointment = async (appointmentId: string, businessId: string): Promise<ConfirmAppointmentResult> => {
    try {
        const supabase = createAdminClient()

        // Flip PENDING → CONFIRMED atomically so a double click (or two tabs)
        // can't confirm twice and send duplicate emails.
        const { data: appt, error } = await supabase
            .from('appointments')
            .update({ status: 'CONFIRMED' })
            .eq('id', appointmentId)
            .eq('business', businessId)
            .eq('status', 'PENDING')
            .eq('require_deposit', false)
            .select('id, start, end, client_metadata, service_data')
            .maybeSingle()
        if (error) return { ok: false, error: 'Something went wrong. Please try again.' }

        if (!appt) {
            const { data: current } = await supabase
                .from('appointments')
                .select('status, require_deposit, business')
                .eq('id', appointmentId)
                .maybeSingle()
            if (!current || current.business !== businessId) return { ok: false, error: 'Appointment not found.' }
            if (current.status === 'CONFIRMED') return { ok: true }
            if (current.require_deposit) return { ok: false, error: 'A deposit is required to confirm this appointment.' }
            return { ok: false, error: 'This appointment can no longer be confirmed.' }
        }

        const { data: business } = await supabase
            .from('business_users')
            .select('business_id, business_name, email, account_settings, completed_stripe_onboarding')
            .eq('business_id', businessId)
            .single()

        if (business) {
            const cm = appt.client_metadata as any
            const sd = appt.service_data as any
            await runConfirmationSideEffects(
                {
                    id: appt.id,
                    start: appt.start,
                    end: appt.end,
                    serviceName: sd?.name ?? 'Appointment',
                    clientMetadata: {
                        firstName: cm?.firstName ?? '',
                        lastName: cm?.lastName ?? '',
                        email: cm?.email ?? '',
                        phoneNumber: cm?.phoneNumber ?? '',
                    },
                },
                {
                    id: business.business_id,
                    name: business.business_name,
                    email: business.email,
                    accountSettings: business.account_settings,
                    completedStripeOnboarding: business.completed_stripe_onboarding,
                },
                {
                    notifyInApp: `${cm?.firstName ?? ''} ${cm?.lastName ?? ''} confirmed their ${sd?.name ?? 'appointment'} on ${DateTime.fromISO(appt.start).setZone(resolveTimezone((business.account_settings as any)?.timezone)).toFormat("LLLL dd, yyyy 'at' h:mm a")}.`,
                }
            )
        }

        return { ok: true }
    } catch (error: any) {
        console.error('confirmAppointment failed:', error)
        return { ok: false, error: 'Something went wrong. Please try again.' }
    }
}
