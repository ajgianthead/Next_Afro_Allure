import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../lib/database.types";

// Get all appointments
export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
    const supabase = createClient<Database>();
    const { businessId } = await params;
    const status = request.nextUrl.searchParams.get('status') as Database['public']['Enums']['status'] | null
    let appointments;
    let error;
    if (status) {
        let { data, error: supabaseError } = await supabase
            .from('appointments')
            .select(`*`)
            .eq('business', businessId).eq('status', status).order('start', { ascending: true }).limit(5);
        appointments = data;
        error = supabaseError
    } else {
        let { data, error: supabaseError } = await supabase
            .from('appointments')
            .select(`*`)
            .eq('business', businessId);
        appointments = data;
        error = supabaseError
    }
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


