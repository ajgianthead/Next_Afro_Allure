'use server'

import { Database } from "../lib/database.types";
import { createClient } from "./supabase/server"

export const sendEditorData = async (editorData: string, businessId: string | undefined) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').update({
        editor_data: editorData
    }).eq("business_id", businessId!).select("*")
    return data
}

export const getEditorData = async (businessId: string | undefined) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').select("editor_data").eq("business_id", businessId!).single()
    if (error) {
        return error
    }
    return data
}
