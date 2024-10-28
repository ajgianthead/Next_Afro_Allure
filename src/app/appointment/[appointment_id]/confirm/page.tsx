"use client"

import { loadStripe } from '@stripe/stripe-js'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import React, { useEffect, useState } from 'react'
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'
import { useParams } from 'next/navigation'

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
        const fetchSession = async () => {
            const response = await fetch("http://localhost:3000/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    connectedAccountId: "acct_1Q6tUcFpD7KoueRC",
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
            }
        }
        const getPolicies = async (data: any) => {
            const response = await fetch(`http://localhost:3000/api/policies/${data.business}`, {
                method: "GET",
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const result = await response.json();
                // setPolicies(result.booking_policies)
                return result.policies
            }
        }
        fetchAppointment().then((appointment) => {
            getPolicies(appointment).then((policies) => {
                if (policies.deposit.enabled) {
                    fetchSession();
                } else {
                    // Updates the appointment status and change the completed state
                    handleCompleted()
                }
            });
        })
    }, []);
    const [completed, setCompleted] = useState(Object.keys(appointmentData).length ? appointmentData.status === "ACCEPTED" : false);
    const handleCompleted = async () => {
        // Update the appointment status, then change the completed state
        const response = await fetch(`http://localhost:3000/api/appointments`, {
            method: "PUT",
            body: JSON.stringify({
                id: appointment_id,
                start: appointmentData.start,
                end: appointmentData.end,
                status: "ACCEPTED"
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
            {appointmentData ? <div className='w-full h-screen overflow-x-hidden overflow-scroll flex py-10 justify-center'>
                {!completed && options ? <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={options}

                >
                    <EmbeddedCheckout className='w-full' />
                </EmbeddedCheckoutProvider> : <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                    <div className='flex gap-3'>
                        <CircleCheckBig color='green' />
                        <Title>Appointment Confirmed</Title></div>
                    <div className='text-center'>
                        <Caption>If you have any questions regarding your appointment, please contact LadyPlutoLooks</Caption>
                    </div>
                </div>}
            </div> : <div>
                <Text>Something went wrong :(</Text>
            </div>}
        </div>
    )
}
