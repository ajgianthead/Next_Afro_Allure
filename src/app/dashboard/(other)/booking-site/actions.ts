'use server'

import { createClient } from "@utils/supabase/server"
import { Database, Json } from "../../../../../lib/database.types"
import { PostgrestError } from "@supabase/supabase-js";

export const updateBookingTheme = async (themeData: any, businessId: string) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').update({
        theme_data: themeData
    }).eq("business_id", businessId).select("*").maybeSingle()
    if (error) throw error
    return data
}

// Check if URL name is available
export const updateBusinessURL = async (businessId: string, urlName: string) => {
    const supabase = createClient<Database>();

    const { error: updateError } = await supabase
        .from("business_users")
        .update({ url_name: urlName })
        .eq("business_id", businessId);

    console.log(updateError);


    return updateError
}
export const isURLNameAvailable = async (urlName: string) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('business_users').select("business_id").eq('url_name', urlName).limit(1).maybeSingle()
    if (error) {
        throw error
    }
    return !data
}
export const createSectionEditorState = async (business_name: string, business_id: string, switchType: string) => {
    const supabase = createClient<Database>();
    const { data: editorId, error: editorError } = await supabase.from('web_editors').select('id').eq('business_id', business_id).maybeSingle()
    if (switchType === 'true' || editorId !== null) {
        const { data, error } = await supabase.from('web_editors').update({
            type: 'SECTIONS',
        }).eq('business_id', business_id).select().maybeSingle()
        if (error) return error
        return data?.id
    } else {
        const { data, error } = await supabase.from('web_editors').insert({
            business_id: business_id,
            type: 'SECTIONS',
            editor_data: JSON.stringify({
                "content": [],
                "root": {},
                "zones": {}
            }),
            section_data: [
                {
                    "id": crypto.randomUUID(),
                    "html": `<h2>Book with ${business_name} now</h2>`,
                    "type": "text",
                    "content": {
                        "type": "doc",
                        "content": [
                            {
                                "type": "heading",
                                "content": [
                                    {
                                        "text": `Book with ${business_name} now`,
                                        "type": "text"
                                    }
                                ]
                            }
                        ]
                    },
                    "editing": false
                },
            ],

        }).select().single()
        console.log(error);

        if (error) return error
        return data?.id
    }
}



export const createEditorState = async (business_id: string, switchType: string) => {
    try {
        const supabase = createClient<Database>();
        const { data: editorId, error: editorError } = await supabase.from('web_editors').select('id').eq('business_id', business_id).maybeSingle()

        if (switchType === 'true' || editorId !== null) {
            const { data: editorData, error } = await supabase.from('web_editors').update({
                type: 'CUSTOM',
            }).eq('business_id', business_id).select().maybeSingle()
            if (error) {
                return error
            }
            return editorData
        } else {
            const { data: editorData, error } = await supabase.from('web_editors').insert({
                business_id: business_id,
                type: 'CUSTOM',
                editor_data: JSON.stringify({
                    "content": [],
                    "root": {},
                    "zones": {}
                }),
                section_data: [] // <-- This will be a template
            }).select().single()
            if (error) {
                return error
            }
            return editorData
        }

    } catch (error: any) {
        console.error(error.message)
    }
}

export const uploadImgSectionChanges = async (file: any, business_id: string, editor_id?: string, array_length?: number) => {
    const supabase = createClient<Database>();
    const url = await supabase.storage.from('web-section-images').upload(`private/${business_id}/${file.id}`, file.fileBody!).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    // const { data, error } = await supabase.from('image_section').insert({
    //     id: file.id,
    //     fileBody: file.fileBody as any,
    //     url: url.data.publicUrl,
    //     editor_id: editor_id,
    //     index: array_length
    // }).select().single()
    return url.data.publicUrl
};

export const getSectionData = async (business_id: string) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('web_editors').select('*').eq('business_id', business_id).single()
    return data

}

export const saveSectionData = async (sectionData: any[], business_id: string, currentlyPublished: boolean) => {
    const supabase = createClient<Database>();
    if (!currentlyPublished) {
        await supabase.from('business_users').update({
            published_site: true
        }).eq('business_id', business_id!)
    }
    const { data, error } = await supabase.from('web_editors').update({
        section_data: sectionData
    }).eq('business_id', business_id).select().single()
    return data
}



export const getSectionImages = async (editor_id: string, business_id?: string) => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase
        .storage
        .from('web-section-images')
        .list(`private/${business_id}`, {
            limit: 100,          // max number of items to return
            offset: 0,           // skip this many items (for pagination)
            sortBy: { column: 'name', order: 'asc' } // optional sorting
        })
    let res = []
    if (data?.length) {
        for (let i = 0; i < data.length; i++) {
            const url = supabase.storage.from('web-section-images').getPublicUrl(`private/${business_id}/${data[i].name}`).data.publicUrl
            res.push({ url: url, id: data[i].name })
        }
    }
    return res
}

export const editSectionImage = async (imgObjId: string, fileBody: File, businessId: string) => {
    // Change image object image source
    const supabase = createClient<Database>()
    const newUrl = await supabase.storage.from('web-section-images').update(`private/${businessId}/${imgObjId}`, fileBody).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    return `${newUrl.data.publicUrl}?t=${Date.now()}`
}

export const deleteUploadedImg = async (imageName: string, business_id: string) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.storage.from('web-section-images').remove([`private/${business_id}/${imageName}`])
    if (error) {
        return error
    }
    return data
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


