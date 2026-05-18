import { Caption, Title } from '@tailus-ui/typography';
import { CircleCheckBig } from 'lucide-react';
import React from 'react';

const Page = () => {
    return (
        <div>
            <div className='flex h-[500px] gap-2 px-5 flex-col w-screen justify-center items-center'>
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
