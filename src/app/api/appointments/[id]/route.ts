import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

// Get an appointments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient<Database>();
    const { id } = await params;
    let { data: appointment, error } = await supabase
        .from('appointments')
        .select(`*, business_users(business_name)`)
        .eq('id', id).single();
    if (error) {
        throw new Error(error.message)
    }
    if (appointment) {
        return new NextResponse(JSON.stringify({ appointment: appointment }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    return new NextResponse(JSON.stringify({
        appointment: "This appointment doesn't exist",
        status: 500
    }))
}
// Delete an appointment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient<Database>();
    const { id } = params
    const response = await supabase.from('appointments').delete().eq('id', id).select().single()
    return new NextResponse(JSON.stringify(response))

}

