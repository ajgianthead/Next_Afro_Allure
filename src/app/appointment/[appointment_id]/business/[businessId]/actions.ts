'use server'

import { Appointment } from "@/features/manualBooking/server/models/Appointment"
import { BusinessUser } from "@/lib/businessUser/BusinessUser"
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders"
import { formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { createClient } from "@/app/utils/supabase/server"
import { Database } from "../../../../../../lib/database.types"

export const confirmAppointment = async (appointmentId: string, businessId: string) => {
    try {
        const supabase = await createClient<Database>()
        const appointment = await Appointment.fetchById(supabase, appointmentId)
        if (!Array.isArray(appointment)) {
            if (appointment.businessId !== businessId) {
                throw new Error('Unauthorized')
            }
            const confirmedAppointment = await appointment.confirmAppointment(supabase)

            // Schedule reminders for no-deposit confirmation — non-critical, must not fail the confirm
            try {
                const business = await BusinessUser.fetch(supabase, appointment.businessId)
                const ids = await AppointmentReminders.schedule({
                    appointmentId: appointment.id,
                    start: appointment.start,
                    end: appointment.end,
                    serviceName: appointment.serviceData.name,
                    businessData: {
                        id: business.id,
                        name: business.name,
                        email: business.email,
                        address: formatBusinessAddress(business.accountSettings.business_address),
                    },
                    clientData: {
                        firstName: appointment.clientMetadata.firstName,
                        lastName: appointment.clientMetadata.lastName,
                        email: appointment.clientMetadata.email,
                        phoneNumber: appointment.clientMetadata.phoneNumber,
                    },
                    settings: {
                        clientReminders: {
                            email_1: business.accountSettings.app_reminders.email_1,
                            email_24: business.accountSettings.app_reminders.email_24,
                        },
                        businessReminders: {
                            enabled: business.accountSettings.notifications.email,
                            email_1: business.accountSettings.notifications.email_1,
                            email_24: business.accountSettings.notifications.email_24,
                        },
                    },
                })
                await supabase.from('appointments').update({
                    reminder_ids: {
                        business: { hour: ids.business.hour, day: ids.business.day },
                        client: { hour: ids.client.hour, day: ids.client.day },
                        paymentCheck: ids.paymentCheck,
                    },
                    payment_link_id: ids.paymentLink,
                }).eq('id', appointment.id)
            } catch (reminderErr) {
                console.error('Failed to schedule reminders after client confirmation:', reminderErr)
            }

            return confirmedAppointment
        }
    } catch (error: any) {
        throw Error(error.message)
    }
}
