'use server'

import { createClient } from "@utils/supabase/server"
import { Database } from "../../../../../lib/database.types"


export const checkAvailabilityToServices = async (availabilityId: string) => {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('services').select().eq('availability', availabilityId)

    if (error) {
        return error
    }
    if (data?.length) {
        return { attachedServices: true }
    }
    return { attachedServices: false }
}
