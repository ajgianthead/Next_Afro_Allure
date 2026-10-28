import Stripe from "stripe";

/**
 * Apple Pay, Google Pay, Cash App Pay and Amazon Pay are Growth features a
 * business switches on in Booking Settings (locked on Starter). When a
 * business drops to Starter they're switched off on its Stripe payment
 * method configuration, so checkout only offers cards. Switching back on is
 * the business's choice after upgrading again.
 *
 * Never throws: the plan change itself must not fail over this. Creates its
 * own Stripe client so it also runs in Trigger.dev tasks; skipped (with a log)
 * if STRIPE_SECRET_KEY isn't set there.
 */
export async function turnOffGrowthPaymentMethods(stripeAccountId: string | null | undefined, paymentMethodConfigId: string | null | undefined): Promise<void> {
    const configId = paymentMethodConfigId?.replace(/"/g, '')
    if (!stripeAccountId || !configId) return
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
        console.warn('STRIPE_SECRET_KEY not set; Growth payment methods left as they were for', stripeAccountId)
        return
    }
    const off = { display_preference: { preference: 'off' as const } }
    try {
        await new Stripe(key).paymentMethodConfigurations.update(
            configId,
            { apple_pay: off, google_pay: off, cashapp: off, amazon_pay: off },
            { stripeAccount: stripeAccountId },
        )
    } catch (err) {
        console.error(`Could not switch off Growth payment methods for ${stripeAccountId}:`, err)
    }
}
