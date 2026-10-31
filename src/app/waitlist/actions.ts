'use server'

import { guardPublicAction } from '@/lib/abuse/guard'
import { createAdminClient } from '@/app/utils/supabase/admin'
export async function joinClientWaitlist(email: string, city?: string, turnstileToken: string | null = null) {
    const blocked = await guardPublicAction('client-waitlist', { turnstileToken, perIp: { max: 5, window: '1 h' } })
    if (blocked) throw new Error(blocked)
    const supabase = createAdminClient()
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
    const supabase = createAdminClient()
    const { count } = await supabase
        .from('client_waitlist')
        .select('*', { count: 'exact', head: true })
    return count ?? 0
}
