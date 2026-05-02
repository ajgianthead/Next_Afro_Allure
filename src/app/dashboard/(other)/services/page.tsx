import { createClient } from '@/app/utils/supabase/server'
import { ServicesClient } from '@/features/services/components'
import { fetchBusinessUser, fetchUser } from '../actions'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)
    if (!business) redirect('/login')

    const supabase = await createClient()

    const [servicesResult, businessResult] = await Promise.all([
        supabase
            .from('services')
            .select('*')
            .eq('business', business.business_id)
            .order('created_at', { ascending: true }),
        supabase
            .from('business_users')
            .select('default_availability, service_addons(id, name, price, business_id), availabilities(id, availability_data)')
            .eq('business_id', business.business_id)
            .single(),
    ])

    const services = servicesResult.data ?? []
    const addons = (businessResult.data?.service_addons as any[]) ?? []
    const availabilities = (businessResult.data?.availabilities as any[]) ?? []
    const defaultAvailability = businessResult.data?.default_availability ?? ''

    return (
        <ServicesClient
            businessId={business.business_id}
            servicesData={services}
            addonsData={addons}
            availabilitiesData={availabilities}
            defaultAvailability={defaultAvailability}
        />
    )
}
