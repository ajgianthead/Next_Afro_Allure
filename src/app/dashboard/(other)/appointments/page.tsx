import { createClient } from "@utils/supabase/server";
import AppointmentsClient, { AppointmentEvent } from "./appointmentsClient";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { assignAddons } from "./actions";
import ResponsiveCalendar from "./ResponsiveCalendar";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const fetchAppointments = async (business_id: string) => {
        const supabase = createClient<Database>()
        const currentTimestamp = new Date().toISOString();
        const res = await supabase.from('business_users').select('booking_policies').eq('business_id', business_id).single();
        const policy = (await supabase.from('business_policies').select("*").eq('id', res.data?.booking_policies!).single()).data
        const services = (await supabase.from('services').select('*').eq('business', business_id)).data
        const appointments = (await supabase.from('appointments').select().eq('business', business_id)).data
        return {
            policy: policy,
            services: services?.length ? await assignAddons(supabase, services!) : [],
            appointments: appointments
        }
    }
    const user = await fetchUser()
    const business = await fetchBusinessUser(user?.id!)
    const appointments = await fetchAppointments(business?.business_id!)
    const events: AppointmentEvent[] = [
        {
            id: "1",
            status: 'confirmed',
            title: "Haircut",
            client: "Jasmine",
            service: "Silk Press",
            time: "10:00 AM",
            start: new Date(2026, 2, 20, 10, 0),
            end: new Date(2026, 2, 20, 11, 0),
        },
    ];

    return <ResponsiveCalendar events={events} />;
}
