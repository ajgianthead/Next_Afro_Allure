'use server'

import { createClient } from "@/app/utils/supabase/server"
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders"
import { NotificationType } from "@/lib/notifications/Notification"
import { trackAppointmentBooked, trackAppointmentCancelled } from "../../../../lib/analytics"
import { isClientBannedFromBusiness } from "app/dashboard/(other)/clients/actions"
import { upsertBusinessClientAsAdmin } from "@/features/shared/clients/upsertBusinessClient"
import { scheduleAndStoreReminders } from "@/features/shared/appointments/confirmation"
import { DateTime } from "luxon"
import { resolveTimezone } from "@/lib/timezone"

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
        body: `${client_metadata?.firstName} just cancelled their appointment on ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toFormat('LLLL dd, yyyy')} @ ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toLocaleString(DateTime.TIME_SIMPLE)}`,
        title: "‼️Cancelled Appointment Alert‼️",
        read: false,
        business_id: data.business,
        type: NotificationType.CancelledBooking,
        appointment_id: data.id,
    })
    if (notifError) console.error(notifError)

    await AppointmentReminders.cancelAll(data.reminder_ids, data.payment_link_id)

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
    const isBanned = await isClientBannedFromBusiness(
        body.client_metadata?.email,
        body.client_metadata?.phoneNumber,
        body.business
    )
    if (isBanned) throw new Error('This business is not accepting bookings from you.')

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
                body: `${client_metadata?.firstName} ${client_metadata?.lastName} just booked ${service_data?.name} on ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toFormat('LLLL dd, yyyy')} at ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toLocaleString(DateTime.TIME_SIMPLE)}.`,
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
                body: `${client_metadata?.firstName} ${client_metadata?.lastName} just booked ${service_data?.name} on ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toFormat('LLLL dd, yyyy')} at ${DateTime.fromISO(data.start).setZone(resolveTimezone(settings?.timezone)).toLocaleString(DateTime.TIME_SIMPLE)}.`,
                title: 'New Booking',
                read: false,
                business_id: data.business,
                type: NotificationType.NewBooking,
                appointment_id: data.id,
            })
            if (notifError) console.error('Failed to insert new-booking notification:', notifError)
            await scheduleAndStoreReminders(supabase, {
                id: data.id,
                start: DateTime.fromISO(data.start).toISO()!,
                end: DateTime.fromISO(data.end).toISO()!,
                serviceName: service_data?.name,
                clientMetadata: {
                    firstName: client_metadata?.firstName,
                    lastName: client_metadata?.lastName,
                    email: client_metadata?.email,
                    phoneNumber: client_metadata?.phoneNumber,
                },
            }, {
                id: data.business,
                name: data.business_users.business_name,
                email: data.business_users.email,
                accountSettings: settings,
                completedStripeOnboarding: !!data.business_users.completed_stripe_onboarding,
            })
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

    // Public booking path — no business session, so use the service-role helper.
    await upsertBusinessClientAsAdmin({
        first_name: client_metadata?.firstName,
        last_name: client_metadata?.lastName,
        email: client_metadata?.email,
        phone_number: client_metadata?.phoneNumber,
    }, data.business)

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
