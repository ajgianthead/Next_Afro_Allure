import { Typography } from '@mui/joy';
import { Caption } from '@tailus-ui/typography';
import React from 'react';

export const metadata = {
    title: 'Terms of Service | AfroAllure',
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
                <Typography level='h1'>AFROALLURE TERMS OF SERVICE
                </Typography>
                <div className='flex flex-col gap-1'>
                    <Caption>Effective Date: 8/12/2025</Caption>
                    <Caption>Last Updated: 8/12/2025</Caption>
                </div>
            </div>
            <div className='my-5'>
                <Typography>
                    Welcome to AfroAllure! These Terms of Service (“Terms”) govern your access to and use of the AfroAllure platform, products, and services (“Services”). Please read them carefully.
                </Typography>
            </div>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>1. Acceptance of Terms</Typography>
                    <Typography>By creating an account or using our Services, you agree to these Terms and our Privacy Policy.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>2. Eligibility</Typography>
                    <Typography>You must be at least 18 years old (or the legal age in your jurisdiction) to use AfroAllure.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>3. Accounts</Typography>
                    <Typography>You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>4. Use of Services</Typography>
                    <Typography>You agree to use AfroAllure only for lawful purposes and in accordance with these Terms. You may not:</Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li>Violate any applicable laws</li>
                            <li>Harass, abuse, or harm others</li>
                            <li>Upload harmful code or content</li>
                        </ul>
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>5. Payments & Fees</Typography>
                    <Typography>If you make payments through AfroAllure, you agree to pay all applicable fees. Transaction processing is handled through third-party providers like Stripe, subject to their terms.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>6. Intellectual Property</Typography>
                    <Typography>All AfroAllure content, branding, and software are owned by AfroAllure or its licensors. You may not copy, modify, or distribute without permission.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>7. Disclaimers</Typography>
                    <Typography>AfroAllure is provided “AS IS” and “AS AVAILABLE” without warranties of any kind.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>8. Limitation of Liability</Typography>
                    <Typography>AfroAllure is not liable for indirect, incidental, special, or consequential damages, or for loss of data, revenue, or profits.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>9. Changes to Terms</Typography>
                    <Typography>We may update these Terms at any time. Continued use of the Services after changes means you accept the updated Terms.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>10. Governing Law</Typography>
                    <Typography>These Terms are governed by the laws of the State of Florida.</Typography>
                </div>
            </div>
        </div>
    );
}

export default Page;
