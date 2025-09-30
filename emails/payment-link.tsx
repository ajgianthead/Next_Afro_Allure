import { Button, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { DateTime } from "luxon";
import { PaymentLinkProps } from "trigger/reminder";

export interface EmailTemplate {
    socials: {
        facebook: string;
        instagram: string;
        twitter: string;
    }
    serviceName: string;
    clientData: {
        firstName: string;
        lastName: string;
    }
    businessData: {
        id: string;
        name: string;
        businessAddress?: string;
    }
    appointmentData: {
        id: string;
        start: string;
        end: string;
    }
}

export default function PaymentLinkEmail(props: PaymentLinkProps) {
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
                <Preview>{`You have an appointment with ${props.clientData.firstName}`}</Preview>
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
                    <Heading as="h2">💸 It's About That Time 💸</Heading>
                    <Text>{`Whenever you're ready, click the link below to pay for your appointment`}</Text>
                </Container>
                <Hr />
                <Container className="font-sans">
                    <ul>
                        <li>{`💇 Service(s): ${props.serviceName}`}</li>
                    </ul>
                </Container>
                <Hr />
                <Container className="font-sans mt-5">
                    <div className="text-center">
                        <Button href={`${process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BASE_URL : process.env.NEXT_PUBLIC_PROD_BASE_URL}/appointments/${props.appointmentID}/business/${props.businessData.id}/eoa-payment`} className="bg-black text-white p-5 font-bold rounded">Pay for Appointment</Button>
                    </div>
                </Container>
                <Container className=" flex flex-col">
                    <Text className="">Stay connected with us!</Text>
                    <Container className="flex flex-col">
                        <ul className="list-none mt-0">
                            <li><Link href={"https://facebook.com"}>🌐 Facebook</Link></li>
                            <li><Link href={"https://instagram.com"}>📸 Instagram</Link></li>
                            <li><Link href={"https://x.com"}>🐦 Twitter</Link></li>
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

PaymentLinkEmail.PreviewProps = {
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
    },
    appointmentID: "4561ec13-2406-4823-86fd-db3a188f7aa8"
}
