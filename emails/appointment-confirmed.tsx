import { Button, Container, Font, Head, Heading, Hr, Html, Img, Link, Preview, Tailwind, Text } from "@react-email/components";
import * as React from "react";
import { DateTime } from "luxon";
import { EmailTemplate } from "./new-appointment";



export default function AppointmentConfirmed({ socials, serviceName, clientData, businessData, appointmentData }: EmailTemplate) {
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
                <Preview>{`Hi ${clientData.firstName},
We’re thrilled to let you know that your appointment with ${businessData.name}`}</Preview>
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
                    <Heading as="h2">Appointment Confirmed 🎉</Heading>
                    <Text>{`Hi ${clientData.firstName},
We’re thrilled to let you know that your appointment with ${businessData.name} has been confirmed! Here are the details for your upcoming visit:`}</Text>
                </Container>
                <Hr />
                <Container className="font-sans">
                    <ul>
                        <li>{`📆 Date: ${DateTime.fromISO(appointmentData.start).toFormat('LLLL dd, yyyy')}`}</li>
                        <li>{`⏰ Time: ${DateTime.fromISO(appointmentData.start).toLocaleString(DateTime.TIME_SIMPLE)}`}</li>
                        <li>{`📍 Location: ${businessData.businessAddress}`}</li>
                        <li>{`💇 Service(s): ${serviceName}`}</li>
                    </ul>
                </Container>
                <Container className="font-sans mt-5">
                    <Text>{`Please arrive on time to ensure the best possible experience. If you have any questions or need to make changes, contact ${businessData.name}`}</Text>
                </Container>
                <Container className="w-full">
                    <Text>🔄 Need to Make Changes?</Text>
                    <ul className="mt-0 list-none">
                        <li><Link href={`https://${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${appointmentData.id}/business/${businessData.id}/reschedule`}>Reschedule your appointment</Link></li>
                        <li><Link href={`https://${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${appointmentData.id}/business/${businessData.id}/cancel`}>Cancel your appointment</Link></li>
                    </ul>
                </Container>

                <Container className=" flex flex-col">
                    <Text className="">Stay connected with us!</Text>
                    <Container className="flex flex-col">
                        <ul className="list-none mt-0">
                            <li><Link href={socials.facebook}>🌐 Facebook</Link></li>
                            <li><Link href={socials.instagram}>📸 Instagram</Link></li>
                            <li><Link href={socials.twitter}>🐦 Twitter</Link></li>
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

AppointmentConfirmed.PreviewProps = {
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
