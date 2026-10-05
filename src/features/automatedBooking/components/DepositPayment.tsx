'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CheckoutForm } from "./CheckoutForm";
import { useBooking } from "../hooks/useBookingData";
import { createCheckout } from "@/lib/stripe/createCheckout";
import { AppointmentType, CheckoutType } from "./../../shared/appointments/types";
import { Loader2 } from "lucide-react";


export const DepositPayment = ({
    setError, setOpenErrorDialog, setRbbOpen,
    agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness,
}: {
    setError: any; setRbbOpen?: any; agreedBusiness: boolean; setAgreedBusiness: any
    agreedAfroAllure: boolean; setAgreedAfroAllure: any; setOpenErrorDialog: any
}) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [id, setID] = useState<string>("")
    const selectedServiceData = data.services.find((s: ServiceType) => s.id === data.selectedService)

    useEffect(() => {
        const fetchSession = async () => {
            // The server prices the booking and works out the deposit; this
            // used to send a browser-calculated amount, which for percentage
            // deposits was the full service price.
            const checkout = await createCheckout(
                CheckoutType.DEPOSIT,
                AppointmentType.AUTOMATED,
                0,
                data.business_id,
                undefined,
                data.bookingSession?.id,
                { serviceId: data.selectedService, addonIds: data.selectedAddons }
            )
            if (checkout) {
                setData((prev) => ({ ...prev, options: { clientSecret: checkout.client_secret! } }))
                setID(checkout.id)
            }
        }
            ; (async () => {
                if (data.stripe_id.length) {
                    const stripePromise = loadStripe(
                        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
                        { stripeAccount: data.stripe_id }
                    )
                    setStripePromise(stripePromise)
                    await fetchSession()
                }
            })()
    }, [data.stripe_id])

    if (!data.options || !promise || !id.length) {
        return (
            <div className="w-full flex justify-center items-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--t-primary)' }} />
            </div>
        )
    }

    return (
        <Elements stripe={promise} options={data.options}>
            <CheckoutForm
                setRbbOpen={setRbbOpen}
                setAgreedAfroAllure={setAgreedAfroAllure}
                setAgreedBusiness={setAgreedBusiness}
                agreedAfroAllure={agreedAfroAllure}
                agreedBusiness={agreedBusiness}
                setError={setError}
                setOpenErrorDialog={setOpenErrorDialog}
                service={selectedServiceData}
                paymentIntentID={id}
            />
        </Elements>
    )
}
