'use server'

import { createClient } from "@/app/utils/supabase/server"

export const updateBookingTheme = async (themeData: any, businessId: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('web_editors').update({
        theme_data: themeData
    }).eq("business_id", businessId).select("*").maybeSingle()
    if (error) throw error
    return data
}

export const updateBusinessURL = async (businessId: string, urlName: string) => {
    const supabase = await createClient();

    const { error: updateError } = await supabase
        .from("business_users")
        .update({ url_name: urlName })
        .eq("business_id", businessId);

    return updateError
}

export const isURLNameAvailable = async (urlName: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('business_users').select("business_id").eq('url_name', urlName).limit(1).maybeSingle()
    if (error) {
        throw error
    }
    return !data
}

export const createSectionEditorState = async (business_name: string, business_id: string, switchType: string) => {
    const supabase = await createClient();
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

        if (error) return error
        return data?.id
    }
}



export const createEditorState = async (business_id: string, switchType: string) => {
    try {
        const supabase = await createClient();
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
                section_data: []
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
    const supabase = await createClient();
    const url = await supabase.storage.from('web-section-images').upload(`private/${business_id}/${file.id}`, file.fileBody!).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    return url.data.publicUrl
};

export const getSectionData = async (business_id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('web_editors').select('*').eq('business_id', business_id).single()
    return data
}

export const saveSectionData = async (sectionData: any[], business_id: string, currentlyPublished: boolean) => {
    const supabase = await createClient();
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
    const supabase = await createClient()
    const { data, error } = await supabase
        .storage
        .from('web-section-images')
        .list(`private/${business_id}`, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
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
    const supabase = await createClient()
    const newUrl = await supabase.storage.from('web-section-images').update(`private/${businessId}/${imgObjId}`, fileBody).then((res) => {
        return supabase.storage.from('web-section-images').getPublicUrl(res.data?.path!)
    })
    return `${newUrl.data.publicUrl}?t=${Date.now()}`
}

export const deleteUploadedImg = async (imageName: string, business_id: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from('web-section-images').remove([`private/${business_id}/${imageName}`])
    if (error) {
        return error
    }
    return data
}

export const deleteSectionImage = async (business_id: string, imageObjId: string) => {
    const supabase = await createClient();
    await supabase.storage.from('web-section-images').remove([`private/${business_id}/${imageObjId}`])
    const { data: deleted } = await supabase.from('image_section').delete().eq('id', imageObjId).select().single()
    if (!deleted) return []
    const { data: remaining } = await supabase.from('image_section').select().gt('index', deleted.index)
    if (!remaining?.length) return []
    const updated: any[] = []
    for (const item of remaining) {
        const { data: newImg } = await supabase.from('image_section').update({ index: item.index - 1 }).eq('id', item.id).select().single()
        if (newImg) updated.push(newImg)
    }
    return updated
}
