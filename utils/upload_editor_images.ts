'use server'

import { Database } from "../lib/database.types";
import { createClient } from "./supabase/server";

export const uploadImage = async (files: FileList, user: string) => {
    const supabase = createClient<Database>();
    const id = crypto.randomUUID();
    const path = `editor/1/image/${id}`
    try {
        const { data, error } = await supabase.storage.from('editor-media-pool').upload(path, files[0], {
            contentType: 'image/*'
        })
        if (error) {
            console.log(error)
        }
        return { url: supabase.storage.from("editor-media-pool").getPublicUrl(path).data.publicUrl, path: path }
    } catch (error) {
        console.log(error);
    }
    console.log(files);
    
}
