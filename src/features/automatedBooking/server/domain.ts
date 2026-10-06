import { createAdminClient } from '@/app/utils/supabase/admin'
import { BookingSessionData } from "../types";
import { DateTime } from "luxon";
import { stripe } from "@/lib/stripe/stripeClient";
import { createCheckout } from "@/lib/stripe/createCheckout";
import { AppointmentType as Appointment, CheckoutType } from "../../shared/appointments/types";
import Stripe from "stripe";
import { AppointmentType } from "@/features/manualBooking/server/models/Appointment";
import { getTotalAmountDue } from "./actions";
import { BusinessUser } from "@/lib/businessUser/BusinessUser";
import { isClientBannedFromBusiness } from "app/dashboard/(other)/clients/actions";

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
        const supabase = createAdminClient();
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
        const supabase = createAdminClient();
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
        const supabase = createAdminClient();
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

        // Block here, before a PaymentIntent (and thus a payment form) is
        // ever created — nothing earlier in the automated-booking flow
        // checked bans at all, so a banned client could simply re-book.
        const clientInfo = session.clientInfo as { email?: string; phoneNumber?: string } | null
        const isBanned = await isClientBannedFromBusiness(clientInfo?.email, clientInfo?.phoneNumber, session.businessId)
        if (isBanned) throw new Error('This business is not accepting bookings from you.')

        let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
        if (session.paymentIntentId) {
            // The PI was created under the connected account's namespace
            // (createCheckout always passes stripeAccount), so retrieving it
            // from the platform account context throws "No such payment_intent".
            const supabase = createAdminClient();
            const business = await BusinessUser.fetch(supabase, session.businessId);
            paymentIntent = await stripe.paymentIntents.retrieve(session.paymentIntentId, {
                stripeAccount: business.stripeAccountId,
            });
            if (paymentIntent.status === 'canceled') {
                paymentIntent = (await createCheckout(CheckoutType.DEPOSIT, Appointment.AUTOMATED, paymentIntent.amount, session.businessId, undefined, session.id, { serviceId: selectedService, addonIds: selectedAddons })) as Stripe.Response<Stripe.PaymentIntent>;
            }
        } else {
            const price = await getTotalAmountDue(selectedAddons, selectedService)
            paymentIntent = (await createCheckout(CheckoutType.DEPOSIT, Appointment.AUTOMATED, price, session.businessId, undefined, session.id, { serviceId: selectedService, addonIds: selectedAddons })) as Stripe.Response<Stripe.PaymentIntent>;
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

        // Redundant with the check in attachPaymentIntent, in case clientInfo
        // wasn't populated on the session yet at that earlier step — this is
        // the terminal step that actually creates the appointment, so it's
        // the last chance to stop a banned client from ending up with a
        // confirmed booking.
        const clientInfo = session?.clientInfo as { email?: string; phoneNumber?: string } | null
        const isBanned = await isClientBannedFromBusiness(clientInfo?.email, clientInfo?.phoneNumber, session?.businessId || '')
        if (isBanned) throw new Error('This business is not accepting bookings from you.')

        const supabase = createAdminClient();
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
