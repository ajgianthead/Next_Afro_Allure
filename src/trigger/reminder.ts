import { configure, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@utils/supabase/server";
import { Resend } from "resend";
import { Database } from "../../lib/database.types";
import ReminderBusiness from "../../emails/reminder-business";
import ReminderClient from "../../emails/reminder-client";
import PaymentLinkEmail from "../../emails/payment-link";

configure({
  // this is the default and if the `TRIGGER_SECRET_KEY` environment variable is set, can omit calling configure
  secretKey: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_TRIGGER_API_KEY : process.env.NEXT_PUBLIC_TRIGGER_PROD_KEY,
});

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

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
          start: data.start,
          end: data.end
        }, socials: {
          instagram: 'https://instagram.com',
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

const configureReminder = async (props: ReminderProps) => {
  // const supabase = createClient<Database>();

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

const checkPaymentStatus = async (appointmentId: string) => {
  const supabase = createClient<Database>()
  const { data } = await supabase.from('appointments').select().eq('id', appointmentId).single()
  if (data?.service_paid) {
    // IDK Something
    return
  } else {
    await supabase.from('appointments').update({
      status: 'INCOMPLETE'
    })
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
    await sendLink(payload)
  }
})
export const checkAppointmentStatus = task({
  id: 'checkPaymentStatus',
  maxDuration: 300,
  run: async (payload: { appointment_id: string }) => {
    await checkPaymentStatus(payload.appointment_id)
  }
})
