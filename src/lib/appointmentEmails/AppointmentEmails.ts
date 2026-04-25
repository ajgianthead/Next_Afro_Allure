import type { JSX } from "react";
import { Resend } from "resend";
import AppointmentConfirmed from "../../../emails/appointment-confirmed";
import NewAppointment from "../../../emails/new-appointment";
import AppointmentRescheduled from "../../../emails/appointment-rescheduled";
import RescheduledAppointment from "../../../emails/rescheduled-appointment";
import AppointmentCancelled from "../../../emails/appointment-cancelled";
import CancelledAppointment from "../../../emails/cancelled-appointment";
import ConfirmAppointmentTemplate from "../../../emails/confirm-appointment";
import EOAReceiptEmail from "../../../emails/eoa-receipt";

const FROM_NOTIFICATION = 'notifications <noreply@reminder.afroallure.co>';
const FROM_BOOKING_ALERT = 'Booking Alert <noreply@reminder.afroallure.co>';
const SOCIALS = { instagram: 'https://instagram.com/afroallure_' };

export interface AppointmentEmailData {
    clientMetadata: {
        firstName: string;
        lastName: string;
        email: string;
    };
    businessData: {
        id: string;
        name: string;
        email: string;
        address: string;
    };
    appointmentData: {
        id: string;
        start: string;
        end: string;
    };
    serviceName: string;
    notifyBusiness: boolean;
}

export function formatBusinessAddress(addr: {
    no_address?: boolean;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
}): string {
    if (addr.no_address) return 'No business address';
    return `${addr.line_1}, ${addr.line_2}, ${addr.city}, ${addr.state} ${addr.zip_code}`;
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function trySend(opts: Parameters<typeof resend.emails.send>[0]): Promise<void> {
    for (let attempt = 0; attempt < 2; attempt++) {
        const { error } = await resend.emails.send(opts);
        if (!error) return;
        if (attempt === 1) throw new Error(error.message);
    }
}

function buildEmailProps(data: AppointmentEmailData) {
    return {
        socials: SOCIALS,
        clientData: { firstName: data.clientMetadata.firstName, lastName: data.clientMetadata.lastName },
        businessData: { id: data.businessData.id, name: data.businessData.name, businessAddress: data.businessData.address },
        appointmentData: { id: data.appointmentData.id, start: data.appointmentData.start, end: data.appointmentData.end },
        serviceName: data.serviceName,
    };
}

export class AppointmentEmails {
    static async sendConfirmed(data: AppointmentEmailData): Promise<void> {
        const props = buildEmailProps(data);
        await trySend({ from: FROM_NOTIFICATION, to: data.clientMetadata.email, subject: 'Appointment Confirmed', react: AppointmentConfirmed(props) });
        if (data.notifyBusiness) {
            await trySend({ from: FROM_BOOKING_ALERT, to: data.businessData.email, subject: 'Booking Alert', react: NewAppointment(props) });
        }
    }

    static async sendRescheduled(data: AppointmentEmailData): Promise<void> {
        const props = buildEmailProps(data);
        await trySend({ from: FROM_NOTIFICATION, to: data.clientMetadata.email, subject: 'Appointment Rescheduled', react: AppointmentRescheduled(props) });
        if (data.notifyBusiness) {
            await trySend({ from: FROM_BOOKING_ALERT, to: data.businessData.email, subject: 'Booking Alert', react: RescheduledAppointment(props) });
        }
    }

    static async sendCancelled(data: AppointmentEmailData): Promise<void> {
        const props = buildEmailProps(data);
        await trySend({ from: FROM_NOTIFICATION, to: data.clientMetadata.email, subject: 'Appointment Cancelled', react: AppointmentCancelled(props) });
        if (data.notifyBusiness) {
            await trySend({ from: FROM_BOOKING_ALERT, to: data.businessData.email, subject: 'Booking Alert', react: CancelledAppointment(props) });
        }
    }

    static async sendEOAReceipt(data: AppointmentEmailData & { amountPaid: number }): Promise<void> {
        const props = { ...buildEmailProps(data), amountPaid: data.amountPaid };
        await trySend({
            from: FROM_NOTIFICATION,
            to: data.clientMetadata.email,
            subject: 'Payment Received — Appointment Receipt',
            react: EOAReceiptEmail(props),
        });
    }

    static async sendPendingConfirmation(data: AppointmentEmailData): Promise<void> {
        await trySend({
            from: 'confirm-appointment <noreply@reminder.afroallure.co>',
            to: data.clientMetadata.email,
            subject: 'Confirm Appointment',
            react: ConfirmAppointmentTemplate(buildEmailProps(data)),
        });
    }

    /** Legacy raw send — prefer the typed methods above for appointment emails. */
    static async send(resendClient: Resend, template: JSX.Element, subject: string, email: string): Promise<string | undefined> {
        const { data, error } = await resendClient.emails.send({
            from: FROM_NOTIFICATION,
            to: email,
            subject,
            react: template,
        });
        if (error) throw new Error(error.message);
        return data?.id;
    }
}

/** @deprecated Use AppointmentEmails */
export const Email = AppointmentEmails;
