import { stripe } from "@lib/utils";
import pool from "@utils/dbPool";
import { NextRequest, NextResponse } from "next/server";
import mailchimp from '@mailchimp/mailchimp_transactional'
import { reminderTask } from "trigger/reminder";
import { DateTime } from "luxon";
import NewAppointment from "../../../../emails/new-appointment";
import { Resend } from "resend";
import AppointmentConfirmed from "../../../../emails/appointment-confirmed";
import Stripe from "stripe";


export async function POST(request: NextRequest) {
  const endpointSecret = "whsec_a8e841916acea536b61024e90f8b38aedc4296c347cbf6f3b991535965c67822";
  const rawBody = await request.arrayBuffer(); // ⬅️ equivalent to express.raw()
  const bodyBuffer = Buffer.from(rawBody);
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(bodyBuffer, sig!, endpointSecret);
  } catch (err: any) {
    console.log(err);

    return new NextResponse(JSON.stringify({ message: `Webhook Error: ${err.message}` }), {
      status: 400
    })
  }
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const appointmentID = "ee4f0747-0cb7-4b3d-a88f-4200c7b2c4d6"
  const client = await pool.connect()
  // const businessID = await (await client.query(`SELECT business FROM business_users bu WHERE bu.stripe_acc_id = $1`, [event.account])).rows[0].business
  const businessID = "a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90"
  const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);


  // Handle the event
  switch (event.type) {
    case 'payment_intent.canceled':
      // Delete appointment
      try {
        await client.query('BEGIN')
        const appointment = await client.query(`DELETE FROM appointments app WHERE app.id = $1  RETURNING *`, [appointmentID])
        await client.query('COMMIT')
        // Send email and/or SMS confirming appointment
      } catch (error: any) {
        console.error(error.message)
        await client.query('ROLLBACK')
      }

      break;
    case 'payment_intent.processing':
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.succeeded':
      await client.query('BEGIN')
      const res = (await client.query(`WITH updated AS (
  UPDATE appointments
  SET status = 'CONFIRMED'
  WHERE id = $1
  RETURNING *
)
SELECT 
  updated.*,
  business_users.business_name,
  business_users.email
FROM updated
JOIN business_users
  ON updated.business = business_users.business_id`, [appointmentID])).rows[0]
      await client.query('COMMIT')
      try {
        await resend.emails.send({
          from: 'appointment-confirmed <noreply@reminder.afroallure.co>',
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
              name: res.business_name,
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
          from: 'appointment-confirmed <noreply@reminder.afroallure.co>',
          to: res?.email!,
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
              name: res.business_name,
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

        // Send Reminder
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
        }, { delay: dayBefore.toISO()! })
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
        }, { delay: dayBefore.toISO()! })
        // Save run id to appointment for later
      } catch (error) {
        console.log(error);
        return new NextResponse(JSON.stringify({ error: error }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        })
      }


      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  client.release()
  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse(null, {
    status: 200
  })
}
