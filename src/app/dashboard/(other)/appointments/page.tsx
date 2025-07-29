import { createClient } from "@utils/supabase/server";
import AppointmentsClient from "./appointmentsClient";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { assignAddons } from "./actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const fetchAppointments = async (business_id: string) => {
        const supabase = createClient<Database>()
        const currentTimestamp = new Date().toISOString();
        const res = await supabase.from('business_users').select('booking_policies').eq('business_id', business_id).single();
        const policy = (await supabase.from('business_policies').select("*").eq('id', res.data?.booking_policies!).single()).data
        const services = (await supabase.from('services').select('*').eq('business', business_id)).data
        const appointments = (await supabase.from('appointments').select().eq('business', business_id).gte('end', currentTimestamp)).data

        console.log(services);

        return {
            policy: policy,
            services: services?.length ? await assignAddons(supabase, services!) : [],
            appointments: appointments
        }
    }
    const user = await fetchUser()
    const business = await fetchBusinessUser(user?.id!)
    const appointments = await fetchAppointments(business?.business_id!)
    return <AppointmentsClient business_id={business?.business_id!} appointmentData={appointments.appointments!} policyData={appointments.policy!} servicesData={appointments.services!} />;
}
