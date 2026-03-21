'use server'

import { stripe } from "@lib/utils";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../lib/database.types";

export const createSubscriptionForExistingCustomer = async (customerID: string) => {
    const testPriceID = "price_1T1gbrC6prOhOhXuRmxVmXsd"
    const priceID = "price_1Sz52NFwA4PUWysawKBx8gUZ"
    const DOMAIN = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PROD_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL
    let checkoutSession;
    const supabase = createClient<Database>()
    const { data: hadTrial, error } = await supabase.from('business_users').select('had_trial, business_id').eq('stripe_customer_id', customerID).maybeSingle()
    try {
        if (!hadTrial?.had_trial) {
            // With trial
            checkoutSession = await stripe.checkout.sessions.create({
                billing_address_collection: 'auto',
                line_items: [{
                    price: process.env.NODE_ENV === 'production' ? priceID : testPriceID,
                    quantity: 1,
                }],
                mode: 'subscription',

                payment_method_collection: 'if_required',
                subscription_data: {
                    trial_period_days: 14,
                    trial_settings: {
                        end_behavior: {
                            missing_payment_method: 'pause'
                        }
                    }
                },
                success_url: `${DOMAIN}/dashboard/?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${DOMAIN}/dashboard/?success=false`,

                customer: customerID
            })
            if (customerID === undefined) {
                const supabase = createClient<Database>()
                await supabase.from('business_users').update({
                    stripe_customer_id: checkoutSession.customer as string
                }).eq('business_id', hadTrial?.business_id!)
            }
        } else {
            // Without trial
            checkoutSession = await stripe.checkout.sessions.create({
                billing_address_collection: 'auto',
                line_items: [{
                    price: priceID,
                    quantity: 1,
                }],
                mode: 'subscription',
                payment_method_collection: 'always',
                success_url: `https://beta.afroallure.co/subscriptionResult/?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: "https://beta.afroallure.co/dashboard",
                customer: customerID
            })
            if (customerID === undefined) {
                const supabase = createClient<Database>()
                await supabase.from('business_users').update({
                    stripe_customer_id: checkoutSession.customer as string
                }).eq('business_id', hadTrial.business_id!)
            }
        }

        return checkoutSession
    } catch (err) {
        throw err
    }
}

export const createSubscriptionCheckout = async (had_trial: boolean, businessID?: string, customerID?: string,) => {
    const testPriceID = "price_1T1gbrC6prOhOhXuRmxVmXsd"
    const priceID = "price_1Sz52NFwA4PUWysawKBx8gUZ"
    const DOMAIN = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PROD_BASE_URL : process.env.NEXT_PUBLIC_BASE_URL
    let checkoutSession;
    try {
        if (!had_trial) {
            // With trial
            checkoutSession = await stripe.checkout.sessions.create({
                billing_address_collection: 'auto',
                line_items: [{
                    price: process.env.NODE_ENV === 'production' ? priceID : testPriceID,
                    quantity: 1,
                }],
                mode: 'subscription',

                payment_method_collection: 'if_required',
                subscription_data: {
                    trial_period_days: 14,
                    trial_settings: {
                        end_behavior: {
                            missing_payment_method: 'pause'
                        }
                    }
                },
                success_url: `${DOMAIN}/dashboard/?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${DOMAIN}/dashboard/?success=false`,

                customer: customerID
            })
            if (customerID === undefined) {
                const supabase = createClient<Database>()
                await supabase.from('business_users').update({
                    stripe_customer_id: checkoutSession.customer as string
                }).eq('business_id', businessID!)
            }
        } else {
            // Without trial
            checkoutSession = await stripe.checkout.sessions.create({
                billing_address_collection: 'auto',
                line_items: [{
                    price: priceID,
                    quantity: 1,
                }],
                mode: 'subscription',
                payment_method_collection: 'always',
                success_url: `https://beta.afroallure.co/subscriptionResult/?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: "https://beta.afroallure.co/dashboard",
                customer: customerID
            })
        }

        return checkoutSession
    } catch (error) {
        throw error
    }

}
