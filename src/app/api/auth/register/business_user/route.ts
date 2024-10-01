import { corsHeaders } from "@utils/cors_headers";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";


// export async function OPTIONS(request: NextRequest) {
//     if (request.method === `OPTIONS`) {
//         return new Response(null, {
//             headers: corsHeaders,
//         });
//     }
// }

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
    }).then(async (data) => {
        return await supabase.from('business_users').insert([
            {
                business_name: name,
                user_id: data.data.user?.id,
                email: data.data.user?.email,
            }
        ]).select()
    }).then(async () => {
        return await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
    })
    if (error) {
        return new Response(JSON.stringify({ error: error }), {
            headers: corsHeaders,
            status: 200
        })
    }
    console.log(user);

    return new Response(JSON.stringify({ data: user }), {
        headers: corsHeaders,
        status: 200
    })
}
