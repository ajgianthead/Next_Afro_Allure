import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";

// Get service by id
export async function GET(request: NextRequest, { params }: { params: { id: string, businessId: string } }) {
    const supabase = createClient<Database>();
    const { id, businessId } = params;
    let { data: services, error } = await supabase.from("services").select("*").eq("id", id).eq("business", businessId)
    if (error) {
        throw new Error(error.message);
    }
    if (services?.length) {
        return new NextResponse(JSON.stringify({ message: "business has no services" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ data: services }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
// Delete service
export async function DELETE(request: NextRequest, { params }: { params: { id: string, businessId: string } }) {
    const supabase = createClient<Database>();
    const { id, businessId } = params;
    let {data, error} = await supabase.from('services').delete().eq("id", id).eq("business", businessId).select().single()
    if(error){
        return new NextResponse(JSON.stringify({ result: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
