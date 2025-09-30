import { createClient } from "@utils/supabase/server";
import { fetchBusinessUser, fetchUser } from "../actions";
import BookingSettingsClient from "./bookingSettingsClient";
import { Database } from "../../../../../lib/database.types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const businessUser = await fetchBusinessUser(user?.id!)
    const supabase = createClient<Database>()
    const { data, error } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessUser.business_id).then(async (value: PostgrestSingleResponse<{ booking_policies: string; }[]>) => {
        return await supabase.from("business_policies").select("*").eq("id", value.data![0].booking_policies).single()
    })
    if (data) {
        console.log(data);

        return <BookingSettingsClient policyData={data!} businessUser={businessUser} />;
    }

}
