'use client'
import Button from '@tailus-ui/Button';
import { twMerge } from 'tailwind-merge';
import * as Link from '@components/Link';
import Separator from '@tailus-ui/Separator';
import { Notifications } from '@components/Notifications';
import { useEffect, useState } from 'react';
import { Menu, Settings, HelpCircle, LayoutDashboard, Calendar, CalendarCog, Database, UsersRound, Shield, Percent, Tag, PanelsTopLeft, ChartNoAxesCombined, Scale, CircleAlert, CircleDollarSign, MessageCircleQuestion } from 'lucide-react';
import { Caption, Text, Title } from '@tailus-ui/typography';
import { UserDropdown } from '@components/UserDropdown';
import ScrollArea from '@components/ScrollArea';
import { fetchUser, sendFeedback } from './actions';
import { SiteWrapper } from '@/app/utils/context/BookingSiteContext';
import Banner from "@components/Banner";
import { useUserContext } from '@/app/utils/context/UserContext';
import { Database as DB } from '../../../../lib/database.types';
import LOGO from "../../../../public/images/logo_transparent_background.png"
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation';
import { getUser } from './getUser';
import { Badge, Chip, Input, Modal, ModalClose, ModalDialog, Textarea, Typography, Button as MUIButton, CircularProgress } from '@mui/joy';
import { PostgrestError } from '@supabase/supabase-js';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { SiteHeader } from '@/app/SiteHeader';
import { DashboardIcon } from '@radix-ui/react-icons';
import {
    IconCalendarEvent,
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconLayoutDashboard,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"
import { NavMain } from '@/app/nav-main';
import { NavDocuments } from '@/app/nav-documents';
import { NavSecondary } from '@/app/nav-secondary';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

interface BusinessNoti extends Business {
    notifications: BusinessNotification[],
}

export default function LayoutComp({
    children, businessData
}: Readonly<{
    children: React.ReactNode;
    businessData: any
}>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname()
    const router = useRouter()
    const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false)
    const [feedback, setFeedback] = useState<string>("")
    const [sendingFeedback, setSendingFeedback] = useState<boolean>(false)

    const data = {
        user: {
            name: "shadcn",
            email: "m@example.com",
            avatar: "/avatars/shadcn.jpg",
        },
        navMain: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: IconLayoutDashboard,
            },
            {
                title: "Calendar",
                url: "/dashboard/appointments",
                icon: IconCalendarEvent,
            },
            {
                title: "Analytics",
                url: "",
                icon: IconChartBar,
            },
            {
                title: "Projects",
                url: "#",
                icon: IconFolder,
            },
            {
                title: "Team",
                url: "#",
                icon: IconUsers,
            },
        ],
        navClouds: [
            {
                title: "Capture",
                icon: IconCamera,
                isActive: true,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
            {
                title: "Proposal",
                icon: IconFileDescription,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
            {
                title: "Prompts",
                icon: IconFileAi,
                url: "#",
                items: [
                    {
                        title: "Active Proposals",
                        url: "#",
                    },
                    {
                        title: "Archived",
                        url: "#",
                    },
                ],
            },
        ],
        navSecondary: [
            {
                title: "Settings",
                url: "#",
                icon: IconSettings,
            },
            {
                title: "Get Help",
                url: "#",
                icon: IconHelp,
            },
            {
                title: "Search",
                url: "#",
                icon: IconSearch,
            },
        ],
        documents: [
            {
                name: "Data Library",
                url: "#",
                icon: IconDatabase,
            },
            {
                name: "Reports",
                url: "#",
                icon: IconReport,
            },
            {
                name: "Word Assistant",
                url: "#",
                icon: IconFileWord,
            },
        ],
    }


    return (

        <div lang="en" className='w-full'>
            <SidebarProvider className='bg-white' style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }>
                <TooltipProvider>
                    <Sidebar variant='inset' className='bg-white'>
                        <SidebarHeader>
                            <Image src={LOGO} alt='afro-allure-logo' />
                        </SidebarHeader>
                        <SidebarContent>
                            <NavMain items={data.navMain} />
                            <NavDocuments items={data.documents} />
                            <NavSecondary items={data.navSecondary} className="mt-auto" />
                            <SidebarGroup />
                        </SidebarContent>
                        <SidebarFooter />
                    </Sidebar>
                    <SidebarInset className='px-5'>
                        <SiteHeader />
                        <main className={''}>
                            <div className='w-full flex-1 max-h-min'>
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
    );
}

