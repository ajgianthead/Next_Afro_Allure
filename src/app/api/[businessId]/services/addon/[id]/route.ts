import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../../lib/database.types";
import { createClient } from "@utils/supabase/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient<Database>();
    const {id} = await params;
    const {data, error} = await supabase.from("service_addons").delete().eq('id', id).select('id, name, price').single()
    if (error) {
        return new NextResponse(JSON.stringify({ result: error, message: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ data, message: "Service Addon deleted!" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
    
}
