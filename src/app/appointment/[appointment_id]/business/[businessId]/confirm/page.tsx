"use client"

import { loadStripe, Stripe } from '@stripe/stripe-js'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import React, { useEffect, useState } from 'react'
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout,
    Elements,
    PaymentElement
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'
import { useParams } from 'next/navigation'
import CircularProgress from '@mui/joy/CircularProgress'
import Button from '@tailus-ui/Button'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: "acct_1Q6tUcFpD7KoueRC",
});

export default function page() {
    const [options, setOptions] = useState<{
        clientSecret: any,
        onComplete?: any
    }>();
    const { appointment_id } = useParams<{ appointment_id: string }>()
    const [policies, setPolicies] = useState<any>();
    const [appointmentData, setAppointmentData] = useState<any>({})
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
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
                    price: 2000,
                    app_fee: 200 // Change Stripe Account ID to be dynamic to business
                }),
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const val = await response.json();
                console.log(val.clientSecret);
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
            return result.data
        }
        fetchAppointment().then((appointment) => {
            if (appointment.status === "CONFIRMED") {
                setCompleted(true)
            } else {

                getPolicies(appointment).then((policy) => {
                    getBusinessData(appointment.business).then((businessData) => {
                        if (policy.deposit.enabled) {

                            fetchSession(businessData.stripe_acc_id, appointment, policy);

                        } else {
                            // Updates the appointment status and change the completed state
                            handleCompleted()
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
                status: "CONFIRMED"
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
    const handleSubmit = () => {

    }

    return (
        <div>
            {completed !== null ? <div>
                {Object.keys(appointmentData).length ? <div className='w-full h-screen overflow-x-hidden overflow-scroll flex py-10 justify-center'>
                    {!completed && options && promise ? <Elements
                        stripe={promise}
                        options={options}
                    >
                        <form onSubmit={handleSubmit}>
                            <PaymentElement className='w-full' />
                            <Button.Root disabled={!promise}>
                                <Button.Label>Book Appointment</Button.Label>
                            </Button.Root>
                        </form>
                    </Elements> : <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                        <div className='flex gap-3'>
                            <CircleCheckBig color='green' />
                            <Title>Appointment Confirmed</Title></div>
                        <div className='text-center'>
                            <Caption>If you have any questions regarding your appointment, please contact {"INSERT BUSINESS NAME"}</Caption>
                        </div>
                    </div>}
                </div> : <div>
                    <Text>Something went wrong :(</Text>
                </div>}
            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress />
            </div>}
        </div>
    )
}
