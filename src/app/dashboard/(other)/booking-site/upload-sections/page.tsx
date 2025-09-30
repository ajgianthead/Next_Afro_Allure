
import React from 'react';
import UploadSectionClient from './uploadSectionClient';
import { fetchBusinessUser, fetchUser } from '../../actions';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../../../../lib/database.types';
import { getSectionData, getSectionImages } from '../actions';

export const metadata = {
    title: 'Webpage Builder | AfroAllure',
};

const Page = async () => {
    const user = await fetchUser()
    const supabase = createClient<Database>()
    const business = await fetchBusinessUser(user?.id!)
    const sectionData = await getSectionData(business.business_id)
    const uploadedImages = await getSectionImages(sectionData?.id!, business.business_id)

    return (
        <div className='flex justify-center'>
            <UploadSectionClient uploadedImageUrls={uploadedImages} section_data={sectionData!} businessId={business?.business_id!} editorId={sectionData?.id!} url_name={business.url_name} />
        </div>
    );
}

export default Page;
