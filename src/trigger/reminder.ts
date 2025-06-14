"use server"

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@utils/supabase/server";
import { Resend } from "resend";
import { Database } from "../../lib/database.types";
import ReminderBusiness from "../../emails/reminder-business";
import ReminderClient from "../../emails/reminder-client";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const supabase = createClient<Database>();

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
  clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }
}

const sendBusinessEmail = async (data: AppointmentReminderData) => {
  try {
    const { error } = await resend.emails.send({
      from: 'appointment-reminder <noreply@reminder.afroallure.co>',
      to: data.businessData.email,
      subject: 'Appointment Reminder',
      react: ReminderBusiness({
        appointmentData: {
          id: data.appointmentId,
          start: data.start,
          end: data.end
        }, socials: {
          facebook: 'https://facebooks.com',
          instagram: 'https://instagram.com',
          twitter: 'https://x.com'
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
          start: data.start,
          end: data.end
        }, socials: {
          facebook: 'https://facebooks.com',
          instagram: 'https://instagram.com',
          twitter: 'https://x.com'
        }, serviceName: data.serviceName, clientData: {
          firstName: data.clientData.firstName,
          lastName: data.clientData.lastName,
        }, businessData: {
          id: data.businessData.id,
          name: data.businessData.name,
          businessAddress: data.businessData.address
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

export type ReminderProps = {
  serviceName: string;
  delay: string;
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

const configureReminder = async (props: ReminderProps) => {
  if (props.sendToType === 'business') {
    // Send to notification system
    await supabase.from('notifications').insert({
      business_id: props.businessData.id,
      title: 'Appointment Reminder',
      body: `You have an appointment with ${props.clientData.firstName} in ${props.delay}`,
      type: 'reminder'
    })
    if (props.sendBy === 'email') {
      // Send via email
      await sendBusinessEmail({
        serviceName: props.serviceName,
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
        serviceName: props.serviceName,
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

// Send appointmentReminder
// Going to have to call this function twice (One for the Business and one for the client)
export const sendAppointmentReminder = async (props: ReminderProps) => {
  const reminderTask = task({
    id: `remind-${props.appointmentData.id}`,
    // Set an optional maxDuration to prevent tasks from running indefinitely
    maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
    run: async () => {
      await configureReminder(props)
    },
  });

  return reminderTask
}

// Send EOA paymentLink
