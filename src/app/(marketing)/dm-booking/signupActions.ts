'use server'

import { Resend } from 'resend'
import { createClient } from '@/app/utils/supabase/server'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { BusinessUser } from '@lib/businessUser/BusinessUser'
import WelcomeEmail from '../../../../emails/welcome'
import SetPasswordEmail from '../../../../emails/set-password'

const FROM = 'AfroAllure <noreply@reminder.afroallure.co>'

export async function createAdFunnelUser(
    email: string,
    businessName: string
): Promise<{ error: string } | { success: true }> {
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = businessName.trim()

    if (!trimmedEmail || !trimmedName) {
        return { error: 'Business name and email are required.' }
    }

    // Generate a random temp password the user will never see
    const tempPassword = crypto.randomUUID() + crypto.randomUUID()

    const supabase = await createClient()

    try {
        await BusinessUser.create(supabase, trimmedEmail, tempPassword, trimmedName)
    } catch (err: any) {
        return { error: err.message ?? 'Could not create your account. Please try again.' }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: tempPassword,
    })
    if (signInError) {
        return { error: 'Account created. Log in at afroallure.co/login to continue.' }
    }

    // Tag user as coming from the ad funnel and needing password setup
    await supabase.auth.updateUser({
        data: { needs_password_setup: true, signup_source: 'dm_booking_ad' },
    })

    const firstName = trimmedName.split(' ')[0]

    // Generate a 7-day recovery link for password setup
    const adminClient = createAdminClient()
    const redirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/set-password`
    const { data: linkData } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: trimmedEmail,
        options: { redirectTo },
    })
    const recoveryUrl: string | null = (linkData as any)?.properties?.action_link ?? null

    // Fire emails without blocking the redirect
    const resend = new Resend(process.env.RESEND_API_KEY)

    resend.emails.send({
        from: FROM,
        to: trimmedEmail,
        subject: "You're in — AfroAllure is set up and ready",
        react: WelcomeEmail({ firstName }),
    }).catch(console.error)

    if (recoveryUrl) {
        resend.emails.send({
            from: FROM,
            to: trimmedEmail,
            subject: 'Set your AfroAllure password',
            react: SetPasswordEmail({ firstName, setPasswordUrl: recoveryUrl }),
        }).catch(console.error)
    }

    return { success: true }
}
