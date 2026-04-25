import { redirect } from "next/navigation";
import { fetchBusinessUser, fetchUser } from "../actions";
import NotificationsClient from "./notificationsClient";
import { createClient } from "@/app/utils/supabase/server";
import { Database } from "../../../../../lib/database.types";

export const metadata = {
    title: 'Notifications | AfroAllure',
};

export default async function Page() {
    const user = await fetchUser()
    if (user) {
        const business = await fetchBusinessUser(user!.id)
        const supabase = await createClient<Database>()
        const { data: notifications, error } = await supabase.from('notifications').select('*, appointments(*, business_users(*))').eq('business_id', business?.business_id!).order('created_at', {
            ascending: false
        })
        return (
            <NotificationsClient notifications={notifications!} />
        )
    } else {
        redirect('/login')
    }


}
