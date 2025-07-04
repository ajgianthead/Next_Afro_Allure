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
export const createImgSignedUrl = async (path: string) => {
    const supabase = createClient<Database>();
    const url = await supabase.storage
        .from('service-photos')
        .createSignedUrl(path, 60 * 60 * 24);

    if (url.error) {
        console.error("Signed URL error:", url.error);
        return;
    }
    return { url: url!.data?.signedUrl, path };
}

export const updateImg = async (path: string, image: {
    imageURL: string | null;
    imageBlob: Blob | null;
}) => {
    const supabase = createClient<Database>();
    const url = await supabase.storage
        .from('service-photos')
        .update(path, image.imageBlob!, {
            contentType: image.imageBlob!.type || 'image/png',
        }).then(async () => {
            const url = await createImgSignedUrl(path)
            return url?.url
        });

    return url
}
