import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { email, password, isBusiness } = await request.json();
    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    }).then(async () => {
        return await supabase.auth.updateUser({
            data: {
                account_type: isBusiness ? 'business' : 'client'
            }
        })
    })

    if (error) {
        throw new Error(error.message);
    }
    return new NextResponse(JSON.stringify({ message: "User successfully logged in!!" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
