import { redirect } from 'next/navigation'

// Returning paid subscribers land here after Stripe checkout.
// Redirect immediately to the dashboard — the webhook will have updated plan_type
// and the ?success=true param triggers the confirmation banner.
export default function SubscriptionResult() {
    redirect('/dashboard?success=true')
}
