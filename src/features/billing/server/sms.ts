import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/stripeClient'
import { createAdminClient } from '@/app/utils/supabase/admin'
import type { BillingInterval } from '../plans'
import { growthPriceId } from './trial'
import { twilioConfigured } from '@/lib/sms/twilio'

// The SMS Reminders add-on is a second item on the business's Growth
// subscription, billed on the same schedule (a subscription's items must
// share one interval, so yearly Growth takes the yearly SMS price).

export function smsPriceId(interval: BillingInterval): string {
    const id = interval === 'year' ? process.env.STRIPE_SMS_YEARLY_PRICE_ID : process.env.STRIPE_SMS_PRICE_ID
    if (!id) throw new Error(`${interval === 'year' ? 'STRIPE_SMS_YEARLY_PRICE_ID' : 'STRIPE_SMS_PRICE_ID'} env var not set`)
    return id
}

/**
 * Whether SMS Reminders can be sold and sent here: Twilio and both SMS
 * prices are set. Until then the add-on shows as coming soon, so nobody
 * pays for texts that can't go out.
 */
export function smsAddonAvailable(): boolean {
    return twilioConfigured() && !!process.env.STRIPE_SMS_PRICE_ID && !!process.env.STRIPE_SMS_YEARLY_PRICE_ID
}

/** The SMS price ids that are configured; empty when the add-on isn't set up in this environment. */
function configuredSmsPriceIds(): string[] {
    return [process.env.STRIPE_SMS_PRICE_ID, process.env.STRIPE_SMS_YEARLY_PRICE_ID].filter((id): id is string => !!id)
}

export function isSmsItem(item: Stripe.SubscriptionItem): boolean {
    return configuredSmsPriceIds().includes(item.price.id)
}

/** The Growth item: any item that isn't the SMS add-on. */
export function growthItemOf(sub: Stripe.Subscription): Stripe.SubscriptionItem | undefined {
    return sub.items.data.find(item => !isSmsItem(item))
}

export function smsItemOf(sub: Stripe.Subscription): Stripe.SubscriptionItem | undefined {
    return sub.items.data.find(isSmsItem)
}

export function intervalOf(item: Stripe.SubscriptionItem): BillingInterval {
    return item.price.recurring?.interval === 'year' ? 'year' : 'month'
}

const LIVE = ['trialing', 'active', 'past_due']

export async function liveSubscription(customerId: string): Promise<Stripe.Subscription | undefined> {
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 })
    return subs.data.find(s => LIVE.includes(s.status))
}

/**
 * Sets business_users.sms_enabled from Stripe: on only while a live
 * subscription carries the SMS price. Reads Stripe rather than the event, so
 * events arriving out of order (a stale trial cancelled after a new
 * subscription starts) can't switch it off wrongly.
 */
export async function syncSmsEnabled(customerId: string): Promise<void> {
    if (configuredSmsPriceIds().length === 0) return
    const sub = await liveSubscription(customerId)
    const enabled = !!(sub && smsItemOf(sub))
    const { error } = await createAdminClient()
        .from('business_users')
        .update({ sms_enabled: enabled })
        .eq('stripe_customer_id', customerId)
    if (error) throw error
}

/** Items for moving a subscription to another interval: Growth and, if present, SMS move together. */
export function itemsForInterval(sub: Stripe.Subscription, interval: BillingInterval): Stripe.SubscriptionUpdateParams.Item[] {
    const growth = growthItemOf(sub)
    const sms = smsItemOf(sub)
    const items: Stripe.SubscriptionUpdateParams.Item[] = []
    if (growth) items.push({ id: growth.id, price: growthPriceId(interval) })
    if (sms) items.push({ id: sms.id, price: smsPriceId(interval) })
    return items
}
