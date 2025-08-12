import { Typography } from '@mui/joy';
import { Caption } from '@tailus-ui/typography';
import React from 'react';

export const metadata = {
    title: 'Beta User Agreement | AfroAllure',
};

const Page = () => {
    return (
        <div style={{
            fontFamily: 'Inter',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 50
        }}>
            <div className='flex gap-2 flex-col'>
                <Typography level='h1'>AFROALLURE BETA PARTICIPATION AGREEMENT</Typography>
                <div className='flex flex-col gap-1'>
                    <Caption>Effective Date: 8/12/2025</Caption>
                    <Caption>Last Updated: 8/12/2025</Caption>
                </div>
            </div>
            <div className='my-5'>
                <Typography>
                    This Beta Participation Agreement (“Agreement”) is between you (“Participant,” “you,” or “your”) and AfroAllure, owned and operated by Abijah Nesbitt (“AfroAllure,” “we,” “our,” or “us”). By accessing or using the AfroAllure beta platform (“Beta”), you agree to the following:
                </Typography>
            </div>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>1. Purpose of Beta</Typography>
                    <Typography>The Beta is a pre-release version of AfroAllure provided for testing, evaluation, and feedback purposes only. Features may be incomplete, contain errors, or change without notice.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>2. License & Restrictions</Typography>
                    <Typography>We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Beta solely for its intended purpose. You may not:</Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li>Copy, modify, or distribute the Beta</li>
                            <li>Reverse engineer or attempt to extract source code</li>
                            <li>Use the Beta for illegal purposes or to harm others</li>
                        </ul>
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>3. Confidentiality</Typography>
                    <Typography>You agree not to share screenshots, recordings, or details about unreleased features without our written consent.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>4. Disclaimer of Warranties</Typography>
                    <Typography>The Beta is provided “AS IS” without warranties of any kind. AfroAllure disclaims all express or implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>5. Limitation of Liability</Typography>
                    <Typography>To the fullest extent permitted by law, AfroAllure is not liable for any damages, including loss of data, profits, or business opportunities, arising from your participation in the Beta.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>6. Feedback</Typography>
                    <Typography>Any feedback you provide becomes AfroAllure’s property, and we may use it without obligation to you.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>7. Termination</Typography>
                    <Typography>We may suspend or terminate your Beta access at any time. You may stop participation at any time.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>8. Governing Law</Typography>
                    <Typography>This Agreement is governed by the laws of the State of Florida, without regard to conflict of law principles.
                    </Typography>
                </div>
            </div>
        </div>
    );
}

export default Page;
