import { fetchBusinessPolicies } from "app/[businessName]/actions";
import SettingsClient from "./settingsclient";
import { fetchBusinessUser, fetchUser } from "../actions";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const business = await fetchBusinessUser(user?.id!)
    return <SettingsClient business={business} />;
}
