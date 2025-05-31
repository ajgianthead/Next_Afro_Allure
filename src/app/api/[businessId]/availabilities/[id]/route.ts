import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";

export async function DELETE(request: NextRequest, { params }: { params: { businessId: string, id: string } }) {
    const supabase = createClient<Database>();
    const { businessId, id } = await params
    const { data, error } = await supabase.from("availabilities").delete().eq("id", id).select().single();
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    if (data) {
        return new NextResponse(JSON.stringify({ result: data }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({ result: "No availabilities to update" }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
    })

}
