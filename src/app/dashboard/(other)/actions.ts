'use server'
import { createClient } from "@utils/supabase/server"
import { redirect } from "next/navigation"
import { Database } from "../../../../lib/database.types"
import { Resend } from "resend"
import { PaymentLinkProps, sendLink } from "trigger/reminder"


export const fetchUser = async () => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.auth.getUser()
    return data?.user

}

export const sendPaymentLink = async (props: PaymentLinkProps) => {
    const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY)
    const res = await sendLink(props)
    return res
}

export const sendFeedback = async ({ businessId, businessName, email, feedback }: {
    businessId: string;
    businessName: string;
    email: string;
    feedback: string;
}) => {
    const supabase = createClient<Database>()
    const { data, error } = await supabase.from('user_feedback').insert({
        business_id: businessId,
        business_name: businessName,
        email: email,
        feedback: feedback
    }).select().single()
    if (error) {
        return error
    }
    return data
}

export const fetchBusinessUser = async (user_id: string) => {
    const supabase = createClient<Database>()
    const { data: business, error } = await supabase.from('business_users').select().eq('user_id', user_id).single()
    return business!
}
