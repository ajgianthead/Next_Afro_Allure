import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function PUT(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { policies } = await request.json();
    const { businessId } = params
    const { data, error } = await supabase.from('business_users').update({
        booking_policies: policies
    }).eq("business_id", businessId).select();
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ result: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = params
    const { data, error } = await supabase.from('business_users').select("booking_policies").eq('business_id', businessId);
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ result: data[0] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}
