'use server'

import { createClient } from "@/app/utils/supabase/server"
import { AccountSettings } from "./settingsclient"
import { stripe } from "@/lib/stripe/stripeClient"
import { isValidTimezone } from "@/lib/timezone"

const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL

export type SaveSettingsResult =
    | { ok: true; accountSettings: AccountSettings; email: string }
    | { ok: false; error: string }

export const saveAccountSettings = async (account_settings: AccountSettings, businessId: string, email: string): Promise<SaveSettingsResult> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'You are signed out. Please sign in again.' }

    const { data: existing } = await supabase
        .from('business_users')
        .select('account_settings')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .single()
    if (!existing) return { ok: false, error: 'Business not found.' }

    // Merge so keys this form doesn't manage (timezone, specialty, …) survive.
    const current = (existing.account_settings ?? {}) as Record<string, any>
    const merged = {
        ...current,
        ...account_settings,
        timezone: isValidTimezone((account_settings as any).timezone) ? (account_settings as any).timezone : current.timezone,
    }

    const { data, error } = await supabase
        .from('business_users')
        .update({ account_settings: merged as any, email: email.trim() })
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .select('account_settings, email')
        .single()
    // Previously the error object was returned and the client checked
    // `instanceof PostgrestError`, which never matches after serialization —
    // so failed saves still showed "Settings saved."
    if (error || !data) return { ok: false, error: error?.message ?? 'Failed to save settings.' }
    return { ok: true, accountSettings: data.account_settings as unknown as AccountSettings, email: data.email }
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
