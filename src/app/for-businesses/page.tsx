import { fetchUser } from 'app/dashboard/(other)/actions';
import AfroAllureBusiness from './forBusinessesClient';
import { getFoundingMemberCount } from '@/lib/foundingMember';

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
