import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import OpeningsClient from '@/features/openings/components/OpeningsClient'
import { bookingUrl } from '@/lib/bookingUrl'
import { fetchBusinessUser, fetchUser } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Share Openings | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const business = await fetchBusinessUser(user.id)
    if (!business) redirect('/login')

    const supabase = await createClient()
    const { data: services } = await supabase
        .from('services')
        .select('id, name')
        .eq('business', business.business_id)
        .order('created_at', { ascending: true })

    return (
        <OpeningsClient
            services={services ?? []}
            businessName={business.business_name}
            brandColor={business.brand_color ?? null}
            bookingLink={bookingUrl(business.url_name, '/book').replace(/^https?:\/\//, '')}
        />
    )
}
