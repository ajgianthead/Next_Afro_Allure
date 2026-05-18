'use server'

import { createClient } from "@/app/utils/supabase/server"
import { AccountSettings } from "./settingsclient"
import { stripe } from "@/lib/stripe/stripeClient"

const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL

export const saveAccountSettings = async (account_settings: AccountSettings, businessId: string, email: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_users')
        .update({ account_settings: account_settings as any, email })
        .eq('business_id', businessId)
        .select('account_settings')
        .single()
    if (error) return error
    return data
}

export const cancelSubscription = async (subscriptionId: string) => {
    return await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}

export const reactivateSubscription = async (subscriptionId: string) => {
    return await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
}

export const createBillingPortalSession = async (customerId: string) => {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${DOMAIN}/dashboard/settings`,
    })
    return session.url
}
