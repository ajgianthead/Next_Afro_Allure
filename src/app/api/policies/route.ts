import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../lib/database.types";
import { NextRequest, NextResponse } from "next/server";
import { PostgrestSingleResponse } from "@supabase/supabase-js";


export async function POST(request: NextRequest) {
    const supabase = createClient<Database>();
    const { business, deposit, late_fee, no_show, cancel_day_limit, important_info, read_before_booking, reschedule_day_limit, reschedule_limit } = await request.json();
    const { data, error } = await supabase.from('business_policies').insert([
        {
            business: business,
            deposit: deposit,
            late_fee: late_fee,
            no_show: no_show,
            cancel_day_limit: cancel_day_limit,
            important_info: important_info,
            read_before_booking: read_before_booking,
            reschedule_day_limit: reschedule_day_limit,
            reschedule_limit: reschedule_limit,
        }
    ]).select("id").then(async (result: PostgrestSingleResponse<{
        id: string;
    }[]>) => {
        return await supabase.from('business_users').update({
            booking_policies: result.data![0].id
        }).eq("business_id", business).select("booking_policies")
    });

    if (error) {
        return new NextResponse(JSON.stringify({ error: error }), {
            headers: { 'Content-Type': 'application/json' },
            status: 400
        })
    }
    return new NextResponse(JSON.stringify({ policyID: data[0].booking_policies }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}
