import { fetchBusinessUser, fetchUser } from "app/dashboard/(other)/actions";
import EditorClient from "./editorClient";
import { redirect } from "next/navigation";
import { getEditorData } from "@utils/editor_actions";
import { PostgrestError } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Website Editor | AfroAllure',
};

export default async function Page() {
    const user = await fetchUser();
    let businessUser
    let data: {
        editor_data: string | null;
    } | PostgrestError
    if (user) {
        businessUser = await fetchBusinessUser(user.id)
        data = await getEditorData(businessUser?.business_id)
        if (data instanceof PostgrestError) {
            console.error(`Error occured when fetching editor data: ${data.message}`)
        } else {
            return <EditorClient editorData={data.editor_data!} />;
        }
    } else {
        redirect('/login')
    }

}
