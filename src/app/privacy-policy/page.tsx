import { Typography } from '@mui/joy';
import { Caption } from '@tailus-ui/typography';
import React from 'react';

export const metadata = {
    title: 'Privacy Policy | AfroAllure',
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
                <Typography level='h1'>AfroAllure Privacy Policy
                </Typography>
                <div className='flex flex-col gap-1'>
                    <Caption>Effective Date: 8/12/2025</Caption>
                    <Caption>Last Updated: 8/12/2025</Caption>
                </div>
            </div>
            <div className='my-5'>
                <Typography>
                    Abijah Nesbitt (“AfroAllure,” “we,” “our,” or “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our platform, mobile app, or other services (“Services”).
                </Typography>
            </div>
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>1. Information We Collect</Typography>
                    <Typography>We may collect the following types of information:</Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, business information, payment details (via third-party processors like Stripe).</li>
                            <li><strong>Usage Data:</strong> IP address, browser type, device information, pages viewed, and actions taken on our platform.</li>
                            <li><strong>Booking & Transaction Data:</strong> Appointment details, payment history, and service preferences.</li>
                        </ul>
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>2. How We Use Your Information</Typography>
                    <Typography>We use your information to:</Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li>Provide and operate our Services</li>
                            <li>Process bookings and payments</li>
                            <li>Communicate with you about your account and updates</li>
                            <li>Improve and customize our Services</li>
                            <li>Detect and prevent fraud or abuse</li>
                        </ul>
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>3. How We Share Your Information</Typography>
                    <Typography>We do not sell your personal information. We may share it with:</Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li><strong>Service providers</strong> (e.g., payment processors, hosting providers, analytics tools)</li>
                            <li><strong>Other users</strong> you interact with on AfroAllure (e.g., stylists see client booking info)</li>
                            <li><strong>Legal authorities</strong> if required by law or to protect rights and safety</li>
                        </ul>
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>4. Cookies & Tracking</Typography>
                    <Typography>We use cookies and similar technologies to improve site performance and analyze usage. You can control cookies through your browser settings.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>5. Data Storage & Security</Typography>
                    <Typography>We store data securely and take reasonable measures to protect it. However, no method of transmission or storage is 100% secure.</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>6. Your Rights</Typography>
                    <Typography>Depending on your location, you may have rights to:
                    </Typography>
                    <Typography>
                        <ul className=' list-disc pl-5'>
                            <li>Access, correct, or delete your personal information</li>
                            <li>Opt out of certain data processing activities</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </Typography>
                    <Typography>To make a request, contact us at [your email address].</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>7. Third-Party Services</Typography>
                    <Typography>Our Services may link to third-party websites or services. We are not responsible for their privacy practices.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>8. Changes to This Policy</Typography>
                    <Typography>We may update this Privacy Policy from time to time. We will post the updated version and update the “Last Updated” date.
                    </Typography>
                </div>
                <div className='flex flex-col gap-2'>
                    <Typography level='h2'>9. Contact Us</Typography>
                    <Typography>If you have questions, contact us at:</Typography>
                    <div className='flex flex-col'>
                        <Typography>Abijah Nesbitt</Typography>
                        <Typography>Email: abijahnesbitt@afroallure.co</Typography>
                        <Typography>Location: Florida, USA</Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
