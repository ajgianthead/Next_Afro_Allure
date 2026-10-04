'use server'

import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/app/utils/supabase/admin";

const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL

// Success/cancel URLs used by every checkout path — keeps all flows consistent.
const SUCCESS_URL = `${DOMAIN}/dashboard?success=true`
const CANCEL_URL = `${DOMAIN}/dashboard`

if (!process.env.STRIPE_GROWTH_PRICE_ID) {
    throw new Error('STRIPE_GROWTH_PRICE_ID env var not set')
}

export const createSubscriptionForExistingCustomer = async (customerID: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_users')
        .select('had_trial, business_id')
        .eq('stripe_customer_id', customerID)
        .maybeSingle()
    if (error) throw error

    if (!data?.had_trial) {
        // First-time subscriber — offer 14-day trial, no card required to start
        return await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            payment_method_collection: 'if_required',
            subscription_data: {
                trial_period_days: 14,
                trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
            },
            success_url: SUCCESS_URL,
            cancel_url: CANCEL_URL,
            customer: customerID,
        })
    }

    // Returning subscriber — no trial, card required upfront
    return await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
        mode: 'subscription',
        payment_method_collection: 'always',
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
        customer: customerID,
    })
}

export const createSubscriptionCheckout = async (had_trial: boolean, businessID?: string, customerID?: string) => {
    let effectiveCustomerId = customerID

    // If no Stripe customer exists yet, create one and persist the ID so future
    // upgrades correctly go through createSubscriptionForExistingCustomer.
    if (!customerID && businessID) {
        // Service role: this runs right after signup (possibly before a session
        // exists) and stripe_customer_id is a protected column. Only ever fills
        // an empty value, so it can't overwrite another business's customer.
        const supabase = createAdminClient()
        const { data: biz } = await supabase
            .from('business_users')
            .select('email, business_name, stripe_customer_id')
            .eq('business_id', businessID)
            .single()
        if (!biz) throw new Error('Business not found')
        if (biz.stripe_customer_id) return createSubscriptionForExistingCustomer(biz.stripe_customer_id)
        const customer = await stripe.customers.create({
            email: biz?.email ?? undefined,
            name: biz?.business_name ?? undefined,
            metadata: { businessId: businessID },
        })
        await supabase
            .from('business_users')
            .update({ stripe_customer_id: customer.id })
            .eq('business_id', businessID)
            .or('stripe_customer_id.is.null,stripe_customer_id.eq.')
        effectiveCustomerId = customer.id
    }

    if (!had_trial) {
        // First-time subscriber — 14-day trial, no card required
        return await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            payment_method_collection: 'if_required',
            subscription_data: {
                trial_period_days: 14,
                trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
            },
            success_url: SUCCESS_URL,
            cancel_url: CANCEL_URL,
            customer: effectiveCustomerId,
        })
    }

    // Returning subscriber — no trial, card required
    return await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
        mode: 'subscription',
        payment_method_collection: 'always',
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
        customer: effectiveCustomerId,
    })
}
