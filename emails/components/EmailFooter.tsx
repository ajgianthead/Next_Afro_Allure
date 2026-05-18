import * as React from 'react'
import { Section, Row, Column, Text, Link, Hr } from '@react-email/components'

interface EmailFooterProps {
    showUnsubscribe?: boolean
}

const YEAR = new Date().getFullYear()

export function EmailFooter({ showUnsubscribe = false }: EmailFooterProps) {
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
                        © {YEAR} AfroAllure. All rights reserved.
                    </Text>
                    {showUnsubscribe && (
                        <Text
                            style={{
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                fontSize: 12,
                                color: '#6F6863',
                                margin: '8px 0 0 0',
                                lineHeight: 1.6,
                            }}
                        >
                            <Link
                                href="{{unsubscribe_url}}"
                                style={{ color: '#6F6863', textDecoration: 'underline' }}
                            >
                                Unsubscribe
                            </Link>
                        </Text>
                    )}
                </Column>
            </Row>
        </Section>
    )
}
