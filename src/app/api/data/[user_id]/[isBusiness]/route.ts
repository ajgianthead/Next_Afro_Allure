import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import Appointment from "@utils/types/appointment";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

// Get business and client data
export async function GET(request: NextRequest, { params }: { params: { user_id: string, isBusiness: boolean } }) {
    const supabase = createClient<Database>();
    const { user_id, isBusiness } = params;
    let { data: user, error } = await supabase
        .from(isBusiness ? 'business_users' : 'client_users')
        .select(`*`)
        .eq('user_id', user_id);
    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
    if (user?.length) {
        return new NextResponse(JSON.stringify({ businessUser: user[0] }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    }
}


