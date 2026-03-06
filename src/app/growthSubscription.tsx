import { CircularProgress } from '@mui/joy';
import React from 'react';
import { createSubscriptionForExistingCustomer } from './for-businesses/actions';
import { redirect } from 'next/navigation';

const Subscription = async ({
    searchParams,
}: {
    searchParams: { [key: string]: any };
}) => {
    const customerID = searchParams.customerID || ''
    const checkout = await createSubscriptionForExistingCustomer(customerID)
    redirect(checkout.url!)
    return (
        <div className='flex justify-center w-full h-screen items-center'>
            <CircularProgress size='lg' />
        </div>
    );
}

export default Subscription;
