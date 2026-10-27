import { notFound } from 'next/navigation'
import { loadRewardsPage } from '@/features/referrals/server/loadRewardsPage'
import { RewardsPageClient } from '@/features/referrals/components/RewardsPageClient'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'My rewards',
    // Private link: keep it out of search engines.
    robots: { index: false, follow: false },
}

export default async function Page({ params }: { params: Promise<{ businessName: string; token: string }> }) {
    const { businessName, token } = await params
    const data = await loadRewardsPage(businessName, token)
    if (!data) notFound()
    return <RewardsPageClient data={data} />
}
