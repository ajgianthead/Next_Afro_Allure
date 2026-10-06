import type { Metadata } from 'next'
import { fetchUser } from 'app/dashboard/(other)/actions'
import SwitchFromStyleSeat from './SwitchFromStyleSeat'

export const metadata: Metadata = {
    title: 'Switching from StyleSeat | AfroAllure',
    description:
        'Move your clients, services and booking link from StyleSeat to AfroAllure in about 15 minutes. Your own branded booking site, loyalty rewards, rebook reminders and automatic no-show fees.',
}

const Page = async () => {
    const user = await fetchUser()
    return <SwitchFromStyleSeat isLoggedIn={!!user} />
}

export default Page
