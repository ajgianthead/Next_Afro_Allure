import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";
import { createClient } from "@utils/supabase/server";

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params;
    let { data, error } = await supabase.from("services").select("*, business_users(business_id, default_availability, availabilities(business_id, availability_data, id), service_addons(id, name, price))").eq("business", businessId).order("created_at", {ascending: true})
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data?.length) {
        return new NextResponse(JSON.stringify({ data, message: "Services found" }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ data, message: "No services found" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}
