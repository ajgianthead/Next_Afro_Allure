'use server'

import { createClient } from "@/app/utils/supabase/server"
import { Database, Json } from "../../../../../lib/database.types"
import { AccountSettings } from "./settingsclient"


export const saveAccountSettings = async (account_settings: any, businessId: string, email: string) => {
    const supabase = await createClient<Database>()
    const { data, error } = await supabase.from('business_users').update({
        account_settings: account_settings,
        email: email
    }).eq('business_id', businessId).select("account_settings").single()
    if (error) return error
    return data
}

