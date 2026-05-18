'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LOGO from "../../../../public/images/logo_transparent_background.png"
import { SiteWrapper } from '@/app/utils/context/BookingSiteContext'
import { SiteHeader } from '@/app/SiteHeader'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from '@/components/ui/sidebar'
import {
    IconLayoutDashboard,
    IconCalendarEvent,
    IconUsers,
    IconChartBar,
    IconWorld,
    IconClock,
    IconAdjustments,
    IconScissors,
    IconCurrencyDollar,
    IconBell,
    IconSettings,
    IconHelpCircle,
    type Icon,
} from '@tabler/icons-react'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { TourProvider } from '@/features/tour/TourProvider'
import { HelpSheet } from '@/features/tour/HelpSheet'

interface NavItem {
    title: string
    url: string
    icon: Icon
}

interface NavGroup {
    label?: string
    items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
            { title: 'Appointments', url: '/dashboard/appointments', icon: IconCalendarEvent },
            { title: 'Clients', url: '/dashboard/clients', icon: IconUsers },
            { title: 'Analytics', url: '/dashboard/analytics', icon: IconChartBar },
        ],
    },
    {
        label: 'Booking',
        items: [
            { title: 'Booking Site', url: '/dashboard/booking-site', icon: IconWorld },
            { title: 'Availability', url: '/dashboard/availability', icon: IconClock },
            { title: 'Booking Settings', url: '/dashboard/booking-settings', icon: IconAdjustments },
        ],
    },
    {
        label: 'Business',
        items: [
            { title: 'Services', url: '/dashboard/services', icon: IconScissors },
            { title: 'Monetization', url: '/dashboard/monetization', icon: IconCurrencyDollar },
        ],
    },
]

const BOTTOM_ITEMS: NavItem[] = [
    { title: 'Notifications', url: '/dashboard/notifications', icon: IconBell },
    { title: 'Settings', url: '/dashboard/settings', icon: IconSettings },
]

export default function LayoutComp({ children, businessData }: { children: React.ReactNode; businessData: any }) {
    const pathname = usePathname()
    const router = useRouter()
    const [helpOpen, setHelpOpen] = useState(false)

    const [unreadCount, setUnreadCount] = useState(
        ((businessData?.notifications ?? []) as { read: boolean }[]).filter(n => !n.read).length
    )
    const supabase = useRef(createClient()).current
    const businessId = businessData?.business_id ?? ''

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

    const isActive = (url: string) =>
        url === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(url)

    return (
        <TourProvider
            toursCompleted={(businessData?.tours_completed as Record<string, boolean>) ?? {}}
            businessId={businessData?.business_id ?? ''}
            isOnboarded={businessData?.is_onboarded ?? true}
        >
        <div lang="en" className="w-full">
            <SidebarProvider
                style={{
                    '--sidebar-width': 'calc(var(--spacing) * 64)',
                    '--header-height': 'calc(var(--spacing) * 12)',
                    '--sidebar-background': '#FFFFFF',
                    '--sidebar-foreground': '#1A1818',
                    '--sidebar-accent': '#FAF7F2',
                    '--sidebar-accent-foreground': '#1A1818',
                    '--sidebar-border': '#E8E2D6',
                    '--sidebar-primary': '#0F0E0E',
                    '--sidebar-primary-foreground': '#FFFFFF',
                } as React.CSSProperties}
            >
                <TooltipProvider>
                    <Sidebar variant="inset">
                        <SidebarHeader className="px-4 py-4 border-b" style={{ borderColor: '#E8E2D6' }}>
                            <Image src={LOGO} alt="AfroAllure" className="w-28" />
                        </SidebarHeader>

                        <SidebarContent className="py-3 gap-0">
                            {NAV_GROUPS.map((group, gi) => (
                                <SidebarGroup key={gi} className="px-3 py-2">
                                    {group.label && (
                                        <SidebarGroupLabel
                                            className="text-[10px] font-semibold tracking-widest mb-1 px-2"
                                            style={{ color: '#C9974A' }}
                                        >
                                            {group.label.toUpperCase()}
                                        </SidebarGroupLabel>
                                    )}
                                    <SidebarMenu className="gap-0.5">
                                        {group.items.map((item) => {
                                            const active = isActive(item.url)
                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        isActive={active}
                                                        tooltip={item.title}
                                                        onClick={() => router.push(item.url)}
                                                        className="rounded-xl transition-colors"
                                                        style={active
                                                            ? { backgroundColor: '#0F0E0E', color: '#FFFFFF' }
                                                            : { color: '#1A1818' }
                                                        }
                                                    >
                                                        <item.icon size={16} />
                                                        <span className="text-sm">{item.title}</span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroup>
                            ))}
                        </SidebarContent>

                        <SidebarFooter className="px-3 py-3 border-t" style={{ borderColor: '#E8E2D6' }}>
                            <SidebarMenu className="gap-0.5">
                                {/* Notifications — rendered separately to show unread badge */}
                                {(() => {
                                    const active = isActive('/dashboard/notifications')
                                    return (
                                        <SidebarMenuItem key="Notifications">
                                            <SidebarMenuButton
                                                isActive={active}
                                                tooltip="Notifications"
                                                onClick={() => router.push('/dashboard/notifications')}
                                                className="rounded-xl transition-colors"
                                                style={active
                                                    ? { backgroundColor: '#0F0E0E', color: '#FFFFFF' }
                                                    : { color: '#1A1818' }
                                                }
                                            >
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <IconBell size={16} />
                                                    {unreadCount > 0 && (
                                                        <span style={{
                                                            position: 'absolute',
                                                            top: -6, right: -7,
                                                            background: '#FC6161',
                                                            color: '#fff',
                                                            fontSize: 9,
                                                            fontWeight: 700,
                                                            fontFamily: 'Inter, system-ui, sans-serif',
                                                            minWidth: 15,
                                                            height: 15,
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
                                                </div>
                                                <span className="text-sm">Notifications</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })()}
                                {/* Settings */}
                                {(() => {
                                    const item = BOTTOM_ITEMS.find(i => i.title === 'Settings')!
                                    const active = isActive(item.url)
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                isActive={active}
                                                tooltip={item.title}
                                                onClick={() => router.push(item.url)}
                                                className="rounded-xl transition-colors"
                                                style={active
                                                    ? { backgroundColor: '#0F0E0E', color: '#FFFFFF' }
                                                    : { color: '#1A1818' }
                                                }
                                            >
                                                <item.icon size={16} />
                                                <span className="text-sm">{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })()}
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Help & Tours"
                                        onClick={() => setHelpOpen(true)}
                                        className="rounded-xl transition-colors"
                                        style={{ color: '#1A1818' }}
                                    >
                                        <IconHelpCircle size={16} />
                                        <span className="text-sm">Help & Tours</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>

                    <SidebarInset className="px-5">
                        <SiteHeader />
                        <main>
                            <div className="w-full flex-1 max-h-min">
                                <SiteWrapper>
                                    {children}
                                </SiteWrapper>
                            </div>
                        </main>
                    </SidebarInset>
                </TooltipProvider>
            </SidebarProvider>
            <Toaster />
        </div>
        <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
        </TourProvider>
    )
}
