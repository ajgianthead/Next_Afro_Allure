import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/app/utils/supabase/admin"
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { AppointmentReminders, reminderSettingsFrom } from "./AppointmentReminders"
import { upsertBusinessClientAsAdmin } from "@/features/shared/clients/upsertBusinessClient"
import { clientConsentedToSms, sendSms } from "@/lib/sms/send"
import { formatWhen, smsTemplates } from "@/lib/sms/templates"
import { resolveTimezone } from "@/lib/timezone"

export interface ConfirmedAppointmentInfo {
    id: string
    start: string
    end: string
    serviceName: string
    clientMetadata: { firstName: string; lastName: string; email: string; phoneNumber: string; smsConsent?: boolean }
}

export interface ConfirmingBusinessInfo {
    id: string
    name: string
    email: string
    accountSettings: any
    completedStripeOnboarding: boolean
}

/**
 * Booking texts for businesses with the SMS add-on: "you're booked" to the
 * client (if they agreed to texts) and "new booking" to the business.
 * sendSms checks the plan, consent and monthly limit, and never throws.
 */
export async function sendConfirmationTexts(
    supabase: SupabaseClient<any, any, any>,
    appointment: ConfirmedAppointmentInfo,
    business: { id: string; name: string; accountSettings: any },
    /** False when the business confirmed it themselves: no "new booking" text about their own action. */
    options: { notifyBusiness: boolean }
) {
    const when = formatWhen(appointment.start, resolveTimezone(business.accountSettings?.timezone))
    const cm = appointment.clientMetadata
    await Promise.all([
        sendSms(supabase, {
            businessId: business.id,
            audience: 'client',
            to: cm.phoneNumber,
            clientConsent: clientConsentedToSms(cm),
            body: smsTemplates.clientConfirmation({ business: business.name, service: appointment.serviceName, when }),
        }),
        options.notifyBusiness && sendSms(supabase, {
            businessId: business.id,
            audience: 'business',
            body: smsTemplates.businessNewBooking({
                client: `${cm.firstName} ${cm.lastName}`.trim(),
                service: appointment.serviceName,
                when,
            }),
        }),
    ])
}

/** Schedules reminder / payment jobs (respecting the business's settings) and stores their run ids on the appointment. */
export async function scheduleAndStoreReminders(
    supabase: SupabaseClient<any, any, any>,
    appointment: ConfirmedAppointmentInfo,
    business: ConfirmingBusinessInfo
) {
    const ids = await AppointmentReminders.schedule({
        appointmentId: appointment.id,
        start: appointment.start,
        end: appointment.end,
        serviceName: appointment.serviceName,
        businessData: {
            id: business.id,
            name: business.name,
            email: business.email,
            address: formatBusinessAddress(business.accountSettings?.business_address),
        },
        clientData: {
            firstName: appointment.clientMetadata.firstName,
            lastName: appointment.clientMetadata.lastName,
            email: appointment.clientMetadata.email,
            phoneNumber: appointment.clientMetadata.phoneNumber,
        },
        settings: reminderSettingsFrom(business.accountSettings),
        canTakeOnlinePayments: business.completedStripeOnboarding,
    })
    const { error } = await supabase.from('appointments').update({
        reminder_ids: {
            business: { hour: ids.business.hour, day: ids.business.day },
            client: { hour: ids.client.hour, day: ids.client.day },
            paymentCheck: ids.paymentCheck,
            noShowCheck: ids.noShowCheck,
            paymentFollowUps: ids.paymentFollowUps,
        },
        payment_link_id: ids.paymentLink ?? '',
    }).eq('id', appointment.id)
    if (error) console.error('Failed to store reminder ids:', error.message)
    return ids
}

/**
 * Everything that should happen once an appointment becomes CONFIRMED,
 * whoever confirmed it. Each step is independent and non-fatal — the
 * appointment is already confirmed, so a failed email must not undo that.
 * Uses the service-role client because the client-side confirm page has no
 * business session.
 */
export async function runConfirmationSideEffects(
    appointment: ConfirmedAppointmentInfo,
    business: ConfirmingBusinessInfo,
    options: { notifyInApp?: string } = {}
) {
    const admin = createAdminClient()

    try {
        await AppointmentEmails.sendConfirmed({
            clientMetadata: {
                firstName: appointment.clientMetadata.firstName,
                lastName: appointment.clientMetadata.lastName,
                email: appointment.clientMetadata.email,
            },
            businessData: {
                id: business.id,
                name: business.name,
                email: business.email,
                address: formatBusinessAddress(business.accountSettings?.business_address),
            },
            appointmentData: { id: appointment.id, start: appointment.start, end: appointment.end },
            serviceName: appointment.serviceName,
            notifyBusiness: business.accountSettings?.notifications?.email === true,
        })
    } catch (err) {
        console.error('Failed to send confirmation emails:', err)
    }

    try {
        await scheduleAndStoreReminders(admin, appointment, business)
    } catch (err) {
        console.error('Failed to schedule reminders after confirmation:', err)
    }

    // notifyInApp is set when the client (not the business) confirmed.
    await sendConfirmationTexts(admin, appointment, business, { notifyBusiness: !!options.notifyInApp })

    await upsertBusinessClientAsAdmin({
        first_name: appointment.clientMetadata.firstName,
        last_name: appointment.clientMetadata.lastName,
        email: appointment.clientMetadata.email,
        phone_number: appointment.clientMetadata.phoneNumber,
    }, business.id)

    if (options.notifyInApp) {
        const { error } = await admin.from('notifications').insert({
            body: options.notifyInApp,
            title: 'Booking Confirmed',
            read: false,
            business_id: business.id,
            type: 'booking-confirmed',
            appointment_id: appointment.id,
        })
        if (error) console.error('Failed to insert booking-confirmed notification:', error.message)
    }
}
