import { redirect } from 'next/navigation'

/** The Custom Builder was replaced by the website builder; old links land there. */
export default function Page() {
    redirect('/dashboard/booking-site')
}
