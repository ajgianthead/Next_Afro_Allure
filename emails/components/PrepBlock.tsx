import * as React from 'react'
import { Section, Text } from '@react-email/components'

export interface PrepDetails {
    instructions: string
    checklist: string[]
}

/** "Before your appointment" — prep instructions and checklist set by the stylist. */
export function PrepBlock({ prep }: { prep?: PrepDetails | null }) {
    if (!prep || (!prep.instructions && prep.checklist.length === 0)) return null
    return (
        <Section
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E2D6',
                borderLeft: '3px solid #C9974A',
                borderRadius: 12,
                padding: '18px 22px',
                margin: '0 0 24px 0',
            }}
        >
            <Text style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 11, color: '#6F6863', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>
                Before your appointment
            </Text>
            {prep.instructions && (
                <Text style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, color: '#3A3532', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                    {prep.instructions}
                </Text>
            )}
            {prep.checklist.map((item, i) => (
                <Text key={i} style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 14, color: '#1A1818', margin: '0 0 4px 0', lineHeight: 1.5 }}>
                    ✓ {item}
                </Text>
            ))}
        </Section>
    )
}
