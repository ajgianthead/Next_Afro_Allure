import { Button, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { DateTime } from "luxon";

export interface EmailTemplate {
    socials: {
        instagram: string;
    }
    businessData: {
        id: string;
        name: string;
    }

}

export default function NewSubscription({ socials, businessData }: EmailTemplate) {
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
                <Preview>Welcome to AfroAllure Growth 🚀 Let’s Build Your Beauty Empire</Preview>
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
                    <Heading as="h2">Welcome to AfroAllure Growth 🚀<br /> Let’s Build Your Beauty Empire</Heading>
                </Container>
                <Hr />
                <Container className="font-sans">
                    <Text>Hi {businessData.name},
                        <br />
                        <br />
                        Welcome to AfroAllure Growth 🎉
                        <br />
                        <br />
                        You just upgraded from being discovered to building real momentum.
                        <br />
                        AfroAllure was created to help Black beauty professionals stand out, attract aligned clients, and grow sustainably — without competing in oversaturated spaces. And now you have access to everything you need to scale.
                        <br />
                        <br />
                        Here’s what’s unlocked for you:
                        <br />
                        <br />
                        ✨ Unlimited Bookings<br />
                        No caps. No restrictions. Book as many clients as you can handle.
                        <br />
                        <br />
                        🌍 Custom Drag-and-Drop Website Builder<br />
                        Design a fully branded booking website that feels like you.<br />
                        Customize sections, images, services, layout, and messaging.
                        <br />
                        <br />
                        💳 Multiple Payment Processing Options<br />
                        Accept credit/debit cards, Apple Pay, Google Pay, Cash App, and more<br />
                        (3% transaction fee applies to all processed payments.)
                        <br /><br />
                        📩 Automated Email Reminders<br />
                        Reduce no-shows and keep clients informed automatically.
                        <br /><br />
                        📊 Business Insights & Analytics<br />
                        Track bookings, revenue, and performance so you can grow intentionally.
                        <br /><br />

                        If you ever need help, just reply to this email. We’re building this platform with you, not just for you.
                        <br /><br />
                        Let’s grow your brand.
                        <br /><br />
                        —<br />
                        The AfroAllure Team<br />
                        Helping Black Beauty Businesses Thrive</Text>
                </Container>
                <Hr />
                <Container className="font-sans mt-5">
                    <div className="text-center">
                        <Button href={`${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/dashboard/appointments`} className="bg-black text-white p-5 font-bold rounded">Manage Subscription</Button>
                    </div>
                </Container>
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

NewSubscription.PreviewProps = {
    socials: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        twitter: 'https://x.com'
    },
    serviceName: "Loc Retwist",
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
