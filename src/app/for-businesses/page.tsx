import { fetchUser } from 'app/dashboard/(other)/actions';
import AfroAllureBusiness from './forBusinessesClient';

const Page = async () => {
    const user = await fetchUser()
    return (
        <div>
            <AfroAllureBusiness isLoggedIn={!!user} />
        </div>
    );
}

export default Page;
