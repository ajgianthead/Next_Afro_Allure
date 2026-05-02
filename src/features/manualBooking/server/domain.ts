import { createClient } from "@/app/utils/supabase/server"
import { Resend } from "resend"
import { Appointment } from "./models/Appointment"
import { Service } from "@/lib/service/Service"
import { Addon } from "@/lib/addons/AddOn"
import { BusinessPolicy, Type } from "@/lib/businessPolicy/BusinessPolicy"
import { BusinessUser } from "@/lib/businessUser/BusinessUser"
import { stripe } from "@/lib/stripe/stripeClient"
import { convertInputToDateTime } from "./utils/convertInputToDateTime"
import { AppointmentData, AppointmentEvent } from "../types"
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders"
import { formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails"
import { runs } from "@trigger.dev/sdk/v3"


export const rescheduleAppointment = async (appointmentData: {
    start: string
    end: string
    date: Date
    appointmentId: string
}) => {
    const supabase = await createClient()
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { startDateToDateTime, endDateToDateTime } = convertInputToDateTime(appointmentData.date, appointmentData.start, appointmentData.end)

    const appointment = await Appointment.fetchById(supabase, appointmentData.appointmentId)

    if (!Array.isArray(appointment)) {
        const rescheduledAppointment = await appointment.reschedule(supabase, {
            start: startDateToDateTime.toISO()!,
            end: endDateToDateTime.toISO()!
        })
        if (!Array.isArray(rescheduledAppointment)) {
            try {
                await rescheduledAppointment.sendBusinessRescheduleEmail(resend, supabase)
                await rescheduledAppointment.sendClientRescheduleEmail(resend, supabase)
            } catch (emailErr) {
                console.error('Failed to send reschedule emails:', emailErr)
            }
        }
        return rescheduledAppointment
    }
}
export const confirmAppointment = async (appointmentId: string, depositChargeId: string) => {
    const supabase = await createClient()
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appointment = await Appointment.fetchById(supabase, appointmentId)

    if (!Array.isArray(appointment)) {
        const business = await BusinessUser.fetch(supabase, appointment.businessId)

        if (!appointment.requireDeposit) {
            await appointment.changeStatus(supabase, 'CONFIRMED')
        } else {
            const paymentData = await stripe.paymentIntents.retrieve(depositChargeId, {
                stripeAccount: business.stripeAccountId
            })
            await appointment.confirmAppointment(supabase, paymentData.amount)
        }
        try {
            await appointment.sendBusinessConfirmationEmail(resend, supabase)
            await appointment.sendClientConfirmationEmail(resend, supabase)
        } catch (emailErr) {
            console.error('Failed to send confirmation emails:', emailErr)
        }

        // Schedule reminders — non-critical, must not throw back to caller
        try {
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
        } catch (err) {
            console.error('Failed to schedule reminders after manual confirmation:', err)
        }
    }
}
export const updateAppointmentStatus = async () => { }


export const createNewManualAppointment = async (appointmentData: AppointmentData) => {
    const supabase = await createClient()
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { startDateToDateTime, endDateToDateTime } = convertInputToDateTime(appointmentData.date, appointmentData.start, appointmentData.end)
    let addOns: {
        id: string,
        name: string,
        price: number
    }[] = []
    try {
        const selectedService = await Service.fetchById(supabase, appointmentData.serviceId)
        if (Array.isArray(selectedService)) throw new Error('Service not found')

        const fetchedAddons = await Addon.fetchByIds(supabase, appointmentData.selectedAddons)
        addOns = fetchedAddons.map(a => ({ id: a.id, name: a.name, price: a.price }))

        let addonPriceTotal = 0
        addOns.forEach((addon) => {
            addonPriceTotal += addon.price
        })
        const totalPrice = selectedService.price + addonPriceTotal
        const policy = await BusinessPolicy.fetch(supabase, selectedService.business)
        let depositPrice = 0;
        if (policy.deposit.enabled) {
            if (policy.deposit.settings.type === Type.FLAT) {
                depositPrice = policy.deposit.settings.value
            } else {
                depositPrice = (policy.deposit.settings.value / 100) * totalPrice
            }
        }

        // Overlap check — reject if a CONFIRMED or PENDING appointment already occupies this slot
        const startISO = startDateToDateTime.toISO()!
        const endISO = endDateToDateTime.toISO()!
        const { data: conflicts, error: conflictError } = await supabase
            .from('appointments')
            .select('id')
            .eq('business', selectedService.business)
            .in('status', ['CONFIRMED', 'PENDING'])
            .lt('start', endISO)
            .gt('end', startISO)
        if (conflictError) throw new Error(conflictError.message)
        if (conflicts && conflicts.length > 0) {
            throw new Error('This time slot conflicts with an existing appointment.')
        }

        const appointment = await Appointment.create(supabase, selectedService.business, {
            client_metadata: appointmentData.clientData, start: startISO, end: endISO, service_data: selectedService, status: 'PENDING', require_deposit: appointmentData.deposit, paid_deposit: false, deposit_charge_id: "", reschedules: policy.rescheduleLimit, deposit_price: depositPrice, selected_addons: addOns, substraction: policy.deposit.settings.subtraction
        })
        if (Array.isArray(appointment)) throw new Error('Unexpected: appointment creation returned multiple results')

        try {
            await appointment.sendConfirmAppointmentEmail(resend, supabase)
        } catch (emailErr) {
            console.error('Failed to send new appointment email:', emailErr)
        }
        const appointmentEvent: AppointmentEvent = {
            id: appointment.id,
            start: new Date(appointment.start),
            title: `${appointment.serviceData.name} with ${appointment.clientMetadata.firstName}`,
            end: new Date(appointment.end),
            clientData: {
                ...appointment.clientMetadata
            },
            serviceData: {
                id: appointment.serviceData.id,
                name: appointment.serviceData.name,
                business: appointment.businessId,
                description: appointment.serviceData.description,
                length: appointment.serviceData.length,
                price: appointment.serviceData.price,
                photo_url: appointment.serviceData.photo_url,
                imagePath: appointment.serviceData.imagePath,
                addons: appointment.serviceData.addons,
                categories: appointment.serviceData.categories,
                availability: appointment.serviceData.availability,
            },
            status: appointment.status,
            depositPrice: appointment.depositPrice,
            paidDeposit: appointment.paidDeposit,
            amountDue: appointment.amountDue,
            requiresDeposit: appointment.requireDeposit
        }
        return appointmentEvent
    } catch (error: any) {
        throw Error(error.message)
    }


}

export const cancelAppointment = async (appointmentId: string) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Fetch reminder/payment-link IDs before cancelling so we can stop scheduled jobs
    const { data: apptMeta } = await supabase
        .from('appointments')
        .select('reminder_ids, payment_link_id')
        .eq('id', appointmentId)
        .single()

    const appointment = await Appointment.fetchById(supabase, appointmentId)
    if (!Array.isArray(appointment)) {
        if (appointment.businessId !== user.id) throw new Error('Unauthorized')

        const cancelledAppointment = await appointment.cancel(supabase)
        if (!Array.isArray(cancelledAppointment)) {
            try {
                await cancelledAppointment.sendBusinessCancellationEmail(resend, supabase)
                await cancelledAppointment.sendClientCancellationEmail(resend, supabase)
            } catch (emailErr) {
                console.error('Failed to send cancellation emails:', emailErr)
            }

            // Cancel scheduled Trigger.dev reminder jobs — fire-and-forget, non-critical
            const reminders = apptMeta?.reminder_ids as any
            if (reminders?.business?.hour) runs.cancel(reminders.business.hour).catch(console.error)
            if (reminders?.business?.day) runs.cancel(reminders.business.day).catch(console.error)
            if (reminders?.client?.hour) runs.cancel(reminders.client.hour).catch(console.error)
            if (reminders?.client?.day) runs.cancel(reminders.client.day).catch(console.error)
            if (apptMeta?.payment_link_id) runs.cancel(apptMeta.payment_link_id).catch(console.error)
            if (reminders?.paymentCheck) runs.cancel(reminders.paymentCheck).catch(console.error)

            return cancelledAppointment
        }
    }
}
