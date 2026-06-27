import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import OnboardingClient from './OnboardingClient'

export const metadata = { title: 'Set up your account | AfroAllure' }

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: business } = await supabase
        .from('business_users')
        .select('business_id, business_name')
        .eq('user_id', user.id)
        .single()

    if (!business) redirect('/login')

    return (
        <OnboardingClient
            businessId={business.business_id}
            businessName={business.business_name}
        />
    )
}
