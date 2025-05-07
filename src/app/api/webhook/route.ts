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
  const businessID = await (await client.query(`SELECT business FROM business_users bu WHERE bu.stripe_acc_id = $1`, [event.account])).rows[0].business

  // Handle the event
  switch (event.type) {
    case 'payment_intent.canceled':
      // Delete appointment
      try {
        await client.query('BEGIN')
        const appointment = await client.query(`DELETE FROM appointments app WHERE app.business_id = $1  RETURNING *`, [businessID])
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
      // Update the appointment
      // try {
      //   await client.query('BEGIN')
      //   const appointment = await client.query(`UPDATE appointments app SET paid_deposit = true, status = 'CONFIRMED' WHERE app.business_id = $1  RETURNING *`, [businessID])
      //   await client.query('COMMIT')                         
      //   // Send email and/or SMS confirming appointment        
      // } catch (error: any) {
      //   console.error(error.message)
      //   await client.query('ROLLBACK')
      // }
      console.log("Webhook works");
      

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
