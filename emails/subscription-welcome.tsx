import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

export interface EmailTemplate {
    socials: {
        instagram: string
    }
    businessData: {
        id: string
        name: string
    }
}

const FEATURE_STYLE: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 14,
    color: '#3A3532',
    margin: '0 0 16px 0',
    lineHeight: 1.6,
    paddingLeft: 16,
    borderLeft: '2px solid #C9974A',
}

export default function NewSubscription({ businessData }: EmailTemplate) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`Welcome to AfroAllure Growth, ${businessData.name} — your plan is now active.`}</Preview>
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
                                    Welcome to Growth.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 15,
                                        color: '#3A3532',
                                        margin: '0 0 24px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Hi {businessData.name}, you just upgraded from being discovered to building real momentum. Here's what's now unlocked for you.
                                </Text>

                                <Text style={FEATURE_STYLE}>
                                    <strong style={{ color: '#1A1818' }}>Unlimited bookings</strong> — no caps, no restrictions. Book as many clients as you can handle.
                                </Text>
                                <Text style={FEATURE_STYLE}>
                                    <strong style={{ color: '#1A1818' }}>Custom drag-and-drop website builder</strong> — design a fully branded booking site that feels like you.
                                </Text>
                                <Text style={FEATURE_STYLE}>
                                    <strong style={{ color: '#1A1818' }}>Multiple payment options</strong> — accept credit/debit cards, Apple Pay, Google Pay, Cash App, and more. (3% transaction fee applies.)
                                </Text>
                                <Text style={FEATURE_STYLE}>
                                    <strong style={{ color: '#1A1818' }}>Automated email reminders</strong> — reduce no-shows and keep clients informed automatically.
                                </Text>
                                <Text style={FEATURE_STYLE}>
                                    <strong style={{ color: '#1A1818' }}>Business insights & analytics</strong> — track bookings, revenue, and performance so you can grow intentionally.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#6F6863',
                                        margin: '8px 0 24px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    If you ever need help, just reply to this email. We're building this platform with you, not just for you.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={`${BASE_URL}/dashboard`}
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
                                            Go to dashboard
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

NewSubscription.PreviewProps = {
    socials: { instagram: 'https://instagram.com/afroallure_' },
    businessData: {
        id: 'a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90',
        name: 'LadyPlutoLooks',
    },
} satisfies EmailTemplate
