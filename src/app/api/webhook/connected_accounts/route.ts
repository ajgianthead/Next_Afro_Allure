import { stripe } from "@/lib/stripe/stripeClient";
import pool from "@/app/utils/dbPool";
import { NextRequest } from "next/server";
import { apiError, webhookAck } from "@/lib/api/response";
import { DateTime } from "luxon";
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails";
import { AppointmentReminders } from "@/features/shared/appointments/AppointmentReminders";
import Stripe from "stripe";
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import { trackAppointmentBooked } from "../../../../../lib/analytics";
import { addCreateNewClient } from "app/dashboard/(other)/clients/actions";

export async function POST(request: NextRequest) {
  const endpointSecret = process.env.CONNECTED_ACCOUNT_WEBHOOK_SECRET!;
  const rawBody = await request.arrayBuffer();
  const bodyBuffer = Buffer.from(rawBody);
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(bodyBuffer, sig!, endpointSecret);
  } catch (err: any) {
    return apiError(`Webhook Error: ${err.message}`, 400);
  }

  const client = await pool.connect();
  try {
    switch (event.type) {
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent, client);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, client);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, client);
        break;
    }
  } catch (error: any) {
    client.release();
    return apiError(error.message ?? 'Webhook handler failed', 500);
  }

  client.release();
  return webhookAck();
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, client: any) {
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM appointments app WHERE app.deposit_charge_id = $1 RETURNING *`,
      [paymentIntent.id]
    );
    await client.query('COMMIT');
  } catch (error: any) {
    console.error('handlePaymentCanceled failed:', error.message);
    await client.query('ROLLBACK');
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, client: any) {
  const { purpose, appointmentType } = paymentIntent.metadata;
  if (appointmentType !== 'automated' || purpose === 'EOA') return;

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `DELETE FROM appointments WHERE deposit_charge_id = $1 AND status = 'PROCESSING' RETURNING *`,
      [paymentIntent.id]
    );
    if (result.rowCount === 0) {
      console.log(`No processing appointment found for PaymentIntent ${paymentIntent.id}`);
    }
    await client.query('COMMIT');
  } catch (error: any) {
    console.error('handlePaymentFailed failed:', error.message);
    await client.query('ROLLBACK');
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, client: any) {
  const { purpose, appointment_id: appointmentID } = paymentIntent.metadata;

  if (purpose === 'EOA') {
    let eoaRes: any;
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `WITH updated AS (
          UPDATE appointments
          SET service_paid = $1, service_paid_type = 'PLATFORM', service_charge_id = $2,
              status = 'COMPLETED', paid_amount = coalesce(paid_amount, 0) + $3
          WHERE id = $4
          RETURNING *
        )
        SELECT updated.*, business_users.business_name, business_users.email, business_users.account_settings
        FROM updated JOIN business_users ON updated.business = business_users.business_id`,
        [true, paymentIntent.id, paymentIntent.amount, appointmentID]
      );
      await client.query('COMMIT');
      eoaRes = result.rows[0];
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    }

    if (eoaRes) {
      try {
        await AppointmentEmails.sendEOAReceipt({
          clientMetadata: {
            firstName: eoaRes.client_metadata.firstName,
            lastName: eoaRes.client_metadata.lastName,
            email: eoaRes.client_metadata.email,
          },
          businessData: {
            id: eoaRes.business,
            name: eoaRes.business_name,
            email: eoaRes.email,
            address: formatBusinessAddress(eoaRes.account_settings.business_address),
          },
          appointmentData: {
            id: eoaRes.id,
            start: DateTime.fromJSDate(eoaRes.start).toISO()!,
            end: DateTime.fromJSDate(eoaRes.end).toISO()!,
          },
          serviceName: eoaRes.service_data.name,
          notifyBusiness: eoaRes.account_settings?.notifications?.email ?? false,
          amountPaid: paymentIntent.amount,
        });
      } catch (emailErr) {
        console.error('Failed to send EOA receipt email:', emailErr);
      }

      // Notify business in-app that EOA payment was received
      try {
        const supabase = await createClient();
        const cm = eoaRes.client_metadata;
        await supabase.from('notifications').insert({
          body: `${cm.firstName} ${cm.lastName} just paid for their ${eoaRes.service_data.name} appointment.`,
          title: 'Payment Received',
          read: false,
          business_id: eoaRes.business,
          type: 'payment-received',
          appointment_id: eoaRes.id,
        });
      } catch (notifErr) {
        console.error('Failed to send EOA payment notification:', notifErr);
      }
    }
    return;
  }

  // Deposit confirmed — update DB first, then side effects separately
  let res: any;
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `WITH updated AS (
        UPDATE appointments
        SET status = 'CONFIRMED', paid_deposit = $1,
            paid_amount = coalesce(paid_amount, 0) + $2,
            amount_due = CASE WHEN substraction THEN amount_due - $2 ELSE amount_due END
        WHERE deposit_charge_id = $3
        RETURNING *
      )
      SELECT updated.*, business_users.business_name, business_users.email, business_users.account_settings
      FROM updated JOIN business_users ON updated.business = business_users.business_id`,
      [true, paymentIntent.amount, paymentIntent.id]
    );
    await client.query('COMMIT');
    res = result.rows[0];
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error; // DB failure → signal Stripe to retry
  }

  // Side effects: appointment is already confirmed, so failures here must NOT
  // return an error to Stripe — a retry would resend confirmation emails.
  try {
    await AppointmentEmails.sendConfirmed({
      clientMetadata: {
        firstName: res.client_metadata.firstName,
        lastName: res.client_metadata.lastName,
        email: res.client_metadata.email,
      },
      businessData: {
        id: res.business,
        name: res.business_name,
        email: res.email,
        address: formatBusinessAddress(res.account_settings.business_address),
      },
      appointmentData: {
        id: res.id,
        start: DateTime.fromJSDate(res.start).toISO()!,
        end: DateTime.fromJSDate(res.end).toISO()!,
      },
      serviceName: res.service_data.name,
      notifyBusiness: res.account_settings.notifications.email,
    });
    // Use res.id (the confirmed appointment's DB id) — appointmentID from PI metadata
    // is undefined for automated bookings where only bookingSessionId is in metadata.
    await scheduleReminders(res, res.id, client);

    // Mark booking session confirmed if this was a session-based automated booking
    const { bookingSessionId } = paymentIntent.metadata;
    if (bookingSessionId) {
      const supabase = await createClient();
      await supabase
        .from('booking_sessions')
        .update({ status: 'confirmed', confirmed_at: DateTime.now().toISO() })
        .eq('id', bookingSessionId);
    }
  } catch (error) {
    console.error('Post-confirmation side effects failed (appointment already confirmed):', error);
  }

  // Fire-and-forget — non-critical, never throw back to Stripe
  trackAppointmentBooked({
    businessId: res.business,
    serviceId: res.service_data.id,
    serviceName: res.service_data.name,
    servicePrice: res.service_data.price,
    appointmentType: '',
  }).catch(console.error);

  addCreateNewClient({
    first_name: res.client_metadata.firstName,
    last_name: res.client_metadata.lastName,
    email: res.client_metadata.email,
    phone_number: res.client_metadata.phoneNumber,
  }, res.business).catch(console.error);
}

async function scheduleReminders(res: any, appointmentId: string, client: any) {
  const settings = res.account_settings;

  const ids = await AppointmentReminders.schedule({
    appointmentId: appointmentId,
    start: DateTime.fromJSDate(res.start).toISO()!,
    end: DateTime.fromJSDate(res.end).toISO()!,
    serviceName: res.service_data.name,
    businessData: {
      id: res.business,
      name: res.business_name,
      email: res.email,
      address: formatBusinessAddress(settings.business_address),
    },
    clientData: {
      firstName: res.client_metadata.firstName,
      lastName: res.client_metadata.lastName,
      email: res.client_metadata.email,
      phoneNumber: res.client_metadata.phoneNumber,
    },
    settings: {
      clientReminders: { email_1: settings.app_reminders.email_1, email_24: settings.app_reminders.email_24 },
      businessReminders: { enabled: settings.notifications.email, email_1: settings.notifications.email_1, email_24: settings.notifications.email_24 },
    },
  });

  await client.query('BEGIN');
  await client.query(
    `UPDATE appointments SET reminder_ids = $1, payment_link_id = $2 WHERE appointments.id = $3 RETURNING *`,
    [
      {
        business: { hour: ids.business.hour, day: ids.business.day },
        client: { hour: ids.client.hour, day: ids.client.day },
        paymentCheck: ids.paymentCheck,
      },
      ids.paymentLink,
      appointmentId,
    ]
  );
  await client.query('COMMIT');
}

