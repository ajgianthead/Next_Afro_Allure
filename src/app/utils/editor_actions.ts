'use server'

import { createClient } from "./supabase/server"
import type { BookingTheme } from "@/features/automatedBooking/types/theme"

export const getEditorData = async (businessId: string | undefined) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('web_editors').select("*").eq("business_id", businessId!).single()
    if (error) {
        return error
    }
    return data
}

export const saveDraftData = async (draftData: string, businessId: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('web_editors').update({
        draft_data: draftData
    }).eq("business_id", businessId).select("*")
    if (error) throw error
    return data
}

export const publishEditorData = async (businessId: string) => {
    const supabase = await createClient();
    const { data: current, error: fetchError } = await supabase.from('web_editors')
        .select('draft_data')
        .eq('business_id', businessId)
        .single()
    if (fetchError) throw fetchError

    const publishedAt = new Date().toISOString()
    const { data, error } = await supabase.from('web_editors').update({
        editor_data: current.draft_data,
        published_at: publishedAt,
    }).eq("business_id", businessId).select("*")
    if (error) throw error

    await supabase.from('business_users').update({
        published_site: true
    }).eq('business_id', businessId)

    return data
}

export const saveThemeData = async (businessId: string, theme: BookingTheme) => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('web_editors')
        .update({ theme_data: theme as any })
        .eq('business_id', businessId)
        .select('*')
    if (error) throw error
    return data
}

export const getThemeData = async (businessId: string): Promise<BookingTheme | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('web_editors')
        .select('theme_data')
        .eq('business_id', businessId)
        .single()
    if (error || !data) return null
    return data.theme_data as unknown as BookingTheme
}
