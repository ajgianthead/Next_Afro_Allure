import React from 'react';
import SelectEditorType from './selectEditorType';
import { getUser } from '../getUser';
import { fetchBusinessUser, fetchUser } from '../actions';
import ManageBookingSite from './manageBookingSite';
import { getEditorData } from '@/app/utils/editor_actions';
import { PostgrestError } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Choose Builder Type | AfroAllure',
};

const Page = async ({ searchParams }: { searchParams?: { 'switch-editor': string }; }) => {
    const user = await fetchUser();
    const { 'switch-editor': switchEditor } = await searchParams!
    const businessUser: any = await fetchBusinessUser(user?.id!)
    const editorData: any = await getEditorData(businessUser.business_id)
    const planType = (businessUser.plan_type ?? 'STARTER') as 'STARTER' | 'GROWTH'
    const gatableData = { hadTrial: businessUser.had_trial, stripeCustomerId: businessUser.stripe_customer_id, businessId: businessUser.business_id }

    if (switchEditor === 'true') {
        return (
            <div>
                <SelectEditorType switchType={switchEditor} businessId={businessUser.business_id} urlName={businessUser.url_name} businessName={businessUser.business_name} planType={planType} gatableData={gatableData} />
            </div>
        );
    }
    else if (businessUser.published_site) {
        if (editorData instanceof PostgrestError) {
            redirect('/dashboard')
        }
        return (
            <ManageBookingSite editorData={editorData} urlName={businessUser.url_name} />
        )
    } else {
        return (
            <div>
                <SelectEditorType switchType={switchEditor} businessId={businessUser.business_id} urlName={businessUser.url_name} businessName={businessUser.business_name} planType={planType} gatableData={gatableData} />
            </div>
        );
    }

}

export default Page;
