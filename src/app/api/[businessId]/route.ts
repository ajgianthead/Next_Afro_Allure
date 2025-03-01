import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../lib/database.types";

export async function GET(request: NextRequest, {params}: {params : {businessId: string}}){
    const {businessId} = await params;
    const supabase = createClient<Database>()
    const {data, error} = await supabase.from('business_users').select('*').eq('business_id', businessId).single();
    if(error){
        return new NextResponse(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ data: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
