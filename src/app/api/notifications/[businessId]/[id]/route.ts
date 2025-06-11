import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient<Database>();
    const { id } = await params
    const { data, error } = await supabase.from("notifications").delete().eq("id", id).select().single()

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

