import { redirect } from 'next/navigation'
import SettingsClient from "./settingsclient";
import type { SubscriptionInfo } from "./settingsclient";
import { fetchBusinessUser, fetchUser } from "../actions";
import { stripe } from "@/lib/stripe/stripeClient";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const business = await fetchBusinessUser(user.id)

    let subscription: SubscriptionInfo | null = null
    if (business.stripe_customer_id) {
        const subs = await stripe.subscriptions.list({
            customer: business.stripe_customer_id,
            status: 'all',
            limit: 1,
        })
        const sub = subs.data[0]
        if (sub) {
            subscription = {
                id: sub.id,
                status: sub.status,
                // In Stripe API 2025+, current_period_end lives on the SubscriptionItem
                current_period_end: sub.items.data[0]?.current_period_end ?? 0,
                cancel_at_period_end: sub.cancel_at_period_end,
                trial_end: sub.trial_end ?? null,
            }
        }
    }

    return <SettingsClient business={business} subscription={subscription} />;
}
