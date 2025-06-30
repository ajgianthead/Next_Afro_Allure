import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import Appointment from "@utils/types/appointment";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";

// Get business and client data
export async function GET(request: NextRequest, { params }: { params: { user_id: string, isBusiness: string } }) {
    const supabase = createClient<Database>();
    const { user_id, isBusiness } = await params;
    let { data: user, error } = await supabase
        .from(isBusiness === 'true' ? 'business_users' : 'client_users')
        .select(`*`)
        .eq('user_id', user_id).single();
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    if (user) {
        return new NextResponse(JSON.stringify({ businessUser: user }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
}


