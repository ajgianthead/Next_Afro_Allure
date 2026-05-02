'use server'

import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";

const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL

export const createSubscriptionForExistingCustomer = async (customerID: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_users')
        .select('had_trial, business_id')
        .eq('stripe_customer_id', customerID)
        .maybeSingle()
    if (error) throw error

    if (!data?.had_trial) {
        // First-time subscriber — offer 14-day trial
        return stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            payment_method_collection: 'if_required',
            subscription_data: {
                trial_period_days: 14,
                trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
            },
            success_url: `${DOMAIN}/dashboard/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/dashboard/?success=false`,
            customer: customerID,
        })
    }

    // Returning subscriber — no trial
    return stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
        mode: 'subscription',
        payment_method_collection: 'always',
        success_url: `${DOMAIN}/subscriptionResult/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/dashboard`,
        customer: customerID,
    })
}

export const createSubscriptionCheckout = async (had_trial: boolean, businessID?: string, customerID?: string) => {
    if (!had_trial) {
        // First-time subscriber — offer 14-day trial
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
            mode: 'subscription',
            payment_method_collection: 'if_required',
            subscription_data: {
                trial_period_days: 14,
                trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
            },
            success_url: `${DOMAIN}/dashboard/?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${DOMAIN}/dashboard/?success=false`,
            customer: customerID,
        })

        // If no existing customer, persist the newly created Stripe customer ID
        if (!customerID && businessID) {
            const supabase = await createClient()
            await supabase
                .from('business_users')
                .update({ stripe_customer_id: session.customer as string })
                .eq('business_id', businessID)
        }

        return session
    }

    // Returning subscriber — no trial
    return stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [{ price: process.env.STRIPE_GROWTH_PRICE_ID!, quantity: 1 }],
        mode: 'subscription',
        payment_method_collection: 'always',
        success_url: `${DOMAIN}/subscriptionResult/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/dashboard`,
        customer: customerID,
    })
}
