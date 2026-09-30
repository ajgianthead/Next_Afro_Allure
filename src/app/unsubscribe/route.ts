import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/utils/supabase/admin'

// Unauthenticated by design — a visitor clicking this link from an email has
// no Supabase session, so this uses the admin client (bypasses RLS) scoped
// strictly to a single token-matched row.
export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) return NextResponse.redirect(new URL('/unsubscribed?error=missing-token', req.url))

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('business_users')
        .update({ marketing_opt_in: false })
        .eq('unsubscribe_token', token)
        .select('business_id')

    if (error || !data?.length) return NextResponse.redirect(new URL('/unsubscribed?error=not-found', req.url))
    return NextResponse.redirect(new URL('/unsubscribed', req.url))
}
