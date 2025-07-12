import { redirect } from "next/navigation";
import { fetchBusinessUser, fetchUser } from "../actions";
import AvailabilityClient from "./availabilityClient";
import { createClient } from "@utils/supabase/server";
import { Database } from "../../../../../lib/database.types";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser();
    if (user) {
        const business = await fetchBusinessUser(user.id)
        const fetchAvailabilities = async (businessId: string) => {
            const supabase = createClient<Database>();
            const { data, error } = await supabase.from('availabilities').select('business_users(default_availability), *').eq("business_id", businessId);
            if (error) {
                console.error(error.message)
            }
            return { availabilities: data, defaultAvailability: data![0].business_users?.default_availability }
        }
        const res = await fetchAvailabilities(business?.business_id!)
        return <AvailabilityClient availabilitiesData={res.availabilities!} defaultAvailabilityData={res.defaultAvailability!} />;
    } else {
        redirect('/login')
    }


}
