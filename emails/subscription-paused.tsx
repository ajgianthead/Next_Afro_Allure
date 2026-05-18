import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailTemplate } from './subscription-welcome'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

const FEATURE_STYLE: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 14,
    color: '#6F6863',
    margin: '0 0 12px 0',
    lineHeight: 1.6,
}

export default function PausedSubscription({ businessData }: EmailTemplate) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`Your AfroAllure Growth plan is paused — reactivate whenever you're ready.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>

                    <EmailHeader goldAccent />

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
                                    Your plan is paused.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 15,
                                        color: '#3A3532',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Hi {businessData.name}, your AfroAllure Growth subscription is currently paused. Growth features are inactive until your subscription resumes.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 11,
                                        color: '#6F6863',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        margin: '0 0 12px 0',
                                    }}
                                >
                                    Temporarily disabled
                                </Text>

                                <Text style={FEATURE_STYLE}>Unlimited bookings</Text>
                                <Text style={FEATURE_STYLE}>Advanced booking analytics</Text>
                                <Text style={FEATURE_STYLE}>Automated email reminders</Text>
                                <Text style={FEATURE_STYLE}>Additional payment processing options</Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '16px 0 24px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    We understand that business moves in seasons. AfroAllure will be here when you're ready to scale again.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={`${BASE_URL}/dashboard/monetization`}
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
                                            Manage subscription
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

PausedSubscription.PreviewProps = {
    socials: { instagram: 'https://instagram.com/afroallure_' },
    businessData: {
        id: 'a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90',
        name: 'LadyPlutoLooks',
    },
} satisfies EmailTemplate
