import { redirect } from 'next/navigation'
import { fetchBusinessUser, fetchUser } from '../actions'
import { createAccountLinkAction } from '@/features/stripe/actions'
import { MonetizationClient, OnboardingGate } from '@/features/monetization/components'
import { checkCompletedOnboarding } from '@/features/monetization/server/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)
    const isOnboarded = await checkCompletedOnboarding(business?.business_id!)

    if (isOnboarded) {
        if (!business?.stripe_acc_id) redirect('/dashboard')
        return <MonetizationClient stripeId={business.stripe_acc_id!} />
    }

    const onboardingLink = business?.current_onboarding_link
        ?? (business?.stripe_acc_id ? await createAccountLinkAction(business.stripe_acc_id) : null)

    return <OnboardingGate onboardingLink={onboardingLink} />
}
