'use server'
import { createClient } from "@utils/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "../../../../lib/database.types"


export const fetchUser = async () => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.auth.getUser()
    return data?.user

}

export const fetchBusinessUser = async (user_id: string) => {
    const supabase = createClient<Database>()
    const { data: business, error } = await supabase.from('business_users').select().eq('user_id', user_id).single()
    return business
}
