import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { DateTime } from 'luxon'
import { EmailTemplate } from './new-appointment'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'
import { AppointmentDetailBlock } from './components/AppointmentDetailBlock'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

export default function AppointmentConfirmed({ serviceName, clientData, businessData, appointmentData }: EmailTemplate) {
    const date = DateTime.fromISO(appointmentData.start).toFormat('cccc, LLLL d, yyyy')
    const time = DateTime.fromISO(appointmentData.start).toFormat('h:mm a')
    const rescheduleUrl = `${BASE_URL}/appointment/${appointmentData.id}/business/${businessData.id}/reschedule`
    const cancelUrl = `${BASE_URL}/appointment/${appointmentData.id}/business/${businessData.id}/cancel`

    return (
        <Html lang="en">
            <Head />
            <Preview>{`You're confirmed with ${businessData.name} — ${date} at ${time}.`}</Preview>
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
                                    Your appointment is confirmed.
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
                                    Hi {clientData.firstName}, you're all set with {businessData.name}. We'll see you soon.
                                </Text>

                                <AppointmentDetailBlock
                                    date={date}
                                    time={time}
                                    service={serviceName}
                                />

                                <Row style={{ marginTop: 8 }}>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Text
                                            style={{
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 11,
                                                color: '#6F6863',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                margin: '0 0 14px 0',
                                            }}
                                        >
                                            Need to make changes?
                                        </Text>
                                        <Link
                                            href={rescheduleUrl}
                                            style={{
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 14,
                                                color: '#1A1818',
                                                textDecoration: 'underline',
                                                marginRight: 24,
                                            }}
                                        >
                                            Reschedule
                                        </Link>
                                        <Link
                                            href={cancelUrl}
                                            style={{
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 14,
                                                color: '#6F6863',
                                                textDecoration: 'underline',
                                            }}
                                        >
                                            Cancel
                                        </Link>
                                    </Column>
                                </Row>

                            </Column>
                        </Row>
                    </Section>

                    <EmailFooter showUnsubscribe />

                </Container>
            </Body>
        </Html>
    )
}

AppointmentConfirmed.PreviewProps = {
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
} satisfies EmailTemplate
