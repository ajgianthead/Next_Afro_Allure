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

    // Query by business relation — reliable regardless of whether booking_policies pointer is set
    let { data } = await supabase
        .from('business_policies')
        .select('*')
        .eq('business', businessUser.business_id)
        .maybeSingle()

    // Self-heal: create a default policy if one doesn't exist yet
    if (!data) {
        const { data: created } = await supabase
            .from('business_policies')
            .insert({
                business: businessUser.business_id,
                deposit: { enabled: false, settings: { type: 'percent', value: 20 } },
                late_fee: { enabled: false },
                no_show: { enabled: false, level: 'strict' },
            })
            .select()
            .single()
        data = created
        if (created) {
            await supabase
                .from('business_users')
                .update({ booking_policies: created.id })
                .eq('business_id', businessUser.business_id)
        }
    }

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
