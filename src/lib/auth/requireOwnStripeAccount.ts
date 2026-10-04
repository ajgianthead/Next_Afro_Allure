import { createClient } from '@/app/utils/supabase/server'

/**
 * Server actions are public endpoints. Anything that grants access to a
 * Stripe connected account — Express dashboard login links, embedded
 * account-management sessions, onboarding links — must only work for the
 * signed-in owner of that account. Stripe account ids are not secret (every
 * booking page needs one for card payments), so without this check anyone
 * could open another business's Stripe dashboard and change its payout bank.
 */
export async function requireOwnStripeAccount(accountId: string): Promise<void> {
    if (!accountId) throw new Error('Unauthorized')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data } = await supabase
        .from('business_users')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('stripe_acc_id', accountId)
        .maybeSingle()
    if (!data) throw new Error('Unauthorized')
}
