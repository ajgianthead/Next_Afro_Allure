import { Button, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { DateTime } from "luxon";

export interface EmailTemplate {
    socials: {
        instagram: string;
    }
    customerID: string
    businessData: {
        id: string;
        name: string;
    }

}

export default function CancelledSubscription({ socials, customerID, businessData }: EmailTemplate) {
    return (
        <Tailwind config={{
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Helvetica', 'sans-serif'],

                    },
                },
            },
        }}>
            <Html className="px-5 font-sans">
                <Preview>Your AfroAllure Growth Subscription Has Been Cancelled ❌</Preview>
                <table align="center" role="presentation" style={{ margin: '0 auto' }}>
                    <tr>
                        <td align="center">
                            <Img src='https://res.cloudinary.com/dr5ztqpd3/image/upload/v1749588842/logo_transparent_background_single_lyghlm.png' alt="Logo" width="50" height="60" style={{
                                display: 'block'
                            }}
                            />
                        </td>
                    </tr>
                </table>
                <Container className="font-sans w-full text-center">
                    <Heading as="h2">Your AfroAllure Growth Subscription Has Been Cancelled ❌</Heading>
                </Container>
                <Hr />
                <Container className="font-sans">
                    <Text>Hi {businessData.name},<br /><br />


                        Your AfroAllure Growth subscription has been successfully cancelled.<br /><br />

                        Your account is still active — you’ve simply moved to the Starter (Free) plan.<br /><br />

                        Here’s what that means:<br /><br />

                        ✅ You Still Have Access To:<br /><br />

                        • Your public booking page<br />
                        • Discovery listing on AfroAllure<br />
                        • Up to 10 bookings per month<br />
                        • Basic credit/debit card payments<br />
                        • Account & profile access<br /><br />

                        ❌ Growth Features That Are Now Disabled:<br /><br />

                        • Unlimited bookings<br />
                        • Custom drag-and-drop website builder<br />
                        • Multiple payment options (Apple Pay, Google Pay, Cash App, etc.)<br />
                        • Automated email reminders<br />
                        • Business analytics & insights<br /><br />

                        If you’re simplifying, restructuring, or taking a slower season — that’s completely understandable. Your business is still visible, and you can continue booking within Starter limits.<br /><br />

                        Whenever you're ready to scale again, upgrading back to Growth instantly restores all premium features.<br /><br /></Text>

                    <Container className="font-sans">
                        <div className="text-center">
                            <Button href={`${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/growthSubscription?customerID=${customerID}`} className="bg-black text-white p-5 font-bold rounded">Upgrade Plan</Button>
                        </div>
                    </Container><br /><br />

                    <Text>Thank you for being part of AfroAllure. We’re building this platform for beauty professionals like you — and we’re always improving.<br /><br />

                        If there’s anything we could have done better, just reply to this email. I read every message.<br /><br />

                        Wishing you continued success,<br /><br />

                        —<br />
                        Abijah Nesbitt<br />
                        Founder, AfroAllure<br />
                        Helping Black Beauty Businesses Thrive<br /></Text>




                </Container>
                <Hr />

                <Container className=" flex flex-col">
                    <Text className="">Stay connected with us!</Text>
                    <Container className="flex flex-col">
                        <ul className="list-none mt-0">
                            <li><Link href={socials.instagram}>📸 Instagram</Link></li>
                        </ul>
                    </Container>
                </Container>
                <Container className="mt-5">
                    <Text className="m-0">Warm regards,</Text>
                    <Text className="m-0">The AfroAllure Team</Text>
                </Container>
                <Container className="text-center my-5 font-thin">
                    <Container className="mt-5">
                        <Text className="m-0">{`Copyright (C) ${new Date().getFullYear()} AfroAllure. All rights reserved.`}</Text>
                    </Container>
                    <Container className="mt-5">
                        <Text className="m-0">Want to change how you receive these emails?</Text>
                        <Text className="m-0">You can update your preferences or unsubscribe</Text>
                    </Container>
                </Container>

            </Html>
        </Tailwind>

    );
}

CancelledSubscription.PreviewProps = {
    socials: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://x.com'
    },
    customerID: "cus-123",
    clientData: {
        firstName: "Abijah",
        lastName: "Nesbitt",
    },
    businessData: {
        id: "a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90",
        name: "LadyPlutoLooks",
        businessAddress: "2800 SW 35th Place, Apt 1508A, Gainesville, FL, 32608",
    },
    appointmentData: {
        id: "4561ec13-2406-4823-86fd-db3a188f7aa8",
        start: "2025-06-11T03:37:37.400Z",
        end: "2025-06-12T05:37:37.400Z",
    },
}
