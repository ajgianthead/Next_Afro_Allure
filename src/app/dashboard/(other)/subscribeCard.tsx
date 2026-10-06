'use client'
import { Button, Card } from '@mui/joy';
import { Caption, Text } from '@tailus-ui/typography';
import { useUpgrade } from '@/features/billing/components/UpgradeDialog';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaCrown } from 'react-icons/fa';

const SubscribeCard = ({ customerID, hadTrial, businessID }: { customerID: string, hadTrial: boolean, businessID: string }) => {
    const router = useRouter()
    const [loading] = useState<boolean>(false)
    const { openUpgrade } = useUpgrade()
    return (
        <Card>
            <div className="flex flex-col gap-2">
                <Text className="font-medium mb-0 flex items-center gap-2"><FaCrown color='gold' />Subscribe to AfroAllure Growth</Text>
                <Caption>You are currently on the <b className='italic'>AfroAllure Starter Plan</b>. You must be<br /> subscribed to <b className='italic'>AfroAllure Growth</b> to access this feature.</Caption>
                <Button loading={loading} onClick={() => openUpgrade()} className="max-w-max flex justify-center items-center gap-1">Upgrade Plan</Button>
            </div>
        </Card>
    );
}

export default SubscribeCard;
