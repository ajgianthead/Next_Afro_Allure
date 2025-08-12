'use client'

import Checkbox from '@components/Checkbox'
import Input from '@components/Input'
import Label from '@components/Label'
import Textarea from '@components/TextArea'
import { CircularProgress, Input as JoyInput, Checkbox as JoyCheckbox } from '@mui/joy'
import Button from '@tailus-ui/Button'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { useUserContext } from '@utils/context/UserContext'
import { Info } from 'lucide-react'
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
        settings: {
            type: Type,
            value: number,
            subtraction: boolean
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

interface PageProps {
    businessUser: Business
}

export default function BookingSettingsClient({ businessUser }: PageProps) {
    const { user } = useUserContext()
    const [businessID, setBusinessID] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        (async () => {
            if (user.business_id) {
                setBusinessID(user.business_id)
                await getPolicy(user.business_id).then(() => {
                    setLoading(false)
                })
            }
        })()

    }, [user.business_id]);
    const [bookingPolicy, setBookingPolicy] = useState<Policy>({
        deposit: {
            enabled: false,
            settings: {
                type: Type.PERCENT,
                value: 20,
                subtraction: true
            }
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
        const result = await fetch(`/api/policies/${id}`, {
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
        const result = await fetch("/api/policies", {
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
        <div>
            {!loading ? <div className='px-10 w-3/4'>
                <div>
                    <Title>Booking Policies</Title>
                    <Caption>Customize your booking policies to control how clients book with you</Caption>
                </div>
                {/* Policy Options */}
                <Text className='font-semibold mt-5 mb-2 text-gray-300'>General</Text>
                <div className='flex flex-col gap-2'>
                    <div className="flex flex-col gap-2 items-start">
                        {!businessUser.completed_stripe_onboarding ? <Caption className='flex gap-1 items-center font-semibold'><Info size={16} />Finish monetization onboarding to enable deposits</Caption> : <></>}
                        <JoyCheckbox disabled={!businessUser.completed_stripe_onboarding} onChange={(e) => {
                            setBookingPolicy({
                                ...bookingPolicy,
                                deposit: {
                                    enabled: e.target.checked,
                                    settings: bookingPolicy.deposit.settings
                                }
                            })
                        }} label="Require a deposit during booking" />

                    </div>
                    {bookingPolicy.deposit.enabled && <div className='ml-5 mt-3 flex flex-col gap-2 font-medium'>
                        <div className="flex gap-2 items-center">
                            <div>
                                <div className='flex gap-2 items-center mb-2'>
                                    <JoyCheckbox checked={bookingPolicy.deposit.settings?.type === Type.PERCENT} onChange={(e) => {
                                        let clone = { ...bookingPolicy }
                                        if (bookingPolicy.deposit.settings?.type === Type.PERCENT) {
                                            clone.deposit.settings.type = Type.FLAT
                                        } else {
                                            clone.deposit.settings.type = Type.PERCENT
                                        }
                                        setBookingPolicy(clone)
                                    }} />
                                    <Caption>Percent Rate</Caption>
                                </div>
                                <JoyInput className='w-1/2' onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        deposit: {
                                            enabled: true,
                                            settings: {
                                                value: parseInt(e.target.value),
                                                type: bookingPolicy.deposit.settings.type,
                                                subtraction: bookingPolicy.deposit.settings.subtraction
                                            }
                                        }
                                    })
                                }} value={bookingPolicy.deposit.settings?.value} disabled={bookingPolicy.deposit.settings?.type !== Type.PERCENT} endDecorator={'%'} />
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div>
                                <div className='flex gap-2 items-center mb-2'>
                                    <JoyCheckbox checked={bookingPolicy.deposit.settings?.type === Type.FLAT} onChange={(e) => {
                                        let clone = { ...bookingPolicy };
                                        if (bookingPolicy.deposit.settings?.type === Type.PERCENT) {
                                            clone.deposit.settings.type = Type.FLAT
                                        } else {
                                            clone.deposit.settings.type = Type.PERCENT
                                        }
                                        setBookingPolicy(clone)
                                    }} />
                                    <Caption>Flat Rate</Caption>
                                </div>
                                <JoyInput className='w-1/2' disabled={bookingPolicy.deposit.settings?.type !== Type.FLAT} startDecorator={'$'} />
                            </div>
                        </div>

                    </div>}

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
            </div> : <div className='flex w-full h-full justify-center items-center'><CircularProgress /></div>}
        </div>
    )
}
