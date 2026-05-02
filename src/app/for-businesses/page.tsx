import React from 'react';
import ForBusinesses from './forBusinessesClient';
import { fetchUser } from 'app/dashboard/(other)/actions';
import { fetchBusinessData } from 'app/business/[businessName]/actions';
import { PostgrestError } from '@supabase/supabase-js';
import AfroAllureBusiness from './forBusinessesClient';

const Page = async () => {
    const user = await fetchUser()
    if (user) {
        const business = await fetchBusinessData(user?.id!)
        if (!(business instanceof PostgrestError)) {
            return (
                <div>
                    <AfroAllureBusiness />
                </div>
            );
        }
    } else {
        return (
            <div>
                <AfroAllureBusiness />
            </div>
        );
    }


}

export default Page;
