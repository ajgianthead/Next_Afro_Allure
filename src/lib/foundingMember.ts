import { createClient } from '@/app/utils/supabase/server'
import { Resend } from 'resend'

const FROM = 'AfroAllure <noreply@reminder.afroallure.co>'

export async function checkAndAssignFoundingMember(
    businessId: string
): Promise<number | null> {
    const supabase = await createClient()

    const { data: memberNumber, error } = await supabase
        .rpc('assign_founding_member', { p_business_id: businessId })

    if (error || memberNumber === null || memberNumber === undefined) {
        return null
    }

    const { data: business } = await supabase
        .from('business_users')
        .select('email, business_name, url_name')
        .eq('business_id', businessId)
        .single()

    if (business) {
        const firstName = business.business_name.split(' ')[0]
        const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.url_name}`
        try {
            const resend = new Resend(process.env.RESEND_API_KEY)
            const { default: FoundingMemberWelcome } = await import('../../emails/founding-member-welcome')
            await resend.emails.send({
                from: FROM,
                to: business.email,
                subject: `You're founding member #${String(memberNumber).padStart(3, '0')} — your rate is locked forever`,
                react: FoundingMemberWelcome({ firstName, memberNumber: memberNumber as number, bookingUrl }),
            })
        } catch (e) {
            console.error('Failed to send founding member welcome email:', e)
        }
    }

    return memberNumber as number
}

export async function getFoundingMemberCount(): Promise<number> {
    const supabase = await createClient()
    const { count } = await supabase
        .from('business_users')
        .select('*', { count: 'exact', head: true })
        .eq('founding_member', true)
    return count ?? 0
}
