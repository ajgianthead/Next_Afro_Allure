import React from 'react';
import Editor from './editor';
import { fetchBusinessUser, fetchUser } from 'app/dashboard/(other)/actions';
import { getEditorData } from '@/app/utils/editor_actions';
import { PostgrestError } from '@supabase/supabase-js';
import { EditorWrapper } from '@/app/utils/context/EditorContext';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

const Page = async ({ params, searchParams }: { params: Promise<{ businessName: string }>; searchParams: Promise<{ template?: string }> }) => {
    const user = await fetchUser();
    if (!user) redirect('/login')

    const { businessName } = await params
    const { template } = await searchParams
    const supabase = await createClient()
    const business = await fetchBusinessUser(user.id)

    if (!business || business.url_name !== businessName) {
        redirect('/dashboard')
    }

    const editorData = await getEditorData(business.business_id)
    const services = await supabase.from('services').select('*').eq('business', business.business_id)

    if (editorData instanceof PostgrestError) {
        redirect('/dashboard')
    }

    return (
        <div>
            <EditorWrapper>
                <Editor isPublished={business.published_site} services={services.data!} businessName={business.url_name} businessId={business.business_id} editorData={editorData.editor_data!} preloadedTemplateId={template} />
            </EditorWrapper>
        </div>
    );

}

export default Page;
