import { redirect } from "next/navigation"
import { isFounder } from "@/lib/auth/requireFounder"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Admin | AfroAllure',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Guards the page only; each admin server action checks isFounder() itself.
    if (!(await isFounder())) redirect('/')

    return <>{children}</>
}
