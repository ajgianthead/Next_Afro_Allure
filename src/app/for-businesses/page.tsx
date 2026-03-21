import React from 'react';
import ForBusinesses from './forBusinessesClient';
import { fetchUser } from 'app/dashboard/(other)/actions';
import { fetchBusinessData } from 'app/business/[businessName]/actions';
import { PostgrestError } from '@supabase/supabase-js';

const Page = async () => {
    const user = await fetchUser()
    if (user) {
        const business = await fetchBusinessData(user?.id!)
        if (!(business instanceof PostgrestError)) {
            return (
                <div>
                    <ForBusinesses user={user} business={business.result} />
                </div>
            );
        }
    } else {
        return (
            <div>
                <ForBusinesses user={user} business={null} />
            </div>
        );
    }


}

export default Page;
