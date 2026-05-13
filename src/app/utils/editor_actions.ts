'use server'

import { createClient } from "./supabase/server"
import type { BookingTheme } from "@/features/automatedBooking/types/theme"

export const sendEditorData = async (editorData: string, businessId: string | undefined, isPublished: boolean) => {
    const supabase = await createClient();
    if (!isPublished) {
        await supabase.from('business_users').update({
            published_site: true
        }).eq('business_id', businessId!)
    }
    const { data, error } = await supabase.from('web_editors').update({
        editor_data: editorData
    }).eq("business_id", businessId!).select("*")
    if (error) throw error
    return data
}

export const getEditorData = async (businessId: string | undefined) => {
    const supabase = await createClient();
    const { data, error } = await supabase.from('web_editors').select("*").eq("business_id", businessId!).single()
    if (error) {
        return error
    }
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
