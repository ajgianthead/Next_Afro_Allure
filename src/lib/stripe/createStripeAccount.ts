import { stripe } from "./stripeClient"

export const createStripeAccount = async () => {
    const account = await stripe.accounts.create({
        controller: {
            stripe_dashboard: {
                type: "express",
            },
            fees: {
                payer: "application"
            },
            losses: {
                payments: "application"
            },
        },
    })
    return account
}
