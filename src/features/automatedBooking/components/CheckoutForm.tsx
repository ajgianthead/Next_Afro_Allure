'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { DateTime } from "luxon";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { bookAppointment } from "../../../app/business/[businessName]/actions";
import { Check, Loader2 } from "lucide-react";
import { useBooking } from "../hooks/useBookingData";
import { useParams, useRouter } from "next/navigation";


function BookingCheckbox({
    id, checked, onChange, children,
}: {
    id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode
}) {
    return (
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer select-none">
            <button
                id={id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className="shrink-0 flex items-center justify-center rounded-md transition-colors mt-0.5"
                style={{
                    width: 18, height: 18,
                    border: checked ? 'none' : '1.5px solid var(--t-primary)',
                    backgroundColor: checked ? 'var(--t-primary)' : 'transparent',
                }}
            >
                {checked && <Check size={11} color="var(--t-primary-text)" strokeWidth={3} />}
            </button>
            <span className="text-xs leading-relaxed" style={{ color: 'var(--t-muted)' }}>{children}</span>
        </label>
    )
}

export const CheckoutForm = ({
    service, paymentIntentID, setError, setOpenErrorDialog,
    setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness,
}: {
    setRbbOpen?: any; agreedBusiness: boolean; setAgreedBusiness: any
    agreedAfroAllure: boolean; setAgreedAfroAllure: any
    service: any; paymentIntentID: string; setError: any; setOpenErrorDialog: any
}) => {
    const { data }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const elements = useElements();
    const stripe = useStripe();
    const router = useRouter();
    const { businessName } = useParams<{ businessName: string }>();
    const [submitting, setSubmitting] = useState(false)
    const [selectedAddons, setSelectedAddons] = useState<any[]>([])
    const [addonSum, setAddonSum] = useState<number>(0)

    useEffect(() => {
        const addons = data.services.filter((s) => s.id === data.selectedService)[0].addons
        const selected_addons: any[] = []
        let sum = 0
        addons.forEach((addon: any) => {
            if (data.selectedAddons.includes(addon.id)) {
                selected_addons.push(addon)
                sum += (addon.price / 100)
            }
        })
        setSelectedAddons(selected_addons)
        setAddonSum(sum)
    }, [])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements || submitting) return;
        setSubmitting(true)
        try {
            await bookAppointment(
                data.selectedAddons, paymentIntentID, data.business_id, data.booking_policy.id,
                service, data.clientInfo,
                { start: data.selectedDateTime.start!, end: data.selectedDateTime.end!, appointmentLength: service.length },
                Intl.DateTimeFormat().resolvedOptions().timeZone
            )
            const { error } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
                confirmParams: {
                    return_url: `${window.location.origin}/${businessName}/book/complete`,
                },
            })
            if (error) throw new Error(error.message)
            router.push(`/${businessName}/book/complete`)
        } catch (err: any) {
            setError(err.message ?? 'Something went wrong. Please try again.')
            setOpenErrorDialog(true)
        } finally {
            setSubmitting(false)
        }
    }

    const startDT = data.selectedDateTime.start ? DateTime.fromISO(data.selectedDateTime.start) : null
    const endDT = data.selectedDateTime.end ? DateTime.fromISO(data.selectedDateTime.end) : null
    const dueNow = data.booking_policy.deposit.settings.type === 'flat'
        ? data.booking_policy.deposit.settings.value
        : ((service.price / 100) + addonSum) * (data.booking_policy.deposit.settings.value / 100)

    return (
        <div className="flex flex-col lg:flex-row gap-4 w-full">
            {/* Summary card */}
            <div
                className="lg:w-1/2 w-full p-5 flex flex-col gap-4"
                style={{
                    backgroundColor: 'var(--t-card)',
                    border: '1px solid var(--t-border)',
                    borderRadius: 'var(--t-card-r)',
                }}
            >
                <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--t-text)', fontFamily: 'var(--t-font)' }}>Appointment Summary</h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--t-muted)' }}>This amount is the deposit needed to confirm your appointment</p>
                </div>

                <div style={{ height: 1, backgroundColor: 'var(--t-border)' }} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--t-muted)' }}>Date</p>
                        <p className="text-sm" style={{ color: 'var(--t-text)' }}>{startDT ? startDT.toFormat('LLLL dd, yyyy') : '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--t-muted)' }}>Time</p>
                        <p className="text-sm" style={{ color: 'var(--t-text)' }}>
                            {startDT ? startDT.toLocaleString(DateTime.TIME_SIMPLE) : '—'}
                            {endDT ? ` – ${endDT.toLocaleString(DateTime.TIME_SIMPLE)}` : ''}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--t-muted)' }}>Service</p>
                        <p className="text-sm" style={{ color: 'var(--t-text)' }}>{service.name}</p>
                        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>${service.price / 100}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--t-muted)' }}>Client</p>
                        <p className="text-sm" style={{ color: 'var(--t-text)' }}>{data.clientInfo.firstName} {data.clientInfo.lastName}</p>
                        <p className="text-sm" style={{ color: 'var(--t-muted)' }}>{data.clientInfo.email}</p>
                    </div>
                </div>

                {selectedAddons.length > 0 && (
                    <>
                        <div style={{ height: 1, backgroundColor: 'var(--t-border)' }} />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--t-muted)' }}>Add-ons</p>
                            {selectedAddons.map((addon: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm" style={{ color: 'var(--t-text)' }}>
                                    <span>{addon.name}</span>
                                    <span>${addon.price / 100}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div style={{ height: 1, backgroundColor: 'var(--t-border)' }} />

                <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: 'var(--t-muted)' }}>Due now</p>
                    <p className="text-xl font-bold" style={{ color: 'var(--t-primary)', fontFamily: 'var(--t-font)' }}>
                        ${dueNow}
                    </p>
                </div>
            </div>

            {/* Payment card */}
            <div
                className="lg:w-1/2 w-full p-5 flex flex-col gap-4"
                style={{
                    backgroundColor: 'var(--t-card)',
                    border: '1px solid var(--t-border)',
                    borderRadius: 'var(--t-card-r)',
                }}
            >
                <p className="text-xs italic" style={{ color: 'var(--t-muted)' }}>
                    * A deposit is required to confirm this appointment
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <PaymentElement className="w-full" />

                    <div className="flex flex-col gap-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
                        <BookingCheckbox id="afroallure-cf" checked={agreedAfroAllure} onChange={setAgreedAfroAllure}>
                            I agree to AfroAllure&apos;s{' '}
                            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{ color: 'var(--t-primary)' }}>
                                Terms & Conditions
                            </a>{' '}and{' '}
                            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{ color: 'var(--t-primary)' }}>
                                Privacy Policy
                            </a>
                        </BookingCheckbox>
                        <BookingCheckbox id="business-cf" checked={agreedBusiness} onChange={setAgreedBusiness}>
                            I agree to this business&apos;s policies as outlined in the{' '}
                            <button
                                type="button"
                                className="font-semibold hover:opacity-70"
                                style={{ color: 'var(--t-primary)' }}
                                onClick={() => setRbbOpen(true)}
                            >
                                Read Before Booking
                            </button>{' '}
                            section, including refund & cancellation policies.
                        </BookingCheckbox>
                    </div>

                    <button
                        type="submit"
                        disabled={!(agreedAfroAllure && agreedBusiness) || submitting}
                        className="flex items-center justify-center gap-2 w-full text-sm font-medium py-2.5 transition-opacity hover:opacity-90 disabled:opacity-40 mt-2"
                        style={{
                            backgroundColor: 'var(--t-primary)',
                            color: 'var(--t-primary-text)',
                            borderRadius: 'var(--t-btn-r)',
                            border: 'none',
                        }}
                    >
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        Book Appointment
                    </button>
                </form>
            </div>
        </div>
    )
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    return phone
}
