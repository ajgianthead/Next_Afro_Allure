import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";
import { assignAddons } from "app/api/util/transformServices";

export async function GET(request: NextRequest, { params }: { params: { businessName: string } }) {
    const supabase = createClient<Database>();
    const { businessName } = await params
    const { data, error } = await supabase.from("business_users").select("*, availabilities(*), services(*), appointments(*)").eq("url_name", `${businessName}`).single();
    const { data: editor_data } = (await supabase.from("web_editors").select("editor_data").eq("business_id", `${data?.business_id}`).single());
    const services = data?.services
    if (error) {
        return new NextResponse(JSON.stringify({ result: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    if (editor_data) {
        return new NextResponse(JSON.stringify({ editor_data: editor_data }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: {...data, services: await assignAddons(supabase, services!)} }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })

}
