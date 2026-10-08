import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/app/utils/supabase/server'
import { safeNext } from '@/lib/auth/safeNext'

/**
 * Where the links in Supabase's auth emails land (see supabase/templates):
 *   /auth/confirm?token_hash=…&type=email&next=/dashboard        (confirm signup)
 *   /auth/confirm?token_hash=…&type=recovery&next=/set-password  (reset password)
 *
 * Verifying the token hash here, rather than exchanging a PKCE code, works
 * when the email is opened in a different browser or device than the one
 * used to sign up (Instagram's in-app browser, then the Gmail app).
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const isRecovery = type === 'recovery'
    const next = safeNext(searchParams.get('next'), isRecovery ? '/set-password' : '/dashboard')

    if (tokenHash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
        if (!error) return NextResponse.redirect(`${origin}${next}`)
        console.error(`Auth link (${type}) failed:`, error.message)
    }

    // Links are single-use and expire; send them somewhere they can get a new one.
    return NextResponse.redirect(isRecovery ? `${origin}/forgot-password?error=link_expired` : `${origin}/login?error=link_expired`)
}
