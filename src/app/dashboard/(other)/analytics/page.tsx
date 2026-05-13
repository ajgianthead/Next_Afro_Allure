import { redirect } from 'next/navigation'
import { fetchBusinessUser, fetchUser } from '../actions'
import { getAnalyticsPageData } from './actions'
import { AnalyticsClient } from './analytics-client'
import { LockedAnalytics } from './components/LockedAnalytics'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)

    if (business.plan_type !== 'GROWTH') {
        return <LockedAnalytics business={business} />
    }

    const data = await getAnalyticsPageData(business.business_id)
    return <AnalyticsClient data={data} business={business} />
}
