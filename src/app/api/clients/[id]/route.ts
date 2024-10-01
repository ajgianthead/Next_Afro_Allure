'use server'

import { createClient } from "@utils/supabase/server"
import { NextResponse } from "next/server";

// Get a client by id
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const supabase = createClient<Database>();
    const { id } = params;
    const { data: clients, error } = await supabase.from('client_users').select("*").eq("client_id", id)
    if (error) {
        throw new Error(error.message)
    }
    if (clients?.length) {
        return new NextResponse(JSON.stringify({ business: clients }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({
        message: "This client doesn't exist",
        status: 500
    }))
}


