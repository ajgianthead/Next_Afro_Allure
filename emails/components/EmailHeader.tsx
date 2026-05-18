import * as React from 'react'
import { Section, Row, Column } from '@react-email/components'

interface EmailHeaderProps {
    goldAccent?: boolean
}

export function EmailHeader({ goldAccent = false }: EmailHeaderProps) {
    return (
        <Section
            style={{
                backgroundColor: '#0F0E0E',
                borderBottom: goldAccent ? '3px solid #C9974A' : undefined,
            }}
        >
            <Row>
                <Column
                    style={{
                        height: 64,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        padding: '0 40px',
                        lineHeight: '64px',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "Georgia, 'Times New Roman', serif",
                            fontSize: 22,
                            color: '#FFFFFF',
                            letterSpacing: '-0.02em',
                            lineHeight: '64px',
                        }}
                    >
                        AfroAllure
                    </span>
                    <span
                        style={{
                            display: 'inline-block',
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#FC6161',
                            verticalAlign: 'middle',
                            marginLeft: 3,
                            position: 'relative',
                            top: -1,
                        }}
                    />
                </Column>
            </Row>
        </Section>
    )
}
