'use server'

import { createClient } from "@/app/utils/supabase/server"
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders"
import { NotificationType } from "@/lib/notifications/Notification"
import { trackAppointmentBooked, trackAppointmentCancelled } from "../../../../lib/analytics"
import { addCreateNewClient } from "app/dashboard/(other)/clients/actions"
import { DateTime } from "luxon"
import { runs } from "@trigger.dev/sdk/v3"

export const getAppointmentByIdAction = async (id: string) => {
    const supabase = await createClient()
    const { data: appointment, error } = await supabase
        .from('appointments')
        .select('*, business_users(business_name)')
        .eq('id', id)
        .single()
    if (error) throw new Error(error.message)
    return appointment
}

export const cancelClientAppointmentAction = async (
    id: string,
    start: string,
    end: string,
    reasons: string[]
) => {
    const supabase = await createClient()

    // Enforce cancel_day_limit before proceeding
    const { data: apptCheck } = await supabase
        .from('appointments')
        .select('status, policy_id')
        .eq('id', id)
        .single()

    if (apptCheck?.status === 'CANCELLED') {
        throw new Error('This appointment has already been cancelled.')
    }

    if (apptCheck?.policy_id) {
        const { data: policy } = await supabase
            .from('business_policies')
            .select('cancel_day_limit')
            .eq('id', apptCheck.policy_id)
            .single()
        const limit = policy?.cancel_day_limit ?? 0
        if (limit > 0) {
            const daysUntil = DateTime.fromISO(start).diff(DateTime.now(), 'days').days
            if (daysUntil < limit) {
                throw new Error(
                    `Cancellations are not allowed within ${limit} day${limit !== 1 ? 's' : ''} of the appointment.`
                )
            }
        }
    }

    const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'CANCELLED', cancellation_reason: reasons })
        .eq('id', id)
        .select('*, business_users(*)')
        .single()
    if (error) throw new Error(error.message)

    const settings = data.business_users.account_settings as any
    const client_metadata = data.client_metadata as any
    const service_data = data.service_data as any

    const addr = settings?.business_address
    const emailData = {
        clientMetadata: {
            firstName: client_metadata?.firstName,
            lastName: client_metadata?.lastName,
            email: client_metadata?.email,
        },
        businessData: {
            id: data.business,
            name: data.business_users.business_name,
            email: data.business_users.email,
            address: formatBusinessAddress(addr),
        },
        appointmentData: {
            id: data.id,
            start: DateTime.fromISO(data.start).toISO()!,
            end: DateTime.fromISO(data.end).toISO()!,
        },
        serviceName: service_data?.name,
        notifyBusiness: settings?.notifications?.email,
    }

    await AppointmentEmails.sendCancelled(emailData).catch(console.error)

    const { error: notifError } = await supabase.from('notifications').insert({
        body: `${client_metadata?.firstName} just cancelled their appointment on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} @ ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}`,
        title: "‼️Cancelled Appointment Alert‼️",
        read: false,
        business_id: data.business,
        type: NotificationType.CancelledBooking,
        appointment_id: data.id,
    })
    if (notifError) console.error(notifError)

    const reminders = data.reminder_ids as any
    if (reminders?.business?.hour) runs.cancel(reminders.business.hour).catch(console.error)
    if (reminders?.business?.day) runs.cancel(reminders.business.day).catch(console.error)
    if (reminders?.client?.hour) runs.cancel(reminders.client.hour).catch(console.error)
    if (reminders?.client?.day) runs.cancel(reminders.client.day).catch(console.error)
    if (data.payment_link_id) runs.cancel(data.payment_link_id).catch(console.error)
    if (reminders?.paymentCheck) runs.cancel(reminders.paymentCheck).catch(console.error)
    if (reminders?.noShowCheck) runs.cancel(reminders.noShowCheck).catch(console.error)

    trackAppointmentCancelled({
        appointmentType: '',
        businessId: data.business,
        serviceId: service_data?.id,
        serviceName: service_data?.name,
        servicePrice: service_data?.price,
    }).catch(console.error)

    return data
}

export const createAppointmentAction = async (body: {
    business: string
    client_metadata: any
    start: string
    end: string
    status: string
    service_data: any
    policy_id: string
    require_deposit: boolean
    paid_deposit: boolean
    deposit_charge_id: string
    reschedules: number
    deposit_price: number | null
    selected_addons: any[]
}) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('appointments')
        .insert([{
            business: body.business,
            client_metadata: body.client_metadata,
            start: body.start,
            end: body.end,
            status: body.status as any,
            service_data: body.service_data,
            policy_id: body.policy_id,
            require_deposit: body.require_deposit,
            paid_deposit: body.paid_deposit,
            deposit_charge_id: body.deposit_charge_id,
            reschedules: body.reschedules,
            deposit_price: body.deposit_price,
            selected_addons: body.selected_addons,
            amount_due: body.service_data.price,
        }])
        .select('*, business_users(*)')
        .single()
    if (error) throw new Error(error.message)

    const settings = data.business_users.account_settings as any
    const client_metadata = data.client_metadata as any
    const service_data = data.service_data as any

    const addr = settings?.business_address
    const emailData = {
        clientMetadata: {
            firstName: client_metadata?.firstName,
            lastName: client_metadata?.lastName,
            email: client_metadata?.email,
        },
        businessData: {
            id: data.business,
            name: data.business_users.business_name,
            email: data.business_users.email,
            address: formatBusinessAddress(addr),
        },
        appointmentData: {
            id: data.id,
            start: DateTime.fromISO(data.start).toISO()!,
            end: DateTime.fromISO(data.end).toISO()!,
        },
        serviceName: service_data?.name,
        notifyBusiness: settings?.notifications?.email,
    }

    try {
        if (data.status === 'PENDING') {
            await AppointmentEmails.sendPendingConfirmation(emailData)
            const { error: notifError } = await supabase.from('notifications').insert({
                body: `${client_metadata?.firstName} ${client_metadata?.lastName} just booked ${service_data?.name} on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} at ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}.`,
                title: 'New Booking Request',
                read: false,
                business_id: data.business,
                type: NotificationType.NewBooking,
                appointment_id: data.id,
            })
            if (notifError) console.error('Failed to insert new-booking notification:', notifError)
        } else if (data.status === 'CONFIRMED') {
            await AppointmentEmails.sendConfirmed(emailData)
            const { error: notifError } = await supabase.from('notifications').insert({
                body: `${client_metadata?.firstName} ${client_metadata?.lastName} just booked ${service_data?.name} on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} at ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}.`,
                title: 'New Booking',
                read: false,
                business_id: data.business,
                type: NotificationType.NewBooking,
                appointment_id: data.id,
            })
            if (notifError) console.error('Failed to insert new-booking notification:', notifError)
            const ids = await AppointmentReminders.schedule({
                appointmentId: data.id,
                start: DateTime.fromISO(data.start).toISO()!,
                end: DateTime.fromISO(data.end).toISO()!,
                serviceName: service_data?.name,
                businessData: {
                    id: data.business,
                    name: data.business_users.business_name,
                    email: data.business_users.email,
                    address: formatBusinessAddress(addr),
                },
                clientData: {
                    firstName: client_metadata?.firstName,
                    lastName: client_metadata?.lastName,
                    email: client_metadata?.email,
                    phoneNumber: client_metadata?.phoneNumber,
                },
                settings: {
                    clientReminders: { email_1: settings?.app_reminders?.email_1, email_24: settings?.app_reminders?.email_24 },
                    businessReminders: { enabled: settings?.notifications?.email, email_1: settings?.notifications?.email_1, email_24: settings?.notifications?.email_24 },
                },
            })
            await supabase.from('appointments').update({
                reminder_ids: {
                    business: { hour: ids.business.hour, day: ids.business.day },
                    client: { hour: ids.client.hour, day: ids.client.day },
                    paymentCheck: ids.paymentCheck,
                    noShowCheck: ids.noShowCheck,
                },
                payment_link_id: ids.paymentLink,
            }).eq('id', data.id)
        }
    } catch (err) {
        console.error('Post-create side effects failed:', err)
    }

    trackAppointmentBooked({
        businessId: data.business,
        serviceId: service_data?.id,
        serviceName: service_data?.name,
        servicePrice: service_data?.price,
        appointmentType: '',
    }).catch(console.error)

    addCreateNewClient({
        first_name: client_metadata?.firstName,
        last_name: client_metadata?.lastName,
        email: client_metadata?.email,
        phone_number: client_metadata?.phoneNumber,
    }, data.business).catch(console.error)

    return data
}

export const getBusinessByIdAction = async (businessId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_users')
        .select('*')
        .eq('business_id', businessId)
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const getPolicyByIdAction = async (policyId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_policies')
        .select('*')
        .eq('id', policyId)
        .single()
    if (error) throw new Error(error.message)
    return data
}
