import { createClient } from "@/app/utils/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Admin | AfroAllure',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !process.env.FOUNDER_EMAIL || user.email !== process.env.FOUNDER_EMAIL) {
        redirect('/')
    }

    return <>{children}</>
}
