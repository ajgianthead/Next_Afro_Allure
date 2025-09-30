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
import { SiteWrapper } from '@utils/context/BookingSiteContext';
import Banner from "@components/Banner";
import { useUserContext } from '@utils/context/UserContext';
import { Database as DB } from '../../../../lib/database.types';
import LOGO from "../../../../public/images/logo_transparent_background.png"
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation';
import { getUser } from './getUser';
import { Badge, Chip, Input, Modal, ModalClose, ModalDialog, Textarea, Typography, Button as MUIButton, CircularProgress } from '@mui/joy';
import { PostgrestError } from '@supabase/supabase-js';

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
                                <Caption className="mx-2 my-2">General</Caption>

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
                                    <Link.Root link="/dashboard/booking-settings" isActive={pathname === "/dashboard/booking-settings"}>
                                        <Link.Icon>
                                            <Scale />
                                        </Link.Icon>
                                        <Link.Label>Booking Settings</Link.Label>
                                    </Link.Root>
                                    <Link.Root link="/dashboard/booking-site/upload-sections" isActive={pathname === "/dashboard/booking-site/upload-sections"}>
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
                            </div>
                        </ScrollArea.Viewport>
                        <ScrollArea.Scrollbar orientation="vertical" />

                    </ScrollArea.Root>
                    <Modal open={feedbackModalOpen} onClose={() => {
                        setFeedbackModalOpen(!feedbackModalOpen)
                        setFeedback("")

                    }}>
                        <ModalDialog sx={{
                            padding: 5,
                            width: '50%'
                        }} size='lg'>
                            <ModalClose />
                            <Typography level='h3'>Send Feedback</Typography>
                            <div className='flex flex-col gap-3'>

                                <div className=' space-y-2'>
                                    <Textarea value={feedback} onChange={(e) => {
                                        setFeedback(e.target.value)
                                    }} minRows={4} placeholder="Tell us what we're doing wrong and/or what we can do better" />
                                </div>
                            </div>
                            <div className='w-full justify-end flex'>
                                <MUIButton disabled={sendingFeedback} onClick={async () => {
                                    setSendingFeedback(true)
                                    const result = await sendFeedback({
                                        businessId: businessData.business_id,
                                        businessName: businessData.business_name,
                                        email: businessData.email,
                                        feedback: feedback
                                    })
                                    if (result instanceof PostgrestError) {
                                        console.error(result.message)
                                    } else {

                                    }
                                    setFeedbackModalOpen(false)
                                    setFeedback("")
                                    setSendingFeedback(false)
                                }}>
                                    {sendingFeedback ? <CircularProgress size='sm' /> : "Send Feedback"}
                                </MUIButton>
                            </div>
                        </ModalDialog>
                    </Modal>
                    <div className="mt-auto h-fit">
                        <Separator className="my-4" />
                        <div className="space-y-1">
                            <div onClick={() => {
                                setFeedbackModalOpen(true)
                            }}>
                                <Link.Root link="#" >
                                    <Link.Icon>
                                        <MessageCircleQuestion />
                                    </Link.Icon>
                                    <Link.Label>Send Feedback</Link.Label>
                                </Link.Root>
                            </div>
                            <div>
                                <Link.Root link="#">
                                    <Link.Icon>
                                        <HelpCircle />
                                    </Link.Icon>
                                    <Link.Label>Help</Link.Label>
                                </Link.Root>
                            </div>
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
                            {businessData.notifications.filter((noti: any) => noti.read === false).length ? <div >
                                <Badge badgeContent={businessData.notifications.filter((noti: any) => noti.read === false).length} badgeInset={8} color='danger' size='sm'>
                                    <Notifications />
                                </Badge>
                            </div> : <Notifications />}
                            <UserDropdown businessData={businessData} />
                        </div>
                    </div>

                    {!businessData?.account_settings?.business_address.line_1.length && !businessData?.account_settings?.business_address.no_address ? <Banner.Root intent="warning" className="mt-2 p-5 rounded-none w-full">
                        <Banner.Content>
                            <CircleAlert className="size-5 text-[--body-text-color]" />
                            <div className="space-y-2">
                                <Text size="sm" className="my-0 text-warning-800 dark:text-warning-300">
                                    To start scheduling appointments, you need to first  <a target='_blank' href={`${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/dashboard/settings`}><strong>add your business address</strong></a>
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

