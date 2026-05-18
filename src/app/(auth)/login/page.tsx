import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import Login from "./loginClient";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Login | AfroAllure',
};

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
    return <Login />;
}
