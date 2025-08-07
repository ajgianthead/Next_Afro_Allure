import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";
import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js";
import { data } from "@tailus-ui/visualizations/data";
import { sendBusinessBookingNoti } from "../../../../lib/notifications";
import { Resend } from "resend";
import ConfirmAppointmentTemplate from "../../../../emails/confirm-appointment";
import { checkAppointmentStatus, reminderTask, sendPaymentLink } from "trigger/reminder";
import { DateTime } from "luxon";
import AppointmentConfirmed from "../../../../emails/appointment-confirmed";
import NewAppointment from "../../../../emails/new-appointment";
import AppointmentRescheduled from "../../../../emails/appointment-rescheduled";
import RescheduledAppointment from "../../../../emails/rescheduled-appointment";
import AppointmentCancelled from "../../../../emails/appointment-cancelled";
import CancelledAppointment from "../../../../emails/cancelled-appointment";
import { runs } from "@trigger.dev/sdk/v3";
import { trackAppointmentBooked, trackAppointmentCancelled, trackAppointmentRescheduled } from "../../../../lib/analytics";


const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);


const sendRescheduledEmails = async (data: any) => {
    const res = data
    await resend.emails.send({
        from: 'notifications <noreply@reminder.afroallure.co>',
        to: res.client_metadata?.email,
        subject: "Appointment Rescheduled",
        react: AppointmentRescheduled({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromJSDate(res.start).toISO()!,
                end: DateTime.fromJSDate(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    })
    await resend.emails.send({
        from: 'Booking Alert <noreply@reminder.afroallure.co>',
        to: res?.business_users.email!,
        subject: "Booking Alert",
        react: RescheduledAppointment({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromJSDate(res.start).toISO()!,
                end: DateTime.fromJSDate(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    });
}
export const sendConfirmationEmail = async (data: any) => {
    const res = data
    await resend.emails.send({
        from: 'notifications <noreply@reminder.afroallure.co>',
        to: res.client_metadata?.email,
        subject: "Appointment Confirmed",
        react: AppointmentConfirmed({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromISO(res.start).toISO()!,
                end: DateTime.fromISO(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    })
    await resend.emails.send({
        from: 'Booking Alert <noreply@reminder.afroallure.co>',
        to: res?.business_users.email!,
        subject: "Booking Alert",
        react: NewAppointment({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromISO(res.start).toISO()!,
                end: DateTime.fromISO(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    });
}

export const sendCancelledEmails = async (data: any) => {
    const res = data
    await resend.emails.send({
        from: 'notifications <noreply@reminder.afroallure.co>',
        to: res.client_metadata?.email,
        subject: "Appointment Cancelled",
        react: AppointmentCancelled({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromJSDate(res.start).toISO()!,
                end: DateTime.fromJSDate(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    })
    await resend.emails.send({
        from: 'Booking Alert <noreply@reminder.afroallure.co>',
        to: res?.business_users.email!,
        subject: "Booking Alert",
        react: CancelledAppointment({
            socials: {
                facebook: "",
                instagram: "",
                twitter: ""
            },
            clientData: {
                firstName: res.client_metadata.firstName,
                lastName: res.client_metadata.lastName,
            },
            businessData: {
                id: res.business,
                name: res.business_users.business_name,
                businessAddress: "2800 SW 35th Place, Gainesville, FL"
            },
            appointmentData: {
                id: res.id,
                start: DateTime.fromJSDate(res.start).toISO()!,
                end: DateTime.fromJSDate(res.end).toISO()!
            },
            serviceName: res.service_data.name
        }),
    });
}
const sendReminders = async (res: any) => {
    const supabase = createClient<Database>();
    const dayBefore = DateTime.fromJSDate(res.start).minus({ day: 1 })
    const remindClient = await reminderTask.trigger({
        serviceName: res.service_data.name,
        delay: dayBefore.toISO()!,
        sendToType: 'client',
        sendBy: 'email',
        appointmentData: {
            id: res.id,
            start: DateTime.fromJSDate(res.start).toISO()!,
            end: DateTime.fromJSDate(res.end).toISO()!,
        },
        businessData: {
            id: res.business,
            name: res.business_name,
            email: res.email,
            address: "2800 SW 35th Place, Gainesville, FL",
        },
        clientData: {
            firstName: res.client_metadata.firstName,
            lastName: res.client_metadata.lastName,
            email: res.client_metadata.email,
            phoneNumber: res.client_metadata.phoneNumber,
        },
    }, { delay: new Date(dayBefore.toISO()!) })
    const remindBusiness = await reminderTask.trigger({
        serviceName: res.service_data.name,
        delay: dayBefore.toISO()!,
        sendToType: 'business',
        sendBy: 'email',
        appointmentData: {
            id: res.id,
            start: DateTime.fromJSDate(res.start).toISO()!,
            end: DateTime.fromJSDate(res.end).toISO()!,
        },
        businessData: {
            id: res.business,
            name: res.business_name,
            email: res.email,
            address: "2800 SW 35th Place, Gainesville, FL",
        },
        clientData: {
            firstName: res.client_metadata.firstName,
            lastName: res.client_metadata.lastName,
            email: res.client_metadata.email,
            phoneNumber: res.client_metadata.phoneNumber,
        },
    }, { delay: new Date(dayBefore.toISO()!) })
    const linkDelay = DateTime.fromISO(res.end).minus({ minutes: 30 })
    const timedPaymentLink = await sendPaymentLink.trigger({
        businessData: {
            id: res.business,
            name: res.business_name,
            email: res.email,
        },
        clientData: {
            firstName: res.client_metadata.firstName,
            lastName: res.client_metadata.lastName,
            email: res.client_metadata.email,
            phoneNumber: res.client_metadata.phoneNumber,
        },
        serviceName: res.service_data.name,
        appointmentID: res.id
    }, { delay: new Date(linkDelay.toISO()!) })
    const afterAppointmentPaymentCheck = await checkAppointmentStatus.trigger({ appointment_id: res.id }, {
        delay: new Date(DateTime.fromISO(res.end).plus({ minutes: 30 }).toISO()!)
    })
    // Save run id to appointment for later
    await supabase.from('appointments').update({
        reminder_ids: {
            business: remindBusiness.id,
            client: remindClient.id,
            paymentCheck: afterAppointmentPaymentCheck.id
        },
        payment_link_id: timedPaymentLink.id
    }).eq('id', res.id)
}

// Edit an appointment
export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();

    // I dont know man??
    const { id, start, end, status, reason } = await request.json();
    const res = await supabase.from('appointments').select('status').eq('id', id).single()
    if (!res.data) {
        return new NextResponse(JSON.stringify({ data: "Appointment doesn't exist" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    if (res.data?.status === "CANCELLED") {
        return new NextResponse(JSON.stringify({ data: "Appointment is already cancelled" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    const { data, error }: { data: any, error: any } = await supabase.from('appointments').update(
        {
            start: start,
            end: end,
            updated_at: new Date().toISOString(),
            status: status,
            cancellation_reason: status === "CANCELLED" ? reason : null
        }
    ).eq('id', id).select("*, business_users(business_name, email)").single();

    // Send email based on editting action
    if (res.data?.status === 'CONFIRMED' && data?.status === 'CONFIRMED') { // Client changed their appointment time and/or date
        await sendRescheduledEmails(data)
        await supabase.from('notifications').insert({
            body: `${data.client_metadata.firstName} just rescheduled on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} @ ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}`,
            title: "‼️Reschedule Alert‼️",
            read: false,
            business_id: data.business,
            type: 'rescheduled-booking',
            appointment_id: data.id
        })

        // Edit scheduled reminders
        const dayBefore = DateTime.fromISO(data.start).minus({ day: 1 })
        const thirtyBefore = DateTime.fromISO(data.end).minus({ minutes: 30 })
        await runs.reschedule(data.reminder_ids.business, { delay: new Date(dayBefore.toISO()!) })
        await runs.reschedule(data.reminder_ids.client, { delay: new Date(dayBefore.toISO()!) })
        await trackAppointmentRescheduled({
            appointmentType: "",
            businessId: data.business,
            serviceId: data.service_data.id,
            serviceName: data.service_data.name,
            servicePrice: data.service_data.price
        })
        await runs.reschedule(data.payment_link_id, { delay: new Date(thirtyBefore.toISO()!) })
        await runs.reschedule(data.reminder_ids.paymentCheck, { delay: new Date(DateTime.fromISO(data.end).plus({ minutes: 30 }).toISO()!) })
    } else if (data?.status === 'CANCELLED') { // Appointment was cancelled
        // Cancel reminders for business and client
        await sendCancelledEmails(data)
        await supabase.from('notifications').insert({
            body: `${data.client_metadata.firstName} just cancelled their appointment on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} @ ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}`,
            title: "‼️Cancelled Appointment Alert‼️",
            read: false,
            business_id: data.business,
            type: 'cancelled-booking',
            appointment_id: data.id
        })
        await runs.cancel(data.reminder_ids.business)
        await runs.cancel(data.reminder_ids.client)
        await runs.cancel(data.payment_link_id)
        await runs.cancel(data.reminder_ids.paymentCheck)
        await trackAppointmentCancelled({
            appointmentType: "",
            businessId: data.business,
            serviceId: data.service_data.id,
            serviceName: data.service_data.name,
            servicePrice: data.service_data.price
        })
    }
    else {
        await sendConfirmationEmail(data)
        await supabase.from('notifications').insert({
            body: `You have an appointment with ${data.client_metadata.firstName} on ${DateTime.fromISO(data.start).toFormat('LLLL dd, yyyy')} @ ${DateTime.fromISO(data.start).toLocaleString(DateTime.TIME_SIMPLE)}`,
            title: "‼️New Booking Alert‼️",
            read: false,
            business_id: data.business,
            type: 'new-booking',
            appointment_id: data.id
        })
        // Set reminders
        await sendReminders(data)
        // Track Appointment Data
        await trackAppointmentBooked({
            businessId: data.business,
            serviceName: data.service_data.name,
            serviceId: data.service_data.id,
            servicePrice: data.service_data.price,
            appointmentType: ""
        })

    }

    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}

// Create an appointment
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();

    const { business, client_metadata, start, end, service_data, status, require_deposit, policy_id, paid_deposit, deposit_charge_id, reschedules, deposit_price, addons } = await request.json();
    const { data, error } = await supabase.from('appointments').insert([
        {
            business: business,
            client_metadata: client_metadata,
            start: start,
            end: end,
            status: status,
            client: null,
            service_data: service_data,
            policy_id: policy_id,
            require_deposit: require_deposit,
            paid_deposit: paid_deposit,
            deposit_charge_id: deposit_charge_id,
            reschedules: reschedules,
            deposit_price: deposit_price,
            selected_addons: addons,
            amount_due: service_data.price
        }
    ]).select("*,business_users(business_name, email)")
    if (data?.length) {
        const res: any = data[0]
        try {
            if (res.status === 'PENDING') {
                await resend.emails.send({
                    from: 'confirm-appointment <noreply@reminder.afroallure.co>',
                    to: res?.client_metadata.email!,
                    subject: "Confirm Appointment",
                    react: ConfirmAppointmentTemplate({
                        socials: {
                            facebook: "",
                            instagram: "",
                            twitter: ""
                        },
                        clientData: {
                            firstName: res.client_metadata.firstName,
                            lastName: res.client_metadata.lastName,
                        },
                        businessData: {
                            id: res.business,
                            name: res.business_users.business_name,
                            businessAddress: "2800 SW 35th Place, Gainesville, FL"
                        },
                        appointmentData: {
                            id: res.id,
                            start: res.start,
                            end: res.end
                        },
                        serviceName: res.service_data.name
                    }),
                });
            }
            if (res.status === 'CONFIRMED') {
                sendConfirmationEmail(res)
                // Set reminders
                await sendReminders(res)
            }
        } catch (error) {
            return new NextResponse(JSON.stringify({ error: error }), {
                headers: { 'Content-Type': 'application/json' },
                status: 400
            })
        }

    }
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
