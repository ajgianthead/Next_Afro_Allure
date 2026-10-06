import { redirect } from 'next/navigation'
import RewardsClient from '@/features/loyalty/components/RewardsClient'
import { getLoyaltyOverview } from '@/features/loyalty/server/actions'
import { fetchUser } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Rewards | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const res = await getLoyaltyOverview()
    if (!res.ok) {
        return (
            <div className="p-5">
                <p className="text-sm" style={{ color: '#FC6161' }}>{res.error}</p>
            </div>
        )
    }
    return <RewardsClient initial={res.overview} />
}
