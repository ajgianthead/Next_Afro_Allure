'use server'

import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";

export const updateStripeOnboardInfo = async (stripeId: string) => {
    const account = await stripe.accounts.retrieve(stripeId);
    if (account.requirements!.currently_due!.length === 0) {
        const supabase = await createClient<Database>();
        const paymentConfig = await stripe.paymentMethodConfigurations.create({
            name: `aa-${stripeId}`,
            card: {
                display_preference: {
                    preference: 'on'
                }
            },
            google_pay: {
                display_preference: {
                    preference: 'off'
                }
            },
            apple_pay: {
                display_preference: {
                    preference: 'off'
                }
            },
            amazon_pay: {
                display_preference: {
                    preference: 'off'
                }
            },
            cashapp: {
                display_preference: {
                    preference: 'off'
                }
            }
        }, {
            stripeAccount: stripeId
        })
        const { data, error } = await supabase.from('business_users').update({
            completed_stripe_onboarding: true,
            payment_method_config_id: paymentConfig.id
        }).eq('stripe_acc_id', stripeId).select().maybeSingle();

        if (error) {
            console.error(error);
        }
        return data
    }
    return -1
}
