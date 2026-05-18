import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Link, Preview } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

interface FoundingMemberWelcomeProps {
    firstName: string
    memberNumber: number
    bookingUrl: string
}

export default function FoundingMemberWelcome({ firstName, memberNumber, bookingUrl }: FoundingMemberWelcomeProps) {
    const paddedNumber = String(memberNumber).padStart(3, '0')

    return (
        <Html lang="en">
            <Head />
            <Preview>{`You're founding member #${paddedNumber} — your rate is locked forever.`}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>

                    <EmailHeader goldAccent />

                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>

                                <Row style={{ marginBottom: 20 }}>
                                    <Column style={{ textAlign: 'center' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                backgroundColor: '#C9974A',
                                                color: '#FFFFFF',
                                                fontFamily: 'Arial, Helvetica, sans-serif',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: '0.16em',
                                                textTransform: 'uppercase',
                                                padding: '7px 14px',
                                                borderRadius: 999,
                                            }}
                                        >
                                            Founding Member #{paddedNumber}
                                        </span>
                                    </Column>
                                </Row>

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
                                    Welcome, {firstName}. Your spot is permanent.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 15,
                                        color: '#3A3532',
                                        margin: '0 0 20px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    You just joined AfroAllure as founding member <strong>#{paddedNumber}</strong> out of 250. That number is yours forever — along with everything that comes with it.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.6,
                                        paddingLeft: 16,
                                        borderLeft: '2px solid #C9974A',
                                    }}
                                >
                                    <strong style={{ color: '#1A1818' }}>Your rate is locked.</strong> No matter what AfroAllure charges in the future, you pay $25/mo. Always.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '0 0 16px 0',
                                        lineHeight: 1.6,
                                        paddingLeft: 16,
                                        borderLeft: '2px solid #C9974A',
                                    }}
                                >
                                    <strong style={{ color: '#1A1818' }}>First in the marketplace.</strong> When the AfroAllure marketplace launches, founding members are listed first — giving you the best shot at being discovered.
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#3A3532',
                                        margin: '0 0 24px 0',
                                        lineHeight: 1.6,
                                        paddingLeft: 16,
                                        borderLeft: '2px solid #C9974A',
                                    }}
                                >
                                    <strong style={{ color: '#1A1818' }}>Your badge is live.</strong> A founding member badge now appears on your public booking page, signaling to clients that you were here from the beginning.
                                </Text>

                                <Text
                                    style={{
                                        fontFamily: 'Arial, Helvetica, sans-serif',
                                        fontSize: 14,
                                        color: '#6F6863',
                                        margin: '0 0 24px 0',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    We built AfroAllure because Black beauty professionals deserve a platform built for them — not adapted for them. You joined early. That means something to us, and we won't forget it.
                                </Text>

                                <Row>
                                    <Column style={{ textAlign: 'center' }}>
                                        <Link
                                            href={bookingUrl}
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
                                            View your booking page
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
                                    If you have questions or need anything, reply to this email — we're a real team, and we read every message.
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

FoundingMemberWelcome.PreviewProps = {
    firstName: 'Imani',
    memberNumber: 7,
    bookingUrl: 'https://beta.afroallure.co/business/imani-braiding',
} satisfies FoundingMemberWelcomeProps
