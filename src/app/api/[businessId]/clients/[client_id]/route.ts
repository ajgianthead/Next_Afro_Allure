import { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@utils/supabase/server";
import Appointment from "@utils/types/appointment";
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../../../lib/database.types";

// Deleting a client from business
export async function DELETE(request: NextRequest, { params }: { params: { client_id: string, businessId: string } }) {
    const supabase = createClient<Database>();
    const { client_id, businessId } = params;
    let response = await supabase
        .from('business_clients')
        .delete()
        .eq('business', businessId).eq('client', client_id);
    return new NextResponse(JSON.stringify(response))
}



