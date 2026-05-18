import * as React from 'react'
import { Section, Row, Column, Text } from '@react-email/components'

interface AppointmentDetailBlockProps {
    date?: string
    time?: string
    service?: string
    location?: string
    duration?: string
    amount?: string
    deposit?: string
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

export function AppointmentDetailBlock({
    date,
    time,
    service,
    location,
    duration,
    amount,
    deposit,
}: AppointmentDetailBlockProps) {
    const rows = [
        { label: 'Date',     value: date },
        { label: 'Time',     value: time },
        { label: 'Service',  value: service },
        { label: 'Location', value: location },
        { label: 'Duration', value: duration },
        { label: 'Amount',   value: amount },
        { label: 'Deposit',  value: deposit },
    ].filter(r => r.value !== undefined && r.value !== null && r.value !== '')

    if (rows.length === 0) return null

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
                            <Text style={VALUE_STYLE}>{row.value}</Text>
                        </Column>
                    </Row>
                )
            })}
        </Section>
    )
}
