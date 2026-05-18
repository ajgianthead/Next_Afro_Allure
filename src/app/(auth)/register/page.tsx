import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import Register from "./registerClient";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Register | AfroAllure',
};

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
    return <Register />;
}
