'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@/app/utils/supabase/client"

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

interface SiteHeaderProps {
    businessId: string
    initialUnreadCount: number
}

export function SiteHeader({ businessId, initialUnreadCount }: SiteHeaderProps) {
    const pathname = usePathname()
    const router = useRouter()
    const label = ROUTE_LABELS[pathname] ?? 'Dashboard'
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
    const supabase = useRef(createClient()).current

    useEffect(() => {
        if (!businessId) return
        const channel = supabase
            .channel(`nav-bell:${businessId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications', filter: `business_id=eq.${businessId}` },
                async () => {
                    const { count } = await supabase
                        .from('notifications')
                        .select('*', { count: 'exact', head: true })
                        .eq('business_id', businessId)
                        .eq('read', false)
                    if (count !== null) setUnreadCount(count)
                }
            )
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [businessId, supabase])

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 my-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)" style={{ borderColor: '#E8E2D6' }}>
            <div className="flex w-full items-center gap-3 px-4 lg:px-6">
                <SidebarTrigger className="-ml-1" style={{ color: '#1A1818' }} />
                <div className="w-px h-4 shrink-0" style={{ backgroundColor: '#E8E2D6' }} />
                <h1 className="text-sm font-semibold" style={{ color: '#1A1818' }}>{label}</h1>
                <div className="ml-auto">
                    <button
                        onClick={() => router.push('/dashboard/notifications')}
                        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
                        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                    >
                        <Bell size={16} style={{ color: '#6F6863' }} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: 3, right: 3,
                                background: '#FC6161',
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 700,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                minWidth: 14,
                                height: 14,
                                borderRadius: 999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 3px',
                                lineHeight: 1,
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
