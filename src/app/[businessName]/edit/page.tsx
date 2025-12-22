import React from 'react';
import Editor from './editor';
import { getUser } from 'app/dashboard/(other)/getUser';
import { fetchBusinessUser } from 'app/dashboard/(other)/actions';
import { getEditorData } from '@utils/editor_actions';
import { PostgrestError } from '@supabase/supabase-js';

const Page = async () => {
    const user = await getUser();
    if (user) {
        const business = await fetchBusinessUser(user.id)
        const editorData = await getEditorData(business.business_id)
        if (!(editorData instanceof PostgrestError)) {
            return (
                <div>
                    <Editor businessId={business.business_id} editorData={editorData.editor_data!} />
                </div>
            );
        }
        console.log(editorData);


    }

}

export default Page;
