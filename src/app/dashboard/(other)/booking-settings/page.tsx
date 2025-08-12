import { fetchBusinessUser, fetchUser } from "../actions";
import BookingSettingsClient from "./bookingSettingsClient";

export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    const businessUser = await fetchBusinessUser(user?.id!)
    return <BookingSettingsClient businessUser={businessUser} />;
}
