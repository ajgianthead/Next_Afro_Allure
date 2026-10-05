import { redirect } from 'next/navigation'
import WaitlistClient from '@/features/waitlist/components/WaitlistClient'
import { getWaitlist } from '@/features/waitlist/server/actions'
import { bookingUrl } from '@/lib/bookingUrl'
import { fetchBusinessUser, fetchUser } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Waitlist | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const business = await fetchBusinessUser(user.id)
    if (!business) redirect('/login')

    const res = await getWaitlist()
    if (!res.ok) {
        return (
            <div className="p-5">
                <p className="text-sm" style={{ color: '#FC6161' }}>{res.error}</p>
            </div>
        )
    }
    return (
        <WaitlistClient
            enabled={res.enabled}
            entries={res.entries}
            bookingLink={bookingUrl(business.url_name, '/book').replace(/^https?:\/\//, '')}
        />
    )
}
