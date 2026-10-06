'use client'

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useParams } from "next/navigation"
import { AlertCircle, CircleCheckBig, Clock, Loader2 } from "lucide-react"

type Outcome = 'checking' | 'succeeded' | 'processing' | 'failed' | 'error'

const COPY: Record<Exclude<Outcome, 'checking'>, { title: string; body: string }> = {
    succeeded: { title: 'Payment received', body: "Thank you! You'll get a receipt by email shortly." },
    processing: { title: 'Payment processing', body: "Your payment is on its way. We'll email your receipt once it clears." },
    failed: { title: 'Payment didn’t go through', body: 'Please go back and try another payment method.' },
    error: { title: 'We couldn’t check your payment', body: 'If you were charged you’ll get a receipt by email. Otherwise, please try again.' },
}

/** Where Stripe returns clients after paying a deposit or a balance. */
export default function CompleteClient() {
    const params = useParams()
    const [outcome, setOutcome] = useState<Outcome>('checking')

    const stripeID = Array.isArray(params.stripeID) ? params.stripeID[0] : params.stripeID

    useEffect(() => {
        const checkPayment = async () => {
            const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret")
            if (!clientSecret) { setOutcome('error'); return }
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, { stripeAccount: stripeID })
            if (!stripe) { setOutcome('error'); return }
            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
            switch (paymentIntent?.status) {
                case "succeeded": setOutcome('succeeded'); break
                case "processing": setOutcome('processing'); break
                case "requires_payment_method": setOutcome('failed'); break
                default: setOutcome('error')
            }
        }
        checkPayment().catch(() => setOutcome('error'))
    }, [stripeID])

    const copy = outcome === 'checking' ? null : COPY[outcome]
    const Icon = outcome === 'succeeded' ? CircleCheckBig : outcome === 'processing' ? Clock : AlertCircle
    const color = outcome === 'succeeded' ? '#16a34a' : outcome === 'processing' ? '#C9974A' : '#DC2626'

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center gap-3 px-5 text-center" style={{ backgroundColor: '#FAF7F2' }}>
            {!copy ? (
                <Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} />
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <Icon size={24} style={{ color }} />
                        <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>{copy.title}</h2>
                    </div>
                    <p className="text-sm max-w-sm" style={{ color: '#6F6863' }}>{copy.body}</p>
                </>
            )}
        </div>
    )
}
