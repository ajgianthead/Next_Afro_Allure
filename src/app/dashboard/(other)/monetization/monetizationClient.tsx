'use client'
import { loadConnectAndInitialize, StripeConnectInstance } from '@stripe/connect-js';
import {
    ConnectBalances, ConnectComponentsProvider, ConnectPayments, ConnectPayoutsList, ConnectReportingChart, ConnectTaxSettings,
    ConnectTaxRegistrations,
    ConnectAccountManagement,
    ConnectPaymentMethodSettings,
} from '@stripe/react-connect-js';
import * as Link from '@components/Link';
import { Caption, Title } from '@tailus-ui/typography';
import { useUserContext } from '@utils/context/UserContext';
import React, { useState, useEffect } from 'react'
import Separator from '@tailus-ui/Separator'
import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import Card from '@tailus-ui/Card';


export default function MonetizationClient() {
    const { user } = useUserContext()
    useEffect(() => {
        const getAccount = async () => {
            console.log(user);
            const result = await fetch(`/api/${user.business_id}`, {
                method: 'GET',
            })
            const res = await result.json();
            return res.data.stripe_acc_id
        }
        const run = async (accountID: string) => {
            const fetchClientSecret = async () => {
                const response = await fetch('/api/account_session', {
                    method: 'POST',
                    body: JSON.stringify({
                        account: accountID
                    })
                })
                if (!response.ok) {
                    // Handle errors on the client side here
                    const { error } = await response.json();
                    console.error('An error occurred: ', error);
                    return undefined;
                } else {
                    const res = await response.json();
                    return res.clientSecret;
                }
            }

            return loadConnectAndInitialize({
                publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
                fetchClientSecret: fetchClientSecret,
                fonts: [
                    {
                        cssSrc: `url(https://fonts.googleapis.com/css?family=Open+Sans)`,
                        family: 'Other'
                    },
                    {
                        src: `url(https://fonts.cdnfonts.com/s/19795/Inter-Light-BETA.woff)`,
                        family: "Default Font"
                    }
                ],
                appearance: {
                    variables: {
                        fontFamily: 'Default Font',
                    },
                }
            })
        }

        if (user.business_id) {
            (async () => {
                await getAccount().then(async (accountID: string) => {
                    try {
                        const instance = await run(accountID);
                        setConnectInstance(instance)
                    } catch (error) {
                        console.error(error)
                    }

                })
            })()
        }
    }, [user]);

    const [stripeConnectInstance, setConnectInstance] = useState<StripeConnectInstance>();
    const [active, setActive] = useState<number>(0)
    const stripeComponents = [<AccountManagement />, <TaxSettings />, <PaymentMethodSettings />]
    return (
        <div>
            <ConnectComponentsProvider connectInstance={stripeConnectInstance!}>
                <div className='p-5'>
                    <Title>Monetization</Title>
                </div>
                <Tabs className='px-5' defaultValue={0}>
                    <TabList>
                        <Tab
                            variant="plain"
                            color="neutral">Earnings</Tab>
                        <Tab
                            variant="plain"
                            color="neutral">Settings</Tab>
                    </TabList>
                    <TabPanel value={0} className='p-0'>{
                        stripeConnectInstance ?
                            <div className='flex gap-2 flex-col  pb-5'>
                                <div className="w-full border border-[#ECECEC] rounded  p-5">

                                    <div className='w-full '>
                                        <ConnectBalances />
                                    </div>
                                </div>
                                <div className='w-full flex md:flex-row flex-col gap-2'>
                                    <div className='md:w-1/2 w-full p-5 border border-[#ECECEC] rounded'>
                                        <ConnectReportingChart
                                            reportName="net_volume"
                                            intervalStart={new Date(2025, 3, 17)}
                                            intervalEnd={new Date()}
                                            intervalType="day"
                                        />
                                    </div>
                                    <div className='md:w-1/2 flex flex-col gap-5 w-full p-5 border border-[#ECECEC] rounded'>
                                        <Caption className='font-medium'>Payments</Caption>
                                        <ConnectPayments />
                                    </div>
                                </div>
                                <div className="w-full flex flex-col gap-5 p-5 border border-[#ECECEC] rounded">
                                    <Caption className='font-medium'>Payouts</Caption>
                                    <ConnectPayoutsList />
                                </div>
                            </div>
                            : <></>
                    }</TabPanel>
                    <TabPanel value={1}>
                        {stripeConnectInstance ? <div>
                            <Card>
                                <Title>Settings</Title>
                                <Caption>Manage your monetization settings and preferences.

                                </Caption>
                                <Separator className="my-4 " orientation='horizontal' />
                                <div className='flex lg:flex-row flex-col'>
                                    <div className="mt-4 flex lg:w-[25%] w-full pr-10">
                                        <div className=' flex lg:flex-col justify-between lg:justify-start lg:gap-2 flex-row w-full'>
                                            <div onClick={(e) => {
                                                e.preventDefault();
                                                setActive(0)
                                            }}>
                                                <Link.Root link="/settings" isActive={active === 0}>
                                                    <Link.Label>Manage Account</Link.Label>
                                                </Link.Root>
                                            </div>
                                            <div onClick={(e) => {
                                                e.preventDefault()
                                                setActive(1)
                                            }}>
                                                <Link.Root link="/settings" isActive={active === 1}>
                                                    <Link.Label>Tax Settings</Link.Label>
                                                </Link.Root>
                                            </div>
                                            <div onClick={(e) => {
                                                e.preventDefault();
                                                setActive(2)
                                            }}>
                                                <Link.Root link="/settings" isActive={active === 2}>
                                                    <Link.Label>Payment Methods</Link.Label>
                                                </Link.Root>
                                            </div>
                                            {/* <div onClick={(e) => {
                                                e.preventDefault()
                                                setActive(3)
                                            }}>
                                                <Link.Root link="/settings" isActive={active === 3}>
                                                    <Link.Label>Manage Subscription</Link.Label>
                                                </Link.Root>
                                            </div> */}
                                        </div>
                                    </div>
                                    <Separator orientation='vertical' className='mx-2' />
                                    {
                                        stripeComponents[active]
                                    }


                                </div>
                            </Card>


                        </div> : <>hi</>}
                    </TabPanel>
                </Tabs>

            </ConnectComponentsProvider>
        </div>
    )
}

const TaxSettings = () => {
    return (
        <div className='w-full'>
            <ConnectTaxSettings />
            <ConnectTaxRegistrations />
        </div>
    )
}

const AccountManagement = () => {
    return (
        <div className='w-full'>
            <ConnectAccountManagement

            // Optional:
            // collectionOptions={{
            //   fields: 'eventually_due',
            //   futureRequirements: 'include',
            // }}
            />
        </div>
    )
}

const PaymentMethodSettings = () => {
    return (
        <div>
            {/* <ConnectPaymentMethodSettings /> */}
        </div>
    )
}
