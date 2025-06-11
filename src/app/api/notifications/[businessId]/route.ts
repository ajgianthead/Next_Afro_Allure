import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { title, body, business_id } = await request.json()
    const { data, error } = await supabase.from("notifications").insert({
        title: title,
        body: body,
        business_id: business_id,
        type: 'business'
    }).select().single()
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    const { id, read } = await request.json()
    const { data, error } = await supabase.from("notifications").update({
        read: read
    }).eq("id", id).select().single()

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}


export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params
    const { data, error } = await supabase.from("notifications").select("*").eq("business_id", businessId).eq('type', 'business')

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ notifications: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
