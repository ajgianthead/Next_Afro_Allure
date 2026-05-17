'use server'

import { createClient } from "@/app/utils/supabase/server"
import { BusinessUser } from "../businessUser/BusinessUser"
import { Appointment } from "../../features/manualBooking/server/models/Appointment"
import { stripe } from "./stripeClient"
import Stripe from "stripe"
import { AppointmentType, CheckoutType } from "../../features/shared/appointments/types"
import { getBookingSession, updateBookingSession } from "@/features/automatedBooking/server/domain"
import { DateTime } from "luxon"
import { calculatePlatformFee } from "@/lib/fees"

export const createCheckout = async (
    checkoutType: CheckoutType,
    appointmentType: AppointmentType,
    price: number,
    businessId: string,
    appointmentId?: string,
    sessionId?: string
): Promise<Stripe.PaymentIntent> => {
    try {
        const supabase = await createClient()
        const business = await BusinessUser.fetch(supabase, businessId)

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
                application_fee_amount: calculatePlatformFee(price),
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
                application_fee_amount: calculatePlatformFee(price),
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
                application_fee_amount: calculatePlatformFee(price),
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
