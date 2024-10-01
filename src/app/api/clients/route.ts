'use server'
import { createClient } from "@utils/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { Database } from "../../../../lib/database.types";

// Update a client
export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    const { id, email, phone_number } = await request.json();
    const { data, error } = await supabase.from('client_users').update(
        {
            email: email,
            phone_number: phone_number,
            updated_at: Date.now().toString()
        }
    ).eq("client_id", id).select();
    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
// Create a client
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { email, phone_number, first_name, last_name } = await request.json();
    const { data, error } = await supabase.from('client_users').insert([
        {
            email: email,
            phone_number: phone_number,
            first_name: first_name,
            last_name: last_name
        }
    ]).select();
    if (error) {
        throw new Error(error.message)
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}


