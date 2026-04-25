import { createClient } from "@/app/utils/supabase/server";
import { fetchBusinessUser, fetchUser } from "../actions";
import BookingSettingsClient from "./bookingSettingsClient";
import { Database } from "../../../../../lib/database.types";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { stripe } from "@lib/utils";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const businessUser = await fetchBusinessUser(user?.id!)
    const supabase = await createClient<Database>()
    const { data, error } = await supabase.from('business_users').select('booking_policies').eq('business_id', businessUser.business_id).then(async (value: PostgrestSingleResponse<{ booking_policies: string; }[]>) => {
        return await supabase.from("business_policies").select("*").eq("id", value.data![0].booking_policies).single()
    })
    let paymentConfig;
    if (businessUser.completed_stripe_onboarding) {
        paymentConfig = await stripe.paymentMethodConfigurations.retrieve(businessUser.payment_method_config_id, {
            stripeAccount: businessUser.stripe_acc_id!
        })
    }

    if (data) {
        console.log(data);
        return <BookingSettingsClient paymentConfig={{ ...paymentConfig }} paymentConfigId={businessUser.payment_method_config_id} policyData={data!} businessUser={businessUser} />;
    }

}
