'use server'

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/app/utils/supabase/admin";
import { requireOwnBusinessId } from "@/lib/auth/requireBusinessOwner";
import { TRIAL_DAYS, type BillingInterval } from "@/features/billing/plans";
import { clearStaleSubscriptions, growthPriceId, hasLiveSubscription } from "@/features/billing/server/trial";

const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL

// Success/cancel URLs used by every checkout path — keeps all flows consistent.
const SUCCESS_URL = `${DOMAIN}/dashboard?success=true`
const CANCEL_URL = `${DOMAIN}/dashboard`

if (!process.env.STRIPE_GROWTH_PRICE_ID) {
    throw new Error('STRIPE_GROWTH_PRICE_ID env var not set')
}


/**
 * One Checkout Session shape for every way into Growth. First-time
 * subscribers get the free trial without a card (the subscription pauses if
 * none is added by the end); returning subscribers pay up front. Promotion
 * codes are accepted on every session.
 */
async function growthCheckout(customer: string, firstTime: boolean, interval: BillingInterval) {
    if (await hasLiveSubscription(customer)) throw new Error('This account already has a Growth subscription.')
    await clearStaleSubscriptions(customer)
    const params: Stripe.Checkout.SessionCreateParams = {
        billing_address_collection: 'auto',
        line_items: [{ price: growthPriceId(interval), quantity: 1 }],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
        customer,
        // A card is still required whenever something is due today; this only
        // skips it during a trial or when a 100%-off code brings the total to $0.
        payment_method_collection: 'if_required',
    }
    if (firstTime) {
        params.subscription_data = {
            trial_period_days: TRIAL_DAYS,
            trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
        }
    }
    return stripe.checkout.sessions.create(params)
}

export const createSubscriptionForExistingCustomer = async (customerID: string, interval: BillingInterval = 'month') => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('business_users')
        .select('had_trial, business_id')
        .eq('stripe_customer_id', customerID)
        .maybeSingle()
    if (error) throw error

    return growthCheckout(customerID, !data?.had_trial, interval)
}

export const createSubscriptionCheckout = async (
    had_trial: boolean,
    businessID?: string,
    customerID?: string,
    interval: BillingInterval = 'month'
) => {
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
        if (biz.stripe_customer_id) return createSubscriptionForExistingCustomer(biz.stripe_customer_id, interval)
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

    return growthCheckout(effectiveCustomerId!, !had_trial, interval)
}

/** Checkout for the signed-in business — what the dashboard plan picker calls. Returns the Checkout URL. */
export const startGrowthCheckout = async (interval: BillingInterval): Promise<string> => {
    const businessId = await requireOwnBusinessId()
    const supabase = createAdminClient()
    const { data: biz } = await supabase
        .from('business_users')
        .select('had_trial, stripe_customer_id')
        .eq('business_id', businessId)
        .single()
    if (!biz) throw new Error('Business not found')

    const session = biz.stripe_customer_id
        ? await growthCheckout(biz.stripe_customer_id, !biz.had_trial, interval)
        : await createSubscriptionCheckout(!!biz.had_trial, businessId, undefined, interval)
    if (!session.url) throw new Error('Checkout did not return a URL')
    return session.url
}

/**
 * Moves the signed-in business's live Growth subscription (trialing or active)
 * between monthly and yearly. During a trial nothing is charged; on an active
 * plan Stripe prorates the change onto the next invoice.
 */
export const switchGrowthInterval = async (interval: BillingInterval): Promise<{ ok: true } | { ok: false; error: string }> => {
    const businessId = await requireOwnBusinessId()
    const { data: biz } = await createAdminClient()
        .from('business_users')
        .select('stripe_customer_id')
        .eq('business_id', businessId)
        .single()
    if (!biz?.stripe_customer_id) return { ok: false, error: 'No subscription found.' }

    const subs = await stripe.subscriptions.list({ customer: biz.stripe_customer_id, status: 'all', limit: 10 })
    const sub = subs.data.find(s => ['trialing', 'active', 'past_due'].includes(s.status))
    const item = sub?.items.data[0]
    if (!sub || !item) return { ok: false, error: 'No subscription found.' }

    const price = growthPriceId(interval)
    if (item.price.id === price) return { ok: true }
    await stripe.subscriptions.update(sub.id, {
        items: [{ id: item.id, price }],
        proration_behavior: sub.status === 'trialing' ? 'none' : 'create_prorations',
    })
    return { ok: true }
}
