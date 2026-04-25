'use client'

import Card from '@tailus-ui/Card';
import { Caption, Title } from '@tailus-ui/typography';
import * as Link from '@components/Link';

import React, { useEffect, useState } from 'react';
import Input from '@components/Input';
import Label from '@components/Label';
import Separator from "@tailus-ui/Separator"
import Button from '@tailus-ui/Button';
import { usePathname } from 'next/navigation';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import useStripeConnect from '@/app/utils/hooks/useStripeConnect';
import { Checkbox, CircularProgress, Button as MUIButton } from '@mui/joy';
import { Json } from '../../../../../lib/database.types';
import { saveAccountSettings } from './actions';
import { PostgrestError } from '@supabase/supabase-js';

export interface AccountSettings {
    business_address: {
        no_address: boolean
        line_1: string
        line_2: string
        city: string
        state: string
        zip_code: string
    },
    notifications: {
        email: boolean
        email_24: boolean
        email_1: boolean
    },
    app_reminders: {
        email_24: boolean,
        email_1: boolean
    }
}

export default function SettingsClient({ business, subscriptionLink }: {
    business: Business
    subscriptionLink?: string
}) {
    const path = usePathname();
    const [active, setActive] = useState<number>(0)
    const [accountSettings, setAccountSettings] = useState<any>(business.account_settings)
    const [currentEmail, setCurrentEmail] = useState<string>(business.email)
    const [savingChanges, setSavingChanges] = useState<boolean>(false)
    const PLAN_TYPE = business.plan_type
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
                                    <Link.Label>Account</Link.Label>
                                </Link.Root>
                            </div>
                            <div onClick={(e) => {
                                e.preventDefault()
                                setActive(1)
                            }}>
                                <Link.Root link="/settings" isActive={active === 1}>
                                    <Link.Label>Preferences</Link.Label>
                                </Link.Root>
                            </div>

                        </div>
                    </div>
                    <Separator orientation='vertical' className='mx-2' />
                    {
                        active === 0 ? (
                            <Account setAccountSettings={setAccountSettings} account_settings={accountSettings} businessName={business.business_name} email={currentEmail} setCurrentEmail={setCurrentEmail} />
                        ) : (
                            <Preferences link={subscriptionLink} planType={PLAN_TYPE} setAccountSettings={setAccountSettings} account_settings={accountSettings} businessName={business.business_name} />
                        )
                    }


                </div>
                <div className='flex justify-end mt-5'>
                    <MUIButton disabled={savingChanges} onClick={async () => {
                        setSavingChanges(true)
                        const settings = await saveAccountSettings(accountSettings, business.business_id, business.email)
                        if (settings instanceof PostgrestError) {
                            console.error(settings.message)
                        } else {
                            setAccountSettings(settings.account_settings as unknown as AccountSettings)
                        }
                        setSavingChanges(false)
                    }} color='neutral'>
                        {savingChanges ? <CircularProgress size='sm' /> : "Save Changes"}
                    </MUIButton>
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

const Preferences = ({ businessName, account_settings, setAccountSettings, planType, link }: { planType: "STARTER" | "GROWTH", businessName: string, link?: string, account_settings: AccountSettings, setAccountSettings: React.Dispatch<React.SetStateAction<AccountSettings>> }) => {
    const STARTER: boolean = planType === 'STARTER'
    return (
        <div className='w-full overflow-y-auto'>
            <Title className='text-md'>Preferences</Title>
            <Caption>Manage your account and booking preferences</Caption>
            <Separator className='my-4' />
            <div className='flex flex-col gap-2'>
                <Label htmlFor='businessName' size='sm' className=' font-medium'>Booking Notifications</Label>
                <Checkbox label="Send email notifications" size='sm' checked={account_settings.notifications.email} onChange={(e) => {
                    setAccountSettings({
                        ...account_settings,
                        notifications: {
                            ...account_settings.notifications,
                            email: e.target.checked
                        }
                    })
                }} />
                {STARTER ? <Caption className='text-xs'>To enable reminders for either you or your clients, you must <a href={link} target='_blank' className='underline  text-[#FC6161] font-medium'>Upgrade Plan</a></Caption> : <></>}

                <Checkbox label="Send email reminders to 24hrs before appointment" disabled={STARTER} checked={STARTER ? false : account_settings.notifications.email_24} size='sm' onChange={(e) => {
                    setAccountSettings({
                        ...account_settings,
                        notifications: {
                            ...account_settings.notifications,
                            email_24: e.target.checked
                        }
                    })
                }} />
                <Checkbox label="Send email reminders to 1hr before appointment" size='sm' disabled={STARTER} checked={STARTER ? false : account_settings.notifications.email_1} onChange={(e) => {
                    setAccountSettings({
                        ...account_settings,
                        notifications: {
                            ...account_settings.notifications,
                            email_1: e.target.checked
                        }
                    })
                }} />

            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>Appointment Reminders</Label>
                {STARTER ? <Caption className='text-xs'>To enable reminders for either you or your clients, you must <a href={link} target='_blank' className='underline  text-[#FC6161] font-medium'>Upgrade Plan</a></Caption> : <></>}

                <Checkbox label="Send email reminders to client 24hrs before appointment" disabled={STARTER} checked={STARTER ? false : account_settings.app_reminders.email_24} size='sm' onChange={(e) => {
                    setAccountSettings({
                        ...account_settings,
                        app_reminders: {
                            ...account_settings.app_reminders,
                            email_24: e.target.checked
                        }
                    })
                }} />
                <Checkbox label="Send email reminders to client 1hr before appointment" disabled={STARTER} checked={STARTER ? false : account_settings.app_reminders.email_1} size='sm' onChange={(e) => {
                    setAccountSettings({
                        ...account_settings,
                        app_reminders: {
                            ...account_settings.app_reminders,
                            email_1: e.target.checked
                        }
                    })
                }} />
            </div>

        </div>
    )
}

const Account = ({ businessName, email, account_settings, setAccountSettings, setCurrentEmail }: { businessName: string, email: string, account_settings: AccountSettings, setAccountSettings: React.Dispatch<React.SetStateAction<AccountSettings>>, setCurrentEmail: any }) => {
    return (
        <div className='w-2/4 overflow-y-auto'>
            <Title className='text-md'>Manage Account</Title>
            <Caption>This is how client will see you when they book with you.</Caption>
            <Separator className='my-4' />
            <div className='flex flex-col gap-2'>
                <Label htmlFor='businessName' size='sm' className=' font-medium'>Business Name</Label>
                <Caption className='text-xs'>This is your public display name. It can be your real name or a pseudonym. This name has to be <strong>UNIQUE</strong> across the entire platform</Caption>
                <Input disabled id='businessName' value={businessName} />
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label htmlFor='email' size='sm' className=' font-medium'>Email</Label>
                <Caption className='text-xs'>You can manage verified email addresses in your email settings.</Caption>
                <Input id='email' value={email} onChange={(e) => {
                    setCurrentEmail(e.target.value)
                }} />
            </div>
            <div className='flex flex-col gap-2 mt-6'>
                <Label size='sm' className=' font-medium'>Business Address</Label>
                <Caption className='text-xs'>The location of your business. This is given to clients once they confirm their appointment with you. Check the box below if you are a travel stylists and don't have an address for clients to meet with you</Caption>
                <div className='my-1'>
                    <Checkbox checked={account_settings.business_address.no_address} onChange={(e) => {
                        setAccountSettings({
                            ...account_settings,
                            business_address: {
                                ...account_settings.business_address,
                                no_address: e.target.checked
                            }
                        })
                    }} label="Do not have a location" size='sm' />

                </div>
                <div className='flex flex-col gap-2'>
                    <Input disabled={account_settings.business_address.no_address} id='street-address' className='w-full' value={account_settings.business_address.line_1} placeholder='Line 1' />
                    <Input disabled={account_settings.business_address.no_address} id='street-address' value={account_settings.business_address.line_2} className='w-full' placeholder='Line 2' />
                    <div className='w-full flex justify-between gap-2'>
                        <Input disabled={account_settings.business_address.no_address} className='w-1/3' id='city' value={account_settings.business_address.city} placeholder='City' />
                        <Input disabled={account_settings.business_address.no_address} className='w-1/3' id='state' value={account_settings.business_address.state} placeholder='State' />
                        <Input disabled={account_settings.business_address.no_address} id='zip-code' className='w-1/3' value={account_settings.business_address.zip_code} />

                    </div>
                </div>
            </div>
        </div>
    )
}

