"use client"

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Caption, Text, Title } from '@tailus-ui/typography'
import React, { useEffect, useState } from 'react'
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'
import CircularProgress from '@mui/joy/CircularProgress'
import Button from '@tailus-ui/Button'
import { Card } from '@mui/joy';
import { DateTime } from 'luxon';
import { createCheckout } from '@/lib/stripe/createCheckout';
import { AppointmentType, CheckoutType } from '@/features/shared/appointments/types';
import { Appointment } from '@/features/manualBooking/server/models/Appointment';
import { confirmAppointment } from '../actions';
import { BusinessUser } from '@/lib/businessUser/BusinessUser';


interface PageProps {
    appointment: InstanceType<typeof Appointment>,
    business: InstanceType<typeof BusinessUser>
}

export default function ConfirmAppClient({ appointment, business }: PageProps) {
    const [options, setOptions] = useState<{
        clientSecret: any,
        onComplete?: any
    }>();
    const [appointmentData, setAppointmentData] = useState<any>({ ...appointment })
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [stripeID, setStripeID] = useState<string | null>(null)
    const [amountDue, setAmountDue] = useState<number>()
    useEffect(() => {
        const fetchSession = async (stripeAccountId: string, appointment: Appointment) => {
            const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
                stripeAccount: stripeAccountId,
            });
            setStripePromise(stripePromise)
            setStripeID(stripeAccountId)
            const res = await createCheckout(CheckoutType.DEPOSIT, AppointmentType.MANUAL, appointment.depositPrice, appointment.businessId, appointment.id)

            setAmountDue(res?.amount)
            const clientSecret = res?.client_secret;
            setOptions({ clientSecret })
            setCompleted(false)
        }
        if (appointment.status === "CONFIRMED") {
            setCompleted(true)
        } else {
            if (appointment) {
                fetchSession(business.stripeAccountId, appointment);
            } else {
                setCompleted(false)
            }
        }
    }, []);
    const [completed, setCompleted] = useState<boolean | null>(null);
    const handleCompleted = async () => {
        // Update the appointment status, then change the completed state
        const confirmedAppointment = await confirmAppointment(appointment.id, appointment.businessId)
        if (!Array.isArray(confirmedAppointment)) {
            setCompleted(true)
        }
    }
    return (
        <div>
            {completed !== null ? <div>
                {Object.keys(appointmentData).length ? <div className='w-full h-screen overflow-x-hidden overflow-scroll flex py-10 justify-center'>
                    {!completed && options && promise ? <Elements
                        stripe={promise}
                        options={options}
                    >
                        <div className='flex lg:flex-row flex-col gap-2 justify-between w-full  max-w-7xl'>
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
                                            {amountDue ? <Title>Due Now: ${amountDue! / 100}</Title> : <CircularProgress size='sm' />}
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
                                    <PaymentForm promise={promise} appointmentID={appointment.id} stripeID={stripeID!} />
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
                        </div> : <div className='flex h-125 gap-2 px-5 flex-col w-screen justify-center items-center'>
                            <div className='flex gap-3'>
                                <CircleCheckBig color='green' />
                                <Title>Appointment Confirmed</Title></div>
                            <div className='text-center'>
                                <Caption>If you have any questions regarding your appointment, please contact {business.name}</Caption>
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
        if (!promise || !elements) {
            return;
        }
        const { error } = await stripe?.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/appointment/${appointmentID}/${stripeID}/complete`,

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
