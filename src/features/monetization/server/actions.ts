'use server'

import { stripe } from '@/lib/stripe/stripeClient'
import { createClient } from '@/app/utils/supabase/server'

export const checkCompletedOnboarding = async (businessId: string): Promise<boolean> => {
    const supabase = await createClient()
    const { data } = await supabase
        .from('business_users')
        .select('completed_stripe_onboarding')
        .eq('business_id', businessId)
        .single()
    return data?.completed_stripe_onboarding ?? false
}

export const createStripeLoginLink = async (connectedAccountId: string): Promise<string> => {
    const loginLink = await stripe.accounts.createLoginLink(connectedAccountId)
    return loginLink.url
}
