import { Html, Head, Body, Container, Heading, Text, Hr, Link } from '@react-email/components'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beta.afroallure.co'

type Props = {
    eventType: 'new_signup' | 'new_subscriber' | 'upgrade' | 'cancellation' | 'payment_failed' | 'at_risk' | 'first_booking' | 'feedback' | 'support_ticket'
    businessName: string
    email: string
    plan?: string
    amount?: number
    detail?: string
    timestamp: string
}

const EVENT_LABELS: Record<string, string> = {
    new_signup: '🆕 New Beta Signup',
    new_subscriber: '💰 New Paid Subscriber',
    upgrade: '⬆️ Plan Upgrade',
    cancellation: '❌ Cancellation',
    payment_failed: '⚠️ Payment Failed',
    at_risk: '🔔 At Risk Business',
    first_booking: '🎉 First Booking Processed',
    feedback: '💬 New Feedback',
    support_ticket: '🎫 New Support Ticket',
}

export default function FounderNotification({ eventType, businessName, email, plan, amount, detail, timestamp }: Props) {
    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#0F0E0E', fontFamily: 'Inter, sans-serif' }}>
                <Container style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 24px' }}>
                    <Heading style={{ color: '#FC6161', fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                        AfroAllure
                    </Heading>
                    <Heading style={{ color: '#FAF7F2', fontSize: '24px', fontWeight: 700, margin: '0 0 24px' }}>
                        {EVENT_LABELS[eventType]}
                    </Heading>
                    <Hr style={{ borderColor: '#2C2822', margin: '0 0 24px' }} />
                    <Text style={{ color: '#9A9088', fontSize: '12px', margin: '0 0 2px' }}>Business</Text>
                    <Text style={{ color: '#FAF7F2', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>{businessName}</Text>
                    <Text style={{ color: '#9A9088', fontSize: '12px', margin: '0 0 2px' }}>Email</Text>
                    <Text style={{ color: '#FAF7F2', fontSize: '14px', margin: '0 0 16px' }}>{email}</Text>
                    {plan && (
                        <>
                            <Text style={{ color: '#9A9088', fontSize: '12px', margin: '0 0 2px' }}>Plan</Text>
                            <Text style={{ color: '#C9974A', fontSize: '14px', fontWeight: 600, margin: '0 0 16px' }}>{plan}</Text>
                        </>
                    )}
                    {amount != null && (
                        <>
                            <Text style={{ color: '#9A9088', fontSize: '12px', margin: '0 0 2px' }}>Amount</Text>
                            <Text style={{ color: '#FAF7F2', fontSize: '14px', margin: '0 0 16px' }}>${(amount / 100).toFixed(2)}/mo</Text>
                        </>
                    )}
                    {detail && (
                        <>
                            <Text style={{ color: '#9A9088', fontSize: '12px', margin: '0 0 2px' }}>Details</Text>
                            <Text style={{ color: '#FAF7F2', fontSize: '14px', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{detail}</Text>
                        </>
                    )}
                    <Hr style={{ borderColor: '#2C2822', margin: '24px 0' }} />
                    <Text style={{ color: '#6B6158', fontSize: '11px', margin: '0 0 8px' }}>{new Date(timestamp).toLocaleString()}</Text>
                    <Link href={`${BASE_URL}/admin`} style={{ color: '#FC6161', fontSize: '13px' }}>View Dashboard →</Link>
                </Container>
            </Body>
        </Html>
    )
}
