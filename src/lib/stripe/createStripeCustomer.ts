import { stripe } from "@lib/utils"

export const createStripeCustomer = async (email: string) => {
    const customer = await stripe.customers.create({
        email: email
    })
    return customer
}
