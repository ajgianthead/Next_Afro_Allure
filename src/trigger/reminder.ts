import { configure, task } from "@trigger.dev/sdk";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { Database } from "../../lib/database.types";
import ReminderBusiness from "../../emails/reminder-business";
import ReminderClient from "../../emails/reminder-client";
import PaymentLinkEmail from "../../emails/payment-link";
import { DateTime } from "luxon";
import { resolveTimezone, toZonedISO } from "../lib/timezone";
import { clientPrepFor, serviceLabel } from "../features/services/pricing";
import { clientConsentedToSms, sendSms } from "../lib/sms/send";
import { formatWhen, payLink, smsTemplates } from "../lib/sms/templates";

configure({
  secretKey: process.env.TRIGGER_API_KEY,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export type AppointmentReminderData = {
  serviceName: string;
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
  timezone?: string;
  /** Client prep checklist (client reminders only). */
  prep?: { instructions: string; checklist: string[] } | null;
  clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }
}

const adminClient = () => createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ROLE_SECRET_KEY!
)

const sendBusinessEmail = async (data: AppointmentReminderData) => {
  try {
    const { error } = await resend.emails.send({
      from: 'appointment-reminder <noreply@reminder.afroallure.co>',
      to: data.businessData.email,
      subject: 'Appointment Reminder',
      react: ReminderBusiness({
        appointmentData: {
          id: data.appointmentId,
          start: toZonedISO(data.start, data.timezone),
          end: toZonedISO(data.end, data.timezone)
        }, socials: {
          instagram: 'https://instagram.com',
        }, serviceName: data.serviceName, clientData: {
          firstName: data.clientData.firstName,
          lastName: data.clientData.lastName,
        }, businessData: {
          id: data.businessData.id,
          name: data.businessData.name
        }
      }),
    });
    if (error) {
      return error;
    }
  } catch (error) {
    return error
  }
}
const sendClientEmail = async (data: AppointmentReminderData) => {
  try {
    const { error } = await resend.emails.send({
      from: 'appointment-reminder <noreply@reminder.afroallure.co>',
      to: data.clientData.email,
      subject: 'Appointment Reminder',
      react: ReminderClient({
        appointmentData: {
          id: data.appointmentId,
          start: toZonedISO(data.start, data.timezone),
          end: toZonedISO(data.end, data.timezone)
        }, socials: {
          instagram: 'https://instagram.com',
        }, serviceName: data.serviceName, clientData: {
          firstName: data.clientData.firstName,
          lastName: data.clientData.lastName,
        }, businessData: {
          id: data.businessData.id,
          name: data.businessData.name,
          businessAddress: data.businessData.address
        }, prep: data.prep
      }),
    });
    if (error) {
      return error;
    }
  } catch (error) {
    return error
  }
}

export type ReminderProps = {
  serviceName: string;
  delay: string;
  /** 'hour' = 1 hour before, 'day' = 24 hours before. Older runs omit it. */
  kind?: 'hour' | 'day';
  sendToType: string;
  sendBy: string;
  appointmentData: {
    id: string;
    start: string;
    end: string;
  }
  businessData: {
    id: string;
    name: string;
    email: string;
    address: string
  },
  clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }
}

export type PaymentLinkProps = {
  clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }
  businessData: {
    id: string;
    name: string;
    email: string;
  },
  serviceName: string;
  appointmentID: string;
}

// Reminders are scheduled when an appointment is confirmed, but the business
// can turn reminders off (or reschedule/cancel) afterwards. Re-check the live
// state right before sending so a disabled reminder never goes out.
const shouldSendReminder = async (props: ReminderProps): Promise<{ send: boolean; kind?: 'day' | 'hour'; timezone?: string; serviceName?: string; smsConsent?: boolean; prep?: { instructions: string; checklist: string[] } | null }> => {
  const supabase = adminClient()
  const [{ data: appt }, { data: business }] = await Promise.all([
    supabase.from('appointments').select('status, start, selected_options, service_data, client_metadata').eq('id', props.appointmentData.id).maybeSingle(),
    supabase.from('business_users').select('account_settings').eq('business_id', props.businessData.id).maybeSingle(),
  ])
  if (!appt || appt.status !== 'CONFIRMED') return { send: false }
  // Rescheduled since this run was queued — the new time has its own runs.
  if (Math.abs(DateTime.fromISO(appt.start).toMillis() - DateTime.fromISO(props.appointmentData.start).toMillis()) > 60_000) {
    return { send: false }
  }
  const settings = (business?.account_settings ?? {}) as any
  const kind = props.kind ?? (
    DateTime.fromISO(props.appointmentData.start).diff(DateTime.fromISO(props.delay), 'hours').hours > 2 ? 'day' : 'hour'
  )
  const key = kind === 'day' ? 'email_24' : 'email_1'
  const enabled = props.sendToType === 'client'
    ? settings?.app_reminders?.[key] === true
    : settings?.notifications?.email === true && settings?.notifications?.[key] === true
  return {
    send: enabled,
    kind,
    smsConsent: clientConsentedToSms(appt.client_metadata),
    timezone: settings?.timezone,
    // "Knotless braids — Small · Waist", and what the client should bring / do.
    serviceName: serviceLabel(props.serviceName, appt.selected_options),
    prep: clientPrepFor(appt.service_data, appt.selected_options),
  }
}

// Texts go out alongside the email when the business has the SMS add-on;
// sendSms checks the plan, consent, opt-outs and the monthly limit.
const textReminder = async (props: ReminderProps, kind: 'day' | 'hour', serviceName: string, timezone: string | undefined, smsConsent: boolean) => {
  const when = formatWhen(props.appointmentData.start, resolveTimezone(timezone))
  if (props.sendToType === 'client') {
    await sendSms(adminClient(), {
      businessId: props.businessData.id,
      audience: 'client',
      to: props.clientData.phoneNumber,
      clientConsent: smsConsent,
      body: smsTemplates.clientReminder({ business: props.businessData.name, service: serviceName, when, kind }),
    })
  } else if (props.sendToType === 'business') {
    await sendSms(adminClient(), {
      businessId: props.businessData.id,
      audience: 'business',
      body: smsTemplates.businessReminder({
        client: `${props.clientData.firstName} ${props.clientData.lastName}`.trim(),
        service: serviceName,
        when,
        kind,
      }),
    })
  }
}

const configureReminder = async (props: ReminderProps) => {
  const { send, kind, timezone, serviceName, prep, smsConsent } = await shouldSendReminder(props)
  if (!send) return

  await textReminder(props, kind ?? 'hour', serviceName ?? props.serviceName, timezone, !!smsConsent)

  if (props.sendToType === 'business') {
    // Send to notification system

    // await supabase.from('notifications').insert({
    //   business_id: props.businessData.id,
    //   title: 'Appointment Reminder',
    //   body: `You have an appointment with ${props.clientData.firstName} in ${props.delay}`,
    //   type: 'reminder'
    // })
    if (props.sendBy === 'email') {
      // Send via email
      await sendBusinessEmail({
        serviceName: serviceName ?? props.serviceName,
        sendBy: props.sendBy,
        businessData: {
          id: props.businessData.id,
          name: props.businessData.name,
          email: props.businessData.email,
          address: props.businessData.address,
        },
        appointmentId: props.appointmentData.id,
        start: props.appointmentData.start,
        end: props.appointmentData.end,
        timezone,
        clientData: {
          ...props.clientData
        },
      })
    }
    else if (props.sendBy === 'phone') {
      // Send via phone #
    }
    else {
      // Send via both email & phone #
    }
  } else if (props.sendToType === 'client') {
    if (props.sendBy === 'email') {
      // Send via email
      await sendClientEmail({
        serviceName: serviceName ?? props.serviceName,
        sendBy: props.sendBy,
        businessData: {
          id: props.businessData.id,
          name: props.businessData.name,
          email: props.businessData.email,
          address: props.businessData.address,
        },
        appointmentId: props.appointmentData.id,
        start: props.appointmentData.start,
        end: props.appointmentData.end,
        timezone,
        prep,
        clientData: {
          ...props.clientData
        },
      })
    }
    else if (props.sendBy === 'phone') {
      // Send via phone #
    }
    else {
      // Send via both email & phone #
    }
  }
}

export const sendLink = async (props: PaymentLinkProps) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'pay-appointment <noreply@reminder.afroallure.co>',
      to: props.clientData.email,
      subject: 'Pay for Appointment',
      react: PaymentLinkEmail({
        appointmentID: props.appointmentID,
        serviceName: props.serviceName,
        clientData: {
          firstName: props.clientData.firstName,
          lastName: props.clientData.lastName,
          email: props.clientData.email,
          phoneNumber: props.clientData.phoneNumber
        },
        businessData: {
          id: props.businessData.id,
          name: props.businessData.name,
          email: props.businessData.email
        }
      }),
    });
    // Then send SMS message via text
    if (error) {
      return error;
    } else {
      return data
    }
  } catch (error) {
    return error
  }
}

// A check queued for an appointment's old time can outlive a reschedule to a
// later time. Only act once the appointment as it stands now has ended.
const hasEnded = (end: string) => DateTime.fromISO(end).toMillis() <= Date.now()

// An unpaid appointment after its end time could mean the client didn't come,
// or came and hasn't paid yet — the app can't tell which. So it's flagged
// INCOMPLETE and the business decides: mark it paid, or mark it a no-show.
// Nothing marks NO_SHOW automatically (a no-show fee needs that status).
const checkPaymentStatus = async (appointmentId: string) => {
  const supabase = adminClient()
  const { data: appt } = await supabase
    .from('appointments')
    .select('id, business, status, service_paid, service_data, client_metadata, end')
    .eq('id', appointmentId)
    .single()

  if (!appt || appt.service_paid) return
  if (!hasEnded(appt.end)) return
  // INCOMPLETE = a follow-up check (24h / 48h) on one already flagged.
  if (appt.status !== 'CONFIRMED' && appt.status !== 'INCOMPLETE') return
  const followUp = appt.status === 'INCOMPLETE'

  if (!followUp) {
    await supabase.from('appointments').update({ status: 'INCOMPLETE' }).eq('id', appointmentId)
  }

  try {
    const cm = appt.client_metadata as any
    const sd = appt.service_data as any
    const who = `${cm?.firstName ?? ''} ${cm?.lastName ?? ''}`.trim() || 'your client'
    const what = sd?.name ?? 'appointment'
    await supabase.from('notifications').insert({
      body: followUp
        ? `${who}'s ${what} still isn't paid. Mark it paid if they came, or mark it as a no-show.`
        : `${who}'s ${what} has ended but hasn't been paid. Mark it paid if they came, or mark it as a no-show.`,
      title: 'Payment Incomplete',
      read: false,
      business_id: appt.business,
      type: 'payment-incomplete',
      appointment_id: appt.id,
    })
  } catch (err) {
    console.error('Failed to send incomplete payment notification:', err)
  }
}

export const reminderTask = task({
  id: `remind-appointment`,
  maxDuration: 300,
  run: async (payload: ReminderProps) => {
    await configureReminder(payload)
  },
});

// Send EOA paymentLink
export const sendPaymentLink = task({
  id: `send-payment-link`,
  maxDuration: 300,
  run: async (payload: PaymentLinkProps) => {
    // Only send if there's still something to pay online: the appointment is
    // confirmed and unpaid, and the business can actually take card payments.
    const supabase = adminClient()
    const [{ data: appt }, { data: business }] = await Promise.all([
      supabase.from('appointments').select('status, service_paid, amount_due, client_metadata').eq('id', payload.appointmentID).maybeSingle(),
      supabase.from('business_users').select('completed_stripe_onboarding').eq('business_id', payload.businessData.id).maybeSingle(),
    ])
    if (!appt || appt.status !== 'CONFIRMED' || appt.service_paid || (appt.amount_due ?? 0) <= 0) return
    if (!business?.completed_stripe_onboarding) return
    await sendLink(payload)
    await sendSms(supabase, {
      businessId: payload.businessData.id,
      audience: 'client',
      to: payload.clientData.phoneNumber,
      clientConsent: clientConsentedToSms(appt.client_metadata),
      body: smsTemplates.clientPaymentLink({
        business: payload.businessData.name,
        service: payload.serviceName,
        url: payLink(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co', payload.appointmentID),
      }),
    })
  }
})
export const checkAppointmentStatus = task({
  id: 'checkPaymentStatus',
  maxDuration: 300,
  run: async (payload: { appointment_id: string }) => {
    await checkPaymentStatus(payload.appointment_id)
  }
})

// No longer scheduled — no-shows are marked by the business (see
// checkPaymentStatus). Kept so runs queued before that change finish quietly.
export const checkNoShowTask = task({
  id: 'checkNoShow',
  maxDuration: 300,
  run: async (_payload: { appointment_id: string }) => {}
})
