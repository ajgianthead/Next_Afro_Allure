import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

export interface EmailTemplate {
    socials: {
        instagram: string
    }
    customerID: string
    businessData: {
        id: string
        name: string
    }
}

export default function CancelledSubscription({ businessData, customerID }: EmailTemplate) {
    const upgradeUrl = `${BASE_URL}/growthSubscription?customerID=${customerID}`

    return (
        <Html lang="en">
            <Head />
            <Preview>{`Your AfroAllure Growth plan has been cancelled — your account remains active on the Starter plan.`}</Preview>
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
                                    Your Growth plan has been cancelled.
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
                                    Hi {businessData.name}, your AfroAllure Growth subscription has been successfully cancelled. You've moved to the Starter (Free) plan — your account stays active.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 11,
                                        color: '#6F6863',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        margin: '0 0 10px 0',
                                    }}
                                >
                                    Still available on Starter
                                </Text>

                                {(['Your public booking page', 'Discovery listing on AfroAllure', 'Up to 10 bookings per month', 'Basic credit/debit card payments', 'Account & profile access'] as const).map(item => (
                                    <Text
                                        key={item}
                                        style={{
                                            fontFamily: 'Arial, Helvetica, sans-serif',
                                            fontSize: 14,
                                            color: '#3A3532',
                                            margin: '0 0 8px 0',
                                            lineHeight: 1.6,
                                            paddingLeft: 16,
                                            borderLeft: '2px solid #E8E2D6',
                                        }}
                                    >
                                        {item}
                                    </Text>
                                ))}

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '20px 0 24px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Whenever you're ready to scale again, upgrading back to Growth instantly restores all premium features.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={upgradeUrl}
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
                                            Upgrade plan
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
                                    If there's anything we could have done better, just reply to this email — I read every message.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 13,
                                        color: '#6F6863',
                                        margin: '8px 0 0 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    — Abijah Nesbitt, Founder, AfroAllure
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

CancelledSubscription.PreviewProps = {
    socials: { instagram: 'https://instagram.com/afroallure_' },
    customerID: 'cus-123',
    businessData: {
        id: 'a2c9f0d8-35b8-4eea-81ed-e1926ae2cf90',
        name: 'LadyPlutoLooks',
    },
} satisfies EmailTemplate
