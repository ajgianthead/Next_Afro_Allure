'use server'

import { createClient } from "@utils/supabase/server"
import { Database, Json } from "../../../../../lib/database.types"



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

export const uploadImgSectionChanges = async (file: any, business_id: string, editor_id: string, array_length: number) => {
    const supabase = createClient<Database>();
    const url = await supabase.storage.from('web-section-images').upload(`private/${business_id}/${file.id}`, file.fileBody!).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    const { data, error } = await supabase.from('image_section').insert({
        id: file.id,
        fileBody: file.fileBody as any,
        url: url.data.publicUrl,
        editor_id: editor_id,
        index: array_length
    }).select().single()
    return data
};


export const getSectionImages = async (editor_id: string) => {
    const supabase = createClient<Database>()
    const { data } = await supabase.from('image_section').select('*').eq('editor_id', editor_id).order("index", {
        ascending: true
    })
    return data
}

export const editSectionImage = async (imgObjId: string, fileBody: File, businessId: string) => {
    // Change image object image source
    const supabase = createClient<Database>()
    const newUrl = await supabase.storage.from('web-section-images').update(`private/${businessId}/${imgObjId}`, fileBody).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    return `${newUrl.data.publicUrl}?t=${Date.now()}`
}

export const deleteSectionImage = async (business_id: string, imageObjId: string) => {
    // Delete in storage
    const supabase = createClient<Database>();
    const updatedArray = await supabase.storage.from('web-section-images').remove([`private/${business_id}/${imageObjId}`]).then(async (res) => {
        return await supabase.from('image_section').delete().eq('id', imageObjId).select().single().then(async (res) => {
            const { data } = await supabase.from('image_section').select().gt('index', res.data?.index)
            if (data?.length) {
                let res: ImageObject[] = []
                for (let i = 0; i < data.length; i++) {
                    const { data: newImgIndex } = await supabase.from('image_section').update({
                        index: data[i].index - 1
                    }).eq('id', data[i].id).select().single()
                    res.push(newImgIndex!)
                }
                return res
            }
        })
    })
    return updatedArray || []
}


