import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { safeNext } from '@/lib/auth/safeNext'

/**
 * PKCE links: Supabase's default email templates ({{ .ConfirmationURL }})
 * verify the email on Supabase's side, then send people to
 * `<redirectTo>?code=…` (middleware forwards `/?code=…` here).
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // auth-js returns redirectType (set by resetPasswordForEmail) but
            // doesn't declare it in its types.
            const redirectType = (data as { redirectType?: string | null }).redirectType
            const isRecovery = redirectType === 'PASSWORD_RECOVERY'
            const next = safeNext(searchParams.get('next'), isRecovery ? '/set-password' : '/dashboard')
            return NextResponse.redirect(`${origin}${next}`)
        }
        // Usually the link was opened in a different browser than the one used
        // to sign up, so the code can't be exchanged. Supabase has already
        // confirmed the email by this point; signing in works.
        console.error('Auth code exchange failed:', error.message)
    }

    return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}
