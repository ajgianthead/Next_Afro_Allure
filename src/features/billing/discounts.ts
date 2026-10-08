import type Stripe from 'stripe'

// Promotion codes are for the monthly plan (checkout only offers them there),
// and every promo is time-limited ("$25 off for 3 months", beta testers'
// 3 free months). A business can still redeem one on monthly and then switch
// to yearly, so the switch drops the subscription's discounts — otherwise a
// monthly promo would come off the $250 yearly bill.

/** The discounts a switch to yearly removes (expanded, so they can be described). */
export function discountsDroppedOnYearly(discounts: (string | Stripe.Discount)[] | null | undefined): Stripe.Discount[] {
    return (discounts ?? []).filter((d): d is Stripe.Discount => typeof d !== 'string')
}

/** "$25 off" / "100% off", for telling the business what they'd give up. */
export function describeDiscount(d: Stripe.Discount): string {
    const c = d.coupon
    if (c?.percent_off) return `${c.percent_off}% off`
    if (c?.amount_off) return `$${(c.amount_off / 100).toFixed(c.amount_off % 100 === 0 ? 0 : 2)} off`
    return 'promo'
}
