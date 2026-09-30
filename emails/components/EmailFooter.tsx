import * as React from 'react'
import { Section, Row, Column, Text, Link, Hr } from '@react-email/components'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

interface EmailFooterProps {
    /** Only true for marketing/promotional sends — transactional emails don't need it. */
    showUnsubscribe?: boolean
    /** Required when showUnsubscribe is true — from business_users.unsubscribe_token. */
    unsubscribeToken?: string
}

const YEAR = new Date().getFullYear()

export function EmailFooter({ showUnsubscribe = false, unsubscribeToken }: EmailFooterProps) {
    return (
        <Section style={{ backgroundColor: '#FAF7F2' }}>
            <Hr style={{ borderColor: '#E8E2D6', margin: 0 }} />
            <Row>
                <Column style={{ padding: '24px 40px', textAlign: 'center' }}>
                    <Text
                        style={{
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: 12,
                            color: '#6F6863',
                            margin: '0 0 4px 0',
                            lineHeight: 1.6,
                        }}
                    >
                        AfroAllure · Built for Black beauty
                    </Text>
                    <Text
                        style={{
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: 12,
                            color: '#6F6863',
                            margin: 0,
                            lineHeight: 1.6,
                        }}
                    >
                        © {YEAR} AfroAllure, LLC · Gainesville, FL 32608
                    </Text>
                    {showUnsubscribe && unsubscribeToken && (
                        <Text
                            style={{
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                fontSize: 11,
                                color: '#888',
                                textAlign: 'center',
                                marginTop: 12,
                                lineHeight: 1.6,
                            }}
                        >
                            You received this because you have an AfroAllure account.<br />
                            <Link
                                href={`${BASE_URL}/unsubscribe?token=${unsubscribeToken}`}
                                style={{ color: '#6F6863', textDecoration: 'underline' }}
                            >
                                Unsubscribe from marketing emails
                            </Link>
                        </Text>
                    )}
                </Column>
            </Row>
        </Section>
    )
}
