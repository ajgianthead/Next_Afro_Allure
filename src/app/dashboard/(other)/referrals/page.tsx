import { redirect } from 'next/navigation'
import ReferralsClient from '@/features/referrals/components/ReferralsClient'
import { getReferralOverview } from '@/features/referrals/server/actions'
import { fetchBusinessUser, fetchUser } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Referrals | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const [res, businessUser] = await Promise.all([getReferralOverview(), fetchBusinessUser(user.id) as Promise<any>])
    if (!res.ok) {
        return (
            <div className="p-5">
                <p className="text-sm" style={{ color: '#FC6161' }}>{res.error}</p>
            </div>
        )
    }
    return (
        <ReferralsClient
            overview={res.overview}
            gatable={{ hadTrial: businessUser?.had_trial, stripeCustomerId: businessUser?.stripe_customer_id, businessId: businessUser?.business_id }}
        />
    )
}
