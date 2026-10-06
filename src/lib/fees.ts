// What AfroAllure takes from each online booking payment, in cents.
//
// Pricing: Growth (paid, trialing or comped) pays no AfroAllure fee; the free
// Starter plan pays 1%. Every plan pays Stripe's card processing fee passed
// through at cost — no markup.
//
// Connected accounts are Express accounts where the platform pays Stripe's
// processing fees (controller.fees.payer = "application"), and Stripe can't
// switch existing accounts. So the processing fee is passed through the
// application fee instead: the business's payout is reduced by Stripe's
// standard card rate (plus 1% on Starter), and AfroAllure uses the processing
// part to pay Stripe. Cash payments never go through Stripe and have no fees.
//
// Keep this in sync with the pricing shown to businesses: FeeDisclosure,
// /for-businesses, /switch/*, /terms and /refunds.

import type { PlanType } from './beta'

/** AfroAllure's own fee on the free Starter plan. Growth pays none. */
export const STARTER_PLATFORM_FEE_PERCENT = 0.01
export const STRIPE_PROCESSING_PERCENT = 0.029
export const STRIPE_PROCESSING_FIXED_CENTS = 30

export function platformFeePercent(planType: PlanType): number {
    return planType === 'GROWTH' ? 0 : STARTER_PLATFORM_FEE_PERCENT
}

/** AfroAllure's own platform fee: 0 on Growth, 1% on Starter. */
export function calculatePlatformFee(amountInCents: number, planType: PlanType): number {
    return Math.round(amountInCents * platformFeePercent(planType))
}

/** Stripe's standard US card processing fee (2.9% + 30¢), passed through at cost. */
export function estimateStripeProcessingFee(amountInCents: number): number {
    return Math.round(amountInCents * STRIPE_PROCESSING_PERCENT) + STRIPE_PROCESSING_FIXED_CENTS
}

/**
 * application_fee_amount for a PaymentIntent: platform fee + card processing.
 * Never more than the charge itself (Stripe rejects that).
 */
export function calculateApplicationFee(amountInCents: number, planType: PlanType): number {
    const amount = Math.max(0, Math.round(amountInCents))
    return Math.min(amount, calculatePlatformFee(amount, planType) + estimateStripeProcessingFee(amount))
}

// Optional instant payouts. Stripe charges AfroAllure 1% (50¢ minimum) plus its
// usual per-payout fee; the fee below is what the business pays. It is set in
// the Stripe Dashboard (Connect → Platform pricing → Instant Payouts) — these
// constants only drive the copy, so keep them in step with that setting.
export const INSTANT_PAYOUT_PERCENT = 0.0175
export const INSTANT_PAYOUT_MIN_CENTS = 100
export const INSTANT_PAYOUT_FEE_LABEL = `${(INSTANT_PAYOUT_PERCENT * 100).toFixed(2).replace(/0$/, '')}% (minimum $${(INSTANT_PAYOUT_MIN_CENTS / 100).toFixed(2)})`
