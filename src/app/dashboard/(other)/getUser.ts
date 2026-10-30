'use server'
import { createClient } from "@/app/utils/supabase/server";

export const getUser = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        return user
    }
    return false
}
