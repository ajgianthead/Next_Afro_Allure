'use client'
import { loadConnectAndInitialize, StripeConnectInstance } from '@stripe/connect-js';
import { ConnectBalances, ConnectComponentsProvider, ConnectPayments, ConnectPayoutsList, ConnectReportingChart } from '@stripe/react-connect-js';
import { Caption, Title } from '@tailus-ui/typography';
import { useUserContext } from '@utils/context/UserContext';
import React, { useState, useEffect } from 'react'
import Separator from '@tailus-ui/Separator'


export default function Earnings() {
    const { user } = useUserContext()
    useEffect(() => {
        const getAccount = async () => {
            console.log(user);

            const result = await fetch(`http://localhost:3000/api/${user.business_id}`, {
                method: 'GET',
            })
            const res = await result.json();
            return res.data.stripe_acc_id
        }
        const run = async (accountID: string) => {


            const fetchClientSecret = async () => {
                const response = await fetch('http://localhost:3000/api/account_session', {
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
                    const instance = await run(accountID);
                    setConnectInstance(instance)
                })
            })()
        }
    }, [user]);

    const [stripeConnectInstance, setConnectInstance] = useState<StripeConnectInstance>();
    return (
        <div>
            <div className='p-5'>
                <Title>Earnings</Title>
                <Separator className="mt-4 w-full" />
            </div>

            {
                stripeConnectInstance ?
                    <ConnectComponentsProvider connectInstance={stripeConnectInstance!}>
                        <div className='flex gap-2 flex-col px-5 pb-5'>
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
                    </ConnectComponentsProvider>
                    : <></>
            }
        </div>
    )
}
