import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { error } = await supabase.auth.signOut()
    if (error) {
        return new NextResponse(JSON.stringify({ message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ message: "User successfully logged out!!" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}


