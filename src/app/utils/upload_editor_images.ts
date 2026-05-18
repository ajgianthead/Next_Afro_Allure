'use server'

import { log } from "console";
import { Database } from "../../../lib/database.types";
import { createClient } from "./supabase/server";

export const getImages = async (businessId: string) => {
    const supabase = await createClient<Database>();
    const { data, error } = await supabase.storage.from('editor-media-pool').list(`editor/${businessId}/image/`)
    if (error) {
        throw Error(error.message)
    }
    if (data && data.length) {
        if (data[0].name !== ".emptyFolderPlaceholder") {
            const fileUrls = data?.map((images) => ({ url: supabase.storage.from("editor-media-pool").getPublicUrl(`editor/${businessId}/image/${images.name}`).data.publicUrl, path: `editor/${businessId}/image/${images.name}` }))
            return fileUrls!
        }
    }
    return []
}

export const uploadImage = async (files: FileList, business: string) => {
    const supabase = await createClient<Database>();
    const id = crypto.randomUUID();
    const path = `editor/${business}/image/${id}`
    try {
        const { data, error } = await supabase.storage.from('editor-media-pool').upload(path, files[0], {
            contentType: 'image/*'
        })
        if (error) {
            throw error
        }
        return { url: supabase.storage.from("editor-media-pool").getPublicUrl(path).data.publicUrl, path: path }
    } catch (error) {
        log(error)
    }


}
