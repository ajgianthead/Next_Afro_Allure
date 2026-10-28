import { Caption, Title } from '@tailus-ui/typography';
import { CircleCheckBig } from 'lucide-react';
import React from 'react';
import { ClearBookingProgress } from '@/features/automatedBooking/components/ClearBookingProgress';

const Page = () => {
    return (
        <div>
            <ClearBookingProgress />
            <div className='flex h-[500px] gap-2 px-5 flex-col w-full justify-center items-center'>
                <div className='flex gap-3'>
                    <CircleCheckBig color='green' />
                    <Title>Appointment Booked</Title></div>
                <div className='text-center'>
                    <Caption>Please check email for confirmation</Caption>
                </div>
            </div>
        </div>
    );
}

export default Page;
