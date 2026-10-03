'use server'

import { Resend } from 'resend'

const FROM = 'AfroAllure <noreply@reminder.afroallure.co>'
const TO = 'privacy@afroallure.co'

export async function submitDataDeletionRequest(name: string, email: string, reason: string) {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail) {
        return { error: 'Name and email are required.' }
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
        await resend.emails.send({
            from: FROM,
            to: TO,
            replyTo: trimmedEmail,
            subject: `Data deletion request from ${trimmedName}`,
            text: [
                `Name: ${trimmedName}`,
                `Email: ${trimmedEmail}`,
                `Reason: ${reason.trim() || '(not provided)'}`,
            ].join('\n'),
        })
    } catch {
        return { error: 'Could not send your request. Please email privacy@afroallure.co directly.' }
    }

    return { success: true }
}
