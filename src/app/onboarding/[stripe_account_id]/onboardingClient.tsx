'use client'
import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation';
import { ConnectAccountOnboarding, ConnectComponentsProvider } from "@stripe/react-connect-js";
import useStripeConnect from '@utils/hooks/useStripeConnect';
import CircularProgress from '@mui/joy/CircularProgress';

export default function OnboardingClient() {
    const accountID = useParams().stripe_account_id as string;
    const router = useRouter();
    useEffect(() => {
        const fetchLink = async () => {
            const res = await fetch("http://localhost:3000/api/accountLink", {
                method: "POST",
                body: JSON.stringify({
                    account: accountID
                })
            })
            const link = await res.json()
            router.replace(link.link)
        }
        fetchLink()
    }, []);
    return (
        <div className='flex justify-center items-center w-screen h-screen'>
            <CircularProgress />
        </div>
    )
}
