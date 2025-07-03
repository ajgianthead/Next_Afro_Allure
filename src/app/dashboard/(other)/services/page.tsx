import { createClient } from "@utils/supabase/server";
import ServicesClient from "./servicesClient";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const getServices = async (business_id: string) => {
        const supabase = createClient<Database>();
        let { data, error } = await supabase.from("services").select("*, business_users(business_id, default_availability, availabilities(business_id, availability_data, id), service_addons(id, name, price))").eq("business", business_id).order("created_at", { ascending: true })
        return data
    }
    const user = await fetchUser()
    if (user) {
        const business = await fetchBusinessUser(user.id)
        const services = await getServices(business?.business_id!)
        return <ServicesClient businessId={business?.business_id!} servicesData={services!} serviceAddonsData={services![0].business_users.service_addons} defaultAvail={services![0].business_users.default_availability} availabilitiesData={services![0].business_users.availabilities} />;
    }
    redirect('/login')

}
