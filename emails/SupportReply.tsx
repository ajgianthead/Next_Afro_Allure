import { Html, Head, Body, Container, Heading, Text, Hr } from '@react-email/components'

export default function SupportReply({ businessName, subject, reply }: { businessName: string, subject: string, reply: string }) {
    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
                <Container style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 24px' }}>
                    <Heading style={{ color: '#FC6161', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 24px' }}>AfroAllure Support</Heading>
                    <Text style={{ fontSize: '16px', color: '#1A1714', lineHeight: '1.7', margin: '0 0 8px' }}>
                        Hey {businessName},
                    </Text>
                    <Text style={{ color: '#6B6158', fontSize: '13px', margin: '0 0 24px' }}>Re: {subject}</Text>
                    <Text style={{ fontSize: '16px', color: '#1A1714', lineHeight: '1.7', margin: '0 0 24px', whiteSpace: 'pre-wrap' as const }}>
                        {reply}
                    </Text>
                    <Text style={{ fontSize: '16px', color: '#1A1714', lineHeight: '1.7', margin: '0' }}>
                        — Abijah<br />
                        <span style={{ color: '#6B6158', fontSize: '13px' }}>Founder, AfroAllure</span>
                    </Text>
                    <Hr style={{ borderColor: '#E5DDD3', margin: '32px 0' }} />
                    <Text style={{ color: '#9A9088', fontSize: '11px', textAlign: 'center' as const, margin: '0' }}>
                        AfroAllure, LLC · Gainesville, FL 32608
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
