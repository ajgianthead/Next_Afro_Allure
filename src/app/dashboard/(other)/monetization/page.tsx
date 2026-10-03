import { redirect } from 'next/navigation'
import { fetchBusinessUser, fetchUser } from '../actions'
import { MonetizationClient, OnboardingGate } from '@/features/monetization/components'
import { checkCompletedOnboarding } from '@/features/monetization/server/actions'

export const dynamic = 'force-dynamic'

export default async function Page({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)
    const isOnboarded = await checkCompletedOnboarding(business?.business_id!)

    if (isOnboarded) {
        if (!business?.stripe_acc_id) redirect('/dashboard')
        return <MonetizationClient stripeId={business.stripe_acc_id!} />
    }

    const { onboarding } = await searchParams
    // Account links are single-use and expire within minutes, so never reuse
    // the one stored at signup — /onboarding/[id] mints a fresh link.
    const onboardingLink = business?.stripe_acc_id ? `/onboarding/${business.stripe_acc_id}` : null
    const status = onboarding === 'incomplete' || onboarding === 'error' ? onboarding : null

    return <OnboardingGate onboardingLink={onboardingLink} status={status} />
}
