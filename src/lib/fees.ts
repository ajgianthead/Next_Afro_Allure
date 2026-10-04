// What AfroAllure takes from each online booking payment, in cents.
//
// Pricing (Option A): a 1% AfroAllure platform fee, plus Stripe's card
// processing fee passed through at cost — no markup.
//
// Connected accounts are Express accounts where the platform pays Stripe's
// processing fees (controller.fees.payer = "application"), and Stripe can't
// switch existing accounts. So the processing fee is passed through the
// application fee instead: the business's payout is reduced by 1% + Stripe's
// standard card rate, and AfroAllure uses the processing part to pay Stripe.
// Cash payments never go through Stripe and have no fees.
//
// Keep this in sync with the pricing shown to businesses: FeeDisclosure,
// /for-businesses, /terms and /refunds.

export const PLATFORM_FEE_PERCENT = 0.01
export const STRIPE_PROCESSING_PERCENT = 0.029
export const STRIPE_PROCESSING_FIXED_CENTS = 30

/** AfroAllure's own platform fee (1%). */
export function calculatePlatformFee(amountInCents: number): number {
    return Math.round(amountInCents * PLATFORM_FEE_PERCENT)
}

/** Stripe's standard US card processing fee (2.9% + 30¢), passed through at cost. */
export function estimateStripeProcessingFee(amountInCents: number): number {
    return Math.round(amountInCents * STRIPE_PROCESSING_PERCENT) + STRIPE_PROCESSING_FIXED_CENTS
}

/**
 * application_fee_amount for a PaymentIntent: platform fee + card processing.
 * Never more than the charge itself (Stripe rejects that).
 */
export function calculateApplicationFee(amountInCents: number): number {
    const amount = Math.max(0, Math.round(amountInCents))
    return Math.min(amount, calculatePlatformFee(amount) + estimateStripeProcessingFee(amount))
}
