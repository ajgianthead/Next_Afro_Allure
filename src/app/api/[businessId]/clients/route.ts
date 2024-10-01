import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import Appointment from "@utils/types/appointment";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

// Get all clients from business
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = params;
    let { data: clients, error } = await supabase
        .from('business_clients')
        .select(`*, client_users(*)`)
        .eq('business_id', businessId);
    if (error) {
        throw new Error(error.message)
    }
    if (clients?.length) {
        return new NextResponse(JSON.stringify({ clients: clients }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({
        message: "This business has no appointments",
        status: 500
    }))
}

// Create new client to business
export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { client, business } = await request.json();
    const { data, error } = await supabase.from('business_clients').insert([
        {
            business: business,
            client: client
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


