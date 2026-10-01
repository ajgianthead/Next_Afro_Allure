'use server'

import { createClient } from '@/app/utils/supabase/server'
import { Resend } from 'resend'
import FounderNotification from '../../../emails/FounderNotification'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AfroAllure <notifications@beta.afroallure.co>'

async function getCurrentBusiness(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
    const { data } = await supabase
        .from('business_users')
        .select('business_id, business_name, email')
        .eq('user_id', userId)
        .maybeSingle()
    return data
}

export async function submitFeedback(formData: FormData): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const business = user ? await getCurrentBusiness(supabase, user.id) : null
    const businessName = business?.business_name ?? 'Unknown'
    const email = business?.email ?? user?.email ?? 'Unknown'

    const type = formData.get('type') as string
    const message = formData.get('message') as string

    if (!message?.trim()) {
        return { error: 'Message is required.' }
    }

    const { error } = await supabase.from('feedback').insert({
        business_id: business?.business_id ?? null,
        business_name: businessName,
        email,
        type,
        message,
        status: 'new',
    })
    if (error) {
        return { error: 'Could not submit feedback. Please try again.' }
    }

    try {
        await resend.emails.send({
            from: FROM,
            to: process.env.FOUNDER_EMAIL!,
            subject: `New feedback (${type}): ${businessName}`,
            react: FounderNotification({
                eventType: 'feedback',
                businessName,
                email,
                detail: `Type: ${type}\n\n${message}`,
                timestamp: new Date().toISOString(),
            }),
        })
    } catch (e) {
        console.error('Failed to send founder feedback notification:', e)
    }

    return { success: true }
}

export async function submitSupportTicket(formData: FormData): Promise<{ success: true } | { error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const business = user ? await getCurrentBusiness(supabase, user.id) : null
    const businessName = business?.business_name ?? 'Unknown'
    const email = business?.email ?? user?.email ?? 'Unknown'

    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!subject?.trim() || !message?.trim()) {
        return { error: 'Subject and message are required.' }
    }

    const { error } = await supabase.from('support_tickets').insert({
        business_id: business?.business_id ?? null,
        business_name: businessName,
        email,
        subject,
        message,
        status: 'open',
        priority: 'normal',
    })
    if (error) {
        return { error: 'Could not submit your ticket. Please try again.' }
    }

    try {
        await resend.emails.send({
            from: FROM,
            to: process.env.FOUNDER_EMAIL!,
            subject: `Support ticket: ${subject} — ${businessName}`,
            react: FounderNotification({
                eventType: 'support_ticket',
                businessName,
                email,
                detail: `Subject: ${subject}\n\n${message}`,
                timestamp: new Date().toISOString(),
            }),
        })
    } catch (e) {
        console.error('Failed to send founder support ticket notification:', e)
    }

    return { success: true }
}
