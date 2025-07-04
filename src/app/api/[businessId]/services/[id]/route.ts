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
    const { id, businessId } = await params;

    const { data: result, error } = await supabase.from('services').delete().eq("id", id).select().then(async (res) => {
        // if imagePath exists, delete img
        await supabase.storage.from('service_photos').remove([res.data![0].imagePath!])
        let { data, error } = await supabase.from('services').select().eq("business", businessId).order("created_at", { ascending: true })
        return { data, error }
    })

    if (error) {
        return new NextResponse(JSON.stringify({ result: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: result }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
