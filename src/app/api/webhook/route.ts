import { stripe } from "../../../lib/utils";
import pool from "@utils/dbPool";
import { NextRequest, NextResponse } from "next/server";
import mailchimp from '@mailchimp/mailchimp_transactional'
import { checkAppointmentStatus, reminderTask, sendPaymentLink } from "trigger/reminder";
import { DateTime } from "luxon";
import NewAppointment from "../../../../emails/new-appointment";
import { Resend } from "resend";
import AppointmentConfirmed from "../../../../emails/appointment-confirmed";
import Stripe from "stripe";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../lib/database.types";
import { trackAppointmentBooked } from "../../../../lib/analytics";


export async function POST(request: NextRequest) {
  const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET!;
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
  const { purpose: paymentPurpose, appointment_id: appointmentID } = paymentIntent.metadata

  const client = await pool.connect()
  // const businessID = await (await client.query(`SELECT business FROM business_users bu WHERE bu.stripe_acc_id = $1`, [event.account])).rows[0].business
  const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);


  // Handle the event
  switch (event.type) {
    case 'refund.created':
      try {
        const supabase = createClient<Database>()
        const refund = event.data.object;
        const appointment = await supabase.from('appointments').select("*, business_users(business_id, stripe_acc_id)").or(`deposit_charge_id.eq.${refund.payment_intent},service_charge_id.eq.${refund.payment_intent}`).single()
        const paymentIntent = await stripe.paymentIntents.retrieve(refund.payment_intent?.toString()!, {
          stripeAccount: appointment.data?.business_users.stripe_acc_id!
        })
        const { purpose } = paymentIntent.metadata
        if (purpose === 'EOA') {
          const transactionReversal = await stripe.tax.transactions.createReversal({
            mode: 'full',
            original_transaction: appointment.data?.eoa_tax_transaction!,
            reference: refund.id,
            expand: ['line_items'],
          })
        } else {
          const transactionReversal = await stripe.tax.transactions.createReversal({
            mode: 'full',
            original_transaction: appointment.data?.deposit_tax_transaction!,
            reference: refund.id,
            expand: ['line_items'],
          })
        }
      } catch (error) {

      }
      break;
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
      const transaction = await stripe.tax.transactions.createFromCalculation({
        calculation: paymentIntent.metadata.tax_calculation,
        reference: paymentIntent.id
      })
      await client.query('BEGIN')
      if (paymentPurpose === 'EOA') {
        const res = (await client.query(`WITH updated AS (
          UPDATE appointments
          SET service_paid = '$1', service_paid_type = 'PLATFORM', service_charge_id = $2, eoa_tax_transaction = $3, status = 'COMPLETED'
          WHERE id = $4
          RETURNING *
        )
        SELECT 
          updated.*,
          business_users.business_name,
          business_users.email
        FROM updated
        JOIN business_users
          ON updated.business = business_users.business_id`, [true, paymentIntent.id, transaction.id, appointmentID])).rows[0]
        // Send reciept to email
      } else {
        const res = (await client.query(`WITH updated AS (
          UPDATE appointments
          SET status = 'CONFIRMED', paid_deposit = $1, deposit_tax_transaction = $2
          WHERE id = $3
          RETURNING *
        )
        SELECT 
          updated.*,
          business_users.business_name,
          business_users.email
        FROM updated
        JOIN business_users
          ON updated.business = business_users.business_id`, [true, transaction.id, appointmentID])).rows[0]
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
          const linkDelay = DateTime.fromJSDate(res.end).minus({ minutes: 30 })
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
          }, { delay: linkDelay.toISO()! })
          const paymentCheck = await checkAppointmentStatus.trigger({
            appointment_id: res.id
          }, { delay: new Date(DateTime.fromJSDate(res.end).plus({ minutes: 30 }).toISO()!) })

          // Save run id to appointment for later
          await client.query('BEGIN')
          await client.query(`UPDATE appointments SET reminder_ids = $1, payment_link_id = $2 WHERE appointments.id = $3  RETURNING *`, [{ business: remindBusiness.id, client: remindClient.id, paymentCheck: paymentCheck }, timedPaymentLink.id, appointmentID])
          await client.query('COMMIT')

        } catch (error) {
          console.log(error);
          return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
          })
        }
        await trackAppointmentBooked({
          businessId: res.business,
          serviceId: res.service_data.id,
          serviceName: res.service_data.name,
          servicePrice: res.service_data.price,
          appointmentType: ""
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
