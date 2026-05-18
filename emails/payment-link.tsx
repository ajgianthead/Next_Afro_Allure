import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { PaymentLinkProps } from 'trigger/reminder'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { AppointmentDetailBlock } from './components/AppointmentDetailBlock'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

export default function PaymentLinkEmail(props: PaymentLinkProps) {
    const payUrl = `${BASE_URL}/appointments/${props.appointmentID}/business/${props.businessData.id}/eoa-payment`

    return (
        <Html lang="en">
            <Head />
            <Preview>{`Your appointment with ${props.businessData.name} is coming up — complete your payment to secure your spot.`}</Preview>
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
                                    Time to pay.
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
                                    Hi {props.clientData.firstName}, your appointment with {props.businessData.name} is coming up. Complete your payment whenever you're ready.
                                </Text>

                                <AppointmentDetailBlock
                                    service={props.serviceName}
                                />

                                <Row style={{ marginTop: 8 }}>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={payUrl}
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#1A1818',
                                                color: '#FAF7F2',
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                padding: '14px 28px',
                                                borderRadius: 999,
                                            }}
                                        >
                                            Pay for appointment
                                        </Link>
                                    </Column>
                                </Row>

                            </Column>
                        </Row>
                    </Section>

                    <EmailFooter />

                </Container>
            </Body>
        </Html>
    )
}

PaymentLinkEmail.PreviewProps = {
    serviceName: 'Loc Retwist',
    clientData: {
        firstName: 'Abijah',
        lastName: 'Nesbitt',
        email: 'abijah@example.com',
        phoneNumber: '555-0100',
    },
    businessData: {
        id: 'a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90',
        name: 'LadyPlutoLooks',
        email: 'ladyplutolooks@example.com',
    },
    appointmentID: '4561ec13-2406-4823-86fd-db3a188f7aa8',
} satisfies PaymentLinkProps
