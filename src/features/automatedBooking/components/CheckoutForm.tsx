import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { DateTime } from "luxon";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { bookAppointment } from "../../../app/business/[businessName]/actions";
import { Button, Card, Checkbox } from "@mui/joy";
import { Caption, Text, Title } from "@/components/tailus-ui/typography";
import { useBooking } from "../hooks/useBookingData";
import { useParams, useRouter } from "next/navigation";

export const CheckoutForm = ({ service, paymentIntentID, setError, setOpenErrorDialog, setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any, service: any, paymentIntentID: string, setError: any, setOpenErrorDialog: any }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const elements = useElements();
    const stripe = useStripe();
    const router = useRouter();
    const { businessName } = useParams<{ businessName: string }>();
    const [submitting, setSubmitting] = useState(false)
    const [selectedAddons, setSelectedAddons] = useState<any[]>([])
    const [addonSum, setAddonSum] = useState<number>(0)

    useEffect(() => {
        const addons = data.services.filter((s) => s.id === data.selectedService)[0].addons
        let selected_addons: any = []
        let sum = 0
        addons.forEach((addon: any) => {
            if (data.selectedAddons.includes(addon.id)) {
                selected_addons.push(addon)
                sum += (addon.price / 100)
            }
        })
        setSelectedAddons(selected_addons)
        setAddonSum(sum)
    }, []);

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (!stripe || !elements || submitting) return;
        setSubmitting(true)
        try {
            const appointment = await bookAppointment(
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
            // Payment succeeded without redirect — navigate to success page
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

    return (
        <div className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl mx-auto">
            <div className="lg:w-1/2 w-full">
                <Card sx={{ width: '100%', padding: 4 }}>
                    <div className="flex flex-col h-full justify-between">
                        <div className="text-center lg:text-left">
                            <Title>Appointment Summary</Title>
                            <Caption>This amount is the deposit price needed to confirm your appointment</Caption>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
                                <div>
                                    <Text className="font-medium">Date:</Text>
                                    <Caption>{startDT ? startDT.toFormat('LLLL dd, yyyy') : '—'}</Caption>
                                </div>
                                <div>
                                    <Text className="font-medium">Time:</Text>
                                    <Caption>
                                        {startDT ? startDT.toLocaleString(DateTime.TIME_SIMPLE) : '—'}
                                        {endDT ? ` ~ ${endDT.toLocaleString(DateTime.TIME_SIMPLE)}` : ''}
                                    </Caption>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
                                <div>
                                    <Text className="font-medium">Service Information:</Text>
                                    <Caption>Name: {service.name}</Caption>
                                    <Caption>Price: ${service.price / 100}</Caption>
                                    <Caption>
                                        Deposit Required: <strong>{data.booking_policy.deposit.enabled ? 'YES' : 'NO'}</strong>
                                    </Caption>
                                </div>
                                <div>
                                    <Text className="font-medium">Client Information:</Text>
                                    <Caption>Name: {data.clientInfo.firstName} {data.clientInfo.lastName}</Caption>
                                    <Caption>Email: {data.clientInfo.email}</Caption>
                                    <Caption>
                                        Phone: {formatPhone(data.clientInfo.phoneNumber)}
                                    </Caption>
                                </div>
                            </div>
                            {selectedAddons.length > 0 && (
                                <div>
                                    <Text className="font-medium">Add-ons:</Text>
                                    {selectedAddons.map((addon: any, idx: number) => (
                                        <Caption key={idx}>{addon.name}: ${addon.price / 100}</Caption>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-center lg:text-right">
                            <Title>
                                Due Now: $
                                {data.booking_policy.deposit.settings.type === 'flat'
                                    ? data.booking_policy.deposit.settings.value
                                    : ((service.price / 100) + addonSum) * (data.booking_policy.deposit.settings.value / 100)
                                }
                            </Title>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="lg:w-1/2 w-full">
                <Card sx={{ width: '100%', padding: 4 }}>
                    <Caption className="italic mb-4">
                        *You are required to pay a deposit to confirm this appointment
                    </Caption>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <PaymentElement className="w-full" />
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="afroallure"
                                    checked={agreedAfroAllure}
                                    onChange={(e) => setAgreedAfroAllure(e.target.checked)}
                                />
                                <label htmlFor="afroallure" className="text-sm leading-tight">
                                    I agree to AfroAllure's{" "}
                                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline text-[#FC6161] font-semibold">
                                        Terms & Conditions
                                    </a>{" "}
                                    and{" "}
                                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-[#FC6161] font-semibold">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="business"
                                    checked={agreedBusiness}
                                    onChange={(e) => setAgreedBusiness(e.target.checked)}
                                />
                                <label htmlFor="business" className="text-sm leading-tight">
                                    I agree to this business's policies as outlined in the{" "}
                                    <button
                                        type="button"
                                        className="underline text-[#FC6161] font-semibold"
                                        onClick={() => setRbbOpen(true)}
                                    >
                                        Read Before Booking
                                    </button>{" "}
                                    section, including refund & cancellation policies.
                                </label>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={!(agreedAfroAllure && agreedBusiness) || submitting}
                            className="mt-4"
                        >
                            Book Appointment
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    if (digits.length === 11 && digits[0] === '1') {
        return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return phone
}
