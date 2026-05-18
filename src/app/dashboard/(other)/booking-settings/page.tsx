import { redirect } from 'next/navigation'
import { createClient } from "@/app/utils/supabase/server";
import { fetchBusinessUser, fetchUser } from "../actions";
import BookingSettingsClient from "./bookingSettingsClient";
import { stripe } from "@/lib/stripe/stripeClient";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const businessUser = await fetchBusinessUser(user.id)
    const supabase = await createClient()

    const { data: bizRow } = await supabase
        .from('business_users')
        .select('booking_policies')
        .eq('business_id', businessUser.business_id)
        .single()

    const { data } = await supabase
        .from('business_policies')
        .select('*')
        .eq('id', bizRow?.booking_policies ?? '')
        .single()

    let paymentConfig;
    if (businessUser.completed_stripe_onboarding) {
        paymentConfig = await stripe.paymentMethodConfigurations.retrieve(
            businessUser.payment_method_config_id,
            { stripeAccount: businessUser.stripe_acc_id! }
        )
    }

    if (data) {
        return (
            <BookingSettingsClient
                paymentConfig={{ ...paymentConfig }}
                paymentConfigId={businessUser.payment_method_config_id}
                policyData={data}
                businessUser={businessUser}
            />
        )
    }
}
