import { corsHeaders } from "@utils/cors_headers";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";

// Register a business user
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { name, email, password } = await request.json();
    // Register user and put user in business_users table
    const { data: user, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                account_type: 'business'
            }
        }
    })
        .then(async (data) => {
            return await supabase.from('business_users').insert([
                {
                    business_name: name,
                    user_id: data.data.user?.id,
                    email: data.data.user?.email,
                }
            ]).select()
        })
    if (error) {
        return new Response(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    console.log(user);

    return new Response(JSON.stringify({ data: user }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
