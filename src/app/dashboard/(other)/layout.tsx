import { createClient } from "@/app/utils/supabase/server";
import LayoutComp from "./layoutcomp";
import { Database } from "../../../../lib/database.types";
import { fetchUser } from "./actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Dashboard | AfroAllure',
};

export default async function Layout({ children }: any) {
    const fetchUserData = async (user_id: string) => {
        const supabase = await createClient();
        const businessData = (await supabase.from('business_users').select("*, notifications(*)").eq('user_id', user_id).single()).data
        return businessData
    }
    const thisUser = await fetchUser();
    if (thisUser === null) {
        redirect('/login')
    }
    const data = await fetchUserData(thisUser?.id!)
    return <><LayoutComp children={children} businessData={data!} />
    </>
}
