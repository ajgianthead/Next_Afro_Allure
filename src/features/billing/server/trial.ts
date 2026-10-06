import { stripe } from '@/lib/stripe/stripeClient'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { TRIAL_DAYS, type BillingInterval } from '../plans'

export function growthPriceId(interval: BillingInterval): string {
    const id = interval === 'year' ? process.env.STRIPE_GROWTH_YEARLY_PRICE_ID : process.env.STRIPE_GROWTH_PRICE_ID
    if (!id) throw new Error(`${interval === 'year' ? 'STRIPE_GROWTH_YEARLY_PRICE_ID' : 'STRIPE_GROWTH_PRICE_ID'} env var not set`)
    return id
}

/**
 * Every new business starts on a Growth trial without entering a card. If no
 * card is added by the end, Stripe pauses the subscription and the webhook
 * moves the business to Starter. Never throws — a Stripe hiccup must not
 * block signup (the business simply starts on Starter and can start the
 * trial from the plan picker). Returns whether the trial started.
 */
export async function startSignupTrial(businessId: string, customerId: string, interval: BillingInterval = 'month'): Promise<boolean> {
    try {
        await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: growthPriceId(interval) }],
            trial_period_days: TRIAL_DAYS,
            trial_settings: { end_behavior: { missing_payment_method: 'pause' } },
            payment_settings: { save_default_payment_method: 'on_subscription' },
            metadata: { businessId, source: 'signup_trial' },
        })
        // The webhook records this too; set it now so the first dashboard load is already on Growth.
        await createAdminClient()
            .from('business_users')
            .update({ plan_type: 'GROWTH', subscription_plan: 'GROWTH', subscription_status: 'trialing', had_trial: true })
            .eq('business_id', businessId)
        return true
    } catch (err) {
        console.error('Failed to start signup trial:', err)
        return false
    }
}

/**
 * A trial that ended without a card leaves a paused subscription behind.
 * Cancel it before a new checkout so the business never ends up with two.
 */
export async function clearStaleSubscriptions(customerId: string): Promise<void> {
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
    await Promise.all(
        subs.data
            .filter(s => s.status === 'paused' || s.status === 'incomplete')
            .map(s => stripe.subscriptions.cancel(s.id).catch(err => console.error('Failed to cancel stale subscription:', err)))
    )
}

/** True when the customer already has a live Growth subscription (trialing, active or past due). */
export async function hasLiveSubscription(customerId: string): Promise<boolean> {
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
    return subs.data.some(s => ['trialing', 'active', 'past_due'].includes(s.status))
}
