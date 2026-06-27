import type { Metadata } from 'next'
import { getFoundingMemberCount } from '@/lib/foundingMember'
import DmBookingClient from '../dmBookingClient'

export const metadata: Metadata = {
    title: 'How DM Booking Works | AfroAllure',
    description: 'See exactly how AfroAllure turns your Instagram DMs into a fully automated booking and payment system.',
}

export default async function HowItWorksPage() {
    const foundingMemberCount = await getFoundingMemberCount()
    return <DmBookingClient foundingMemberCount={foundingMemberCount} />
}
