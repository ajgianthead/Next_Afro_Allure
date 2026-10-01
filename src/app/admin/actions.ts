'use server'

import { createAdminClient } from '@/app/utils/supabase/admin'
import { Resend } from 'resend'
import SupportReply from '../../../emails/SupportReply'
import AtRiskCheckin from '../../../emails/AtRiskCheckin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function updateFeedbackStatus(id: string, status: string, founderNotes: string): Promise<{ success: true } | { error: string }> {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('feedback')
        .update({
            status,
            founder_notes: founderNotes,
            resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', id)
    if (error) return { error: error.message }
    return { success: true }
}

export async function replyToTicket(ticketId: string, reply: string): Promise<{ success: true } | { error: string }> {
    const supabase = createAdminClient()
    const { data: ticket } = await supabase
        .from('support_tickets')
        .select('email, business_name, subject')
        .eq('id', ticketId)
        .single()
    if (!ticket || !ticket.email) return { error: 'Ticket not found' }

    try {
        await resend.emails.send({
            from: 'Abijah at AfroAllure <abijahnesbitt@afroallure.co>',
            to: ticket.email,
            subject: `Re: ${ticket.subject}`,
            react: SupportReply({
                businessName: ticket.business_name ?? 'there',
                subject: ticket.subject,
                reply,
            }),
        })
    } catch {
        return { error: 'Failed to send reply email' }
    }

    const { error } = await supabase
        .from('support_tickets')
        .update({ founder_reply: reply, status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', ticketId)
    if (error) return { error: error.message }

    return { success: true }
}

export async function updateTicketPriority(ticketId: string, priority: string): Promise<{ success: true } | { error: string }> {
    const supabase = createAdminClient()
    const { error } = await supabase.from('support_tickets').update({ priority }).eq('id', ticketId)
    if (error) return { error: error.message }
    return { success: true }
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<{ success: true } | { error: string }> {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('support_tickets')
        .update({ status, resolved_at: ['resolved', 'closed'].includes(status) ? new Date().toISOString() : null })
        .eq('id', ticketId)
    if (error) return { error: error.message }
    return { success: true }
}

export async function sendAtRiskEmail(businessId: string): Promise<{ success: true } | { error: string }> {
    const supabase = createAdminClient()
    const { data: business } = await supabase
        .from('business_users')
        .select('business_name, email')
        .eq('business_id', businessId)
        .single()
    if (!business) return { error: 'Business not found' }

    try {
        await resend.emails.send({
            from: 'Abijah at AfroAllure <abijahnesbitt@afroallure.co>',
            to: business.email,
            subject: 'Quick check-in from AfroAllure',
            react: AtRiskCheckin({ businessName: business.business_name, ownerName: '' }),
        })
        await supabase
            .from('business_users')
            .update({ last_checkin_sent_at: new Date().toISOString() })
            .eq('business_id', businessId)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to send email' }
    }
}
