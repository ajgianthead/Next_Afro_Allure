import type { Metadata } from 'next'
import DmBookingLandingClient from './dmBookingLandingClient'

export const metadata: Metadata = {
    title: 'Book by DM. Get paid like a business. | AfroAllure',
    description:
        'AfroAllure adds automatic deposit collection, appointment confirmations, and reminders to your existing DM workflow. Free during beta. Built specifically for Black beauty professionals.',
    openGraph: {
        title: 'Book by DM. Get paid like a business.',
        description: 'The booking system for stylists who book through DMs.',
        images: ['/og-dm-booking.jpg'],
    },
}

export default function Page() {
    return <DmBookingLandingClient />
}
