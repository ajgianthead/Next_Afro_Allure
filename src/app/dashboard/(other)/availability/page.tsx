import { effectivePlanType } from '@/lib/beta'
import { redirect } from "next/navigation";
import { fetchBusinessUser, fetchUser } from "../actions";
import { AvailabilityClient } from "@/features/availability/components";
import { getAvailabilitiesAction } from "@/features/availability/server/actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser();
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)
    const { availabilities, defaultAvailability } = await getAvailabilitiesAction(business?.business_id!)

    return (
        <AvailabilityClient
            availabilitiesData={availabilities ?? []}
            defaultAvailabilityData={defaultAvailability ?? ''}
            planType={effectivePlanType(business?.plan_type)}
            hadTrial={business?.had_trial ?? false}
            businessId={business?.business_id ?? ''}
            stripeCustomerId={business?.stripe_customer_id ?? null}
        />
    );
}
