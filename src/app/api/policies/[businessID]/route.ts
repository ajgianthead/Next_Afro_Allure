import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { Database } from "../../../../../lib/database.types";


export async function GET(request: NextRequest, {params} : {params: {businessID: string}}) {
    const supabase = createClient<Database>();
    const {businessID} = await params
    const { data, error } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessID).then(async (value: PostgrestSingleResponse<{ booking_policies: string; }[]>) => {
        return await supabase.from("business_policies").select("*").eq("id", value.data![0].booking_policies).single()
    })
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ policies: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
