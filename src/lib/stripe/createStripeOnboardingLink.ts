import { stripe } from "@lib/utils"
import { SupabaseClient } from "@supabase/supabase-js"
import { Database } from "../../../lib/database.types"

export const createStripeOnboardingLink = async (stripeAccountId: string) => {
    const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/onboarding/${stripeAccountId}`,
        return_url: `${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/onboarding/${stripeAccountId}/return`,
        type: 'account_onboarding',
        collection_options: {
            fields: "eventually_due"
        }
    })
    return accountLink.url
}
