import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

interface WelcomeEmailProps {
    firstName: string
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`Welcome to AfroAllure, ${firstName} — your booking system is ready.`}</Preview>
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
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    You're in, {firstName}.
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
                                    Your AfroAllure account is live. In the next few minutes you'll finish setting up your profile — it only takes one more step.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.6,
                                        paddingLeft: 16,
                                        borderLeft: '2px solid #FC6161',
                                    }}
                                >
                                    <strong style={{ color: '#1A1818' }}>What happens next:</strong> Complete your profile setup, add your first service, and you'll be ready to take bookings. The whole setup takes under 5 minutes.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#6F6863',
                                        margin: '0 0 28px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Also check for a separate email with a link to set your password when you're ready.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href="https://beta.afroallure.co/onboarding"
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#FC6161',
                                                color: '#FFFFFF',
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 14,
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                padding: '14px 28px',
                                                borderRadius: 999,
                                            }}
                                        >
                                            Finish setting up →
                                        </Link>
                                    </Column>
                                </Row>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 13,
                                        color: '#6F6863',
                                        margin: '24px 0 0 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Questions? Reply to this email — we read every message.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 13,
                                        color: '#1A1818',
                                        fontWeight: 600,
                                        margin: '6px 0 0 0',
                                    }}
                                >
                                    — The AfroAllure Team
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

WelcomeEmail.PreviewProps = {
    firstName: 'Imani',
} satisfies WelcomeEmailProps
