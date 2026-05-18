import { createClient } from "@/app/utils/supabase/server";
import { BookingSessionData } from "../types";
import { DateTime } from "luxon";
import { stripe } from "@/lib/stripe/stripeClient";
import { createCheckout } from "@/lib/stripe/createCheckout";
import { AppointmentType as Appointment, CheckoutType } from "../../shared/appointments/types";
import Stripe from "stripe";
import { AppointmentType } from "@/features/manualBooking/server/models/Appointment";
import { getTotalAmountDue } from "./actions";

// Helper function to build booking session data for insert/update
const buildBookingSessionData = (data: BookingSessionData) => ({
    status: data.status,
    updated_at: DateTime.now().toISO(),
    service_id: data.serviceId,
    selected_datetime: data.selectDateTime,
    business_id: data.businessId,
    clientInfo: data.clientInfo,
    payment_intent_id: data.paymentIntentId,
    confirmed_at: data.confirmedAt,
    currency: 'usd',
    amount: data.amountDue,
    metadata: data.metaData as any,
    expires_at: data.expiresAt,
});

export const updateBookingSession = async (data: BookingSessionData) => {
    try {
        const supabase = await createClient();
        const { data: row, error } = await supabase
            .from('booking_sessions')
            .update(buildBookingSessionData(data))
            .eq('id', data.id!)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return row;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

export const createBookingSession = async (data: BookingSessionData) => {
    try {
        const supabase = await createClient();
        const { data: row, error } = await supabase
            .from('booking_sessions')
            .insert(buildBookingSessionData(data))
            .select()
            .single();
        if (error) throw new Error(error.message);
        return row;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

export const getBookingSession = async (id: string) => {
    try {
        const supabase = await createClient();
        const { data: row, error } = await supabase
            .from('booking_sessions')
            .select()
            .eq('id', id)
            .single();
        if (error) throw new Error(error.message);
        return {
            id: row.id,
            businessId: row.business_id,
            serviceId: row.service_id,
            selectDateTime: row.selected_datetime,
            clientInfo: {
                ...row.clientInfo as any
            },
            paymentIntentId: row.payment_intent_id,
            status: row.status,
            metaData: row.metadata,
            amountDue: row.amount,
            currency: row.currency,
            updatedAt: row.updated_at,
            confirmedAt: row.confirmed_at,
            expiresAt: row.expires_at
        } as BookingSessionData;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

export const attachPaymentIntent = async (id: string, selectedService: string, selectedAddons: string[]) => {
    try {
        const session = await getBookingSession(id);
        if (!session) throw new Error("Session not found");

        let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
        if (session.paymentIntentId) {
            paymentIntent = await stripe.paymentIntents.retrieve(session.paymentIntentId);
            if (paymentIntent.status === 'canceled') {
                paymentIntent = (await createCheckout(CheckoutType.DEPOSIT, Appointment.AUTOMATED, paymentIntent.amount, session.businessId, undefined, session.id)) as Stripe.Response<Stripe.PaymentIntent>;
            }
        } else {
            const price = await getTotalAmountDue(selectedAddons, selectedService)
            paymentIntent = (await createCheckout(CheckoutType.DEPOSIT, Appointment.AUTOMATED, price, session.businessId, undefined, session.id)) as Stripe.Response<Stripe.PaymentIntent>;
        }

        const updatedSession = await updateBookingSession({
            id: session.id,
            businessId: session.businessId,
            serviceId: session.serviceId,
            selectDateTime: session.selectDateTime,
            status: 'payment_pending',
            metaData: {},
            amountDue: paymentIntent.amount,
            currency: 'usd',
            updatedAt: session.updatedAt!,
            confirmedAt: session.confirmedAt,
            expiresAt: session.expiresAt,
            clientInfo: session.clientInfo as { firstName: string; lastName: string; email: string; phoneNumber: string; },
            paymentIntentId: paymentIntent.id,
        });
        return updatedSession;
    } catch (error) {
        throw new Error((error as Error).message);
    }
};

export const markSessionConfirmed = async (id: string, appointmentData: AppointmentType) => {
    try {
        const session = await getBookingSession(id);
        if (session?.status === 'confirmed') return;

        const supabase = await createClient();
        const { error } = await supabase.rpc('confirm_booking_session', {
            p_booking_session_id: id,
            p_business: session?.businessId || '',
            p_client_metadata: session?.clientInfo || {},
            p_service_id: session?.serviceId || '',
            p_start: appointmentData.start,
            p_end: appointmentData.end,
            p_status: 'CONFIRMED',
            p_service_data: appointmentData.serviceData as any,
            p_require_deposit: appointmentData.requireDeposit,
            p_deposit_charge_id: appointmentData.depositChargeId,
            p_paid_deposit: appointmentData.paidDeposit,
            p_reschedules: appointmentData.numberOfReschedules,
            p_deposit_price: appointmentData.depositPrice,
            p_selected_addons: appointmentData.selectedAddons as any,
            p_amount_due: appointmentData.amountDue,
            p_subtraction: appointmentData.subtraction,
        });
        if (error) throw new Error(error.message);
    } catch (error: any) {
        throw new Error(error.message);
    }
}
