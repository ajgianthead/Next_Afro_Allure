'use server'

import { stripe } from "../../../../../lib/utils";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../../lib/database.types";

export const updateStripeOnboardInfo = async (stripeId: string) => {
    const account = await stripe.accounts.retrieve(stripeId);
    if (account.requirements!.currently_due!.length === 0) {
        const supabase = createClient<Database>();
        const { data, error } = await supabase.from('business_users').update({
            completed_stripe_onboarding: true
        }).eq('stripe_acc_id', stripeId).select().single();
        if (error) {
            console.error(error);
        }
        return data
    }
    return -1
}
