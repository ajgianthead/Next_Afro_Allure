'use client'
import Button from '@tailus-ui/Button';
import { twMerge } from 'tailwind-merge';
import * as Link from '@components/Link';
import Separator from '@tailus-ui/Separator';
import { Notifications } from '@components/Notifications';
import { useEffect, useState } from 'react';
import { BrandIcon } from '@components/utilities/Brand';
import { Menu, Settings, HelpCircle, LayoutDashboard, Calendar, CalendarCog, Database, UsersRound, Shield, Percent, Tag, PanelsTopLeft, ChartNoAxesCombined, Scale, CircleAlert } from 'lucide-react';
import { Caption, Text, Title } from '@tailus-ui/typography';
import { UserDropdown } from '@components/UserDropdown';
import ScrollArea from '@components/ScrollArea';
import { fetchUser } from './actions';
import { SiteWrapper } from '@utils/context/BookingSiteContext';
import Banner from "@components/Banner";
import { useUserContext } from '@utils/context/UserContext';
import { Database as DB } from '../../../../lib/database.types';



export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useUserContext();
    const [userData, setUserData] = useState<DB['public']['Tables']['business_users']['Row'] | null>(null)
    useEffect(() => {
        const fetchUserData = async () => {
            const res = await fetch(`http://localhost:3000/api/${user.business_id}`, {
                method: 'GET'
            })
            const userData = await res.json()
            setUserData(userData.data)
        }
        fetchUser()
        // Fetch services
        if (user.business_id) {
            fetchUserData()
        }
    }, [user.business_id]);


    return (
        <div lang="en">
            <div
                className={twMerge(
                    'fixed inset-y-0 left-0 z-20 flex -translate-x-72  transition-transform duration-300 lg:translate-x-0',
                    isMenuOpen && 'translate-x-0'
                )}
            >
                <div data-shade="900" className="feedback-bg flex w-72 flex-col gap-4 p-4 lg:w-64">
                    <div className="flex w-10">
                        <BrandIcon className="mx-auto" />
                    </div>
                    <ScrollArea.Root className="-mx-1 -my-4">
                        <ScrollArea.Viewport className="w-full px-1 py-4">
                            <div className="mt-4 space-y-1">
                                <Link.Root link="/dashboard" isActive>
                                    <Link.Icon>
                                        <LayoutDashboard />
                                    </Link.Icon>
                                    <Link.Label>Dashboard</Link.Label>
                                </Link.Root>
                                <Link.Root link="/dashboard/appointments">
                                    <Link.Icon>
                                        <Calendar />
                                    </Link.Icon>
                                    <Link.Label>Appointments</Link.Label>
                                </Link.Root>
                                <Link.Root link="/dashboard/clients">
                                    <Link.Icon>
                                        <UsersRound />
                                    </Link.Icon>
                                    <Link.Label>Clients</Link.Label>
                                </Link.Root>
                                <div>
                                    <Caption className="mx-2 my-2">Automated Booking</Caption>
                                    <Link.Root link="/dashboard/availability">
                                        <Link.Icon>
                                            <CalendarCog />
                                        </Link.Icon>
                                        <Link.Label>Availability</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/services">
                                        <Link.Icon>
                                            <Database />
                                        </Link.Icon>
                                        <Link.Label>Services</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/booking-policies">
                                        <Link.Icon>
                                            <Scale />
                                        </Link.Icon>
                                        <Link.Label>Policies</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/booking-site">
                                        <Link.Icon>
                                            <PanelsTopLeft />
                                        </Link.Icon>
                                        <Link.Label>Booking Site</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard">
                                        <Link.Icon>
                                            <ChartNoAxesCombined />
                                        </Link.Icon>
                                        <Link.Label>Analytics</Link.Label>
                                    </Link.Root>
                                </div>
                                <div>
                                    <Caption className="mx-2 my-2">Client Rewards</Caption>
                                    <Link.Root link="#">
                                        <Link.Icon>
                                            <Tag />
                                        </Link.Icon>
                                        <Link.Label>Loyalty Program</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/discounts">
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
            <main className={twMerge('lg:ml-auto lg:w-[calc(100vw-16rem)]', isMenuOpen && 'pointer-events-none opacity-50')}>
                <div className="feedback-bg flex-col sticky top-0 z-10 flex items-end justify-betweenpx-6 pl-[1.25rem] py-3 lg:py-4">
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
                        {/* <Title size="base" weight="bold">
                            Dashboard
                        </Title> */}
                    </div>
                    <div className="flex items-center gap-4 pr-6">
                        <Notifications />
                        <UserDropdown />
                    </div>
                    {userData?.is_onboarded && <Banner.Root intent="warning" className="rounded-none w-full">
                        <Banner.Content>
                            <CircleAlert className="size-5 text-[--body-text-color]" />
                            <div className="space-y-2">
                                <Text size="sm" className="my-0 text-warning-800 dark:text-warning-300">
                                    To launch your booking site you need to first:
                                </Text>
                                <ul className='mt-2 list-disc text-sm text-warning-800 dark:text-warning-300'>
                                    {userData?.availabilities?.length && <li>Create an <a href="/dashboard/availability" className='font-bold'>Availability</a></li>}
                                    <li>Upload your <a href="/dashboard/services" className='font-bold'>Service(s)</a></li>
                                    {userData?.booking_policies?.length && <li>Configure your <a href="/dashboard/booking-policies" className='font-bold'>Booking Policies</a></li>}
                                    {!userData?.completed_stripe_onboarding && <li>Onboard with <a href="/onboarding/#" target='_blank' className='font-bold'>Stripe to accept payments</a></li>}
                                </ul>
                            </div>
                        </Banner.Content>
                    </Banner.Root>}

                </div>

                <div className='w-full'>
                    <SiteWrapper>
                        {children}
                    </SiteWrapper>
                </div>

            </main>
        </div>
    );
}

