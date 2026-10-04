import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview } from '@react-email/components'
import { DateTime } from 'luxon'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { AppointmentDetailBlock } from './components/AppointmentDetailBlock'

export interface RefundIssuedProps {
    clientData: { firstName: string; lastName: string }
    businessData: { id: string; name: string; businessAddress: string }
    appointmentData: { id: string; start: string; end: string }
    serviceName: string
    amountRefunded: number
    /** The refund hasn't settled yet (e.g. some bank payment methods). */
    pending: boolean
    /** The appointment was cancelled as part of this refund. */
    cancelled: boolean
    socials: { instagram: string }
}

export default function RefundIssuedEmail({ clientData, businessData, appointmentData, serviceName, amountRefunded, pending, cancelled }: RefundIssuedProps) {
    const date = DateTime.fromISO(appointmentData.start, { setZone: true }).toFormat('cccc, LLLL d, yyyy')
    const time = DateTime.fromISO(appointmentData.start, { setZone: true }).toFormat('h:mm a')
    const amount = `$${(amountRefunded / 100).toFixed(2)}`

    return (
        <Html lang="en">
            <Head />
            <Preview>{`${businessData.name} has refunded you ${amount}.`}</Preview>
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
                                    {pending ? 'Your refund is on its way.' : 'You’ve been refunded.'}
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
                                    Hi {clientData.firstName}, {businessData.name} has issued you a refund of {amount} for
                                    your {serviceName} appointment{cancelled ? ', which has been cancelled' : ''}.
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
                                    The refund goes back to the payment method you used. It usually appears within
                                    5–10 business days, depending on your bank. If you have any questions, reach out
                                    to {businessData.name} directly.
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

RefundIssuedEmail.PreviewProps = {
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
    amountRefunded: 5000,
    pending: false,
    cancelled: true,
} satisfies RefundIssuedProps
