'use server'

import { createClient } from "@utils/supabase/server"
import { Database } from "../../../../../lib/database.types";


export const uploadImg = async (path: string, image: {
    imageURL: string | null;
    imageBlob: Blob | null;
}) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.storage
        .from('service-photos')
        .upload(path, image.imageBlob!, {
            contentType: image.imageBlob!.type || 'image/png',
        });
    if (error) {
        console.error("Upload error:", error);
        return;
    }
    return data
}
export const createPublicImgURL = async (path: string) => {
    const supabase = createClient<Database>();
    const url = supabase.storage
        .from('service-photos')
        .getPublicUrl(path).data.publicUrl;


    return { url: url, path };
}

export const updateImg = async (path: string, image: {
    imageURL: string | null;
    imageBlob: Blob | null;
}) => {
    const supabase = createClient<Database>();
    const img = await supabase.storage
        .from('service-photos')
        .update(path, image.imageBlob!, {
            contentType: image.imageBlob!.type || 'image/png',
        })

    return img
}
