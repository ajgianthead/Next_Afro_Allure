'use client'

import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { useParams } from "next/navigation"

export default function CompleteClient() {
    const params = useParams()
    const [message, setMessage] = useState("Checking payment...")

    const stripeID = Array.isArray(params.stripeID)
        ? params.stripeID[0]
        : params.stripeID

    useEffect(() => {
        const checkPayment = async () => {
            const stripe = await loadStripe(
                process.env.NODE_ENV === "development"
                    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
                    : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!,
                { stripeAccount: stripeID }
            )

            if (!stripe) return

            const params = new URLSearchParams(window.location.search)
            const clientSecret = params.get("payment_intent_client_secret")

            if (!clientSecret) {
                setMessage("Missing payment information.")
                return
            }

            const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)

            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Success! Payment received.")
                    break

                case "processing":
                    setMessage("Payment processing.")
                    break

                case "requires_payment_method":
                    setMessage("Payment failed. Please try another payment method.")
                    break

                default:
                    setMessage("Something went wrong.")
            }
        }

        checkPayment()
    }, [stripeID])

    return <div>{message}</div>
}
