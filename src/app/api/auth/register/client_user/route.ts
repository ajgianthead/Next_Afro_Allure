// Register a client user

import { corsHeaders } from "@utils/cors_headers";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { email, password, phone_number } = await request.json();
    // Register user and put user in business_users table
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        phone: phone_number,
        options: {
            data: {
                account_type: 'client'
            }
        }
    }).then(async (data) => {
        return await supabase.from('client_users').insert([
            {
                // TODO: Get a business id #
                user_id: data.data.user?.id,
                email: data.data.user?.email,
                phone_number: data.data.user?.phone,
                created_at: data.data.user?.created_at
            }
        ])
    })
    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ result: data }), {
        headers: corsHeaders,
        status: 200
    })
}
