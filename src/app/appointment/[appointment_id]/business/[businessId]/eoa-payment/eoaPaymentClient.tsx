"use client"

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'
import { useParams } from 'next/navigation'
import CircularProgress from '@mui/joy/CircularProgress'
import Button from '@tailus-ui/Button'
import { Card } from '@mui/joy';
import { getAppointmentByIdAction, getBusinessByIdAction, getPolicyByIdAction } from '@/features/shared/appointments/actions'
import { createCheckoutAction } from '@/features/stripe/actions'



export default function EOAClient() {
    const [options, setOptions] = useState<{ clientSecret: any }>()
    const { appointment_id } = useParams<{ appointment_id: string }>()
    const [businessData, setBusinessData] = useState<any>({})
    const [appointmentData, setAppointmentData] = useState<any>({})
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [stripeID, setStripeID] = useState<string | null>(null)
    useEffect(() => {
        const init = async () => {
            const appointment = await getAppointmentByIdAction(appointment_id)
            setAppointmentData(appointment)

            if (appointment.status !== 'CONFIRMED') {
                setError(true)
                return
            }
            if (appointment.service_paid) {
                setCompleted(true)
                return
            }

            const [, business] = await Promise.all([
                getPolicyByIdAction(appointment.policy_id!),
                getBusinessByIdAction(appointment.business),
            ])
            setStripeID(business.stripe_acc_id)
            setBusinessData(business)

            const stripePromise = loadStripe(
                process.env.NODE_ENV === 'development'
                    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
                    : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!,
                { stripeAccount: business.stripe_acc_id! }
            )
            setStripePromise(stripePromise)

            const meta = appointment.client_metadata as any
            const { clientSecret } = await createCheckoutAction({
                connectedAccountId: business.stripe_acc_id!,
                price: appointment.amount_due,
                purpose: 'EOA',
                client_email: meta.email,
                paymentIntent: appointment.service_charge_id ?? undefined,
                appointmentID: appointment_id,
            })
            setOptions({ clientSecret })
            setCompleted(false)
        }
        init().catch(() => setError(true))
    }, []);
    const [error, setError] = useState<boolean>(false)
    const [completed, setCompleted] = useState<boolean | null>(null);
    return (
        <div>
            {error ? <div className='w-full h-screen flex justify-center items-center'>
                <Text>Something went wrong</Text>
            </div> : <div>
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
                                                    <Caption>This amount is all thats left to pay for your appointment</Caption>
                                                </div>
                                                <div className='flex gap-2 w-full mt-5'>
                                                    <div className='w-full flex flex-col gap-5'>
                                                        <div className='flex lg:flex-row flex-col gap-2'>
                                                            <div className='w-full lg:w-1/2 lg:text-left justify-center text-center'>
                                                                <Text className='font-medium'>Date:</Text>
                                                                <Caption>{appointmentData.start ? DateTime.fromISO(appointmentData.start).toFormat('LLLL dd, yyyy') : '—'}</Caption>
                                                            </div>
                                                            <div className='w-full lg:w-1/2 lg:text-left text-center' >
                                                                <Text className='font-medium'>Time:</Text>
                                                                <Caption>
                                                                    {appointmentData.start ? DateTime.fromISO(appointmentData.start).toLocaleString(DateTime.TIME_SIMPLE) : '—'}
                                                                    {appointmentData.end ? ` ~ ${DateTime.fromISO(appointmentData.end).toLocaleString(DateTime.TIME_SIMPLE)}` : ''}
                                                                </Caption>
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
                                                                    <Caption>Phone Number: {formatPhone(appointmentData.client_metadata.phoneNumber)}</Caption>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                                            <Text className='font-medium'>Add-ons:</Text>
                                                            {appointmentData.selected_addons.map((addon: any, index: number) => {
                                                                return (
                                                                    <Caption key={index}>{addon.name}: ${addon.price / 100}</Caption>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <div className='flex w-full lg:justify-end justify-center mt-5'>
                                                <Title>Due Now: ${appointmentData.amount_due / 100}</Title>
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
                                        <PaymentForm promise={promise} appointmentID={appointment_id} stripeID={stripeID!} />
                                    </Card>
                                </div>
                            </div>
                        </Elements> : <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                            <div className='flex gap-3'>
                                <CircleCheckBig color='green' />
                                <Title>Appointment Paid</Title></div>
                            <div className='text-center'>
                                <Caption>You will receive a reciept, via email, regarding your payment shortly</Caption>
                            </div>
                        </div>}
                    </div> : <div>
                        <Text>Something went wrong :(</Text>
                    </div>}
                </div> : <div className='w-full h-screen flex justify-center items-center'>
                    <CircularProgress />
                </div>}
            </div>}
        </div>
    )
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return phone
}

const PaymentForm = ({ promise, appointmentID, stripeID }: { promise: Promise<Stripe | null>, appointmentID: string, stripeID: string }) => {
    const elements = useElements()
    const stripe = useStripe();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!promise || !elements) {
            return;
        }
        // Validate email

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
                <Button.Label>Pay for Appointment</Button.Label>
            </Button.Root>
        </form>
    )
}
