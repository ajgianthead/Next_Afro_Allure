import { fetchBusinessPolicies } from "app/business/[businessName]/actions";
import SettingsClient from "./settingsclient";
import { fetchBusinessUser, fetchUser } from "../actions";
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from "app/for-businesses/actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const business = await fetchBusinessUser(user?.id!)
    let link: string | undefined = undefined;
    if (business.plan_type === 'STARTER') {
        const session = await createSubscriptionForExistingCustomer(business.stripe_customer_id!)
        link = session.url!
    }
    return <SettingsClient business={business} subscriptionLink={link} />;
}
