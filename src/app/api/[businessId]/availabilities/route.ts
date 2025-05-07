import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function PUT(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params
    const { availabilities, defaultAvailability } = await request.json()
    const { data, error } = await supabase.from("business_users").update({
        availabilities: availabilities,
        default_availability: defaultAvailability,
    }).eq("business_id", businessId).select();
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data?.length) {
        return new NextResponse(JSON.stringify({ result: data[0] }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "No availabilities to update" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
    })

}
// Get availabilities
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params;
    const { data, error } = await supabase.from('business_users').select('availabilities(id, business_id, availability_data), default_availability').eq("business_id", businessId).single();

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data) {
        return new NextResponse(JSON.stringify({ result: {availabilities: data.availabilities, defaultAvailability: data.default_availability} }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "No availabilities to update" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
    })

}

