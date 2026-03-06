import { createClient } from "@utils/supabase/server";
import ConfirmAppClient from "./confirmClient";
import { Database } from "../../../../../../../lib/database.types";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { appointment_id: string, businessId: string } }) {
    // Get all my data
    const { businessId, appointment_id } = await params
    const supabase = createClient<Database>()
    const { data: appointment, error: appointmentError } = await supabase.from('appointments').select('*, business_users(*)').eq('id', appointment_id).maybeSingle()
    return <ConfirmAppClient appointment={appointment!} />;
}
