'use server'

import { createClient } from "@/app/utils/supabase/server"
import { Database } from "../../../../../lib/database.types";
import { ServiceType } from "@/lib/service/Service";


export const uploadImg = async (path: string, image: {
    imageURL: string | null;
    imageBlob: Blob | null;
}) => {
    const supabase = await createClient<Database>();
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
    const supabase = await createClient<Database>();
    const url = supabase.storage
        .from('service-photos')
        .getPublicUrl(path).data.publicUrl;


    return { url: url, path };
}

export const updateImg = async (path: string, image: {
    imageURL: string | null;
    imageBlob: Blob | null;
}) => {
    const supabase = await createClient<Database>();
    const img = await supabase.storage
        .from('service-photos')
        .update(path, image.imageBlob!, {
            contentType: image.imageBlob!.type || 'image/png',
        })

    return img
}

export const createServiceAction = async (businessId: string, serviceData: Omit<ServiceType, 'addons'> & { addons: string[] }) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('services')
        .insert([{
            id: serviceData.id,
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            length: serviceData.length,
            addons: serviceData.addons,
            imagePath: serviceData.imagePath,
            photo_url: serviceData.photo_url,
            business: businessId,
            categories: serviceData.categories,
            availability: serviceData.availability,
        }])
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const updateServiceAction = async (businessId: string, serviceData: {
    id: string
    name: string
    price: number
    description: string
    addons: string[]
    length: number
    photo_url: string | null
    category: string[] | null
    availability: string | null
}) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('services')
        .update({
            name: serviceData.name,
            price: serviceData.price,
            description: serviceData.description,
            addons: serviceData.addons,
            length: serviceData.length,
            photo_url: serviceData.photo_url,
            categories: serviceData.category,
            availability: serviceData.availability ?? undefined,
        })
        .eq('id', serviceData.id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const deleteServiceAction = async (businessId: string, serviceId: string) => {
    const supabase = await createClient<Database>()
    const { data: deleted, error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .select()
        .single()
    if (deleteError) throw new Error(deleteError.message)

    if (deleted.imagePath) {
        await supabase.storage.from('service_photos').remove([deleted.imagePath]).catch(console.error)
    }

    const { data, error } = await supabase
        .from('services')
        .select()
        .eq('business', businessId)
        .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export const createAddonAction = async (businessId: string, name: string, price: number) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('service_addons')
        .insert({ business_id: businessId, name, price: Math.round(price) })
        .select('id, name, price')
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const updateAddonAction = async (addon: { id: string; name: string; price: number }) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('service_addons')
        .update({ name: addon.name, price: Math.round(addon.price) })
        .eq('id', addon.id)
        .select('id, name, price')
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const deleteAddonAction = async (addonId: string) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase
        .from('service_addons')
        .delete()
        .eq('id', addonId)
        .select('id, name, price')
        .single()
    if (error) throw new Error(error.message)
    return data
}
