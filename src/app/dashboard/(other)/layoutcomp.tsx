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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
} from '@/components/ui/sidebar'
import {
    IconLayoutDashboard,
    IconCalendarEvent,
    IconUsers,
    IconChartBar,
    IconWorld,
    IconCalendarCheck,
    IconClock,
    IconAdjustments,
    IconScissors,
    IconCurrencyDollar,
    IconSettings,
    IconHelpCircle,
    IconLogout,
    IconMessage2,
    IconLifebuoy,
    IconGift,
    IconUserPlus,
    IconUsersGroup,
    IconHourglass,
    IconPhoto,
    IconBuildingStore,
    IconChevronDown,
    type Icon,
} from '@tabler/icons-react'
import { signOutAction } from '@/app/(auth)/actions'
import { useState } from 'react'
import { TourProvider } from '@/features/tour/TourProvider'
import { UpgradeProvider } from '@/features/billing/components/UpgradeDialog'
import { PlanBanner } from '@/features/billing/components/PlanBanner'
import { HelpSheet } from '@/features/tour/HelpSheet'

interface NavItem {
    title: string
    url: string
    icon: Icon
}

/** A dropdown in the sidebar that holds related pages. */
interface NavParent {
    title: string
    icon: Icon
    children: NavItem[]
}

interface NavGroup {
    label?: string
    items: (NavItem | NavParent)[]
}

const isParent = (item: NavItem | NavParent): item is NavParent => 'children' in item

const NAV_GROUPS: NavGroup[] = [
    {
        items: [
            { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
            { title: 'Appointments', url: '/dashboard/appointments', icon: IconCalendarEvent },
            {
                // Everything about the people who book: who they are, what they've earned, who they've sent.
                title: 'Clientele',
                icon: IconUsersGroup,
                children: [
                    { title: 'Clients', url: '/dashboard/clients', icon: IconUsers },
                    { title: 'Rewards', url: '/dashboard/rewards', icon: IconGift },
                    { title: 'Referrals', url: '/dashboard/referrals', icon: IconUserPlus },
                ],
            },
            { title: 'Analytics', url: '/dashboard/analytics', icon: IconChartBar },
        ],
    },
    {
        label: 'Booking',
        items: [
            {
                // Everything clients see online: the website and the page they book on.
                title: 'Storefront',
                icon: IconBuildingStore,
                children: [
                    { title: 'Website', url: '/dashboard/booking-site', icon: IconWorld },
                    { title: 'Booking Page', url: '/dashboard/booking-page', icon: IconCalendarCheck },
                ],
            },
            { title: 'Availability', url: '/dashboard/availability', icon: IconClock },
            { title: 'Waitlist', url: '/dashboard/waitlist', icon: IconHourglass },
            { title: 'Booking Settings', url: '/dashboard/booking-settings', icon: IconAdjustments },
            { title: 'Share Openings', url: '/dashboard/openings', icon: IconPhoto },
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
    { title: 'Settings', url: '/dashboard/settings', icon: IconSettings },
    { title: 'Feedback', url: '/feedback', icon: IconMessage2 },
    { title: 'Support', url: '/support', icon: IconLifebuoy },
]

export default function LayoutComp({ children, businessData }: { children: React.ReactNode; businessData: any }) {
    const pathname = usePathname()
    const router = useRouter()
    const [helpOpen, setHelpOpen] = useState(false)
    // Dropdowns the business opened or closed; otherwise one is open while you're on one of its pages.
    const [openParents, setOpenParents] = useState<Record<string, boolean>>({})

    const isActive = (url: string) =>
        url === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(url)

    return (
        <UpgradeProvider hadTrial={!!businessData?.had_trial}>
        <TourProvider
            toursCompleted={(businessData?.tours_completed as Record<string, boolean>) ?? {}}
            businessId={businessData?.business_id ?? ''}
            isOnboarded={businessData?.is_onboarded ?? true}
            hasTimezone={!!businessData?.account_settings?.timezone}
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
                                            if (isParent(item)) {
                                                const childActive = item.children.some(c => isActive(c.url))
                                                const open = openParents[item.title] ?? childActive
                                                return (
                                                    <SidebarMenuItem key={item.title}>
                                                        <SidebarMenuButton
                                                            tooltip={item.title}
                                                            aria-expanded={open}
                                                            onClick={() => setOpenParents(prev => ({ ...prev, [item.title]: !open }))}
                                                            className="rounded-xl transition-colors"
                                                            style={{ color: '#1A1818', fontWeight: childActive && !open ? 600 : undefined }}
                                                        >
                                                            <item.icon size={16} />
                                                            <span className="text-sm">{item.title}</span>
                                                            <IconChevronDown size={14} className={`ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
                                                        </SidebarMenuButton>
                                                        {open && (
                                                            <SidebarMenuSub className="mt-0.5">
                                                                {item.children.map(child => {
                                                                    const active = isActive(child.url)
                                                                    return (
                                                                        <SidebarMenuSubItem key={child.title}>
                                                                            <SidebarMenuSubButton
                                                                                href={child.url}
                                                                                isActive={active}
                                                                                onClick={e => { e.preventDefault(); router.push(child.url) }}
                                                                                className="h-8 rounded-lg"
                                                                                style={active ? { backgroundColor: '#0F0E0E', color: '#FFFFFF' } : { color: '#1A1818' }}
                                                                            >
                                                                                <child.icon size={15} color={active ? '#FFFFFF' : undefined} />
                                                                                <span>{child.title}</span>
                                                                            </SidebarMenuSubButton>
                                                                        </SidebarMenuSubItem>
                                                                    )
                                                                })}
                                                            </SidebarMenuSub>
                                                        )}
                                                    </SidebarMenuItem>
                                                )
                                            }
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
                                {BOTTOM_ITEMS.map((item) => {
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
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Sign Out"
                                        onClick={() => signOutAction()}
                                        className="rounded-xl transition-colors"
                                        style={{ color: '#6F6863' }}
                                    >
                                        <IconLogout size={16} />
                                        <span className="text-sm">Sign Out</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>

                    <SidebarInset className="px-5">
                        <SiteHeader
                            businessId={businessData?.business_id ?? ''}
                            initialUnreadCount={((businessData?.notifications ?? []) as { read: boolean }[]).filter(n => !n.read).length}
                        />
                        <PlanBanner
                            subscriptionStatus={businessData?.subscription_status}
                            complimentaryUntil={businessData?.complimentary_until}
                        />
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
        </UpgradeProvider>
    )
}
