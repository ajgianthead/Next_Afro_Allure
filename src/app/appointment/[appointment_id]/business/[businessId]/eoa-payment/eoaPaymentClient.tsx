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
import { getAppointmentByIdAction, getBusinessByIdAction } from '@/features/shared/appointments/actions'
import { createCheckoutAction } from '@/features/stripe/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function fmt(cents: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatPhone(phone: string): string {
    const d = phone.replace(/\D/g, '')
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
    if (d.length === 11 && d[0] === '1') return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
    return phone
}

export default function EOAClient() {
    const { appointment_id } = useParams<{ appointment_id: string }>()
    const [options, setOptions] = useState<{ clientSecret: any }>()
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [stripeID, setStripeID] = useState<string | null>(null)
    const [appointmentData, setAppointmentData] = useState<any>({})
    const [error, setError] = useState(false)
    const [completed, setCompleted] = useState<boolean | null>(null)

    useEffect(() => {
        const init = async () => {
            const appointment = await getAppointmentByIdAction(appointment_id)
            setAppointmentData(appointment)

            if (appointment.status !== 'CONFIRMED') { setError(true); return }
            if (appointment.service_paid) { setCompleted(true); return }

            const business = await getBusinessByIdAction(appointment.business)
            setStripeID(business.stripe_acc_id)

            const stripePromise = loadStripe(
                process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
                { stripeAccount: business.stripe_acc_id! }
            )
            setStripePromise(stripePromise)

            const meta = appointment.client_metadata as any
            const { clientSecret } = await createCheckoutAction({
                connectedAccountId: business.stripe_acc_id!,
                price: appointment.amount_due,
                purpose: 'EOA',
                client_email: meta.email,
                paymentIntent: appointment.service_charge_id ?? undefined,
                appointmentID: appointment_id,
            })
            setOptions({ clientSecret })
            setCompleted(false)
        }
        init().catch(() => setError(true))
    }, [])

    if (error) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-3 px-5" style={{ backgroundColor: '#FAF7F2' }}>
                <p className="text-base font-medium" style={{ color: '#1A1818' }}>This payment link is no longer valid.</p>
                <p className="text-sm" style={{ color: '#6F6863' }}>Your appointment may have already been completed or cancelled.</p>
            </div>
        )
    }

    if (completed === null) {
        return (
            <div className="w-full h-screen flex justify-center items-center" style={{ backgroundColor: '#FAF7F2' }}>
                <Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} />
            </div>
        )
    }

    if (completed) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center gap-3 px-5" style={{ backgroundColor: '#FAF7F2' }}>
                <div className="flex items-center gap-3">
                    <CircleCheckBig size={24} style={{ color: '#16a34a' }} />
                    <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>Payment Received</h2>
                </div>
                <p className="text-sm text-center" style={{ color: '#6F6863' }}>
                    You'll receive a receipt via email shortly. Thank you!
                </p>
            </div>
        )
    }

    if (!options?.clientSecret || !promise) {
        return (
            <div className="w-full h-screen flex justify-center items-center" style={{ backgroundColor: '#FAF7F2' }}>
                <Loader2 className="size-8 animate-spin" style={{ color: '#6F6863' }} />
            </div>
        )
    }

    const cm = appointmentData.client_metadata as any
    const sd = appointmentData.service_data as any
    const addons: any[] = appointmentData.selected_addons ?? []

    return (
        <div className="w-full min-h-screen py-10 px-4" style={{ backgroundColor: '#FAF7F2' }}>
            <Elements stripe={promise} options={options}>
                <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-4">
                    {/* Summary */}
                    <div className="flex-1 rounded-xl p-6 flex flex-col gap-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>
                                Appointment Summary
                            </p>
                            <h2 className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                                {sd?.name}
                            </h2>
                        </div>

                        <div className="flex flex-col gap-3" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                            <SummaryRow
                                label="Date"
                                value={appointmentData.start ? DateTime.fromISO(appointmentData.start).toFormat('DDDD') : '—'}
                            />
                            <SummaryRow
                                label="Time"
                                value={appointmentData.start
                                    ? `${DateTime.fromISO(appointmentData.start).toLocaleString(DateTime.TIME_SIMPLE)} – ${DateTime.fromISO(appointmentData.end).toLocaleString(DateTime.TIME_SIMPLE)}`
                                    : '—'}
                            />
                            <SummaryRow label="Service" value={sd?.name ?? '—'} />
                            {appointmentData.require_deposit && (
                                <SummaryRow label="Deposit Paid" value={fmt(appointmentData.deposit_price ?? 0)} />
                            )}
                        </div>

                        {cm && (
                            <div className="flex flex-col gap-1" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>Client</p>
                                <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                    {cm.firstName} {cm.lastName}
                                </p>
                                <p className="text-sm" style={{ color: '#6F6863' }}>{cm.email}</p>
                                <p className="text-sm" style={{ color: '#6F6863' }}>{formatPhone(cm.phoneNumber ?? '')}</p>
                            </div>
                        )}

                        {addons.length > 0 && (
                            <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>Add-ons</p>
                                {addons.map((addon, i) => (
                                    <div key={i} className="flex justify-between">
                                        <p className="text-sm" style={{ color: '#1A1818' }}>{addon.name}</p>
                                        <p className="text-sm" style={{ color: '#6F6863' }}>{fmt(addon.price)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="rounded-lg px-4 py-3" style={{ backgroundColor: '#0F0E0E' }}>
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Due Now</p>
                                <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#FFFFFF' }}>
                                    {fmt(appointmentData.amount_due ?? 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="flex-1 rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>Payment</p>
                            <p className="text-sm" style={{ color: '#6F6863' }}>
                                Complete your payment below to finalise your appointment.
                            </p>
                        </div>
                        <EOAPaymentForm appointmentID={appointment_id} stripeID={stripeID!} />
                    </div>
                </div>
            </Elements>
        </div>
    )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <p className="text-sm" style={{ color: '#6F6863' }}>{label}</p>
            <p className="text-sm font-medium text-right" style={{ color: '#1A1818' }}>{value}</p>
        </div>
    )
}

function EOAPaymentForm({ appointmentID, stripeID }: { appointmentID: string; stripeID: string }) {
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
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Pay for Appointment'}
            </Button>
        </form>
    )
}
