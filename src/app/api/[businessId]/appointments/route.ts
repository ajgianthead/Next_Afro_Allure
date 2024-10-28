import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import Appointment from "@utils/types/appointment";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

// Get all appointments
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = params;
    let { data: appointments, error } = await supabase
        .from('appointments')
        .select(`*`)
        .eq('business', businessId);
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        })
    }
    return new NextResponse(JSON.stringify({ appointments: appointments }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}


