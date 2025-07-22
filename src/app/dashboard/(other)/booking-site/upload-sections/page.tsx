
import React from 'react';
import UploadSectionClient from './uploadSectionClient';
import { fetchBusinessUser, fetchUser } from '../../actions';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../../../../lib/database.types';
import { getSectionImages } from '../actions';

export const metadata = {
    title: 'Webpage Builder | AfroAllure',
};

const Page = async () => {
    const user = await fetchUser()
    const supabase = createClient<Database>()
    const business = await fetchBusinessUser(user?.id!)
    const editor_id = (await supabase.from('web_editors').select('*').eq('business_id', business?.business_id!).single()).data?.id!
    const imageObjects = await getSectionImages(editor_id)
    return (
        <div className='flex justify-center'>
            <UploadSectionClient businessId={business?.business_id!} editorId={editor_id} imageObj={imageObjects!} />
        </div>
    );
}

export default Page;
