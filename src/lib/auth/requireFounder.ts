import { createClient } from '@/app/utils/supabase/server'

/**
 * Whether the signed-in user is the founder (FOUNDER_EMAIL) — the same rule as
 * the /admin layout. The layout only guards the page: admin server actions
 * are public HTTP endpoints, so each one must check this itself.
 */
export async function isFounder(): Promise<boolean> {
    const founder = process.env.FOUNDER_EMAIL?.trim().toLowerCase()
    if (!founder) return false
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return !!user?.email && user.email.toLowerCase() === founder
}
