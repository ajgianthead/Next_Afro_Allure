import 'server-only'

import { createClient } from '@/app/utils/supabase/server'
import { effectivePlanType } from '@/lib/beta'
import type { PlanType } from '../gating'
import { sanitizePage } from '../page'

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }

export const SIGNED_OUT = 'You are signed out. Please sign in again.'
const EMPTY_PUCK = JSON.stringify({ content: [], root: {}, zones: {} })

// builder_draft / builder_data / builder_published_at and the BUILDER type
// come from migration 20261102000000; the generated database types catch up
// after it runs in production, hence the loose casts on those columns.
export async function ownBusiness() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('business_users')
        .select('business_id, url_name, plan_type, published_site')
        .eq('user_id', user.id)
        .single()
    return data ? { supabase, business: data, plan: effectivePlanType(data.plan_type) as PlanType } : null
}

export async function ensureRow(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string) {
    const { data } = await supabase.from('web_editors').select('id').eq('business_id', businessId).maybeSingle()
    if (data) return null
    const { error } = await supabase.from('web_editors').insert({ business_id: businessId, type: 'TEMPLATE', editor_data: EMPTY_PUCK, section_data: [] })
    return error?.message ?? null
}

/** Saves the signed-in owner's draft. Drafts never show on the live site. Shared by the server action and the draft endpoint (used when the page closes). */
export async function saveDraft(raw: unknown): Promise<Result<{ savedAt: string }>> {
    const own = await ownBusiness()
    if (!own) return { ok: false, error: SIGNED_OUT }
    const clean = sanitizePage(raw)
    if (!clean.ok) return clean
    const rowError = await ensureRow(own.supabase, own.business.business_id)
    if (rowError) {
        console.error('builder draft: could not create the editor row:', rowError)
        return { ok: false, error: 'Could not save. Please try again.' }
    }
    const { error } = await own.supabase.from('web_editors').update({ builder_draft: clean.page } as any).eq('business_id', own.business.business_id)
    if (error) {
        // e.g. the builder columns are missing because migration 20261102000000 hasn't run on this database.
        console.error('builder draft save failed:', error.code, error.message)
        return { ok: false, error: 'Could not save. Please try again.' }
    }
    return { ok: true, data: { savedAt: new Date().toISOString() } }
}
