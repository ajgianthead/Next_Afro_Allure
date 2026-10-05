import { stripe } from "@/lib/stripe/stripeClient";
import pool from "@/app/utils/dbPool";
import { NextRequest } from "next/server";
import { apiError, webhookAck } from "@/lib/api/response";
import { DateTime } from "luxon";
import { AppointmentEmails, formatBusinessAddress } from "@/lib/appointmentEmails/AppointmentEmails";
import { AppointmentReminders, reminderSettingsFrom } from "@/features/shared/appointments/AppointmentReminders";
import Stripe from "stripe";
import { Database } from "../../../../../lib/database.types";
import { trackAppointmentBooked } from "../../../../../lib/analytics";
import { upsertBusinessClientAsAdmin } from "@/features/shared/clients/upsertBusinessClient";
import { syncStripeRefund } from "@/features/refunds/server/sync";
import { notifyLoyaltyForAppointment } from "@/features/loyalty/server/notify";
import { createAdminClient } from "@/app/utils/supabase/admin";

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
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, event.account);
        break;
      case 'refund.created':
      case 'refund.updated':
      case 'refund.failed':
        await handleRefundEvent(event.data.object as Stripe.Refund, event.account);
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
    // Scoped to status='PROCESSING' — that's only ever a placeholder row for
    // an automated-booking session that hasn't completed payment yet (see
    // createNewManualAppointment / the automated-session flow). Without this
    // scope, canceling the PaymentIntent behind a real, already-created
    // manual-booking appointment would delete that appointment outright
    // instead of just clearing its charge reference.
    await client.query(
      `DELETE FROM appointments app WHERE app.deposit_charge_id = $1 AND app.status = 'PROCESSING' RETURNING *`,
      [paymentIntent.id]
    );
    await client.query('COMMIT');
  } catch (error: any) {
    console.error('handlePaymentCanceled failed:', error.message);
    await client.query('ROLLBACK');
  }
}

// Refunds are issued from the appointment detail modal (src/features/refunds),
// which records them immediately. These events keep those records in step
// with Stripe — pending → succeeded/failed — and catch any refund made
// outside the app so appointment totals stay accurate.
// NOTE: the connected-account webhook endpoint in Stripe must listen for
// charge.refunded, refund.created, refund.updated and refund.failed — that's
// a Stripe dashboard setting, not something this file controls.
//
// Errors are rethrown so Stripe retries; syncStripeRefund is idempotent.
async function handleRefundEvent(eventRefund: Stripe.Refund, account: string | undefined) {
  // Re-fetch so out-of-order events can't regress a refund's status.
  const refund = account
    ? await stripe.refunds.retrieve(eventRefund.id, {}, { stripeAccount: account })
    : eventRefund;
  const synced = await syncStripeRefund(refund);
  if (synced?.newlyFailed) await notifyRefundFailed(synced.appointmentId, synced.businessId, synced.amount, refund.failure_reason);
}

async function handleChargeRefunded(charge: Stripe.Charge, account: string | undefined) {
  if (!account) return;
  // charge.refunds isn't included on Charge objects in current API
  // versions, so list them explicitly.
  const refunds = await stripe.refunds.list({ charge: charge.id, limit: 100 }, { stripeAccount: account });
  for (const refund of refunds.data) {
    const synced = await syncStripeRefund(refund);
    if (synced?.newlyFailed) await notifyRefundFailed(synced.appointmentId, synced.businessId, synced.amount, refund.failure_reason);
  }
}

async function notifyRefundFailed(appointmentId: string, businessId: string, amount: number, failureReason: string | null | undefined) {
  try {
    // Service role: there's no signed-in user in a webhook request.
    const supabase = createAdminClient();
    const { data: appt } = await supabase
      .from('appointments')
      .select('client_metadata, service_data')
      .eq('id', appointmentId)
      .single();
    const cm = appt?.client_metadata as any;
    const serviceName = (appt?.service_data as any)?.name ?? 'appointment';
    const reason = failureReason ? ` (${failureReason.replace(/_/g, ' ')})` : '';
    await supabase.from('notifications').insert({
      body: `Your $${(amount / 100).toFixed(2)} refund to ${cm?.firstName ?? 'your client'} ${cm?.lastName ?? ''} for their ${serviceName} appointment failed${reason}. The money was returned to your balance.`,
      title: 'Refund Failed',
      read: false,
      business_id: businessId,
      type: 'refund-failed',
      appointment_id: appointmentId,
    });
  } catch (error) {
    console.error('notifyRefundFailed failed:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, client: any) {
  const { purpose, appointmentType } = paymentIntent.metadata;

  // Automated-booking deposit failures: the appointment row is just a
  // PROCESSING placeholder until the deposit succeeds, so clean it up.
  if (appointmentType === 'automated' && purpose !== 'EOA') {
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `DELETE FROM appointments WHERE deposit_charge_id = $1 AND status = 'PROCESSING' RETURNING *`,
        [paymentIntent.id]
      );
      if (result.rowCount === 0 && process.env.NODE_ENV === 'development') {
        console.log(`No processing appointment found for PaymentIntent ${paymentIntent.id}`);
      }
      await client.query('COMMIT');
    } catch (error: any) {
      console.error('handlePaymentFailed failed:', error.message);
      await client.query('ROLLBACK');
    }
    return;
  }

  // Manual-booking deposit failures, and EOA (balance-due) failures for
  // either booking type: the appointment already exists as a real row, so
  // don't touch it — just let the business know the charge didn't go
  // through, since previously this branch did nothing at all.
  try {
    const chargeColumn = purpose === 'EOA' ? 'service_charge_id' : 'deposit_charge_id';
    const result = await client.query(
      `SELECT id, business, client_metadata, service_data FROM appointments WHERE ${chargeColumn} = $1`,
      [paymentIntent.id]
    );
    const appt = result.rows[0];
    if (!appt) return;

    const cm = appt.client_metadata;
    const label = purpose === 'EOA' ? 'balance payment' : 'deposit';
    const supabase = createAdminClient();
    await supabase.from('notifications').insert({
      body: `${cm.firstName} ${cm.lastName}'s ${label} for their ${appt.service_data.name} appointment failed to process.`,
      title: 'Payment Failed',
      read: false,
      business_id: appt.business,
      type: 'payment-failed',
      appointment_id: appt.id,
    });
  } catch (error: any) {
    console.error('handlePaymentFailed (manual/EOA) failed:', error.message);
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
            address: formatBusinessAddress(eoaRes.account_settings?.business_address),
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
        const supabase = createAdminClient();
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

      // Paid in full = visit completed: tell the client their loyalty progress.
      await notifyLoyaltyForAppointment(eoaRes.id);
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
        address: formatBusinessAddress(res.account_settings?.business_address),
      },
      appointmentData: {
        id: res.id,
        start: DateTime.fromJSDate(res.start).toISO()!,
        end: DateTime.fromJSDate(res.end).toISO()!,
      },
      serviceName: res.service_data.name,
      notifyBusiness: res.account_settings?.notifications?.email === true,
    });
    // Use res.id (the confirmed appointment's DB id) — appointmentID from PI metadata
    // is undefined for automated bookings where only bookingSessionId is in metadata.
    await scheduleReminders(res, res.id, client);

    // Mark booking session confirmed if this was a session-based automated booking
    const { bookingSessionId } = paymentIntent.metadata;
    if (bookingSessionId) {
      const supabase = createAdminClient();
      await supabase
        .from('booking_sessions')
        .update({ status: 'confirmed', confirmed_at: DateTime.now().toISO() })
        .eq('id', bookingSessionId);
    }
  } catch (error) {
    console.error('Post-confirmation side effects failed (appointment already confirmed):', error);
  }

  // booking-confirmed notification — non-critical, never throw back to Stripe
  try {
    const supabase = createAdminClient();
    const cm = res.client_metadata;
    await supabase.from('notifications').insert({
      body: `${cm.firstName} ${cm.lastName}'s deposit was received. Their ${res.service_data.name} appointment is now confirmed.`,
      title: 'Booking Confirmed',
      read: false,
      business_id: res.business,
      type: 'booking-confirmed',
      appointment_id: res.id,
    });
  } catch (notifErr) {
    console.error('Failed to insert booking-confirmed notification:', notifErr);
  }

  // Fire-and-forget — non-critical, never throw back to Stripe
  trackAppointmentBooked({
    businessId: res.business,
    serviceId: res.service_data.id,
    serviceName: res.service_data.name,
    servicePrice: res.service_data.price,
    appointmentType: '',
  }).catch(console.error);

  // No business session in a webhook — the service-role helper does the insert.
  await upsertBusinessClientAsAdmin({
    first_name: res.client_metadata.firstName,
    last_name: res.client_metadata.lastName,
    email: res.client_metadata.email,
    phone_number: res.client_metadata.phoneNumber,
  }, res.business);
}

async function scheduleReminders(res: any, appointmentId: string, client: any) {
  const settings = res.account_settings;

  // Note: this runs inside the caller's try/catch (handlePaymentSucceeded,
  // which only logs on failure — the appointment is already confirmed, so a
  // retry here must never be signaled back to Stripe). The BEGIN/COMMIT
  // below previously had no local rollback: if the UPDATE threw, the
  // transaction stayed open and the pooled connection went back to the pool
  // mid-transaction instead of being rolled back.
  const ids = await AppointmentReminders.schedule({
    appointmentId: appointmentId,
    start: DateTime.fromJSDate(res.start).toISO()!,
    end: DateTime.fromJSDate(res.end).toISO()!,
    serviceName: res.service_data.name,
    businessData: {
      id: res.business,
      name: res.business_name,
      email: res.email,
      address: formatBusinessAddress(settings?.business_address),
    },
    clientData: {
      firstName: res.client_metadata.firstName,
      lastName: res.client_metadata.lastName,
      email: res.client_metadata.email,
      phoneNumber: res.client_metadata.phoneNumber,
    },
    settings: reminderSettingsFrom(settings),
    // A deposit just succeeded through Stripe, so online payments work.
    canTakeOnlinePayments: true,
  });

  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE appointments SET reminder_ids = $1, payment_link_id = $2 WHERE appointments.id = $3 RETURNING *`,
      [
        {
          business: { hour: ids.business.hour, day: ids.business.day },
          client: { hour: ids.client.hour, day: ids.client.day },
          paymentCheck: ids.paymentCheck,
          noShowCheck: ids.noShowCheck,
        },
        ids.paymentLink ?? '',
        appointmentId,
      ]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

