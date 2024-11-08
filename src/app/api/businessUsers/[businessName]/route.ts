import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function GET(request: NextRequest, { params }: { params: { businessName: string } }) {
    const supabase = createClient<Database>();
    const { businessName } = params
    const { data, error } = await supabase.from("business_users").select("*").ilike("business_name", `%${businessName}%`);
    if (error) {
        return new NextResponse(JSON.stringify({ result: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    if (data?.length) {
        return new NextResponse(JSON.stringify({ result: data[0] }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "Business doesn't exist" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
    })

}
