'use server'

import { Resend } from 'resend'
import { createAdminClient } from '@/app/utils/supabase/admin'
import { guardPublicAction } from '@/lib/abuse/guard'

const FROM = 'AfroAllure <noreply@reminder.afroallure.co>'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Result = { ok: true } | { ok: false; error: string }

/**
 * Public: a visitor sends the business a message from its website's Contact
 * section. Plain-text email to the business's account address, with the
 * visitor as Reply-To. Bot check and rate limits per visitor and per business.
 */
export async function sendContactMessageAction(input: { businessId: string; name: string; contact: string; message: string }, turnstileToken: string | null = null): Promise<Result> {
    const businessId = String(input?.businessId ?? '')
    const blocked = await guardPublicAction('site-contact', {
        turnstileToken,
        perIp: { max: 5, window: '1 h' },
        perKey: { key: businessId, max: 40, window: '1 d' },
    })
    if (blocked) return { ok: false, error: blocked }

    const name = String(input?.name ?? '').trim().slice(0, 80)
    const contact = String(input?.contact ?? '').trim().slice(0, 120)
    const message = String(input?.message ?? '').trim().slice(0, 2000)
    if (!name) return { ok: false, error: 'Please enter your name.' }
    if (!contact) return { ok: false, error: 'Please add an email or phone number so they can reply.' }
    if (message.length < 2) return { ok: false, error: 'Please write a message.' }

    const { data: business } = await createAdminClient().from('business_users').select('business_name, email').eq('business_id', businessId).maybeSingle()
    if (!business?.email) return { ok: false, error: 'This business can’t take messages right now. Please try booking instead.' }

    try {
        const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
            from: FROM,
            to: business.email,
            ...(EMAIL.test(contact) ? { replyTo: contact } : {}),
            subject: `New message from ${name} (your website)`,
            text: [
                `${name} sent you a message from your AfroAllure website.`,
                '',
                `Contact: ${contact}`,
                '',
                message,
                '',
                EMAIL.test(contact) ? 'Reply to this email to answer them.' : 'Reply using the contact details above.',
            ].join('\n'),
        })
        if (error) throw new Error(error.message)
        return { ok: true }
    } catch (err: any) {
        console.error('site contact email failed:', err?.message)
        return { ok: false, error: 'Your message didn’t send. Please try again.' }
    }
}
