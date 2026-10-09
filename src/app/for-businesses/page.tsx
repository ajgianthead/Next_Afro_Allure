import type { Metadata } from 'next'
import { fetchUser } from 'app/dashboard/(other)/actions';
import AfroAllureBusiness from './forBusinessesClient';
import { getFoundingMemberCount } from '@/lib/foundingMember';

export const metadata: Metadata = {
    title: 'AfroAllure for Business | Booking Built for Black Beauty Professionals',
    description: 'Booking sites for braiders, locticians, natural hair stylists and barbers: size × length pricing, deposits and no-show fees, reminders, loyalty and no percentage fee on Growth. Start free.',
    alternates: { canonical: '/for-businesses' },
}

const Page = async () => {
    const [user, foundingMemberCount] = await Promise.all([
        fetchUser(),
        getFoundingMemberCount(),
    ])
    return (
        <div>
            <AfroAllureBusiness isLoggedIn={!!user} foundingMemberCount={foundingMemberCount} />
        </div>
    );
}

export default Page;
