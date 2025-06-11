"use server"

import { task } from "@trigger.dev/sdk/v3";
import { createClient } from "@utils/supabase/server";
import { Resend } from "resend";
import { Database } from "../../lib/database.types";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const supabase = createClient<Database>();

const sendBusinessEmail = async (businessData: {
  id: string;
  name: string;
  email: string;
}, appointmentData: {
  id: string;
  start: string;
  end: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'appointment-reminder <noreply@reminder.afroallure.co>',
      to: businessData.email,
      subject: 'Appointment Reminder',
      react: EmailTemplate({ firstName: 'Abijah' }),
    });
    if (error) {
      return error;
    }
  } catch (error) {
    return error
  }
}
const sendClientEmail = async (appointmentData: {
  id: string;
  start: string;
  end: string;
},
  clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'appointment-reminder <noreply@reminder.afroallure.co>',
      to: clientData.email,
      subject: 'Appointment Reminder',
      react: EmailTemplate({ firstName: 'Abijah' }),
    });
    if (error) {
      return error;
    }
  } catch (error) {
    return error
  }
}

export type ReminderProps = {
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
      await sendBusinessEmail(props.businessData, props.appointmentData)
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
      await sendClientEmail(props.appointmentData, props.clientData)
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



// Send paymentConfirmation
// Send EOA paymentLink
