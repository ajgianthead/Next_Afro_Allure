'use server'

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

export const uploadImage = async (file: File, business: string) => {
    const supabase = await createClient<Database>();
    const id = crypto.randomUUID();
    const path = `editor/${business}/image/${id}`
    const { error } = await supabase.storage.from('editor-media-pool').upload(path, file, {
        contentType: file.type
    })
    if (error) {
        throw new Error(error.message)
    }
    return { url: supabase.storage.from("editor-media-pool").getPublicUrl(path).data.publicUrl, path: path }
}
