'use server'

import { parsePrep, parseStyleOptions } from '@/features/services/pricing'
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

// Style options and prep are validated before saving; a disabled or empty
// options block is stored as null. Omitted fields are left unchanged.
function styleFields(serviceData: ServiceData) {
    const fields: { style_options?: any; prep?: any; rebook_weeks?: number | null } = {}
    if ('style_options' in serviceData) fields.style_options = parseStyleOptions(serviceData.style_options)
    if ('prep' in serviceData) fields.prep = parsePrep(serviceData.prep)
    if ('rebook_weeks' in serviceData) {
        const weeks = Number(serviceData.rebook_weeks)
        fields.rebook_weeks = serviceData.rebook_weeks != null && Number.isInteger(weeks) && weeks >= 1 && weeks <= 52 ? weeks : null
    }
    return fields
}

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
            ...styleFields(serviceData),
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
            ...styleFields(serviceData),
        })
        .eq('id', serviceData.id)
        .eq('business', businessId)
        .select()
        .single()
    if (error) throw new Error(error.message)
    return data
}

export const deleteServiceAction = async (businessId: string, serviceId: string) => {
    const supabase = await createClient()

    // Keep businesses from deleting their last remaining service — enforced
    // client-side too, but that can be bypassed by a stale tab or a direct call.
    const { count } = await supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('business', businessId)
    if ((count ?? 0) <= 1) {
        throw new Error('You must have at least one service.')
    }

    const { data: deleted, error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('business', businessId)
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

export const updateAddonAction = async (businessId: string, addon: AddonData): Promise<AddonData> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('service_addons')
        .update({ name: addon.name, price: Math.round(addon.price) })
        .eq('id', addon.id)
        .eq('business_id', businessId)
        .select('id, name, price, business_id')
        .single()
    if (error) throw new Error(error.message)
    return data as AddonData
}

export const deleteAddonAction = async (businessId: string, addonId: string): Promise<void> => {
    const supabase = await createClient()
    const { error } = await supabase
        .from('service_addons')
        .delete()
        .eq('id', addonId)
        .eq('business_id', businessId)
    if (error) throw new Error(error.message)
}
