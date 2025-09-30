'use client'

import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useParams } from 'next/navigation';

const PaymentStatus = ({ stripeID }: { stripeID: any }) => {

    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const something = async () => {

            const stripe = await loadStripe(process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!, {
                stripeAccount: stripeID
            });
            if (!stripe) {
                return;
            }

            // Retrieve the "payment_intent_client_secret" query parameter appended to
            // your return_url by Stripe.js
            const clientSecret = new URLSearchParams(window.location.search).get(
                'payment_intent_client_secret'
            );

            // Retrieve the PaymentIntent
            stripe
                .retrievePaymentIntent(clientSecret!)
                .then(({ paymentIntent }) => {
                    // Inspect the PaymentIntent `status` to indicate the status of the payment
                    // to your customer.
                    //
                    // Some payment methods will [immediately succeed or fail][0] upon
                    // confirmation, while others will first enter a `processing` state.
                    //
                    // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
                    switch (paymentIntent?.status) {
                        case 'succeeded':
                            setMessage('Success! Payment received.');
                            break;

                        case 'processing':
                            setMessage("Payment processing. We'll update you when payment is received.");
                            break;

                        case 'requires_payment_method':
                            // Redirect your user back to your payment page to attempt collecting
                            // payment again
                            setMessage('Payment failed. Please try another payment method.');
                            break;

                        default:
                            setMessage('Something went wrong.');


                            break;
                    }
                }).catch((error) => {


                });
        }
        (async () => {
            await something()
        })()

    }, []);


    return <div>{message}</div>;
};

export default function CompleteClient() {
    const params = useParams();

    const id = params.stripeID
    return (
        <div>
            <PaymentStatus stripeID={id} />
        </div>
    )
}


