import * as React from 'react'
import { Html, Head, Body, Container, Section, Row, Column, Text, Preview, Button, Link } from '@react-email/components'
import { EmailHeader } from './components/EmailHeader'
import { EmailFooter } from './components/EmailFooter'

export interface ReferralInviteProps {
    clientFirstName: string
    businessName: string
    /** e.g. "Give $10 off, get $10 off" */
    offer: string
    /** Their booking link with ?ref=CODE, to share. */
    shareUrl: string
    /** Their private "My rewards" page. */
    rewardsUrl: string
    /** Set when a friend's visit just earned them a reward. */
    newReward: { code: string; rewardText: string; friendName: string; expiresOn: string | null } | null
}

const serif = "Georgia, 'Times New Roman', serif"
const sans = 'Arial, Helvetica, sans-serif'

/** Sends a client their referral link, or tells them a friend's visit earned them a reward. */
export default function ReferralInviteEmail(props: ReferralInviteProps) {
    const { clientFirstName, businessName, offer, shareUrl, rewardsUrl, newReward } = props
    const preview = newReward
        ? `${newReward.friendName} came in. You earned ${newReward.rewardText} at ${businessName}!`
        : `${offer}: share your link for ${businessName}.`

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
                                    {newReward ? `You earned ${newReward.rewardText}.` : offer + '.'}
                                </Text>
                                <Text style={{ fontFamily: sans, fontSize: 15, color: '#3A3532', margin: '0 0 20px 0', lineHeight: 1.6 }}>
                                    Hi {clientFirstName}, {newReward
                                        ? `${newReward.friendName} booked with ${businessName} using your link. Here's your thank-you, for your next appointment.`
                                        : `love ${businessName}? Share your personal link. Friends who book through it count as your referrals.`}
                                </Text>

                                {newReward && (
                                    <Section style={{ backgroundColor: '#FAF7F2', border: '1px dashed #C9BFAE', borderRadius: 12, margin: '0 0 20px 0' }}>
                                        <Row>
                                            <Column style={{ padding: '18px 20px', textAlign: 'center' }}>
                                                <Text style={{ fontFamily: sans, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6F6863', margin: '0 0 6px 0' }}>
                                                    {newReward.rewardText} · your code
                                                </Text>
                                                <Text style={{ fontFamily: 'Courier New, monospace', fontSize: 26, fontWeight: 'bold', color: '#1A1818', margin: 0, letterSpacing: 3 }}>
                                                    {newReward.code}
                                                </Text>
                                                {newReward.expiresOn && (
                                                    <Text style={{ fontFamily: sans, fontSize: 12, color: '#6F6863', margin: '6px 0 0 0' }}>
                                                        Use by {newReward.expiresOn}
                                                    </Text>
                                                )}
                                            </Column>
                                        </Row>
                                    </Section>
                                )}

                                <Text style={{ fontFamily: sans, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#6F6863', margin: '0 0 6px 0' }}>
                                    Your link to share
                                </Text>
                                <Text style={{ fontFamily: sans, fontSize: 15, color: '#1A1818', margin: '0 0 20px 0', wordBreak: 'break-all' }}>
                                    <Link href={shareUrl} style={{ color: '#1A1818' }}>{shareUrl}</Link>
                                </Text>

                                <Section style={{ textAlign: 'center', margin: '8px 0 0 0' }}>
                                    <Button
                                        href={rewardsUrl}
                                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontFamily: sans, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}
                                    >
                                        See my rewards & link
                                    </Button>
                                </Section>

                                <Text style={{ fontFamily: sans, fontSize: 13, color: '#6F6863', margin: '20px 0 0 0', lineHeight: 1.6 }}>
                                    Rewards count when a friend new to {businessName} books through your link and completes their visit.
                                    {newReward ? ` Enter your code when you book online, or give it to ${businessName} at your appointment.` : ''}
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

ReferralInviteEmail.PreviewProps = {
    clientFirstName: 'Brianna',
    businessName: 'Kayla Braids',
    offer: 'Give $10 off, get $10 off',
    shareUrl: 'https://kayla.afroallure.co/book?ref=BRIA-7F3K',
    rewardsUrl: 'https://kayla.afroallure.co/refer/00000000-0000-0000-0000-000000000000',
    newReward: { code: 'AA-7F3KQ2', rewardText: '$10 off', friendName: 'Maya', expiresOn: 'April 20, 2027' },
} satisfies ReferralInviteProps
