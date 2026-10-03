'use server'

import { stripe } from "@/lib/stripe/stripeClient";
import { createClient } from "@/app/utils/supabase/server";

export type OnboardingReturnResult = 'complete' | 'incomplete'

export const updateStripeOnboardInfo = async (stripeId: string): Promise<OnboardingReturnResult> => {
    const supabase = await createClient();

    // Only the signed-in owner of this Stripe account may finalize it.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, payment_method_config_id')
        .eq('stripe_acc_id', stripeId)
        .eq('user_id', user.id)
        .maybeSingle()
    if (!business) throw new Error('Stripe account not found for this business')

    const account = await stripe.accounts.retrieve(stripeId);
    // currently_due alone misses past_due (should be treated as still
    // outstanding, not complete) and can also flag a business as unfinished
    // over purely optional eventually_due fields — check both explicitly.
    const requirements = account.requirements
    const hasOutstandingRequirements =
        (requirements?.currently_due?.length ?? 0) > 0 ||
        (requirements?.past_due?.length ?? 0) > 0
    if (hasOutstandingRequirements || !account.details_submitted) return 'incomplete'

    // Reuse the payment method configuration if this return page was already
    // hit once (refresh, back button) instead of creating duplicates. A
    // failure here must not block the business from finishing — checkout
    // falls back to the account's default configuration.
    let paymentConfigId = business.payment_method_config_id?.replace(/"/g, '') || null
    if (!paymentConfigId) {
        try {
            const paymentConfig = await stripe.paymentMethodConfigurations.create({
                name: `aa-${stripeId}`,
                card: { display_preference: { preference: 'on' } },
                google_pay: { display_preference: { preference: 'off' } },
                apple_pay: { display_preference: { preference: 'off' } },
                amazon_pay: { display_preference: { preference: 'off' } },
                cashapp: { display_preference: { preference: 'off' } },
            }, { stripeAccount: stripeId })
            paymentConfigId = paymentConfig.id
        } catch (err) {
            console.error('Failed to create payment method configuration:', err)
        }
    }

    const { error } = await supabase.from('business_users').update({
        completed_stripe_onboarding: true,
        current_onboarding_link: null,
        ...(paymentConfigId ? { payment_method_config_id: paymentConfigId } : {}),
    }).eq('business_id', business.business_id)
    if (error) throw new Error(error.message)

    return 'complete'
}
