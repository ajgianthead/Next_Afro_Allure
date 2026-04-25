import { Container, Heading, Hr, Html, Img, Link, Preview, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { DateTime } from "luxon";

export interface EOAReceiptProps {
    clientData: { firstName: string; lastName: string }
    businessData: { id: string; name: string; businessAddress: string }
    appointmentData: { id: string; start: string; end: string }
    serviceName: string
    amountPaid: number
    socials: { instagram: string }
}

export default function EOAReceiptEmail({ clientData, businessData, appointmentData, serviceName, amountPaid, socials }: EOAReceiptProps) {
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
                <Preview>{`Payment received — thank you, ${clientData.firstName}!`}</Preview>
                <table align="center" role="presentation" style={{ margin: '0 auto' }}>
                    <tr>
                        <td align="center">
                            <Img
                                src="https://res.cloudinary.com/dr5ztqpd3/image/upload/v1749588842/logo_transparent_background_single_lyghlm.png"
                                alt="Logo"
                                width="50"
                                height="60"
                                style={{ display: 'block' }}
                            />
                        </td>
                    </tr>
                </table>
                <Container className="font-sans w-full text-center">
                    <Heading as="h2">Payment Received ✅</Heading>
                    <Text>{`Hi ${clientData.firstName}, thank you for your payment! Here's your receipt for your appointment with ${businessData.name}.`}</Text>
                </Container>
                <Hr />
                <Container className="font-sans">
                    <ul>
                        <li>{`📆 Date: ${DateTime.fromISO(appointmentData.start).toFormat('LLLL dd, yyyy')}`}</li>
                        <li>{`⏰ Time: ${DateTime.fromISO(appointmentData.start).toLocaleString(DateTime.TIME_SIMPLE)}`}</li>
                        <li>{`📍 Location: ${businessData.businessAddress}`}</li>
                        <li>{`💇 Service(s): ${serviceName}`}</li>
                        <li>{`💳 Amount Paid: $${(amountPaid / 100).toFixed(2)}`}</li>
                    </ul>
                </Container>
                <Container className="font-sans mt-5">
                    <Text>{`We hope you enjoyed your experience. If you have any questions, feel free to reach out to ${businessData.name}.`}</Text>
                </Container>
                <Container className="flex flex-col">
                    <Text>Stay connected with us!</Text>
                    <ul className="list-none mt-0">
                        <li><Link href={socials.instagram}>📸 Instagram</Link></li>
                    </ul>
                </Container>
                <Container className="mt-5">
                    <Text className="m-0">Warm regards,</Text>
                    <Text className="m-0">The AfroAllure Team</Text>
                </Container>
                <Container className="text-center my-5 font-thin">
                    <Text className="m-0">{`Copyright (C) ${new Date().getFullYear()} AfroAllure. All rights reserved.`}</Text>
                </Container>
            </Html>
        </Tailwind>
    );
}

EOAReceiptEmail.PreviewProps = {
    socials: { instagram: 'https://instagram.com/afroallure_' },
    serviceName: "Loc Retwist",
    clientData: { firstName: "Abijah", lastName: "Nesbitt" },
    businessData: {
        id: "a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90",
        name: "LadyPlutoLooks",
        businessAddress: "2800 SW 35th Place, Apt 1508A, Gainesville, FL, 32608",
    },
    appointmentData: {
        id: "4561ec13-2406-4823-86fd-db3a188f7aa8",
        start: "2025-06-11T03:37:37.400Z",
        end: "2025-06-11T05:37:37.400Z",
    },
    amountPaid: 15000,
} satisfies EOAReceiptProps;
