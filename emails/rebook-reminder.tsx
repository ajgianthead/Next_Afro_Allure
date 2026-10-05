import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview, Button } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

export interface RebookReminderProps {
    clientFirstName: string
    businessName: string
    serviceName: string
    /** e.g. "6 weeks" */
    sinceText: string
    bookingUrl: string
}

const serif = "Georgia, 'Times New Roman', serif"
const sans = 'Arial, Helvetica, sans-serif'

export default function RebookReminderEmail({ clientFirstName, businessName, serviceName, sinceText, bookingUrl }: RebookReminderProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`It's almost time for your next ${serviceName} with ${businessName}.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>
                    <EmailHeader />
                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>
                                <Text style={{ fontFamily: serif, fontSize: 30, color: '#1A1818', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                                    Time for your next {serviceName}?
                                </Text>
                                <Text style={{ fontFamily: sans, fontSize: 15, color: '#3A3532', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                                    Hi {clientFirstName}, it&apos;s been about {sinceText} since your last {serviceName} with {businessName}.
                                    Book now to keep your style fresh and get the time that works for you before it&apos;s taken.
                                </Text>
                                <Section style={{ textAlign: 'center' }}>
                                    <Button
                                        href={bookingUrl}
                                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontFamily: sans, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}
                                    >
                                        Book my next appointment
                                    </Button>
                                </Section>
                            </Column>
                        </Row>
                    </Section>
                    <EmailFooter />
                </Container>
            </Body>
        </Html>
    )
}

RebookReminderEmail.PreviewProps = {
    clientFirstName: 'Ama',
    businessName: 'LadyPlutoLooks',
    serviceName: 'Loc Retwist',
    sinceText: '5 weeks',
    bookingUrl: 'https://ladyplutolooks.afroallure.co/book',
} satisfies RebookReminderProps
