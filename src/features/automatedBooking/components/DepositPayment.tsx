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
import { CircularProgress } from "@mui/joy";

function getDepositAmountCents(policy: any, servicePrice: number, addonPriceCents: number): number {
    const total = servicePrice + addonPriceCents
    if (policy?.deposit?.settings?.type === 'flat') {
        return Math.round((policy.deposit.settings.value ?? 0) * 100)
    }
    if (policy?.deposit?.settings?.type === 'percentage') {
        return Math.round(total * (policy.deposit.settings.value ?? 0) / 100)
    }
    return total
}

export const DepositPayment = ({ setError, setOpenErrorDialog, setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setError: any, setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any, setOpenErrorDialog: any }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [id, setID] = useState<string>("")
    const selectedServiceData = data.services.find((s: ServiceType) => s.id === data.selectedService)

    useEffect(() => {
        const fetchSession = async () => {
            const addonPriceCents = (selectedServiceData?.addons as any[] ?? [])
                .filter((a: any) => data.selectedAddons.includes(a.id))
                .reduce((sum: number, a: any) => sum + (a.price ?? 0), 0)
            const depositAmount = getDepositAmountCents(data.booking_policy, selectedServiceData?.price ?? 0, addonPriceCents)

            const checkout = await createCheckout(
                CheckoutType.DEPOSIT,
                AppointmentType.AUTOMATED,
                depositAmount,
                data.business_id,
                undefined,
                data.bookingSession?.id
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

    return (
        <div>
            {data.options && promise && id.length > 0 ? (
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
            ) : (
                <div className="w-full h-screen flex justify-center items-center">
                    <CircularProgress />
                </div>
            )}
        </div>
    )
}
