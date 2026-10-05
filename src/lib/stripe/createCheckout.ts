'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { BusinessUser } from "../businessUser/BusinessUser"
import { Appointment } from "../../features/manualBooking/server/models/Appointment"
import { stripe } from "./stripeClient"
import Stripe from "stripe"
import { AppointmentType, CheckoutType } from "../../features/shared/appointments/types"
import { getBookingSession, updateBookingSession } from "@/features/automatedBooking/server/domain"
import { DateTime } from "luxon"
import { calculateApplicationFee } from "@/lib/fees"
import { quoteFromDb } from "@/features/services/server/quote"
import { calculateDeposit, remainingBalance, type StyleSelection } from "@/features/services/pricing"

/**
 * Creates (or reuses) the PaymentIntent for a deposit or end-of-appointment
 * payment. The amount is always computed here from the database — the
 * `price` argument from the browser is ignored (kept for call compatibility).
 * Online booking deposits need `booking` so the server can price the chosen
 * service, options and add-ons.
 */
export const createCheckout = async (
    checkoutType: CheckoutType,
    appointmentType: AppointmentType,
    _price: number,
    businessId: string,
    appointmentId?: string,
    sessionId?: string,
    booking?: { serviceId: string; addonIds: string[]; style?: StyleSelection | null }
): Promise<Stripe.PaymentIntent> => {
    try {
        const supabase = createAdminClient()
        const business = await BusinessUser.fetch(supabase, businessId)

        // Without this, a business can publish and accept bookings before
        // Stripe Connect is actually finished, and the client only finds out
        // when the PaymentIntent create call below fails with an opaque
        // Stripe error.
        if (!business.completedStripeOnboarding) {
            throw new Error('This business hasn\'t finished setting up payments yet. Please check back soon or contact them directly.')
        }

        // ── Automated booking: session-only path ──────────────────────────────
        if (sessionId && !appointmentId) {
            const session = await getBookingSession(sessionId)
            if (!session) throw new Error('Booking session not found')

            // Reuse existing non-cancelled PI (idempotency)
            if (session.paymentIntentId) {
                const existing = await stripe.paymentIntents.retrieve(
                    session.paymentIntentId,
                    { stripeAccount: business.stripeAccountId }
                )
                if (existing.status !== 'canceled') return existing
            }

            const clientEmail = (session.clientInfo as any)?.email as string | undefined

            if (!booking?.serviceId) throw new Error('Missing booking details')
            const { quote } = await quoteFromDb(supabase, {
                businessId,
                serviceId: booking.serviceId,
                addonIds: booking.addonIds,
                selection: booking.style,
            })
            // Same policy bookAppointment uses, so the two always agree.
            const { data: bizRow } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessId).single()
            const { data: activePolicy } = await supabase.from('business_policies').select('deposit').eq('id', bizRow?.booking_policies ?? '').maybeSingle()
            const price = calculateDeposit((activePolicy?.deposit ?? null) as any, quote.totalCents)
            if (price < 50) throw new Error("This booking doesn't need a deposit.")

            const paymentIntent = await stripe.paymentIntents.create({
                amount: price,
                currency: 'usd',
                receipt_email: clientEmail,
                metadata: {
                    checkoutType,
                    bookingSessionId: sessionId,
                    businessId,
                    appointmentType,
                    purpose: checkoutType === CheckoutType.EOA ? 'EOA' : 'DEPOSIT',
                },
                payment_method_configuration: business.paymentMethodConfigId,
                application_fee_amount: calculateApplicationFee(price),
            }, {
                stripeAccount: business.stripeAccountId,
            })

            await updateBookingSession({
                ...session,
                paymentIntentId: paymentIntent.id,
                amountDue: paymentIntent.amount,
                status: 'payment_pending',
                updatedAt: DateTime.now().toISO()!,
            })

            return paymentIntent
        }

        // ── Appointment-based path ─────────────────────────────────────────────
        if (!appointmentId) throw new Error('Either appointmentId or sessionId must be provided')

        const appointment = await Appointment.fetchById(supabase, appointmentId)
        if (!appointment || Array.isArray(appointment)) throw new Error('Appointment not found')

        if (checkoutType === CheckoutType.DEPOSIT) {
            const { data: row, error } = await supabase
                .from('appointments')
                .select('deposit_charge_id')
                .eq('id', appointment.id)
                .single()
            if (error) throw new Error(error.message)

            if (row.deposit_charge_id?.length) {
                const existing = await stripe.paymentIntents.retrieve(
                    row.deposit_charge_id,
                    { stripeAccount: business.stripeAccountId }
                )
                if (existing.status !== 'canceled') return existing
            }

            // The deposit was set when the appointment was created.
            const price = Math.round(appointment.depositPrice ?? 0)
            if (price < 50) throw new Error("This appointment doesn't need a deposit.")

            const paymentIntent = await stripe.paymentIntents.create({
                amount: price,
                currency: 'usd',
                receipt_email: appointment.clientMetadata.email,
                metadata: {
                    checkoutType,
                    appointment_id: appointment.id,
                    businessId,
                    appointmentType,
                    purpose: 'DEPOSIT',
                },
                payment_method_configuration: business.paymentMethodConfigId,
                application_fee_amount: calculateApplicationFee(price),
            }, {
                stripeAccount: business.stripeAccountId,
            })

            const { error: updateError } = await supabase
                .from('appointments')
                .update({ deposit_charge_id: paymentIntent.id })
                .eq('id', appointment.id)
            if (updateError) throw new Error(updateError.message)

            return paymentIntent
        }

        if (checkoutType === CheckoutType.EOA) {
            const { data: row, error } = await supabase
                .from('appointments')
                .select('service_charge_id')
                .eq('id', appointment.id)
                .single()
            if (error) throw new Error(error.message)

            if (row.service_charge_id?.length) {
                const existing = await stripe.paymentIntents.retrieve(
                    row.service_charge_id,
                    { stripeAccount: business.stripeAccountId }
                )
                if (existing.status !== 'canceled') return existing
            }

            const price = remainingBalance({
                amount_due: appointment.amountDue,
                deposit_price: appointment.depositPrice,
                paid_deposit: appointment.paidDeposit,
                substraction: appointment.subtraction,
            })
            if (price < 50) throw new Error('Nothing is left to pay for this appointment.')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: price,
                currency: 'usd',
                receipt_email: appointment.clientMetadata.email,
                metadata: {
                    checkoutType,
                    appointment_id: appointment.id,
                    businessId,
                    appointmentType,
                    purpose: 'EOA',
                },
                payment_method_configuration: business.paymentMethodConfigId,
                application_fee_amount: calculateApplicationFee(price),
            }, {
                stripeAccount: business.stripeAccountId,
            })

            const { error: updateError } = await supabase
                .from('appointments')
                .update({ service_charge_id: paymentIntent.id })
                .eq('id', appointment.id)
            if (updateError) throw new Error(updateError.message)

            return paymentIntent
        }

        throw new Error('Invalid checkoutType')
    } catch (error: any) {
        throw new Error(error.message)
    }
}
