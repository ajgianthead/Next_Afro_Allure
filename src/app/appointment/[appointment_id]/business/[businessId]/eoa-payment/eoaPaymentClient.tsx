'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createCheckoutAction } from '@/features/stripe/actions'
import { getBalanceSummary, type BalanceSummary } from '@/features/stripe/balanceSummary'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function fmt(cents: number) {
    const s = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(cents) / 100)
    return cents < 0 ? `−${s}` : s
}

function Screen({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center gap-3 px-5 text-center" style={{ backgroundColor: '#FAF7F2' }}>
            {children}
        </div>
    )
}

/**
 * End-of-appointment payment: opened from the payment link email or by
 * scanning the QR code in the dashboard.
 */
export default function EOAClient() {
    const { appointment_id } = useParams<{ appointment_id: string }>()
    const [summary, setSummary] = useState<BalanceSummary | null>(null)
    const [options, setOptions] = useState<{ clientSecret: string }>()
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [dueNow, setDueNow] = useState(0)
    const [state, setState] = useState<'loading' | 'ready' | 'paid' | 'invalid'>('loading')

    useEffect(() => {
        const init = async () => {
            const s = await getBalanceSummary(appointment_id)
            if (!s) { setState('invalid'); return }
            setSummary(s)
            if (s.state !== 'payable' || !s.stripeAccountId) { setState(s.state === 'paid' ? 'paid' : 'invalid'); return }

            setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, { stripeAccount: s.stripeAccountId }))
            // The server works out the amount; nothing here is trusted.
            const { clientSecret, amountDue } = await createCheckoutAction({ purpose: 'EOA', appointmentID: appointment_id })
            if (!clientSecret) { setState('invalid'); return }
            setOptions({ clientSecret })
            setDueNow(amountDue)
            setState('ready')
        }
        init().catch(() => setState('invalid'))
    }, [appointment_id])

    if (state === 'loading') {
        return <Screen><Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} /></Screen>
    }

    if (state === 'paid') {
        return (
            <Screen>
                <div className="flex items-center gap-3">
                    <CircleCheckBig size={24} style={{ color: '#16a34a' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>Already paid</h2>
                </div>
                <p className="text-sm" style={{ color: '#6F6863' }}>
                    This appointment{summary?.businessName ? ` with ${summary.businessName}` : ''} is paid in full. Thank you!
                </p>
            </Screen>
        )
    }

    if (state === 'invalid' || !summary || !options || !promise) {
        return (
            <Screen>
                <p className="text-base font-medium" style={{ color: '#1A1818' }}>This payment link is no longer valid.</p>
                <p className="text-sm" style={{ color: '#6F6863' }}>
                    The appointment may have been cancelled or there&apos;s nothing left to pay.
                    {summary?.businessName ? ` Please contact ${summary.businessName} if you think this is wrong.` : ''}
                </p>
            </Screen>
        )
    }

    const start = DateTime.fromISO(summary.start)
    const end = DateTime.fromISO(summary.end)

    return (
        <div className="w-full min-h-screen py-10 px-4" style={{ backgroundColor: '#FAF7F2' }}>
            <Elements stripe={promise} options={options}>
                <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-4">
                    {/* Summary */}
                    <div className="flex-1 rounded-xl p-6 flex flex-col gap-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>
                                {summary.businessName || 'Appointment'}
                            </p>
                            <h2 className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>{summary.serviceName}</h2>
                            {summary.optionsText && <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>{summary.optionsText}</p>}
                            <p className="text-sm mt-1" style={{ color: '#6F6863' }}>
                                {start.toFormat('cccc, LLLL d')} · {start.toLocaleString(DateTime.TIME_SIMPLE)} – {end.toLocaleString(DateTime.TIME_SIMPLE)}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                            {summary.lines.map((line, i) => (
                                <div key={i} className="flex justify-between gap-4">
                                    <p className="text-sm" style={{ color: '#1A1818' }}>{line.label}</p>
                                    <p className="text-sm" style={{ color: line.cents < 0 ? '#15803D' : '#6F6863' }}>{fmt(line.cents)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#0F0E0E' }}>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Due now</p>
                                <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#FFFFFF' }}>{fmt(dueNow)}</p>
                            </div>
                        </div>

                        {summary.clientName && (
                            <p className="text-xs" style={{ color: '#6F6863' }}>
                                For {summary.clientName}{summary.clientEmail ? ` · receipt to ${summary.clientEmail}` : ''}
                            </p>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="flex-1 rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>Payment</p>
                            <p className="text-sm" style={{ color: '#6F6863' }}>Pay your balance below.</p>
                        </div>
                        <EOAPaymentForm appointmentID={appointment_id} stripeID={summary.stripeAccountId!} amount={dueNow} />
                    </div>
                </div>
            </Elements>
        </div>
    )
}

function EOAPaymentForm({ appointmentID, stripeID, amount }: { appointmentID: string; stripeID: string; amount: number }) {
    const elements = useElements()
    const stripe = useStripe()
    const [submitting, setSubmitting] = useState(false)
    const [payError, setPayError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!stripe || !elements) return
        setSubmitting(true)
        setPayError('')
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/appointment/${appointmentID}/${stripeID}/complete`,
            },
        })
        if (error) setPayError(error.message ?? 'Payment failed. Please try again.')
        setSubmitting(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
            <PaymentElement className="w-full" />
            {payError && <p className="text-sm" style={{ color: '#FC6161' }}>{payError}</p>}
            <Button
                type="submit"
                disabled={!stripe || !elements || submitting}
                style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
            >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : `Pay ${fmt(amount)}`}
            </Button>
        </form>
    )
}
