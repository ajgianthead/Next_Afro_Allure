import { checkAppointmentStatus, checkNoShowTask, reminderTask, sendPaymentLink } from "trigger/reminder";
import { runs } from "@trigger.dev/sdk";
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
    /** Whether the business finished Stripe onboarding. No payment link is sent otherwise. */
    canTakeOnlinePayments: boolean;
}

export interface ScheduledReminderIds {
    business: { hour: string | null; day: string | null };
    client: { hour: string | null; day: string | null };
    paymentCheck: string | null;
    paymentLink: string | null;
    noShowCheck: string | null;
    /** The 24h and 48h follow-up payment checks. */
    paymentFollowUps: string[];
}

/** Builds the reminder settings from a business's account_settings JSON. Missing values mean "off". */
export function reminderSettingsFrom(accountSettings: any): ReminderData['settings'] {
    return {
        clientReminders: {
            email_1: accountSettings?.app_reminders?.email_1 === true,
            email_24: accountSettings?.app_reminders?.email_24 === true,
        },
        businessReminders: {
            enabled: accountSettings?.notifications?.email === true,
            email_1: accountSettings?.notifications?.email_1 === true,
            email_24: accountSettings?.notifications?.email_24 === true,
        },
    };
}

// One failed trigger (e.g. Trigger.dev unreachable) shouldn't drop every other job.
async function safe<T extends { id: string }>(label: string, fn: () => Promise<T>): Promise<string | null> {
    try {
        return (await fn()).id;
    } catch (err) {
        console.error(`Failed to schedule ${label}:`, err);
        return null;
    }
}

export class AppointmentReminders {
    static async schedule(data: ReminderData): Promise<ScheduledReminderIds> {
        const now = DateTime.now();
        const start = DateTime.fromISO(data.start);
        const end = DateTime.fromISO(data.end);
        const hourBefore = start.minus({ hours: 1 });
        const dayBefore = start.minus({ days: 1 });
        const linkDelay = end.minus({ minutes: 30 });

        const appointmentData = { id: data.appointmentId, start: data.start, end: data.end };
        const { businessData, clientData } = data;
        const { clientReminders, businessReminders } = data.settings;

        // A reminder whose send time has already passed (e.g. a 24h reminder
        // for a same-day appointment) would fire immediately — skip it.
        const reminder = (enabled: boolean, kind: 'hour' | 'day', sendToType: 'client' | 'business') => {
            const at = kind === 'hour' ? hourBefore : dayBefore;
            if (!enabled || at <= now) return Promise.resolve(null);
            return safe(`${sendToType} ${kind} reminder`, () => reminderTask.trigger(
                { serviceName: data.serviceName, delay: at.toISO()!, kind, sendToType, sendBy: 'email', appointmentData, businessData, clientData },
                { delay: at.toJSDate() }
            ));
        };

        const [clientHour, clientDay, businessHour, businessDay] = await Promise.all([
            reminder(clientReminders.email_1, 'hour', 'client'),
            reminder(clientReminders.email_24, 'day', 'client'),
            reminder(businessReminders.enabled && businessReminders.email_1, 'hour', 'business'),
            reminder(businessReminders.enabled && businessReminders.email_24, 'day', 'business'),
        ]);

        const paymentLink = data.canTakeOnlinePayments
            ? await safe('payment link', () => sendPaymentLink.trigger(
                {
                    businessData: { id: businessData.id, name: businessData.name, email: businessData.email },
                    clientData,
                    serviceName: data.serviceName,
                    appointmentID: data.appointmentId,
                },
                { delay: (linkDelay > now ? linkDelay : now).toJSDate() }
            ))
            : null;

        const paymentCheck = await safe('payment check', () => checkAppointmentStatus.trigger(
            { appointment_id: data.appointmentId },
            { delay: end.plus({ minutes: 30 }).toJSDate() }
        ));

        const noShowCheck = await safe('no-show check', () => checkNoShowTask.trigger(
            { appointment_id: data.appointmentId },
            { delay: end.plus({ minutes: 15 }).toJSDate() }
        ));

        // Follow-up payment checks at 24hr and 48hr after appointment end.
        // Awaited and stored so a reschedule or cancel can cancel them too.
        const paymentFollowUps = await Promise.all([
            safe('24h payment check', () => checkAppointmentStatus.trigger(
                { appointment_id: data.appointmentId },
                { delay: end.plus({ hours: 24 }).toJSDate() }
            )),
            safe('48h payment check', () => checkAppointmentStatus.trigger(
                { appointment_id: data.appointmentId },
                { delay: end.plus({ hours: 48 }).toJSDate() }
            )),
        ]);

        return {
            business: { hour: businessHour, day: businessDay },
            client: { hour: clientHour, day: clientDay },
            paymentCheck,
            paymentLink,
            noShowCheck,
            paymentFollowUps: paymentFollowUps.filter((id): id is string => id !== null),
        };
    }

    /** Cancels every job stored on an appointment row (reminder_ids + payment_link_id). Never throws. */
    static cancelAll(reminderIds: any, paymentLinkId?: string | null) {
        const ids = [
            reminderIds?.business?.hour,
            reminderIds?.business?.day,
            reminderIds?.client?.hour,
            reminderIds?.client?.day,
            reminderIds?.paymentCheck,
            reminderIds?.noShowCheck,
            ...(Array.isArray(reminderIds?.paymentFollowUps) ? reminderIds.paymentFollowUps : []),
            paymentLinkId,
        ].filter((id): id is string => typeof id === 'string' && id.length > 0);
        return Promise.all(ids.map(id => runs.cancel(id).catch(err => console.error(`Failed to cancel run ${id}:`, err))));
    }
}
