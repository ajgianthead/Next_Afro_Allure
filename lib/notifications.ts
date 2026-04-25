import { createClient } from "@/app/utils/supabase/server";
import { Resend } from "resend";
import { Database } from "./database.types";
import NewAppointment from "../emails/new-appointment";
import RescheduledAppointment from "../emails/rescheduled-appointment";
import CancelledAppointment from "../emails/cancelled-appointment";
import AppointmentConfirmed from "../emails/appointment-confirmed";
import AppointmentRescheduled from "../emails/appointment-rescheduled";
import AppointmentCancelled from "../emails/appointment-cancelled";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const supabase = await createClient<Database>();

export type AppointmentNotiData = {
    serviceName: string;
    sendTo: string;
    type: string;
    sendBy: string;
    businessData: {
        id: string;
        name: string;
        email: string;
        address: string;
    }
    appointmentId: string;
    start: string;
    end: string;
    clientData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    }
}

const sendSystemNoti = async (appointmentData: AppointmentNotiData, type: string) => {
    await supabase.from('notifications').insert({
        business_id: appointmentData.businessData.id,
        title: 'New Appointment!',
        body: `${appointmentData.clientData.firstName} just booked with you on DATE @ TIME`,
        type: 'booking-alert'
    })
}


type TemplateMap = {
    [key: string]: {
        title: string;
        template: JSX.Element
    }
}

const sendEmail = async (data: AppointmentNotiData) => {
    const templateData = {
        socials: {
            facebook: 'https://facebooks.com',
            instagram: 'https://instagram.com',
            twitter: 'https://x.com'
        },
        serviceName: data.serviceName,
        clientData: {
            firstName: data.clientData.firstName,
            lastName: data.clientData.lastName,
        },
        businessData: {
            id: data.businessData.id,
            name: data.businessData.name,
        },
        appointmentData: {
            start: data.start,
            end: data.end,
            id: data.appointmentId
        }
    }
    const templateMap: TemplateMap = {
        // Send to client
        'appointment_confirmed': {
            title: "Appointment Confirmed 🎉",
            template: AppointmentConfirmed(templateData)
        },
        'appointment_rescheduled': {
            title: "Appointment Rescheduled! ✅",
            template: AppointmentRescheduled(templateData)
        },
        'appointment_cancelled': {
            title: "Appointment Canceled ❌",
            template: AppointmentCancelled(templateData)
        },
        // Send to business
        'confirmed_appointment': {
            title: "‼️New Booking Alert‼️",
            template: NewAppointment(templateData)
        },
        'rescheduled_appointment': {
            title: "‼️Reschedule Alert‼️",
            template: RescheduledAppointment(templateData)
        },
        'cancelled_appointment': {
            title: "‼️Cancelled Appointment Alert‼️",
            template: CancelledAppointment(templateData)
        },

    }
    try {
        const { error } = await resend.emails.send({
            from: 'booking-notification <noreply@notification.afroallure.co>',
            to: data.sendTo === 'business' ? data.businessData.email : data.clientData.email,
            subject: templateMap[data.type].title,
            react: templateMap[data.type].template,
        });
        if (error) {

            return error;
        }
    } catch (error) {
        return error
    }
}
const sendEmailOrPhone = async (appointmentData: AppointmentNotiData) => {
    if (appointmentData.sendBy === 'email') {
        await sendEmail(appointmentData)
    } else if (appointmentData.sendBy === 'phone') {
        // Send via phone #
    } else {
        // Send both
        await sendEmail(appointmentData)
    }
}

export const sendBusinessBookingNoti = async (appointmentData: AppointmentNotiData) => {
    if (appointmentData.type === 'confirmed_appointment') {
        // Send via system
        await supabase.from('notifications').insert({
            business_id: appointmentData.businessData.id,
            title: 'New Appointment!',
            body: `${appointmentData.clientData.firstName} just booked with you on DATE @ TIME`,
            type: 'booking-alert'
        })
    } else if (appointmentData.type === 'rescheduled_appointment') {
        // Send via system
        await supabase.from('notifications').insert({
            business_id: appointmentData.businessData.id,
            title: 'Appointment Rescheduled!',
            body: `${appointmentData.clientData.firstName} just rescheduled their appointment to DATE @ TIME`,
            type: 'booking-alert'
        })
    } else if (appointmentData.type === 'cancelled_appointment') {
        // Send via system
        await supabase.from('notifications').insert({
            business_id: appointmentData.businessData.id,
            title: 'New Appointment!',
            body: `${appointmentData.clientData.firstName} just cancelled their appointment on DATE @ TIME`,
            type: 'booking-alert'
        })
    }
    await sendEmailOrPhone(appointmentData)
}

const sendClientBookingNoti = async (appointmentData: AppointmentNotiData) => {
    await sendEmailOrPhone(appointmentData)
}
