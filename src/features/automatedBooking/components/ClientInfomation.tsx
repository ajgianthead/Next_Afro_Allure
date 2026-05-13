'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { Check } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useBooking } from "../hooks/useBookingData";

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

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

export const ClientInfo = ({
    setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness,
}: {
    setRbbOpen?: any; agreedBusiness: boolean; setAgreedBusiness: any
    agreedAfroAllure: boolean; setAgreedAfroAllure: any
}) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();

    return (
        <div className="flex flex-col items-center w-full">
            <div className="w-full md:w-2/3 mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--t-text)', fontFamily: SERIF }}>Contact Information</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--t-muted)' }}>Enter your information below</p>
            </div>

            <div
                className="w-full md:w-2/3 flex flex-col gap-3 p-5"
                style={{
                    backgroundColor: 'var(--t-card)',
                    border: '1px solid var(--t-border)',
                    borderRadius: 'var(--t-card-r)',
                }}
            >
                <div className="flex gap-3">
                    <input
                        placeholder="First Name"
                        value={data.clientInfo.firstName}
                        onChange={(e) => setData((prev) => ({ ...prev, clientInfo: { ...prev.clientInfo, firstName: e.target.value } }))}
                        className="flex-1 text-sm px-3.5 py-2.5 outline-none transition-colors"
                        style={{
                            borderRadius: 'var(--t-input-r)',
                            border: '1px solid var(--t-border)',
                            backgroundColor: 'var(--t-bg)',
                            color: 'var(--t-text)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--t-primary)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--t-border)')}
                    />
                    <input
                        placeholder="Last Name"
                        value={data.clientInfo.lastName}
                        onChange={(e) => setData((prev) => ({ ...prev, clientInfo: { ...prev.clientInfo, lastName: e.target.value } }))}
                        className="flex-1 text-sm px-3.5 py-2.5 outline-none transition-colors"
                        style={{
                            borderRadius: 'var(--t-input-r)',
                            border: '1px solid var(--t-border)',
                            backgroundColor: 'var(--t-bg)',
                            color: 'var(--t-text)',
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--t-primary)')}
                        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--t-border)')}
                    />
                </div>
                <input
                    type="email"
                    placeholder="Email"
                    value={data.clientInfo.email}
                    onChange={(e) => setData((prev) => ({ ...prev, clientInfo: { ...prev.clientInfo, email: e.target.value } }))}
                    className="w-full text-sm px-3.5 py-2.5 outline-none transition-colors"
                    style={{
                        borderRadius: 'var(--t-input-r)',
                        border: '1px solid var(--t-border)',
                        backgroundColor: 'var(--t-bg)',
                        color: 'var(--t-text)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--t-primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--t-border)')}
                />
                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={data.clientInfo.phoneNumber}
                    onChange={(e) => setData((prev) => ({ ...prev, clientInfo: { ...prev.clientInfo, phoneNumber: e.target.value } }))}
                    className="w-full text-sm px-3.5 py-2.5 outline-none transition-colors"
                    style={{
                        borderRadius: 'var(--t-input-r)',
                        border: '1px solid var(--t-border)',
                        backgroundColor: 'var(--t-bg)',
                        color: 'var(--t-text)',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--t-primary)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--t-border)')}
                />

                {!data.booking_policy.deposit.enabled && (
                    <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid var(--t-border)' }}>
                        <BookingCheckbox id="afroallure-ci" checked={agreedAfroAllure} onChange={setAgreedAfroAllure}>
                            I agree to AfroAllure&apos;s{' '}
                            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{ color: 'var(--t-primary)' }}>
                                Terms & Conditions
                            </a>{' '}and{' '}
                            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-semibold hover:opacity-70" style={{ color: 'var(--t-primary)' }}>
                                Privacy Policy
                            </a>
                        </BookingCheckbox>
                        <BookingCheckbox id="business-ci" checked={agreedBusiness} onChange={setAgreedBusiness}>
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
                )}
            </div>
        </div>
    )
}
