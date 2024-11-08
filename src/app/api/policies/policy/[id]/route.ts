import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";


export async function GET(request: NextRequest, {params} : {params: {id: string}}) {
    const supabase = createClient<Database>();
    const {id} = params
    const { data, error } = await supabase.from("business_policies").select("*").eq("id", id).single()

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ policy: data }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
