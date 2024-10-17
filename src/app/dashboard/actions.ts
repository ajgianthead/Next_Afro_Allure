'use server'
import { createClient } from "@utils/supabase/server"
import { Database } from "../../../lib/database.types"
import { redirect } from "next/navigation"


export const fetchUser = async () => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('http://localhost:3000/login')
    }
}
