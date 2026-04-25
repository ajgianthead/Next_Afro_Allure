'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { Caption, Title } from "@/components/tailus-ui/typography";
import { Card, Checkbox, Input } from "@mui/joy";
import { Dispatch, SetStateAction } from "react";
import { useBooking } from "../hooks/useBookingData";



export const ClientInfo = ({ setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    return (
        <div className='flex w-full flex-col items-center justify-center'>
            <div className='w-full md:w-1/2 mb-4 text-left'>
                <Title>Contact Information</Title>
                <Caption>Enter your information below</Caption>
            </div>
            <Card className='w-full md:w-1/2 flex flex-col gap-2'>
                <div className='flex gap-2'>
                    <Input placeholder='First Name' value={data.clientInfo.firstName} onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            clientInfo: {
                                ...prev.clientInfo,
                                firstName: e.target.value,
                            }
                        }))
                    }} />
                    <Input placeholder='Last Name' value={data.clientInfo.lastName} onChange={(e) => {
                        setData((prev) => ({
                            ...prev,
                            clientInfo: {
                                ...prev.clientInfo,
                                lastName: e.target.value
                            }
                        }))
                    }} />
                </div>
                <Input placeholder='Email' type='email' value={data.clientInfo.email} onChange={(e) => {
                    setData((prev) => ({
                        ...prev,
                        clientInfo: {
                            ...prev.clientInfo,
                            email: e.target.value
                        }
                    }))
                }} />
                <Input placeholder='Phone Number' type='tel' value={data.clientInfo.phoneNumber} onChange={(e) => {
                    setData((prev) => ({
                        ...prev,
                        clientInfo: {
                            ...prev.clientInfo,
                            phoneNumber: e.target.value
                        }
                    }))
                }} />
                {data.booking_policy.deposit.enabled ? <></> : <div className="space-y-2 mt-2">
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="afroallure"
                            checked={agreedAfroAllure}
                            onChange={(val) => setAgreedAfroAllure(val.target.checked)}
                        />
                        <label htmlFor="afroallure" className="text-sm leading-tight">
                            I agree to AfroAllure’s{" "}
                            <a
                                href="/terms-of-service"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-[#FC6161] font-semibold"
                            >
                                Terms & Conditions
                            </a>{" "}
                            and{" "}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-[#FC6161] font-semibold"
                            >
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="business"
                            checked={agreedBusiness}
                            onChange={(val) => setAgreedBusiness(val.target.checked)}
                        />
                        <label htmlFor="business" className="text-sm leading-tight">
                            I agree to this business’s policies as outlined in the{" "}
                            <button
                                type="button"
                                className="underline text-[#FC6161] font-semibold"
                                onClick={() => {
                                    // open your "read before booking" modal here
                                    setRbbOpen(true)
                                }}
                            >
                                Read Before Booking
                            </button>{" "}
                            section, including refund & cancellation policies.
                        </label>
                    </div>
                </div>}

            </Card>

        </div>
    )
}
