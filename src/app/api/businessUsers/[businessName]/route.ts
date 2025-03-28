import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

export async function GET(request: NextRequest, { params }: { params: { businessName: string } }) {
    const supabase = createClient<Database>();
    const { businessName } = await params
    const { data, error } = await supabase.from("business_users").select("*").eq("url_name", `${businessName}`).single();
    const { editor_data } = (await supabase.from("web_editors").select("editor_data").eq("business_id", `${data?.business_id}`).single()).data!;
    if (error) {
        return new NextResponse(JSON.stringify({ result: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    if (editor_data?.length) {
        return new NextResponse(JSON.stringify({ editor_data: editor_data }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "Business doesn't exist" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
    })

}
