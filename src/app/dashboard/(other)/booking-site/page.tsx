import React from 'react';
import SelectEditorType from './selectEditorType';
import { getUser } from '../getUser';
import { fetchBusinessUser, fetchUser } from '../actions';
import ManageBookingSite from './manageBookingSite';
import { getEditorData } from '@utils/editor_actions';
import { PostgrestError } from '@supabase/supabase-js';

export const metadata = {
    title: 'Choose Builder Type | AfroAllure',
};

const Page = async ({ searchParams }: { searchParams?: { 'switch-editor': string }; }) => {
    const user = await fetchUser();
    const { 'switch-editor': switchEditor } = await searchParams!
    const businessUser: any = await fetchBusinessUser(user?.id!)
    const editorData: any = await getEditorData(businessUser.business_id)
    if (switchEditor === 'true') {
        return (
            <div>
                <SelectEditorType switchType={switchEditor} businessId={businessUser.business_id} urlName={businessUser.url_name} businessName={businessUser.business_name} />
            </div>
        );
    }
    else if (businessUser.published_site) {
        if (!(editorData instanceof PostgrestError)) {
            return (
                <ManageBookingSite editorData={editorData} urlName={businessUser.url_name} />
            )
        }
        // Return error or something
    } else {
        return (
            <div>
                <SelectEditorType switchType={switchEditor} businessId={businessUser.business_id} urlName={businessUser.url_name} businessName={businessUser.business_name} />
            </div>
        );
    }

}

export default Page;
