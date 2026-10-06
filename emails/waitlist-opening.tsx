import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview, Button } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

export interface WaitlistOpeningProps {
    clientFirstName: string
    businessName: string
    /** e.g. "Thursday, March 5" */
    date: string
    /** e.g. "10:00 AM" */
    time: string
    bookingUrl: string
}

const serif = "Georgia, 'Times New Roman', serif"
const sans = 'Arial, Helvetica, sans-serif'

export default function WaitlistOpeningEmail({ clientFirstName, businessName, date, time, bookingUrl }: WaitlistOpeningProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`A spot just opened with ${businessName} on ${date} at ${time}.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>
                    <EmailHeader />
                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>
                                <Text style={{ fontFamily: serif, fontSize: 30, color: '#1A1818', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                                    A spot just opened up.
                                </Text>
                                <Text style={{ fontFamily: sans, fontSize: 15, color: '#3A3532', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                                    Hi {clientFirstName}, you asked {businessName} to let you know when a time opened up.
                                    One just did:
                                </Text>
                                <Section style={{ backgroundColor: '#FAF7F2', borderRadius: 12, margin: '0 0 24px 0' }}>
                                    <Row>
                                        <Column style={{ padding: '18px 20px', textAlign: 'center' }}>
                                            <Text style={{ fontFamily: serif, fontSize: 22, color: '#1A1818', margin: 0 }}>{date}</Text>
                                            <Text style={{ fontFamily: sans, fontSize: 15, color: '#3A3532', margin: '4px 0 0 0' }}>{time}</Text>
                                        </Column>
                                    </Row>
                                </Section>
                                <Section style={{ textAlign: 'center' }}>
                                    <Button
                                        href={bookingUrl}
                                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontFamily: sans, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}
                                    >
                                        Book this time
                                    </Button>
                                </Section>
                                <Text style={{ fontFamily: sans, fontSize: 13, color: '#6F6863', margin: '20px 0 0 0', lineHeight: 1.6 }}>
                                    Other people on the waitlist were told too, so it goes to whoever books first.
                                    The time isn't held for you.
                                </Text>
                            </Column>
                        </Row>
                    </Section>
                    <EmailFooter />
                </Container>
            </Body>
        </Html>
    )
}

WaitlistOpeningEmail.PreviewProps = {
    clientFirstName: 'Ama',
    businessName: 'LadyPlutoLooks',
    date: 'Thursday, March 5',
    time: '10:00 AM',
    bookingUrl: 'https://ladyplutolooks.afroallure.co/book',
} satisfies WaitlistOpeningProps
