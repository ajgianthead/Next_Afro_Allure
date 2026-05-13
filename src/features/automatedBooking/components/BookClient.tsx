"use client"
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ArrowLeftCircleIcon, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { createAppointmentAction } from '@/features/shared/appointments/actions'
import { BookingData, BookingWrapper } from '@/features/automatedBooking/context/BookingDataContext';
import { BusinessType } from '@/lib/businessUser/BusinessUser';
import { AvailabilityType } from '@/features/availability/server/models/Availability';
import { AppointmentType } from '@/features/manualBooking/server/models/Appointment';
import { ServiceType } from '@/lib/service/Service';
import { BusinessPolicyType } from '@/lib/businessPolicy/BusinessPolicy';
import { ServiceSelection } from './ServiceSelection';
import { DateTimePicker } from './DateTimePicker';
import { ClientInfo } from './ClientInfomation';
import { DepositPayment } from './DepositPayment';
import { useBooking } from '../hooks/useBookingData'
import { createBookingSessionAction, updateDateTimeAction, updateClientInfoAction, getBookingSessionAction } from '../server'
import { BookingStepper } from './BookingStepper'
import { DEFAULT_BOOKING_THEME, type BookingTheme } from '@/features/automatedBooking/types/theme'
import { useRouter } from 'next/navigation'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export function BookClient({ businessData, availabilities, appointments, services, policy, bookingLimitReached, themeData }: {
    businessData: BusinessType,
    availabilities: AvailabilityType[],
    appointments: AppointmentType[],
    services: ServiceType[],
    policy: BusinessPolicyType,
    bookingLimitReached?: boolean
    themeData?: BookingTheme | null
}) {
    return (
        <BookingWrapper businessData={businessData} availabilities={availabilities} appointments={appointments} services={services} policy={policy}>
            <Book businessName={businessData.urlName} businessData={businessData} bookingLimitReachedInitial={bookingLimitReached} themeData={themeData} />
        </BookingWrapper>
    )
}

function BookingFullMessage({ businessData }: { businessData: BusinessType }) {
    return (
        <div className="flex flex-col items-center text-center py-16 px-6 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--t-bg)' }}>
                <ArrowLeftCircleIcon size={22} style={{ color: 'var(--t-accent)' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--t-text)' }}>
                This stylist&apos;s booking slots are currently full for this month
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--t-muted)' }}>
                Please reach out to them directly to get on their waitlist.
            </p>
            {(businessData as any).email && (
                <a
                    href={`mailto:${(businessData as any).email}`}
                    className="text-sm font-medium underline-offset-2 hover:underline"
                    style={{ color: 'var(--t-accent)' }}
                >
                    {(businessData as any).email}
                </a>
            )}
        </div>
    )
}

function BookingCheckbox({
    id,
    checked,
    onChange,
    children,
}: {
    id: string
    checked: boolean
    onChange: (v: boolean) => void
    children: React.ReactNode
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
            <span className="text-xs leading-relaxed" style={{ color: 'var(--t-muted)' }}>
                {children}
            </span>
        </label>
    )
}

const Book = ({ businessName, businessData, bookingLimitReachedInitial, themeData }: {
    businessName: string
    businessData: BusinessType
    bookingLimitReachedInitial?: boolean
    themeData?: BookingTheme | null
}) => {
    const theme = { ...DEFAULT_BOOKING_THEME, ...themeData }
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [agreedAfroAllure, setAgreedAfroAllure] = useState<boolean>(false)
    const [agreedBusiness, setAgreedBusiness] = useState<boolean>(false)
    const [bookingLimitReached, setBookingLimitReached] = useState<boolean>(bookingLimitReachedInitial ?? false)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
    const [rbbOpen, setRbbOpen] = useState(false)
    const [rbbAccepted, setRbbAccepted] = useState<boolean>(false)
    const router = useRouter()

    const steps = !data.booking_policy ? [] : data.booking_policy.deposit.enabled
        ? ["Service", "Date & Time", "Contact", "Deposit"]
        : ["Service", "Date & Time", "Contact"]

    useEffect(() => {
        setRbbOpen(data.booking_policy?.readBeforeBooking?.length > 0)
    }, [data.booking_policy])

    useEffect(() => {
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('bookingSessionId') : null
        if (!sessionId) {
            setData((prev) => ({ ...prev, bookingSession: null }))
            return
        }
        getBookingSessionAction(sessionId).then((sessionData) => {
            if (!sessionData) return
            setData((prev) => ({
                ...prev,
                selectedService: sessionData.serviceId!,
                selectedDateTime: {
                    start: sessionData.selectDateTime!,
                    end: DateTime.fromISO(sessionData.selectDateTime!).plus({
                        minutes: prev.services.find((s) => s.id === sessionData.serviceId!)?.length ?? 0
                    }).toISO()!
                },
                options: { ...prev.options, clientSecret: sessionData.paymentIntentId },
                clientInfo: sessionData.clientInfo as any,
                bookingSession: sessionData,
            }))
            if (sessionData.status === 'initiated') setActiveStep(1)
            else if (sessionData.status === 'date_selected') setActiveStep(2)
            else if (sessionData.status === 'details_completed') setActiveStep(data.booking_policy.deposit.enabled ? 3 : 2)
            else setActiveStep(0)
        })
    }, [])

    useEffect(() => {
        if (data.bookingSession) setIsLoading(false)
    }, [data.bookingSession])

    const renderActiveStep = () => {
        const sharedProps = { setRbbOpen, setAgreedAfroAllure, setAgreedBusiness, agreedAfroAllure, agreedBusiness }
        switch (activeStep) {
            case 0: return <ServiceSelection />
            case 1: return <DateTimePicker />
            case 2: return <ClientInfo {...sharedProps} />
            case 3: return <DepositPayment {...sharedProps} setError={setError} setOpenErrorDialog={setOpenErrorDialog} />
            default: return null
        }
    }

    const handleSubmit = async () => {
        const { firstName, lastName, email, phoneNumber } = data.clientInfo
        if (!firstName || !lastName || !email || !phoneNumber) {
            setError("Please fill in all contact information fields")
            setOpenErrorDialog(true)
            return false
        }
        await createAppointmentAction({
            business: data.business_id,
            start: data.selectedDateTime.start!,
            end: data.selectedDateTime.end!,
            status: "CONFIRMED",
            client_metadata: data.clientInfo,
            service_data: data.services.filter((service) => service.id === data.selectedService)[0],
            policy_id: data.booking_policy.id,
            require_deposit: false,
            paid_deposit: false,
            deposit_charge_id: "",
            reschedules: data.booking_policy.rescheduleLimit,
            deposit_price: null,
            selected_addons: data.selectedAddons
        })
        return true
    }

    const handleSessionUpdates = async () => {
        if (activeStep === 0 && !data.bookingSession && data.selectedService.length > 0) {
            const session = await createBookingSessionAction(data.business_id, data.selectedService)
            localStorage.setItem('bookingSessionId', session.id!)
            setData((prev) => ({
                ...prev, bookingSession: {
                    id: session.id,
                    businessId: session.business_id,
                    serviceId: session.service_id,
                    selectDateTime: session.selected_datetime,
                    clientInfo: session.clientInfo as { firstName: string; lastName: string; email: string; phoneNumber: string; },
                    status: session.status,
                    metaData: session.metadata as any,
                    amountDue: session.amount,
                    currency: session.currency!,
                    expiresAt: session.expires_at,
                    confirmedAt: session.confirmed_at,
                    paymentIntentId: session.payment_intent_id,
                    updatedAt: session.updated_at!
                }
            }))
        } else if (activeStep === 1 && data.bookingSession && Object.values(data.selectedDateTime).length > 0) {
            const updatedSession = await updateDateTimeAction(data.bookingSession.id!, `${data.selectedDateTime.start!}`)
            setData((prev) => ({
                ...prev,
                bookingSession: prev.bookingSession ? {
                    ...prev.bookingSession,
                    selectDateTime: updatedSession.selected_datetime
                } : prev.bookingSession
            }))
        } else if (activeStep === 2 && data.bookingSession && data.clientInfo.firstName.length > 0) {
            const updatedSession = await updateClientInfoAction(data.bookingSession.id!, data.clientInfo)
            setData((prev) => ({
                ...prev,
                bookingSession: prev.bookingSession ? {
                    ...prev.bookingSession,
                    clientInfo: updatedSession.clientInfo as any,
                    status: updatedSession.status,
                    selectDateTime: updatedSession.selected_datetime
                } : prev.bookingSession
            }))
        }
    }

    const handleNext = async () => {
        await handleSessionUpdates()
        setActiveStep((prev) => Math.min(prev + 1, steps.length - 1))
    }

    const canGoNext =
        (activeStep === 0 && data.selectedService.length > 0) ||
        (activeStep === 1 && Object.values(data.selectedDateTime).filter(Boolean).length > 0) ||
        (activeStep === 2 && data.clientInfo.firstName.length > 0 && data.clientInfo.lastName.length > 0 && data.clientInfo.email.length > 0 && data.clientInfo.phoneNumber.length > 0)

    const themeVars = {
        '--t-bg': theme.backgroundColor,
        '--t-card': theme.cardColor,
        '--t-border': theme.borderColor,
        '--t-primary': theme.primaryColor,
        '--t-primary-text': theme.primaryTextColor,
        '--t-text': theme.textColor,
        '--t-muted': theme.mutedColor,
        '--t-accent': theme.accentColor,
        '--t-btn-r': theme.buttonRadius,
        '--t-input-r': theme.inputRadius,
        '--t-card-r': theme.cardRadius,
    } as React.CSSProperties

    return (
        <div style={{ ...themeVars, backgroundColor: 'var(--t-bg)', minHeight: '100dvh' }}>
            {/* Read Before Booking modal */}
            {rbbOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                >
                    <div
                        className="w-full max-w-md overflow-hidden"
                        style={{
                            backgroundColor: 'var(--t-card)',
                            border: '1px solid var(--t-border)',
                            borderRadius: 'var(--t-card-r)',
                        }}
                    >
                        <div className="p-5" style={{ borderBottom: '1px solid var(--t-border)' }}>
                            <h2 className="text-base font-semibold" style={{ color: 'var(--t-text)', fontFamily: SERIF }}>
                                Please Read Before Booking
                            </h2>
                            <p className="text-sm mt-1" style={{ color: 'var(--t-muted)' }}>
                                Make sure you understand the policies before continuing
                            </p>
                        </div>
                        <div className="p-5 max-h-60 overflow-y-auto">
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--t-text)' }}>
                                {data.booking_policy?.readBeforeBooking}
                            </p>
                        </div>
                        <div className="p-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--t-border)' }}>
                            <BookingCheckbox
                                id="rbb-accept"
                                checked={rbbAccepted}
                                onChange={setRbbAccepted}
                            >
                                I understand and agree
                            </BookingCheckbox>
                            <button
                                disabled={!rbbAccepted}
                                onClick={() => setRbbOpen(false)}
                                className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-90 disabled:opacity-40"
                                style={{
                                    backgroundColor: 'var(--t-primary)',
                                    color: 'var(--t-primary-text)',
                                    borderRadius: 'var(--t-btn-r)',
                                    border: 'none',
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error toast */}
            {openErrorDialog && (
                <div
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm"
                    style={{ backgroundColor: 'rgba(252,97,97,0.1)', color: '#DC2626', border: '1px solid rgba(252,97,97,0.2)' }}
                >
                    {error}
                    <button
                        onClick={() => setOpenErrorDialog(false)}
                        className="ml-2 font-medium hover:opacity-70"
                        style={{ color: '#DC2626' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Top bar */}
            <div
                className="w-full flex items-center px-5 py-4"
                style={{ borderBottom: '1px solid var(--t-border)' }}
            >
                <Link
                    href={`/${businessName}`}
                    className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                    style={{ color: 'var(--t-muted)' }}
                >
                    <ArrowLeftCircleIcon size={18} />
                    Back
                </Link>
            </div>

            {isLoading ? (
                <div className="w-full flex justify-center items-center" style={{ height: 'calc(100dvh - 57px)' }}>
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--t-primary)' }} />
                </div>
            ) : (
                <div className="flex flex-col items-center px-4 py-6">
                    <div className="w-full max-w-3xl">
                        {bookingLimitReached ? (
                            <BookingFullMessage businessData={businessData} />
                        ) : (
                            <>
                                <BookingStepper steps={steps} activeStep={activeStep} />
                                <div className="mb-6">{renderActiveStep()}</div>

                                {/* Nav buttons */}
                                <div className="flex items-center justify-between">
                                    <button
                                        disabled={activeStep === 0}
                                        onClick={() => setActiveStep(activeStep - 1)}
                                        className="text-sm font-medium px-5 py-2.5 transition-opacity hover:opacity-80 disabled:opacity-40"
                                        style={{
                                            border: '1px solid var(--t-border)',
                                            borderRadius: 'var(--t-btn-r)',
                                            color: 'var(--t-text)',
                                            backgroundColor: 'var(--t-card)',
                                        }}
                                    >
                                        Back
                                    </button>

                                    {activeStep < steps.length - 1 ? (
                                        <button
                                            disabled={!canGoNext}
                                            onClick={handleNext}
                                            className="text-sm font-medium px-5 py-2.5 transition-opacity hover:opacity-90 disabled:opacity-40"
                                            style={{
                                                backgroundColor: 'var(--t-primary)',
                                                color: 'var(--t-primary-text)',
                                                borderRadius: 'var(--t-btn-r)',
                                                border: 'none',
                                            }}
                                        >
                                            Next
                                        </button>
                                    ) : !data.booking_policy?.deposit?.enabled ? (
                                        <button
                                            disabled={!(agreedAfroAllure && agreedBusiness) || submitting}
                                            onClick={async () => {
                                                setSubmitting(true)
                                                try {
                                                    const res = await handleSubmit()
                                                    if (res) router.push(`/${businessName}/book/complete`)
                                                } catch (err: any) {
                                                    if (err?.message?.includes('BOOKING_LIMIT_REACHED')) {
                                                        setBookingLimitReached(true)
                                                    } else {
                                                        setError("Something went wrong. Please try again.")
                                                        setOpenErrorDialog(true)
                                                    }
                                                } finally {
                                                    setSubmitting(false)
                                                }
                                            }}
                                            className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 transition-opacity hover:opacity-90 disabled:opacity-40"
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
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
