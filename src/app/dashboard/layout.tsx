'use client'
import Button from '@tailus-ui/Button';
import { twMerge } from 'tailwind-merge';
import * as Link from '@components/Link';
import Separator from '@tailus-ui/Separator';
import { Notifications } from '@components/Notifications';
import { useEffect, useState } from 'react';
import { BrandIcon } from '@components/utilities/Brand';
import { Menu, Settings, HelpCircle, LayoutDashboard, Calendar, CalendarCog, Database, UsersRound, Shield, Percent, Tag, PanelsTopLeft, ChartNoAxesCombined, Scale } from 'lucide-react';
import { Caption, Title } from '@tailus-ui/typography';
import { UserDropdown } from '@components/UserDropdown';
import ScrollArea from '@components/ScrollArea';
import { fetchUser } from './actions';


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        fetchUser()
    }, []);


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
                                <Link.Root link="/" isActive>
                                    <Link.Icon>
                                        <LayoutDashboard />
                                    </Link.Icon>
                                    <Link.Label>Dashboard</Link.Label>
                                </Link.Root>
                                <Link.Root link="/appointments">
                                    <Link.Icon>
                                        <Calendar />
                                    </Link.Icon>
                                    <Link.Label>Appointments</Link.Label>
                                </Link.Root>
                                <Link.Root link="/clients">
                                    <Link.Icon>
                                        <UsersRound />
                                    </Link.Icon>
                                    <Link.Label>Clients</Link.Label>
                                </Link.Root>
                                <div>
                                    <Caption className="mx-2 my-2">Automated Booking</Caption>
                                    <Link.Root link="/availability">
                                        <Link.Icon>
                                            <CalendarCog />
                                        </Link.Icon>
                                        <Link.Label>Availability</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/services">
                                        <Link.Icon>
                                            <Database />
                                        </Link.Icon>
                                        <Link.Label>Services</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/services">
                                        <Link.Icon>
                                            <Scale />
                                        </Link.Icon>
                                        <Link.Label>Policies</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/booking-site">
                                        <Link.Icon>
                                            <PanelsTopLeft />
                                        </Link.Icon>
                                        <Link.Label>Booking Site</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/booking-site">
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
                                    <Link.Root link="/discounts">
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
                            <Link.Root link="/settings">
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
                <div className="feedback-bg sticky top-0 z-10 flex items-center justify-between  px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-4">
                        <Notifications />
                        <UserDropdown />
                    </div>
                </div>
                <div className='w-full'>{children}</div>

            </main>
        </div>
    );
}

