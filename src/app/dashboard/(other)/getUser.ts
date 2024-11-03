'use server'
import { createClient } from "@utils/supabase/server";

export const getUser = async () => {
    const supabase = createClient<Database>();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        return user
    }
    return false
}
