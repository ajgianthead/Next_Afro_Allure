import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function GET(request: NextRequest, {params}: {params : {businessId: string}}){
    const {businessId} = await params;
    const supabase = createClient<Database>()
    const currentTimestamp = new Date().toISOString();
    const res = await supabase.from('business_users').select('booking_policies').eq('business_id', businessId).single();
    const policy = (await supabase.from('business_policies').select("*").eq('id', res.data?.booking_policies!).single()).data
    const services = (await supabase.from('services').select('*').eq('business', businessId)).data
    const appointments = (await supabase.from('appointments').select().eq('business', businessId).gte('end', currentTimestamp)).data
    
    const uniqueAddonIds = [...new Set(services?.flatMap(service => service.addons))]
    const {data: addons, error} = await supabase.from('service_addons').select("*").in('id', uniqueAddonIds)
    const addonsById = Object.fromEntries((addons ?? []).map(addon => [addon.id, addon]))
    const servicesWithAddons = services?.map(service => ({
        ...service,
        addonDetails: service.addons!.map((id: any) => addonsById[id]).filter(Boolean)
      }));

    return new NextResponse(JSON.stringify({
        policy: policy,
        services: servicesWithAddons,
        appointments: appointments
    } ), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
