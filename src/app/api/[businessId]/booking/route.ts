import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";
import { assignAddons } from "app/api/util/transformServices";


export async function GET(request: NextRequest, {params}: {params : {businessId: string}}){
    const {businessId} = await params;
    const supabase = createClient<Database>()
    const currentTimestamp = new Date().toISOString();
    const res = await supabase.from('business_users').select('booking_policies').eq('business_id', businessId).single();
    const policy = (await supabase.from('business_policies').select("*").eq('id', res.data?.booking_policies!).single()).data
    const services = (await supabase.from('services').select('*').eq('business', businessId)).data
    const appointments = (await supabase.from('appointments').select().eq('business', businessId).gte('end', currentTimestamp)).data
    
    return new NextResponse(JSON.stringify({
        policy: policy,
        services: await assignAddons(supabase, services!),
        appointments: appointments
    } ), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
