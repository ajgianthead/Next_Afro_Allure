"use client"
import Input from '@components/Input'
import { Caption, Text, Title } from '@tailus-ui/typography'
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepButton from '@mui/joy/StepButton';
import StepIndicator from '@mui/joy/StepIndicator';
import { ArrowLeftCircleIcon, Check } from 'lucide-react'
import Card from '@tailus-ui/Card'
import Separator from "@tailus-ui/Separator"
import Link from 'next/link'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Skeleton from '@mui/joy/Skeleton';
import { DateTime } from 'luxon'
import { getAvailability, getUnavailability } from '../../../app/business/[businessName]/actions'
import { createAppointmentAction } from '@/features/shared/appointments/actions'
import { getSlots } from "slot-calculator"
import { useParams, useRouter } from 'next/navigation'
import CircularProgress from '@mui/joy/CircularProgress'
import Dialog from '@components/Dialog';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BookingData, BookingWrapper } from '@/features/automatedBooking/context/BookingDataContext';
import { Card as MUICard, Button, Checkbox, Snackbar, Modal, DialogContent, DialogTitle, ModalClose, Typography, ModalDialog, Divider } from '@mui/joy';
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

export function BookClient({ businessData, availabilities, appointments, services, policy }: {
    businessData: BusinessType,
    availabilities: AvailabilityType[],
    appointments: AppointmentType[],
    services: ServiceType[],
    policy: BusinessPolicyType
}) {
    const params = useParams();
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && window.gtag) {
    //         window.gtag('event', 'business_page_view', {
    //             business_slug: businessData.urlName, // or dynamically pulled from the route
    //             page_type: 'book',
    //         });
    //     }
    // }, []);
    return <BookingWrapper businessData={businessData} availabilities={availabilities} appointments={appointments} services={services} policy={policy}>
        <Book businessName={businessData.urlName} />
    </BookingWrapper>
}


const Book = ({ businessName }: { businessName: string }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [agreedAfroAllure, setAgreedAfroAllure] = useState<boolean>(false)
    const [agreedBusiness, setAgreedBusiness] = useState<boolean>(false)

    const steps = !data.booking_policy ? [] : data.booking_policy.deposit.enabled
        ? ["Select a service", "Pick a date and a time", "Contact Information", "Pay Booking Deposit"]
        : ["Select a service", "Pick a date and a time", "Contact Information"]

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
    const [submitting, setSubmitting] = useState<boolean>(false)
    const router = useRouter()
    const handleSubmit = async () => {
        const { firstName, lastName, email, phoneNumber } = data.clientInfo
        if (!firstName || !lastName || !email || !phoneNumber) {
            setError("Please fill in all contact information fields")
            setOpenErrorDialog(true)
            return
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
    const [error, setError] = useState<string>("")
    const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
    const [rbbOpen, setRbbOpen] = useState(data.booking_policy.readBeforeBooking.length > 0)
    const [accepted, setAccepted] = useState<boolean>(false)

    const handleSessionUpdates = async () => {
        // This function can be used to handle any updates to the booking session after each step
        if (activeStep === 0 && !data.bookingSession && data.selectedService.length > 0) {
            // Call API to update selected service in session
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
            // Call API to update selected date and time in session
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
    console.log(data);

    return (
        <div className='flex justify-center items-center flex-col'>
            <Modal
                open={rbbOpen}

            >
                <ModalDialog className="w-md rounded-2xl p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b">
                        <DialogTitle className="text-lg font-semibold">
                            Please Read Before Booking
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Make sure you understand the policies before continuing
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-5 max-h-75 overflow-y-auto space-y-3">
                        <Typography className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {data.booking_policy.readBeforeBooking}
                        </Typography>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="accent-indigo-600"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                            />
                            I understand and agree
                        </label>

                        <button
                            disabled={!accepted}
                            onClick={() => setRbbOpen(false)}
                            className={`px-4 py-2 rounded-lg text-white transition
          ${accepted
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : "bg-gray-300 cursor-not-allowed"}
        `}
                        >
                            Continue
                        </button>
                    </div>
                </ModalDialog>
            </Modal>
            <Snackbar
                color='danger'
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                open={openErrorDialog}
                onClose={() => {
                    setOpenErrorDialog(false)
                }}
            >
                {error}
            </Snackbar>
            <div className='w-full grid grid-cols-3 p-5'>
                <a href="/afroallure" className='items-center flex max-w-min'>
                    <Caption className='flex text-md items-center gap-2 cursor-pointer'>
                        <ArrowLeftCircleIcon size={18} />
                        Back
                    </Caption>
                </a>
                <div className='flex justify-center'>
                    <Typography level='h1'>LOGO</Typography>
                </div>
            </div>
            <Divider orientation='horizontal' className="px-10" />
            {!isLoading ? <div className='md:w-3/4 w-full justify-center items-center mt-5  flex flex-col overflow-hidden'>
                <div className='w-full flex-col p-5'>
                    <div className='mb-5'>
                        <CircularProgress size="md" determinate value={((activeStep + 1) / steps.length) * 100}>
                            {`${activeStep + 1} / ${steps.length}`}
                        </CircularProgress>
                    </div>

                    {renderActiveStep()}
                </div>
                <div className='w-full flex justify-between pb-2 px-5'>
                    <Button disabled={activeStep === 0} onClick={() => {
                        setActiveStep(activeStep - 1)
                    }}>
                        Back
                    </Button>
                    {activeStep < steps.length - 1 ? <Button disabled={(activeStep === 0 && data.selectedService.length === 0) || (activeStep === 1 && Object.values(data.selectedDateTime).length === 0) || activeStep === 2 && (data.clientInfo.firstName.length === 0 || data.clientInfo.lastName.length === 0 || data.clientInfo.email.length === 0 || data.clientInfo.phoneNumber.length === 0)} onClick={handleNext}>

                        Next
                    </Button> : (!data.booking_policy.deposit.enabled ? <Button loading={submitting} disabled={!(agreedAfroAllure && agreedBusiness) || submitting} onClick={async () => {
                        setSubmitting(true)
                        try {
                            const res = await handleSubmit()
                            if (res) {
                                router.push(`/${businessName}/book/complete`)
                            }
                        } catch {
                            setError("Something went wrong. Please try again.")
                            setOpenErrorDialog(true)
                        } finally {
                            setSubmitting(false)
                        }
                    }}>
                        Book Appointment
                    </Button> : <></>)}
                </div>
            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress /></div>}

        </div>
    )
}

