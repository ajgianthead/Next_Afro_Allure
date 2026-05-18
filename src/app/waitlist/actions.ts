'use server'
import { createClient } from '@/app/utils/supabase/server'

export async function joinClientWaitlist(email: string, city?: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('client_waitlist')
        .insert({ email, city: city || null })
    if (error) {
        if (error.code === '23505') return { success: false, duplicate: true }
        throw new Error(error.message)
    }
    return { success: true, duplicate: false }
}

export async function getWaitlistCount(): Promise<number> {
    const supabase = await createClient()
    const { count } = await supabase
        .from('client_waitlist')
        .select('*', { count: 'exact', head: true })
    return count ?? 0
}
