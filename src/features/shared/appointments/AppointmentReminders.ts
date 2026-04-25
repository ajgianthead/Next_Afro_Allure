import { checkAppointmentStatus, reminderTask, sendPaymentLink } from "trigger/reminder";
import { DateTime } from "luxon";

export interface ReminderData {
    appointmentId: string;
    start: string; // ISO
    end: string;   // ISO
    serviceName: string;
    businessData: {
        id: string;
        name: string;
        email: string;
        address: string;
    };
    clientData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    settings: {
        clientReminders: { email_1: boolean; email_24: boolean };
        businessReminders: { enabled: boolean; email_1: boolean; email_24: boolean };
    };
}

export interface ScheduledReminderIds {
    business: { hour: string | null; day: string | null };
    client: { hour: string | null; day: string | null };
    paymentCheck: string;
    paymentLink: string;
}

export class AppointmentReminders {
    static async schedule(data: ReminderData): Promise<ScheduledReminderIds> {
        const start = DateTime.fromISO(data.start);
        const end = DateTime.fromISO(data.end);
        const hourBefore = start.minus({ hours: 1 });
        const dayBefore = start.minus({ days: 1 });
        const linkDelay = end.minus({ minutes: 30 });

        const appointmentData = { id: data.appointmentId, start: data.start, end: data.end };
        const { businessData, clientData } = data;
        const { clientReminders, businessReminders } = data.settings;

        const [remindClient_1, remindClient_24] = await Promise.all([
            clientReminders.email_1
                ? reminderTask.trigger(
                    { serviceName: data.serviceName, delay: hourBefore.toISO()!, sendToType: 'client', sendBy: 'email', appointmentData, businessData, clientData },
                    { delay: hourBefore.toISO()! }
                  )
                : null,
            clientReminders.email_24
                ? reminderTask.trigger(
                    { serviceName: data.serviceName, delay: dayBefore.toISO()!, sendToType: 'client', sendBy: 'email', appointmentData, businessData, clientData },
                    { delay: dayBefore.toISO()! }
                  )
                : null,
        ]);

        const [remindBusiness_1, remindBusiness_24] = businessReminders.enabled
            ? await Promise.all([
                businessReminders.email_1
                    ? reminderTask.trigger(
                        { serviceName: data.serviceName, delay: hourBefore.toISO()!, sendToType: 'business', sendBy: 'email', appointmentData, businessData, clientData },
                        { delay: hourBefore.toISO()! }
                      )
                    : null,
                businessReminders.email_24
                    ? reminderTask.trigger(
                        { serviceName: data.serviceName, delay: dayBefore.toISO()!, sendToType: 'business', sendBy: 'email', appointmentData, businessData, clientData },
                        { delay: dayBefore.toISO()! }
                      )
                    : null,
              ])
            : [null, null];

        const timedPaymentLink = await sendPaymentLink.trigger(
            {
                businessData: { id: data.businessData.id, name: data.businessData.name, email: data.businessData.email },
                clientData,
                serviceName: data.serviceName,
                appointmentID: data.appointmentId,
            },
            { delay: linkDelay.toISO()! }
        );

        const paymentCheck = await checkAppointmentStatus.trigger(
            { appointment_id: data.appointmentId },
            { delay: new Date(end.plus({ minutes: 30 }).toISO()!) }
        );

        return {
            business: { hour: remindBusiness_1?.id ?? null, day: remindBusiness_24?.id ?? null },
            client: { hour: remindClient_1?.id ?? null, day: remindClient_24?.id ?? null },
            paymentCheck: paymentCheck.id,
            paymentLink: timedPaymentLink.id,
        };
    }
}
