'use server'

import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";
import { BookingSettings, PaymentConfig } from "./bookingSettingsClient";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/stripeClient";
import Stripe from "stripe";



export const handleBookingSettings = async (bookingSettings: any, businessId: string, paymentConfigId: string, paymentConfig: PaymentConfig, ogPaymentConfig: any) => {
    const supabase = await createClient<Database>();
    let oldPayConfig = JSON.stringify({
        google_pay: {
            display_preference: {
                preference: ogPaymentConfig.google_pay?.display_preference.preference!
            }
        },
        apple_pay: {
            display_preference: {
                preference: ogPaymentConfig.apple_pay?.display_preference.preference!
            }
        },
        amazon_pay: {
            display_preference: {
                preference: ogPaymentConfig.amazon_pay?.display_preference.preference!
            }
        },
        cashapp: {
            display_preference: {
                preference: ogPaymentConfig.cashapp?.display_preference.preference!
            }
        },
    })
    let newPayConfig = JSON.stringify(paymentConfig)
    const { data: hasOnboarded } = await supabase.from('business_users').select('completed_stripe_onboarding, stripe_acc_id').eq('business_id', businessId).maybeSingle()
    if (!hasOnboarded?.completed_stripe_onboarding && bookingSettings.deposit.enabled) {
        return false
    }
    if (newPayConfig === oldPayConfig) { // If the payment method config isn't different from the one already stored, don't update it
        await stripe.paymentMethodConfigurations.update(paymentConfigId, {
            google_pay: {
                display_preference: {
                    preference: paymentConfig.google_pay.display_preference.preference
                }
            },
            apple_pay: {
                display_preference: {
                    preference: paymentConfig.apple_pay.display_preference.preference
                }
            },
            amazon_pay: {
                display_preference: {
                    preference: paymentConfig.amazon_pay.display_preference.preference
                }
            },
            cashapp: {
                display_preference: {
                    preference: paymentConfig.cashapp.display_preference.preference
                }
            }
        }, {
            stripeAccount: hasOnboarded?.stripe_acc_id!
        })
    }

    const { data, error } = await supabase.from('business_policies').insert(
        {
            business: businessId,
            deposit: bookingSettings.deposit,
            late_fee: bookingSettings.lateFee,
            no_show: bookingSettings.noShowPolicy,
            cancel_day_limit: bookingSettings.cancelDayLimit,
            important_info: bookingSettings.importantInfo,
            read_before_booking: bookingSettings.readBeforeBooking,
            reschedule_day_limit: bookingSettings.rescheduleDayLimit,
            reschedule_limit: bookingSettings.rescheduleLimit,
            book_ahead_value: bookingSettings.bookAheadValue
        }
    ).select("id").then(async (result: PostgrestSingleResponse<{
        id: string;
    }[]>) => {
        return await supabase.from('business_users').update({
            booking_policies: result.data![0].id
        }).eq("business_id", businessId).select("booking_policies")
    });
    console.log(data, error)

    if (error) {
        return error
    }
    return data
}
