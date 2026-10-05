'use server'

import { createClient } from "@/app/utils/supabase/server";
import { BookingSettings, PaymentConfig } from "./bookingSettingsClient";
import { stripe } from "@/lib/stripe/stripeClient";
import { NO_SHOW_FEE_OFF, parseNoShowFee } from "@/features/noShowFees/noShowFee";

export const handleBookingSettings = async (
    bookingSettings: any,
    businessId: string,
    paymentConfigId: string,
    paymentConfig: PaymentConfig,
    ogPaymentConfig: any
) => {
    const supabase = await createClient()

    const oldPayConfig = JSON.stringify({
        google_pay: { display_preference: { preference: ogPaymentConfig.google_pay?.display_preference.preference } },
        apple_pay: { display_preference: { preference: ogPaymentConfig.apple_pay?.display_preference.preference } },
        amazon_pay: { display_preference: { preference: ogPaymentConfig.amazon_pay?.display_preference.preference } },
        cashapp: { display_preference: { preference: ogPaymentConfig.cashapp?.display_preference.preference } },
    })
    const newPayConfig = JSON.stringify(paymentConfig)

    const { data: bizData } = await supabase
        .from('business_users')
        .select('completed_stripe_onboarding, stripe_acc_id')
        .eq('business_id', businessId)
        .maybeSingle()

    if (!bizData?.completed_stripe_onboarding && bookingSettings.deposit.enabled) {
        return false
    }

    // Only call Stripe API when the payment config actually changed
    if (newPayConfig !== oldPayConfig) {
        await stripe.paymentMethodConfigurations.update(
            paymentConfigId,
            {
                google_pay: { display_preference: { preference: paymentConfig.google_pay.display_preference.preference } },
                apple_pay: { display_preference: { preference: paymentConfig.apple_pay.display_preference.preference } },
                amazon_pay: { display_preference: { preference: paymentConfig.amazon_pay.display_preference.preference } },
                cashapp: { display_preference: { preference: paymentConfig.cashapp.display_preference.preference } },
            },
            { stripeAccount: bizData?.stripe_acc_id! }
        )
    }

    const { data: policyData, error: policyError } = await supabase
        .from('business_policies')
        .insert({
            business: businessId,
            deposit: bookingSettings.deposit,
            late_fee: bookingSettings.lateFee,
            no_show: bookingSettings.noShowPolicy,
            // Only once the column exists (the settings page sends it then).
            ...(bookingSettings.noShowFee !== undefined
                ? { no_show_fee: { ...(bookingSettings.deposit?.enabled ? parseNoShowFee(bookingSettings.noShowFee) : NO_SHOW_FEE_OFF) } }
                : {}),
            cancel_day_limit: bookingSettings.cancelDayLimit,
            important_info: bookingSettings.importantInfo,
            read_before_booking: bookingSettings.readBeforeBooking,
            reschedule_day_limit: bookingSettings.rescheduleDayLimit,
            reschedule_limit: bookingSettings.rescheduleLimit,
            book_ahead_value: bookingSettings.bookAheadValue,
        })
        .select('id')

    if (policyError) return policyError

    const { data, error } = await supabase
        .from('business_users')
        .update({ booking_policies: policyData[0].id })
        .eq('business_id', businessId)
        .select('booking_policies')

    if (error) return error
    return data
}
