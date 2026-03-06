import React from 'react';
import Editor from './editor';
import { getUser } from 'app/dashboard/(other)/getUser';
import { fetchBusinessUser, fetchUser } from 'app/dashboard/(other)/actions';
import { getEditorData } from '@utils/editor_actions';
import { PostgrestError } from '@supabase/supabase-js';
import { fetchGoogleFonts } from 'useGoogleFonts';
import { EditorWrapper } from '@utils/context/EditorContext';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../../../lib/database.types';

const Page = async ({ params }: { params: { businessName: string } }) => {
    const user = await fetchUser();
    const { businessName } = await params
    const supabase = createClient<Database>()
    const business = await fetchBusinessUser(user?.id!)

    if (business && business.url_name === businessName) {
        const editorData = await getEditorData(business.business_id)
        const services = await supabase.from('services').select('*').eq('business', business.business_id)
        console.log(editorData);

        if (!(editorData instanceof PostgrestError)) {
            return (
                <div>
                    <EditorWrapper>
                        <Editor isPublished={business.published_site} services={services.data!} businessName={business.url_name} businessId={business.business_id} editorData={editorData.editor_data!} />
                    </EditorWrapper>
                </div>
            );
        }


    }

}

export default Page;
