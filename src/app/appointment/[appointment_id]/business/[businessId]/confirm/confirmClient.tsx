'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'
import React, { useEffect, useState } from 'react'
import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js'
import { CircleCheckBig, Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { Button } from '@/components/ui/button'
import { createCheckout } from '@/lib/stripe/createCheckout'
import { AppointmentType, CheckoutType } from '@/features/shared/appointments/types'
import { Appointment } from '@/features/manualBooking/server/models/Appointment'
import { confirmAppointment } from '../actions'
import { BusinessUser } from '@/lib/businessUser/BusinessUser'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

interface PageProps {
    appointment: InstanceType<typeof Appointment>
    business: InstanceType<typeof BusinessUser>
}

export default function ConfirmAppClient({ appointment, business }: PageProps) {
    const [options, setOptions] = useState<{ clientSecret: any }>()
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [stripeID, setStripeID] = useState<string | null>(null)
    const [amountDue, setAmountDue] = useState<number>()
    const [completed, setCompleted] = useState<boolean | null>(
        appointment.status === 'CONFIRMED' ? true : null
    )
    const [confirming, setConfirming] = useState(false)
    const [confirmError, setConfirmError] = useState('')

    useEffect(() => {
        if (appointment.status === 'CONFIRMED') return

        if (!appointment.requireDeposit) {
            setCompleted(false)
            return
        }

        const initStripe = async () => {
            const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
                stripeAccount: business.stripeAccountId,
            })
            setStripePromise(stripePromise)
            setStripeID(business.stripeAccountId)
            const res = await createCheckout(
                CheckoutType.DEPOSIT,
                AppointmentType.MANUAL,
                appointment.depositPrice,
                appointment.businessId,
                appointment.id
            )
            setAmountDue(res?.amount)
            setOptions({ clientSecret: res?.client_secret })
            setCompleted(false)
        }
        initStripe()
    }, [])

    const handleConfirm = async () => {
        setConfirming(true)
        setConfirmError('')
        try {
            const result = await confirmAppointment(appointment.id, appointment.businessId)
            if (!Array.isArray(result)) setCompleted(true)
        } catch (err: any) {
            setConfirmError(err?.message ?? 'Something went wrong. Please try again.')
        } finally {
            setConfirming(false)
        }
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
                    <h2 className="text-lg font-semibold" style={{ color: '#1A1818' }}>Appointment Confirmed</h2>
                </div>
                <p className="text-sm text-center" style={{ color: '#6F6863' }}>
                    If you have any questions, please contact {business.name}.
                </p>
            </div>
        )
    }

    if (appointment.requireDeposit && options?.clientSecret && promise) {
        return (
            <div className="w-full min-h-screen py-10 px-4" style={{ backgroundColor: '#FAF7F2' }}>
                <Elements stripe={promise} options={options}>
                    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-4">
                        <AppointmentSummary appointment={appointment} amountDue={amountDue} />
                        <div className="flex-1 rounded-xl p-6 flex flex-col gap-4" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}>
                            <p className="text-sm" style={{ color: '#6F6863' }}>
                                A deposit is required to confirm your appointment.
                            </p>
                            <PaymentForm appointmentID={appointment.id} stripeID={stripeID!} />
                        </div>
                    </div>
                </Elements>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen flex justify-center items-start px-4 py-16" style={{ backgroundColor: '#FAF7F2' }}>
            <div className="w-full max-w-xl flex flex-col gap-4">
                <AppointmentSummary appointment={appointment} amountDue={undefined} />
                {confirmError && (
                    <p className="text-sm" style={{ color: '#FC6161' }}>{confirmError}</p>
                )}
                <div className="flex justify-end">
                    <Button
                        onClick={handleConfirm}
                        disabled={confirming}
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
                    >
                        {confirming ? <Loader2 className="size-4 animate-spin" /> : 'Confirm Appointment'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function AppointmentSummary({
    appointment,
    amountDue,
}: {
    appointment: InstanceType<typeof Appointment>
    amountDue?: number
}) {
    const fmt = (cents: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

    return (
        <div
            className="flex-1 rounded-xl p-6 flex flex-col gap-5"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
        >
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#6F6863' }}>
                    Appointment Summary
                </p>
                <h2 className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                    {appointment.serviceData.name}
                </h2>
            </div>

            <div className="flex flex-col gap-3" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                <Row label="Date" value={DateTime.fromISO(appointment.start).toFormat('DDDD')} />
                <Row
                    label="Time"
                    value={`${DateTime.fromISO(appointment.start).toFormat('t')} – ${DateTime.fromISO(appointment.end).toFormat('t')}`}
                />
                <Row label="Price" value={fmt(appointment.serviceData.price)} />
                {appointment.requireDeposit && (
                    <Row label="Deposit" value={fmt(appointment.depositPrice)} />
                )}
            </div>

            <div className="flex flex-col gap-1" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                    Client
                </p>
                <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                    {appointment.clientMetadata.firstName} {appointment.clientMetadata.lastName}
                </p>
                <p className="text-sm" style={{ color: '#6F6863' }}>{appointment.clientMetadata.email}</p>
            </div>

            {(appointment.selectedAddons?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #F0EBE3', paddingTop: '1rem' }}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#6F6863' }}>
                        Add-ons
                    </p>
                    {appointment.selectedAddons.map((addon: any, i: number) => (
                        <div key={i} className="flex justify-between">
                            <p className="text-sm" style={{ color: '#1A1818' }}>{addon.name}</p>
                            <p className="text-sm" style={{ color: '#6F6863' }}>{fmt(addon.price)}</p>
                        </div>
                    ))}
                </div>
            )}

            {amountDue !== undefined && (
                <div
                    className="rounded-lg px-4 py-3"
                    style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E2D6' }}
                >
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium" style={{ color: '#6F6863' }}>Due Now</p>
                        <p className="text-xl font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                            {fmt(amountDue)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <p className="text-sm" style={{ color: '#6F6863' }}>{label}</p>
            <p className="text-sm font-medium text-right" style={{ color: '#1A1818' }}>{value}</p>
        </div>
    )
}

function PaymentForm({ appointmentID, stripeID }: { appointmentID: string; stripeID: string }) {
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PaymentElement className="w-full" />
            {payError && <p className="text-sm" style={{ color: '#FC6161' }}>{payError}</p>}
            <Button
                type="submit"
                disabled={!stripe || !elements || submitting}
                style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF' }}
            >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Pay Deposit & Confirm'}
            </Button>
        </form>
    )
}
