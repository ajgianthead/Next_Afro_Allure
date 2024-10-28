'use client'

import Checkbox from '@components/Checkbox'
import Input from '@components/Input'
import Label from '@components/Label'
import Textarea from '@components/TextArea'
import Button from '@tailus-ui/Button'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { useUserContext } from '@utils/context/UserContext'
import React, { useState, useEffect } from 'react'

enum Level {
    LIGHT = "light",
    MODERATE = "moderate",
    STRICT = 'strict'
}
enum Type {
    FLAT = "flat",
    PERCENT = "percent"
}

type Policy = {
    deposit: {
        enabled: boolean;
        settings?: {
            type: Type,
            value: number
        }
    };
    lateFee: {
        enabled: boolean,
        fee?: number
    };
    noShowPolicy: {
        enabled: boolean
        level?: Level
    }
    rescheduleLimit: string;
    rescheduleDayLimit: string;
    cancelDayLimit: string;
    importantInfo: string;
    readBeforeBooking: string;
    refundPolicy: string;

}

export default function page() {
    const { user } = useUserContext()
    const [businessID, setBusinessID] = useState<string>("")
    useEffect(() => {
        if (user.business_id) {
            setBusinessID(user.business_id)
            getPolicy(user.business_id)
        }
    }, [user.business_id]);
    const [bookingPolicy, setBookingPolicy] = useState<Policy>({
        deposit: {
            enabled: false
        },
        lateFee: {
            enabled: false
        },
        noShowPolicy: {
            enabled: false
        },
        rescheduleLimit: "",
        rescheduleDayLimit: "",
        cancelDayLimit: "",
        importantInfo: "",
        readBeforeBooking: "",
        refundPolicy: ""
    });
    const getPolicy = async (id: string) => {
        const result = await fetch(`http://localhost:3000/api/policies/${id}`, {
            method: "GET"
        })
        const { policies } = await result.json()
        const policy: Policy = {
            deposit: policies.deposit,
            lateFee: policies.late_fee,
            noShowPolicy: policies.no_show,
            rescheduleLimit: policies.reschedule_limit.toString(),
            rescheduleDayLimit: policies.reschedule_day_limit.toString(),
            cancelDayLimit: policies.cancel_day_limit.toString(),
            importantInfo: policies.important_info,
            readBeforeBooking: policies.read_before_booking,
            refundPolicy: ""
        }
        setBookingPolicy(policy)
    }
    const handlePolicy = async () => {
        // Send policy data to database
        // Handle validation
        const result = await fetch("http://localhost:3000/api/policies", {
            method: 'POST',
            body: JSON.stringify({
                business: businessID,
                deposit: bookingPolicy.deposit,
                late_fee: bookingPolicy.lateFee,
                no_show: bookingPolicy.noShowPolicy,
                cancel_day_limit: Number(bookingPolicy.cancelDayLimit),
                important_info: bookingPolicy.importantInfo,
                read_before_booking: bookingPolicy.readBeforeBooking,
                reschedule_day_limit: Number(bookingPolicy.rescheduleDayLimit),
                reschedule_limit: Number(bookingPolicy.rescheduleLimit),
            })
        })
        const policyID = await result.json()
        console.log(policyID);

    }
    return (
        <div className='px-10 w-3/4'>
            <div>
                <Title>Booking Policies</Title>
                <Caption>Customize your booking policies to control how clients book with you</Caption>
            </div>
            {/* Policy Options */}
            <Text className='font-semibold mt-5 mb-2 text-gray-300'>General</Text>
            <div className='flex flex-col gap-2'>
                <div className="flex gap-2 items-center">
                    <Checkbox.Root checked={bookingPolicy.deposit.enabled} onClick={() => {
                        if (bookingPolicy.deposit.enabled && bookingPolicy.noShowPolicy.enabled) {
                            setBookingPolicy({
                                ...bookingPolicy,
                                noShowPolicy: {
                                    enabled: !bookingPolicy.noShowPolicy.enabled,
                                    level: undefined
                                },
                                deposit: {
                                    enabled: !bookingPolicy.deposit.enabled
                                }
                            })
                        } else {
                            setBookingPolicy({
                                ...bookingPolicy,
                                deposit: {
                                    enabled: !bookingPolicy.deposit.enabled
                                }
                            })
                        }
                    }}>
                        <Checkbox.Indicator />
                    </Checkbox.Root>
                    <Label>Require a deposit during booking</Label>
                </div>
                <div className="flex gap-2 items-center">
                    <Checkbox.Root checked={bookingPolicy.lateFee.enabled} onClick={() => {
                        setBookingPolicy({
                            ...bookingPolicy,
                            lateFee: {
                                enabled: !bookingPolicy.lateFee.enabled
                            }
                        })
                    }}>
                        <Checkbox.Indicator />
                    </Checkbox.Root>
                    <Label>Late fee</Label>
                </div>
                <div className="flex gap-2 flex-col">
                    <div className="flex gap-2 items-center">
                        <Checkbox.Root disabled={!bookingPolicy.deposit.enabled} checked={bookingPolicy.noShowPolicy.enabled} onClick={() => {
                            if (bookingPolicy.noShowPolicy.enabled) {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    noShowPolicy: {
                                        enabled: !bookingPolicy.noShowPolicy.enabled,
                                        level: undefined
                                    }
                                })
                            } else {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    noShowPolicy: {
                                        enabled: !bookingPolicy.noShowPolicy.enabled,
                                    }
                                })
                            }
                        }}>
                            <Checkbox.Indicator />
                        </Checkbox.Root>
                        <div>
                            <Label>Enable a no-show policy</Label>
                            <Caption>Enabling this protects decreases the likelihood of no-shows</Caption>
                        </div>
                    </div>
                    {bookingPolicy.noShowPolicy.enabled && <div className='ml-5 flex flex-col gap-2 font-medium'>
                        <div className="flex gap-2 items-center">
                            <Checkbox.Root checked={bookingPolicy.noShowPolicy.level === "light"} onClick={() => {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    noShowPolicy: {
                                        enabled: true,
                                        level: Level.LIGHT
                                    }
                                })
                            }}>
                                <Checkbox.Indicator />
                            </Checkbox.Root>
                            <div>
                                <Label className='text-green-500'>Light</Label>
                                <Caption>Keep deposit </Caption>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Checkbox.Root checked={bookingPolicy.noShowPolicy.level === "moderate"} onClick={() => {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    noShowPolicy: {
                                        enabled: true,
                                        level: Level.MODERATE
                                    }
                                })
                            }}>
                                <Checkbox.Indicator />
                            </Checkbox.Root>
                            <div>
                                <Label className='text-orange-500'>Moderate</Label>
                                <Caption>Charge full price of the appointment</Caption>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Checkbox.Root checked={bookingPolicy.noShowPolicy.level === "strict"} onClick={() => {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    noShowPolicy: {
                                        enabled: true,
                                        level: Level.STRICT
                                    }
                                })
                            }}>
                                <Checkbox.Indicator />
                            </Checkbox.Root>
                            <div>
                                <Label className='text-red-500'>Strict</Label>
                                <Caption>Charge full price, and ban their account from booking</Caption>
                            </div>
                        </div>
                    </div>}
                </div>
                <div>
                    <Text className='font-semibold mt-5 mb-2 text-gray-300'>Appointments</Text>
                    <div className='flex items-center gap-5'>
                        <Text>Clients can <span className='font-bold'>reschedule</span></Text>
                        <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.rescheduleLimit} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                rescheduleLimit: e.target.value
                            })
                        }} />
                        <Text>times before having to repay their deposit</Text>
                    </div>
                    <div className='flex items-center gap-5'>
                        <Text>Clients can't <span className='font-bold'>reschedule</span></Text>
                        <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.rescheduleDayLimit} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                rescheduleDayLimit: e.target.value
                            })
                        }} />
                        <Text>days before their appointment</Text>
                    </div>
                    <div className='flex items-center gap-5'>
                        <Text>Clients can't <span className='font-bold'>cancel</span></Text>
                        <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.cancelDayLimit} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                cancelDayLimit: e.target.value
                            })
                        }} />
                        <Text>days before their appointment</Text>
                    </div>
                </div>
                <div>
                    <Text className='font-semibold mt-5 mb-2 text-gray-300'>Booking Site</Text>
                    <div>
                        <Label htmlFor='important'>Important Information</Label>
                        <Caption>This will be the first section that'll appear on your booking site. Make sure to outline any rules, conditions, and/or expections you expect clients to follow</Caption>
                        <Textarea className="w-1/2 mt-2" required id='important' value={bookingPolicy.importantInfo} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                importantInfo: e.target.value
                            })
                        }} />
                    </div>
                    <div>
                        <Label>Read before booking</Label>
                        <Caption>Let clients know anything else they need to know before beginning to book with you</Caption>
                        <Textarea className="w-1/2 mt-2" value={bookingPolicy.readBeforeBooking} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                readBeforeBooking: e.target.value
                            })
                        }} />
                    </div>

                    <div>
                        <Label>Refund Policy</Label>
                        <Caption>Business's refund policy, if any</Caption>
                        <Textarea className="w-1/2 mt-2" value={bookingPolicy.refundPolicy} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                refundPolicy: e.target.value
                            })
                        }} />
                    </div>

                </div>
            </div>
            <Button.Root className='my-5' onClick={handlePolicy}>
                <Button.Label>Save Changes</Button.Label>
            </Button.Root>
        </div>
    )
}
