'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell } from "lucide-react"
import { usePathname } from "next/navigation"

const ROUTE_LABELS: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/appointments': 'Appointments',
    '/dashboard/clients': 'Clients',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/availability': 'Availability',
    '/dashboard/booking-site': 'Booking Site',
    '/dashboard/booking-settings': 'Booking Settings',
    '/dashboard/monetization': 'Monetization',
    '/dashboard/services': 'Services',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/settings': 'Settings',
}

export function SiteHeader() {
    const pathname = usePathname()
    const label = ROUTE_LABELS[pathname] ?? 'Dashboard'

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 my-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)" style={{ borderColor: '#E8E2D6' }}>
            <div className="flex w-full items-center gap-3 px-4 lg:px-6">
                <SidebarTrigger className="-ml-1" style={{ color: '#1A1818' }} />
                <div className="w-px h-4 shrink-0" style={{ backgroundColor: '#E8E2D6' }} />
                <h1 className="text-sm font-semibold" style={{ color: '#1A1818' }}>{label}</h1>
                <div className="ml-auto">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-stone-100">
                        <Bell size={16} style={{ color: '#6F6863' }} />
                    </button>
                </div>
            </div>
        </header>
    )
}
