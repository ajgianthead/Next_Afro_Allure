import { stripe } from "@lib/utils";
import pool from "@utils/dbPool";
import { NextRequest, NextResponse } from "next/server";
import mailchimp from '@mailchimp/mailchimp_transactional'


export async function POST(request: NextRequest) {
const endpointSecret = "whsec_387472f4c2731ffe1b1312127be3768762a7f4022447f8f12c05d8859f9ed5d7";

  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(await request.json(), sig!, endpointSecret);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ message:`Webhook Error: ${err.message}` }), {
        status: 400
    })
  }

 
  const client = await pool.connect()

  // Handle the event
  switch (event.type) {
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      // Delete appointment
      try {
        await client.query('BEGIN')
        const appointment = await client.query(`DELETE FROM appointments app WHERE app.deposit_charge_id = $1  RETURNING *`, [paymentIntentCanceled.id])
        await client.query('COMMIT')                         
        // Send email and/or SMS confirming appointment
      } catch (error: any) {
        console.error(error.message)
        await client.query('ROLLBACK')
      }

      break;
    case 'payment_intent.processing':
      const paymentIntentProcessing = event.data.object;
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;

      // Then define and call a function to handle the event payment_intent.succeeded
      // Update the appointment
      try {
        await client.query('BEGIN')
        const appointment = await client.query(`UPDATE appointments app SET paid_deposit = true, status = 'CONFIRMED' WHERE app.deposit_charge_id = $1  RETURNING *`, [paymentIntentSucceeded.id])
        await client.query('COMMIT')                         
        // Send email and/or SMS confirming appointment
        const mctx = mailchimp(process.env.NEXT_PUBLIC_MAILCHIMP_TEST_API_KEY!);
        const response = await mctx.messages.sendTemplate({
          template_name: 'confirm-appointment',
          template_content: [],
          message: {
              to: [{
                      'email': appointment.rows[0].client_metadata.email,
                  }],
                  "global_merge_vars": [
                      {
                          name: "stylist_name",
                          content: "LadyPlutoLooks" // Insert stylist name
                      },
                      {
                          name: "appointment_date",
                          content: '' // Format Appointment Date
                      },
                      {
                          name: "appointment_time",
                          content: '' // Format Appointment Time
                      },
                      {
                          name: "business_address",
                          content: '' // Insert Business Address
                      },
                      {
                          name: "service_name",
                          content: appointment.rows[0].service_data.name // Format Appointment Date
                      },
                      {
                          name: "facebook_url",
                          content: '' // Format Appointment Date
                      },
                      {
                          name: "instagram_url",
                          content: 'https://www.instagram.com/afroallure_/' // Format Appointment Date
                      },
                      {
                          name: "twitter_url",
                          content: '' // Format Appointment Date
                      },
                  ],
                 
          }
      })

      } catch (error: any) {
        console.error(error.message)
        await client.query('ROLLBACK')
      }

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
client.release()
  // Return a 200 response to acknowledge receipt of the event
    return new NextResponse(null , {
        status: 200
    })


}
