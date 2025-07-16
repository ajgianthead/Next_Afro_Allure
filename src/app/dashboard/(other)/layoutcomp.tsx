'use client'
import Button from '@tailus-ui/Button';
import { twMerge } from 'tailwind-merge';
import * as Link from '@components/Link';
import Separator from '@tailus-ui/Separator';
import { Notifications } from '@components/Notifications';
import { useEffect, useState } from 'react';
import { Menu, Settings, HelpCircle, LayoutDashboard, Calendar, CalendarCog, Database, UsersRound, Shield, Percent, Tag, PanelsTopLeft, ChartNoAxesCombined, Scale, CircleAlert, CircleDollarSign } from 'lucide-react';
import { Caption, Text, Title } from '@tailus-ui/typography';
import { UserDropdown } from '@components/UserDropdown';
import ScrollArea from '@components/ScrollArea';
import { fetchUser } from './actions';
import { SiteWrapper } from '@utils/context/BookingSiteContext';
import Banner from "@components/Banner";
import { useUserContext } from '@utils/context/UserContext';
import { Database as DB } from '../../../../lib/database.types';
import LOGO from "../../../../public/images/logo_transparent_background.png"
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation';
import { getUser } from './getUser';
import { Badge, Chip } from '@mui/joy';

interface BusinessNoti extends Business {
    notifications: BusinessNotification[],
}

export default function LayoutComp({
    children, businessData
}: Readonly<{
    children: React.ReactNode;
    businessData: BusinessNoti
}>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname()
    const router = useRouter()

    return (
        <div lang="en">
            <div
                className={twMerge(
                    'fixed inset-y-0 left-0 z-30 flex -translate-x-72  transition-transform duration-300 lg:translate-x-0',
                    isMenuOpen && 'translate-x-0'
                )}
            >
                <div data-shade="900" className="feedback-bg flex w-72 flex-col gap-4 p-4 lg:w-64">
                    <div className="flex w-full pr-5">
                        {/* <BrandIcon className="mx-auto" /> */}
                        <Image src={LOGO} alt='logo' className='w-full' />
                    </div>
                    <ScrollArea.Root className="-mx-1 pr-5 -my-4">
                        <ScrollArea.Viewport className="w-full px-1 py-4">
                            <div className="mt-4 space-y-1">
                                <Link.Root link="/dashboard" isActive={pathname === "/dashboard"}>
                                    <Link.Icon>
                                        <LayoutDashboard />
                                    </Link.Icon>
                                    <Link.Label>Dashboard</Link.Label>
                                </Link.Root>
                                <Link.Root link="/dashboard/appointments" isActive={pathname === "/dashboard/appointments"}>
                                    <Link.Icon>
                                        <Calendar />
                                    </Link.Icon>
                                    <Link.Label>Appointments</Link.Label>
                                </Link.Root>
                                <Link.Root link="/dashboard/clients" isActive={pathname === "/dashboard/clients"}>
                                    <Link.Icon>
                                        <UsersRound />
                                    </Link.Icon>
                                    <Link.Label>Clients</Link.Label>
                                </Link.Root>
                                <Link.Root link="/dashboard/monetization" isActive={pathname === "/dashboard/monetization"}>
                                    <Link.Icon>
                                        <CircleDollarSign />
                                    </Link.Icon>
                                    <Link.Label>Monetization</Link.Label>
                                </Link.Root>
                                <div>
                                    <Caption className="mx-2 my-2">Automated Booking</Caption>
                                    <Link.Root link="/dashboard/availability" isActive={pathname === "/dashboard/availability"}>
                                        <Link.Icon>
                                            <CalendarCog />
                                        </Link.Icon>
                                        <Link.Label>Availability</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/services" isActive={pathname === "/dashboard/services"}>
                                        <Link.Icon>
                                            <Database />
                                        </Link.Icon>
                                        <Link.Label>Services</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/booking-policies" isActive={pathname === "/dashboard/booking-settings"}>
                                        <Link.Icon>
                                            <Scale />
                                        </Link.Icon>
                                        <Link.Label>Booking Settings</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/booking-site" isActive={pathname === "/dashboard/booking-site"}>
                                        <Link.Icon>
                                            <PanelsTopLeft />
                                        </Link.Icon>
                                        <Link.Label>Booking Site</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/analytics" isActive={pathname === "/dashboard/analytics"}>
                                        <Link.Icon>
                                            <ChartNoAxesCombined />
                                        </Link.Icon>
                                        <Link.Label>Analytics</Link.Label>
                                    </Link.Root>
                                </div>
                                <div>
                                    <Caption className="mx-2 my-2">Client Rewards</Caption>
                                    <Link.Root disabled={true} link="#">
                                        <Link.Icon>
                                            <Tag />
                                        </Link.Icon>
                                        <Link.Label><div className='flex items-center'>Loyalty Program</div></Link.Label>
                                    </Link.Root>
                                    <Link.Root link="#" isActive={pathname === "/dashboard/discounts"}>
                                        <Link.Icon>
                                            <Percent />
                                        </Link.Icon>
                                        <Link.Label>Discounts</Link.Label>
                                    </Link.Root>
                                </div>
                            </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" />

                    </ScrollArea.Root>

                    <div className="mt-auto h-fit">
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <Link.Root link="#">
                                <Link.Icon>
                                    <HelpCircle />
                                </Link.Icon>
                                <Link.Label>Help</Link.Label>
                            </Link.Root>
                            <Link.Root link="/dashboard/settings">
                                <Link.Icon>
                                    <Settings />
                                </Link.Icon>
                                <Link.Label>Settings</Link.Label>
                            </Link.Root>
                        </div>
                    </div>
                </div>

            </div>
            {isMenuOpen && (
                <div
                    aria-hidden
                    className="fixed inset-0 z-[11] bg-[--overlay-bg] transition duration-300 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
            <main className={twMerge('lg:ml-72 lg:w-[calc(100vw-20rem)] h-screen flex flex-col', isMenuOpen && 'pointer-events-none opacity-50')}>
                <div className="feedback-bg flex-col sticky top-0 z-20 flex items-end justify-between  pl-[1.25rem] py-3 lg:py-4">
                    <div className='flex-row flex justify-between w-full'>
                        <div className="flex items-center gap-2 pr-6">
                            <Button.Root
                                size="sm"
                                variant="ghost"
                                intent="gray"
                                className="-ml-2 focus:bg-transparent lg:hidden dark:focus:bg-transparent"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <Button.Icon type="only">
                                    <Menu />
                                </Button.Icon>
                            </Button.Root>
                        </div>
                        <div className="flex items-center gap-4 pr-6">
                            {businessData.notifications.filter((noti) => noti.read === false).length ? <div >
                                <Badge badgeContent={businessData.notifications.length} badgeInset={8} color='danger' size='sm'>
                                    <Notifications />
                                </Badge>
                            </div> : <Notifications />}
                            <UserDropdown businessData={businessData} />
                        </div>
                    </div>

                    {businessData && !businessData?.completed_stripe_onboarding ? <Banner.Root intent="warning" className="mt-2 p-5 rounded-none w-full">
                        <Banner.Content>
                            <CircleAlert className="size-5 text-[--body-text-color]" />
                            <div className="space-y-2">
                                <Text size="sm" className="my-0 text-warning-800 dark:text-warning-300">
                                    To launch your booking site, you need to finish  <a target='_blank' href={`${businessData.current_onboarding_link}`}><strong>onboarding with Stripe</strong></a> to start accepting payments
                                </Text>

                            </div>
                        </Banner.Content>
                    </Banner.Root> : <></>}
                </div>

                <div className='w-full flex-1 max-h-min'>
                    <SiteWrapper>
                        {children}
                    </SiteWrapper>
                </div>

            </main>
        </div>
    );
}

