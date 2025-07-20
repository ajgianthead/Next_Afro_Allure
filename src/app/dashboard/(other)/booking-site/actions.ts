'use server'

import { createClient } from "@utils/supabase/server"
import { Database, Json } from "../../../../../lib/database.types"


export interface ImageObject {
    id: string,
    fileBody: Blob,
    url: string
}

export const createEditorState = async (business_id: string) => {
    try {
        const supabase = createClient<Database>();
        //
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

export const uploadImgSectionChanges = async (files: ImageObject[], business_id: string, editor_id: string) => {
    const supabase = createClient<Database>();
    try {
        const res = await Promise.all(
            files.map(async (file) => {
                // Upload file
                if (file.url.startsWith('blob')) {
                    const uniqueId = file.id;
                    const uploadRes = await supabase.storage
                        .from('web-section-images')
                        .upload(`private/${business_id}/${uniqueId}`, file.fileBody);

                    if (uploadRes.error) throw uploadRes.error;

                    const { data: imageURL } = supabase.storage
                        .from('web-section-images')
                        .getPublicUrl(uploadRes.data.path);

                    return {
                        id: uniqueId,
                        fileBody: file.fileBody,
                        url: imageURL.publicUrl,
                    } as any;
                } else {
                    return file;
                }
            })
        );

        console.log("Result:", res);

        const { data, error } = await supabase
            .from('web_editors')
            .update({ image_objects: res })
            .eq('id', editor_id)
            .select()
            .single();

        if (error) throw error;

        return res;
    } catch (error: any) {
        return error.message;
    }
};


export const getSectionImages = async (business_id: string) => {
    const supabase = createClient<Database>()
    let imageObjects: ImageObject[];
    try {
        const { data } = await supabase.from('web_editors').select('image_objects').eq('business_id', business_id).single()
        imageObjects = data?.image_objects as unknown as ImageObject[]
    } catch (error: any) {
        return error.message
    }
    return imageObjects
}


