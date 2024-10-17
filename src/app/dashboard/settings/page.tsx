'use client'

import Card from '@tailus-ui/Card';
import { Caption, Title } from '@tailus-ui/typography';
import * as Link from '@components/Link';

import React, { useEffect, useState } from 'react';
import Input from '@components/Input';
import Label from '@components/Label';
import Separator from "@tailus-ui/Separator"
import Button from '@tailus-ui/Button';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import useStripeConnect from '@utils/hooks/useStripeConnect';



const Page = () => {
    const path = usePathname();
    const [active, setActive] = useState<number>(0)
    // useEffect(() => {

    //     return () => {

    //     };
    // }, [active]);
    return (
        <div className=''>
            <Card className='mx-6'>
                <Title>Settings</Title>
                <Caption>Manage your account settings and set notifications preferences.

                </Caption>
                <Separator className="my-4 " orientation='horizontal' />
                <div className='flex'>
                    <div className="mt-4 flex w-[25%] pr-10">
                        <div className='space-y-1 w-full'>
                            <div onClick={(e) => {
                                e.preventDefault();
                                setActive(0)
                            }}>
                                <Link.Root link="/settings" isActive={active === 0}>
                                    <Link.Label>Profile</Link.Label>
                                </Link.Root>
                            </div>
                            <div onClick={(e) => {
                                e.preventDefault()
                                setActive(1)
                            }}>
                                <Link.Root link="/settings" isActive={active === 1}>
                                    <Link.Label>Manage Account</Link.Label>
                                </Link.Root>
                            </div>
                            <div onClick={(e) => {
                                e.preventDefault();
                                setActive(2)
                            }}>
                                <Link.Root link="/settings" isActive={active === 2}>
                                    <Link.Label>Stripe</Link.Label>
                                </Link.Root>
                            </div>
                            <div onClick={(e) => {
                                e.preventDefault()
                                setActive(3)
                            }}>
                                <Link.Root link="/settings" isActive={active === 3}>
                                    <Link.Label>Manage Subscription</Link.Label>
                                </Link.Root>
                            </div>
                        </div>
                    </div>
                    <Separator orientation='vertical' className='mx-2' />
                    {
                        active === 0 ? (
                            <Profile />
                        ) : (
                            <ManageStripe />
                        )
                    }


                </div>
            </Card>
        </div>
    );
}

const ManageStripe = () => {
    const stripeConnectInstance = useStripeConnect("acct_1Q6tUcFpD7KoueRC")
    return (
        <div className='w-full h-[450px] overflow-y-scroll overflow-x-hidden'>
            {
                stripeConnectInstance && <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                    <ConnectAccountOnboarding onExit={() => {

                    }} />
                </ConnectComponentsProvider>
            }
        </div>
    )
}

const ManageAccount = () => {
    return (
        <div className='w-2/4 overflow-y-auto'>
            <Title className='text-md'>Manage Account</Title>
            <Caption>This is how client will see you when they book with you.</Caption>
            <Separator className='my-4' />
            <div className='flex flex-col gap-2'>
                <Label htmlFor='businessName' size='sm' className=' font-medium'>Business Name</Label>
                <Input id='businessName' value={"LadyPlutoLooks"} disabled />
                <Caption className='text-xs'>This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.</Caption>
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>Email</Label>
                <Input id='email' value={"abijah.nez@gmail.com"} />
                <Caption className='text-xs'>You can manage verified email addresses in your email settings.</Caption>
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>URLs</Label>
                <Caption className='text-xs'>Add links to your website, blog, or social media profiles.</Caption>
                <Input value={"https://www.afroallure.com/ladyplutolooks"} />
                <Input value={"https://www.google.com"} />
                <div className='mb-1 ml-1'>
                    <Button.Root variant="outlined" size='xs' className='rounded'
                        intent="gray">
                        <Button.Label className='text-xs font-medium'>Add URL</Button.Label>
                    </Button.Root>
                </div>

            </div>
        </div>
    )
}

const Profile = () => {
    return (
        <div className='w-2/4 overflow-y-auto'>
            <Title className='text-md'>Profile</Title>
            <Caption>This is how client will see you when they book with you.</Caption>
            <Separator className='my-4' />
            <div className='flex flex-col gap-2'>
                <Label htmlFor='businessName' size='sm' className=' font-medium'>Business Name</Label>
                <Input id='businessName' value={"LadyPlutoLooks"} disabled />
                <Caption className='text-xs'>This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.</Caption>
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>Email</Label>
                <Input id='email' value={"abijah.nez@gmail.com"} />
                <Caption className='text-xs'>You can manage verified email addresses in your email settings.</Caption>
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>URLs</Label>
                <Caption className='text-xs'>Add links to your website, blog, or social media profiles.</Caption>
                <Input value={"https://www.afroallure.com/ladyplutolooks"} />
                <Input value={"https://www.google.com"} />
                <div className='mb-1 ml-1'>
                    <Button.Root variant="outlined" size='xs' className='rounded'
                        intent="gray">
                        <Button.Label className='text-xs font-medium'>Add URL</Button.Label>
                    </Button.Root>
                </div>

            </div>
        </div>
    )
}

export default Page;
