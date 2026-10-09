import { stripe } from '@/lib/stripe/stripeClient'
import type { BillingInterval } from '../plans'

export function growthPriceId(interval: BillingInterval): string {
    const id = interval === 'year' ? process.env.STRIPE_GROWTH_YEARLY_PRICE_ID : process.env.STRIPE_GROWTH_PRICE_ID
    if (!id) throw new Error(`${interval === 'year' ? 'STRIPE_GROWTH_YEARLY_PRICE_ID' : 'STRIPE_GROWTH_PRICE_ID'} env var not set`)
    return id
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
