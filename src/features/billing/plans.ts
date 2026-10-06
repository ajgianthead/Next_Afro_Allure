// Growth plan pricing shown across the app. The amounts Stripe actually
// charges live on the Stripe prices (STRIPE_GROWTH_PRICE_ID and
// STRIPE_GROWTH_YEARLY_PRICE_ID) — keep these in step with them.

export type BillingInterval = 'month' | 'year'

export const GROWTH_MONTHLY_CENTS = 2500
export const GROWTH_YEARLY_CENTS = 25000
export const TRIAL_DAYS = 30

/** What a year of monthly billing costs, and what the yearly plan saves against it. */
export const YEARLY_FULL_PRICE_CENTS = GROWTH_MONTHLY_CENTS * 12
export const YEARLY_SAVINGS_CENTS = YEARLY_FULL_PRICE_CENTS - GROWTH_YEARLY_CENTS
/** 50 / 300 = 16.7% — rounded to a whole percent for labels ("Save 17%"). */
export const YEARLY_SAVINGS_PERCENT = Math.round((YEARLY_SAVINGS_CENTS / YEARLY_FULL_PRICE_CENTS) * 100)
/** Whole months the yearly price saves ($50 ÷ $25 = 2). */
export const YEARLY_FREE_MONTHS = Math.floor(YEARLY_SAVINGS_CENTS / GROWTH_MONTHLY_CENTS)

export const dollars = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`

/** "$20.83" — the yearly plan expressed per month. */
export const yearlyPerMonth = () => dollars(Math.round(GROWTH_YEARLY_CENTS / 12))

/** Free Starter plan limits, matching the gates in availability and manual booking. */
export const STARTER_LIMITS = {
    availabilitySchedules: 1,
    manualBookingsPerMonth: 10,
}
