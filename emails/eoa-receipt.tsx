import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview } from '@react-email/components'
import { DateTime } from 'luxon'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { AppointmentDetailBlock } from './components/AppointmentDetailBlock'

export interface EOAReceiptProps {
    clientData: { firstName: string; lastName: string }
    businessData: { id: string; name: string; businessAddress: string }
    appointmentData: { id: string; start: string; end: string }
    serviceName: string
    amountPaid: number
    socials: { instagram: string }
}

export default function EOAReceiptEmail({ clientData, businessData, appointmentData, serviceName, amountPaid }: EOAReceiptProps) {
    const date = DateTime.fromISO(appointmentData.start).toFormat('cccc, LLLL d, yyyy')
    const time = DateTime.fromISO(appointmentData.start).toFormat('h:mm a')
    const amount = `$${(amountPaid / 100).toFixed(2)}`

    return (
        <Html lang="en">
            <Head />
            <Preview>{`Payment received — thank you, ${clientData.firstName}! You're all set with ${businessData.name}.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>

                    <EmailHeader />

                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>

                                <Text
                                    style={{
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        fontSize: 32,
                                        color: '#1A1818',
                                        fontWeight: 'normal',
                                        margin: '0 0 12px 0',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Payment received.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 15,
                                        color: '#3A3532',
                                        margin: '0 0 8px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Hi {clientData.firstName}, thank you for your payment. Here's your receipt for your appointment with {businessData.name}.
                                </Text>

                                <AppointmentDetailBlock
                                    date={date}
                                    time={time}
                                    service={serviceName}
                                    location={businessData.businessAddress}
                                    amount={amount}
                                />

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#6F6863',
                                        margin: '16px 0 0 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    We hope you enjoy your appointment. If you have any questions, reach out to {businessData.name} directly.
                                </Text>

                            </Column>
                        </Row>
                    </Section>

                    <EmailFooter showUnsubscribe />

                </Container>
            </Body>
        </Html>
    )
}

EOAReceiptEmail.PreviewProps = {
    socials: { instagram: 'https://instagram.com/afroallure_' },
    serviceName: 'Loc Retwist',
    clientData: { firstName: 'Abijah', lastName: 'Nesbitt' },
    businessData: {
        id: 'a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90',
        name: 'LadyPlutoLooks',
        businessAddress: '2800 SW 35th Place, Gainesville, FL 32608',
    },
    appointmentData: {
        id: '4561ec13-2406-4823-86fd-db3a188f7aa8',
        start: '2025-09-18T15:00:00.000Z',
        end: '2025-09-18T17:00:00.000Z',
    },
    amountPaid: 15000,
} satisfies EOAReceiptProps
