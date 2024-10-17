"use client"

import { loadStripe } from '@stripe/stripe-js'
import Card from '@tailus-ui/Card'
import { Caption, Title } from '@tailus-ui/typography'
import React from 'react'
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { CircleCheckBig } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
    stripeAccount: "acct_1Q6tUcFpD7KoueRC",
});

export default async function page() {
    // const fetchSession = async () => {
    //     const response = await fetch("http://127.0.0.1:3000/api/checkout", {
    //         method: "POST",
    //         body: JSON.stringify({
    //             connectedAccountId: "acct_1Q6tUcFpD7KoueRC",
    //         }),
    //     });
    //     if (!response.ok) {
    //         // Handle errors on the client side here
    //         const { error } = await response.json();
    //         throw new Error("An error occurred: ", error);
    //     } else {
    //         const val = await response.json();
    //         console.log(val.clientSecret);

    //         return val.clientSecret
    //     }
    // }
    // const clientSecret = await
    //     fetchSession();
    // const options = { clientSecret }
    return (
        <div className='w-full h-screen overflow-x-hidden overflow-scroll flex py-10 justify-center'>
            {/* {clientSecret && <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={options}
            >
                <EmbeddedCheckout className='w-full' />
            </EmbeddedCheckoutProvider>} */}

            <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
                <div className='flex gap-3'>
                    <CircleCheckBig color='green' />
                    <Title>Appointment Confirmed</Title></div>
                <div className='text-center'>
                    <Caption>If you have any questions regarding your appointment, please contact LadyPlutoLooks</Caption>
                </div>
            </div>


        </div>
    )
}
