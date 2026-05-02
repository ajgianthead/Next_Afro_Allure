'use server'

import { createClient } from '@/app/utils/supabase/server'
import { ServiceData, AddonData } from '../types'

// ── Image actions ─────────────────────────────────────────────────────────────

export const uploadImg = async (path: string, imageBlob: Blob) => {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
        .from('service-photos')
        .upload(path, imageBlob, { contentType: imageBlob.type || 'image/png' })
    if (error) throw new Error(error.message)
    return data
}

export const updateImg = async (path: string, imageBlob: File) => {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
        .from('service-photos')
        .update(path, imageBlob, { contentType: imageBlob.type || 'image/png' })
    if (error) throw new Error(error.message)
    return data
}

export const getPublicImgURL = async (path: string): Promise<string> => {
    // Public URL is deterministic — no async needed
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    return `${supabaseUrl}/storage/v1/object/public/service-photos/${path}`
}

// ── Service actions ───────────────────────────────────────────────────────────

export const createServiceAction = async (
    businessId: string,
    serviceData: ServiceData
) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('services')
        .insert({
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
        })
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const updateServiceAction = async (
    businessId: string,
    serviceData: ServiceData
) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('services')
        .update({
            name: serviceData.name,
            description: serviceData.description,
            price: serviceData.price,
            length: serviceData.length,
            addons: serviceData.addons,
            photo_url: serviceData.photo_url,
            imagePath: serviceData.imagePath,
            categories: serviceData.categories,
            availability: serviceData.availability,
        })
        .eq('id', serviceData.id)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const deleteServiceAction = async (businessId: string, serviceId: string) => {
    const supabase = await createClient()
    const { data: deleted, error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .select()
        .single()
    if (deleteError) throw new Error(deleteError.message)

    if (deleted.imagePath) {
        await supabase.storage
            .from('service-photos')
            .remove([deleted.imagePath])
            .catch(console.error)
    }

    const { data, error } = await supabase
        .from('services')
        .select()
        .eq('business', businessId)
        .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
}

// ── Addon actions ─────────────────────────────────────────────────────────────

export const createAddonAction = async (
    businessId: string,
    name: string,
    price: number
): Promise<AddonData> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('service_addons')
        .insert({ business_id: businessId, name, price: Math.round(price) })
        .select('id, name, price, business_id')
        .single()
    if (error) throw new Error(error.message)
    return data as AddonData
}

export const updateAddonAction = async (addon: AddonData): Promise<AddonData> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('service_addons')
        .update({ name: addon.name, price: Math.round(addon.price) })
        .eq('id', addon.id)
        .select('id, name, price, business_id')
        .single()
    if (error) throw new Error(error.message)
    return data as AddonData
}

export const deleteAddonAction = async (addonId: string): Promise<void> => {
    const supabase = await createClient()
    const { error } = await supabase
        .from('service_addons')
        .delete()
        .eq('id', addonId)
    if (error) throw new Error(error.message)
}
