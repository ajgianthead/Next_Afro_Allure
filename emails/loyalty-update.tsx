import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview, Button } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

export interface LoyaltyUpdateProps {
    clientFirstName: string
    businessName: string
    /** Booking site link for the "Book again" button. */
    bookingUrl: string
    /** e.g. "$20 off" */
    rewardText: string
    /** Rewards just earned on this visit (codes). Empty = progress update only. */
    newRewards: { code: string; expiresOn: string | null }[]
    /** e.g. "2 more visits" — shown when no reward was earned. */
    remainingText: string
    /** Visits/stamps banked toward the next reward, for the punch card. Null for spend programs. */
    stamps: { filled: number; total: number } | null
    /** True when this visit earned a rebook bonus. */
    rebookBonus: boolean
}

const serif = "Georgia, 'Times New Roman', serif"
const sans = 'Arial, Helvetica, sans-serif'

export default function LoyaltyUpdateEmail(props: LoyaltyUpdateProps) {
    const { clientFirstName, businessName, bookingUrl, rewardText, newRewards, remainingText, stamps, rebookBonus } = props
    const earned = newRewards.length > 0
    const preview = earned
        ? `You earned ${rewardText} at ${businessName}!`
        : `You're ${remainingText} away from ${rewardText} at ${businessName}.`

    return (
        <Html lang="en">
            <Head />
            <Preview>{preview}</Preview>
            <Body style={{ backgroundColor: '#FAF7F2', margin: 0, padding: '40px 0' }}>
                <Container style={{ maxWidth: 600, margin: '0 auto' }}>
                    <EmailHeader />
                    <Section style={{ backgroundColor: '#FFFFFF', borderRadius: '0 0 16px 16px' }}>
                        <Row>
                            <Column style={{ padding: '40px' }}>
                                <Text style={{ fontFamily: serif, fontSize: 30, color: '#1A1818', margin: '0 0 12px 0', lineHeight: 1.2 }}>
                                    {earned ? `You earned ${rewardText}.` : 'Thanks for coming in.'}
                                </Text>
                                <Text style={{ fontFamily: sans, fontSize: 15, color: '#3A3532', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                                    Hi {clientFirstName}, {earned
                                        ? `your loyalty with ${businessName} paid off. Use the code below on your next appointment.`
                                        : `your visit to ${businessName} counted toward your next reward. You're ${remainingText} away from ${rewardText}.`}
                                    {rebookBonus ? ' You also got a bonus visit for rebooking on time.' : ''}
                                </Text>

                                {earned && newRewards.map(r => (
                                    <Section key={r.code} style={{ backgroundColor: '#FAF7F2', border: '1px dashed #C9BFAE', borderRadius: 12, margin: '0 0 12px 0' }}>
                                        <Row>
                                            <Column style={{ padding: '18px 20px', textAlign: 'center' }}>
                                                <Text style={{ fontFamily: sans, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6F6863', margin: '0 0 6px 0' }}>
                                                    {rewardText} · your code
                                                </Text>
                                                <Text style={{ fontFamily: 'Courier New, monospace', fontSize: 26, fontWeight: 'bold', color: '#1A1818', margin: 0, letterSpacing: 3 }}>
                                                    {r.code}
                                                </Text>
                                                {r.expiresOn && (
                                                    <Text style={{ fontFamily: sans, fontSize: 12, color: '#6F6863', margin: '6px 0 0 0' }}>
                                                        Use by {r.expiresOn}
                                                    </Text>
                                                )}
                                            </Column>
                                        </Row>
                                    </Section>
                                ))}

                                {!earned && stamps && (
                                    <Section style={{ margin: '0 0 20px 0' }}>
                                        <Row>
                                            <Column style={{ textAlign: 'center' }}>
                                                {Array.from({ length: stamps.total }, (_, i) => (
                                                    <span
                                                        key={i}
                                                        style={{
                                                            display: 'inline-block', width: 28, height: 28, borderRadius: 14, margin: '0 4px',
                                                            backgroundColor: i < stamps.filled ? '#1A1818' : '#FFFFFF',
                                                            border: '2px solid #1A1818',
                                                        }}
                                                    />
                                                ))}
                                            </Column>
                                        </Row>
                                    </Section>
                                )}

                                <Section style={{ textAlign: 'center', margin: '8px 0 0 0' }}>
                                    <Button
                                        href={bookingUrl}
                                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontFamily: sans, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}
                                    >
                                        Book your next visit
                                    </Button>
                                </Section>

                                {earned && (
                                    <Text style={{ fontFamily: sans, fontSize: 13, color: '#6F6863', margin: '20px 0 0 0', lineHeight: 1.6 }}>
                                        Share this code with {businessName} when you book or at your appointment and it comes off your bill.
                                    </Text>
                                )}
                            </Column>
                        </Row>
                    </Section>
                    <EmailFooter />
                </Container>
            </Body>
        </Html>
    )
}

LoyaltyUpdateEmail.PreviewProps = {
    clientFirstName: 'Abijah',
    businessName: 'LadyPlutoLooks',
    bookingUrl: 'https://ladyplutolooks.afroallure.co',
    rewardText: '$20 off',
    newRewards: [],
    remainingText: '2 more visits',
    stamps: { filled: 3, total: 5 },
    rebookBonus: true,
} satisfies LoyaltyUpdateProps
