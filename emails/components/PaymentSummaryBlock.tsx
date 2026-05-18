import * as React from 'react'
import { Section, Row, Column, Text } from '@react-email/components'

interface PaymentSummaryBlockProps {
    amount: number
    aaFee: number
    stripeFee: number
    netEarnings: number
}

function formatCents(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`
}

const LABEL_STYLE: React.CSSProperties = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 11,
    color: '#6F6863',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 4px 0',
    lineHeight: 1.4,
}

const VALUE_STYLE: React.CSSProperties = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 16,
    color: '#1A1818',
    margin: 0,
    lineHeight: 1.4,
}

const EARNINGS_VALUE_STYLE: React.CSSProperties = {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 20,
    color: '#16A34A',
    margin: 0,
    lineHeight: 1.4,
}

export function PaymentSummaryBlock({ amount, aaFee, stripeFee, netEarnings }: PaymentSummaryBlockProps) {
    const rows = [
        { label: 'Amount received',    value: formatCents(amount),      style: VALUE_STYLE },
        { label: 'AfroAllure fee',      value: `−${formatCents(aaFee)}`, style: VALUE_STYLE },
        { label: 'Stripe processing',   value: `−${formatCents(stripeFee)}`, style: VALUE_STYLE },
        { label: 'Your earnings',       value: formatCents(netEarnings), style: EARNINGS_VALUE_STYLE },
    ]

    return (
        <Section
            style={{
                backgroundColor: '#FAF7F2',
                border: '1px solid #E8E2D6',
                borderRadius: 12,
                padding: '20px 24px',
                margin: '24px 0',
            }}
        >
            {rows.map((row, i) => {
                const isLast = i === rows.length - 1
                return (
                    <Row key={row.label}>
                        <Column
                            style={{
                                padding: '10px 0',
                                borderBottom: isLast ? undefined : '1px solid #E8E2D6',
                            }}
                        >
                            <Text style={LABEL_STYLE}>{row.label}</Text>
                            <Text style={row.style}>{row.value}</Text>
                        </Column>
                    </Row>
                )
            })}
        </Section>
    )
}
