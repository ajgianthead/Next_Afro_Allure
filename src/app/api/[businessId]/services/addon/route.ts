import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";
import { createClient } from "@utils/supabase/server";

export async function POST(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params;
    const {name, price} = await request.json()
    const {data, error} = await supabase.from("service_addons").insert({
        business_id: businessId,
        name: name,
        price: parseInt(price)
    }).select('id, name, price').single()
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ data, message: "Service Addon created!" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
    
}

export async function PUT(request: NextRequest) {
    const supabase = createClient<Database>();
    const {id, name, price} = await request.json()
    const {data, error} = await supabase.from("service_addons").update({
        name: name,
        price: parseInt(price)
    }).eq('id', id).select('id, name, price').single()
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ data, message: "Service Addon updated!" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
    
}
