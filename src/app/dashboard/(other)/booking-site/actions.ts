'use server'

import { createClient } from "@utils/supabase/server"
import { Database } from "../../../../../lib/database.types"


export const createEditorState = async (business_id: string) => {
    try {
        const supabase = createClient<Database>();
        const { data: editorData, error } = await supabase.from('web_editors').insert({
            business_id: business_id,
            editor_data: ""
        }).select().single()
        if (error) {
            return error
        }
        return editorData
    } catch (error: any) {
        console.error(error.message)
    }
}
