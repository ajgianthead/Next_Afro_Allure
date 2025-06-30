"use client"

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Caption, Text, Title } from '@tailus-ui/typography'
import React, { useEffect, useState } from 'react'
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
    Elements,
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'
import { useParams } from 'next/navigation'
import CircularProgress from '@mui/joy/CircularProgress'
import Button from '@tailus-ui/Button'
import { AppointmentReminderData, appointmentReminders } from '@utils/bull_mq'
import { Card } from '@mui/joy';
import Head from 'next/head';
import { DateTime } from 'luxon';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: "acct_1Q6tUcFpD7KoueRC",
});



export default function ConfirmAppClient() {
    const [options, setOptions] = useState<{
        clientSecret: any,
        onComplete?: any
    }>();
    const { appointment_id, businessId } = useParams<{ appointment_id: string, businessId: string }>()
    const [policies, setPolicies] = useState<any>();
    const [appointmentData, setAppointmentData] = useState<any>({})
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [stripeID, setStripeID] = useState<string | null>(null)
    const [businessData, setBusinessData] = useState<any>({})
    useEffect(() => {
        // Fetch appointment data with appointmentID, when use businessID
        // that's attached to the appointment to fetch the business's policies
        const fetchAppointment = async () => {
            const response = await fetch(`http://localhost:3000/api/appointments/${appointment_id}`, {
                method: "GET",
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const res = await response.json();
                setAppointmentData(res.appointment)
                return res.appointment
            }
        }
        const fetchSession = async (stripeID: string, appointment: Appointment, policy: Policy) => {
            const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
                stripeAccount: stripeID,
            });
            setStripePromise(stripePromise)
            const response = await fetch("http://localhost:3000/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    connectedAccountId: stripeID,
                    price: appointment.amount_due,
                    app_fee: 200,// Change Stripe Account ID to be dynamic to business
                    appointmentID: appointment_id,
                    paymentIntent: appointment.deposit_charge_id
                }),
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const val = await response.json();
                const clientSecret = val.clientSecret;
                const opt = { clientSecret }
                setOptions({
                    ...options,
                    clientSecret: opt.clientSecret,
                    onComplete: handleCompleted
                })
                setCompleted(false)
            }
        }
        const getPolicies = async (data: any) => {
            const response = await fetch(`http://localhost:3000/api/policies/policy/${data.policy_id}`, {
                method: "GET",
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const result = await response.json();
                // setPolicies(result.booking_policies)
                return result.policy
            }
        }

        const getBusinessData = async (businessID: string) => {
            const res = await fetch(`http://localhost:3000/api/${businessID}`, {
                method: 'GET'
            })
            const result = await res.json();
            setStripeID(result.data.stripe_acc_id)
            setBusinessData(result.data)
            return result.data
        }
        fetchAppointment().then(async (appointment) => {
            if (appointment.status === "CONFIRMED") {
                await getBusinessData(businessId)
                setCompleted(true)
            } else {
                getPolicies(appointment).then((policy) => {
                    getBusinessData(appointment.business).then((businessData) => {
                        if (appointment.require_deposit) {
                            fetchSession(businessData.stripe_acc_id, appointment, policy);
                        } else {
                            setCompleted(false)
                            // Updates the appointment status and change the completed state
                            // handleCompleted()
                        }
                    })

                });
            }
        })
    }, []);
    const [completed, setCompleted] = useState<boolean | null>(null);
    const handleCompleted = async () => {
        // Update the appointment status, then change the completed state
        const response = await fetch(`http://localhost:3000/api/appointments`, {
            method: "PUT",
            body: JSON.stringify({
                id: appointment_id,
                start: appointmentData.start,
                end: appointmentData.end,
                status: "CONFIRMED",
            })
        });
        if (!response.ok) {
            // Handle errors on the client side here
            const { error } = await response.json();
            throw new Error("An error occurred: ", error);
        } else {
            setCompleted(true)
        }
    }
    return (
        <div>
            <Head>
                <title>My page title</title>
                <meta property="og:title" content="My page title" key="title" />
            </Head>
            {completed !== null ? <div>
                {Object.keys(appointmentData).length ? <div className='w-full h-screen overflow-x-hidden overflow-scroll flex py-10 justify-center'>
                    {!completed && options && promise ? <Elements
                        stripe={promise}
                        options={options}
                    >
                        <div className='flex lg:flex-row flex-col gap-2 justify-between w-full  max-w-[1280px]'>
                            <div className='lg:w-1/2 w-full m-2'>
                                <Card sx={{
                                    width: '100%',
                                    height: '100%',
                                    padding: 3
                                }}>
                                    <div className='flex flex-col justify-between h-full'>
                                        <div>
                                            <div className='text-center lg:text-left'>
                                                <Title>Appointment Summary</Title>
                                                <Caption>This amount is the deposit price needed to confirm your appointment</Caption>
                                            </div>
                                            <div className='flex gap-2 w-full mt-5'>
                                                <div className='w-full flex flex-col gap-5'>
                                                    <div className='flex lg:flex-row flex-col gap-2'>
                                                        <div className='w-full lg:w-1/2 lg:text-left justify-center text-center'>
                                                            <Text className='font-medium'>Date:</Text>
                                                            <Caption>{DateTime.fromISO(appointmentData.start).toFormat('DDDD')}</Caption>
                                                        </div>
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center' >
                                                            <Text className='font-medium'>Time:</Text>
                                                            <Caption>{`${DateTime.fromISO(appointmentData.start).toFormat('t')} ~ ${DateTime.fromISO(appointmentData.end).toFormat('t')}`}</Caption>
                                                        </div>
                                                    </div>
                                                    <div className="flex lg:flex-row flex-col gap-5">
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                            <Text className='font-medium'>Service Information:</Text>
                                                            <Caption>Name: {appointmentData.service_data.name}</Caption>
                                                            <Caption>Price: ${appointmentData.service_data.price / 100}</Caption>
                                                            <Caption>Deposit Required: <strong>{appointmentData.require_deposit ? 'YES' : 'NO'}</strong></Caption>
                                                            <Caption>Deposit Amount: ${appointmentData.deposit_price / 100}</Caption>
                                                        </div>
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                            <Text className='font-medium'>Client Information:</Text>
                                                            <div className='w-full flex flex-col gap-1'>
                                                                <Caption>Name: {appointmentData.client_metadata.firstName + " " + appointmentData.client_metadata.lastName}</Caption>
                                                                <Caption>Email: {appointmentData.client_metadata.email}</Caption>
                                                                <Caption>Phone Number: ({appointmentData.client_metadata.phoneNumber.slice(0, 3)}) {appointmentData.client_metadata.phoneNumber.slice(3, 6)}-{appointmentData.client_metadata.phoneNumber.slice(6)}</Caption>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                        <Text className='font-medium'>Add-ons:</Text>
                                                        {appointmentData.selected_addons.map((addon: any, index: number) => {
                                                            return (
                                                                <Caption key={index}>{addon.name}: ${addon.price}</Caption>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                        <div className='flex w-full lg:justify-end justify-center mt-5'>
                                            <Title>Due Now: ${appointmentData.deposit_price / 100}</Title>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className='w-full lg:w-1/2 h-full m-2'>
                                <Card sx={{
                                    width: '100%',
                                    height: '100%',
                                    padding: 3
                                }}>
                                    <Caption><i>*You are required to pay a deposit to confirm this appointment</i></Caption>
                                    <PaymentForm promise={promise} appointmentID={appointment_id} stripeID={stripeID!} />
                                </Card>
                            </div>
                        </div>
                    </Elements> : <div>
                        {!completed ? <div>
                            <div className='w-full m-2'>
                                <Card sx={{
                                    width: '100%',
                                    height: '100%',
                                    padding: 3
                                }}>
                                    <div className='flex flex-col justify-between h-full'>
                                        <div>
                                            <div className='text-center lg:text-left'>
                                                <Title>Appointment Summary</Title>
                                                <Caption>This amount is the deposit price needed to confirm your appointment</Caption>
                                            </div>
                                            <div className='flex gap-2 w-full mt-5'>
                                                <div className='w-full flex flex-col gap-5'>
                                                    <div className='flex lg:flex-row flex-col gap-2'>
                                                        <div className='w-full lg:w-1/2 lg:text-left justify-center text-center'>
                                                            <Text className='font-medium'>Date:</Text>
                                                            <Caption>{DateTime.fromISO(appointmentData.start).toFormat('DDDD')}</Caption>
                                                        </div>
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center' >
                                                            <Text className='font-medium'>Time:</Text>
                                                            <Caption>{`${DateTime.fromISO(appointmentData.start).toFormat('t')} ~ ${DateTime.fromISO(appointmentData.end).toFormat('t')}`}</Caption>
                                                        </div>
                                                    </div>
                                                    <div className="flex lg:flex-row flex-col gap-5">
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                            <Text className='font-medium'>Service Information:</Text>
                                                            <Caption>Name: {appointmentData.service_data.name}</Caption>
                                                            <Caption>Price: ${appointmentData.service_data.price / 100}</Caption>
                                                            <Caption>Deposit Required: <strong>{appointmentData.require_deposit ? 'YES' : 'NO'}</strong></Caption>
                                                            <Caption>Deposit Amount: ${appointmentData.deposit_price / 100}</Caption>
                                                        </div>
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                            <Text className='font-medium'>Client Information:</Text>
                                                            <div className='w-full flex flex-col gap-1'>
                                                                <Caption>Name: {appointmentData.client_metadata.firstName + " " + appointmentData.client_metadata.lastName}</Caption>
                                                                <Caption>Email: {appointmentData.client_metadata.email}</Caption>
                                                                <Caption>Phone Number: ({appointmentData.client_metadata.phoneNumber.slice(0, 3)}) {appointmentData.client_metadata.phoneNumber.slice(3, 6)}-{appointmentData.client_metadata.phoneNumber.slice(6)}</Caption>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                        <Text className='font-medium'>Add-ons:</Text>
                                                        {appointmentData.selected_addons.map((addon: any, index: number) => {
                                                            return (
                                                                <Caption key={index}>{addon.name}: ${addon.price}</Caption>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <Button.Root onClick={async () => {
                                        await handleCompleted()
                                    }}>
                                        <Button.Label>Confirm Appointment</Button.Label>
                                    </Button.Root>
                                </Card>
                            </div>
                        </div> : <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                            <div className='flex gap-3'>
                                <CircleCheckBig color='green' />
                                <Title>Appointment Confirmed</Title></div>
                            <div className='text-center'>
                                <Caption>If you have any questions regarding your appointment, please contact {businessData.business_name}</Caption>
                            </div>
                        </div>}</div>}
                </div> : <div>
                    <Text>Something went wrong :(</Text>
                </div>}
            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress />
            </div>}
        </div>
    )
}

const PaymentForm = ({ promise, appointmentID, stripeID }: { promise: Promise<Stripe | null>, appointmentID: string, stripeID: string }) => {
    const elements = useElements()
    const stripe = useStripe();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        //TODO: Stripe confirmPayment
        if (!promise || !elements) {
            return;
        }
        const { error } = await stripe?.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: `http://localhost:3000/appointment/${appointmentID}/${stripeID}/complete`,

            },
        })!;
        if (error) {
            throw Error(error.message)
        }
    }
    return (
        <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col gap-5 justify-between h-full'>
            <PaymentElement className='w-full' />
            <Button.Root type='submit' disabled={!promise}>
                <Button.Label>Pay Deposit and Confirm Appointment</Button.Label>
            </Button.Root>
        </form>
    )
}
