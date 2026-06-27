import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

interface SetPasswordEmailProps {
    firstName: string
    setPasswordUrl: string
}

export default function SetPasswordEmail({ firstName, setPasswordUrl }: SetPasswordEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>{`${firstName}, set your AfroAllure password — this link expires in 7 days.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>

                    <EmailHeader />

                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>

                                <Text
                                    style={{
                                        fontFamily: "Georgia, 'Times New Roman', serif",
                                        fontSize: 30,
                                        color: '#1A1818',
                                        fontWeight: 'normal',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Set your password, {firstName}.
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
                                    Click the button below to create a password for your AfroAllure account. This link is valid for 7 days.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={setPasswordUrl}
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
                                            Set my password →
                                        </Link>
                                    </Column>
                                </Row>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 13,
                                        color: '#6F6863',
                                        margin: '24px 0 12px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    If the button doesn't work, copy and paste this link into your browser:
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
                                        fontSize: 12,
                                        color: '#6F6863',
                                        margin: '0 0 24px 0',
                                        lineHeight: 1.5,
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {setPasswordUrl}
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 13,
                                        color: '#6F6863',
                                        margin: '0 0 0 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    If you didn't sign up for AfroAllure, you can safely ignore this email.
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

SetPasswordEmail.PreviewProps = {
    firstName: 'Imani',
    setPasswordUrl: 'https://beta.afroallure.co/set-password',
} satisfies SetPasswordEmailProps
