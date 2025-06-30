'use server'

import { Database } from "../lib/database.types";
import { createClient } from "./supabase/server"

export const sendEditorData = async (editorData: string, editorId: string | undefined) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').update({
        editor_data: editorData
    }).eq("id", editorId!).select("*")
    return data
}

export const getEditorData = async (editorId: string | undefined) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').select("editor_data").eq("id", editorId!).single()
    if (error) {
        return error
    }
    return data
}
