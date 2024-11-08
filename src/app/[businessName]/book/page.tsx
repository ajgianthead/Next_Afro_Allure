"use client"
import '@fontsource/inter';
import Input from '@components/Input'
import Button from '@tailus-ui/Button'
import { Caption, Text, Title } from '@tailus-ui/typography'
import Image from 'next/image'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Stepper from '@mui/joy/Stepper';
import Step from '@mui/joy/Step';
import StepButton from '@mui/joy/StepButton';
import StepIndicator from '@mui/joy/StepIndicator';
import { Check } from 'lucide-react'
import Label from '@components/Label'
import Card from '@tailus-ui/Card'
import Separator from "@tailus-ui/Separator"
import Link from 'next/link'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Skeleton from '@mui/joy/Skeleton';
import { DateTime } from 'luxon'
import { getAvailability, getUnavailability } from '../actions'
import { getSlots, OutputSlot } from "slot-calculator"
import { useParams } from 'next/navigation'
import { Json } from '../../../../lib/database.types'
import CircularProgress from '@mui/joy/CircularProgress'
import Dialog from '@components/Dialog';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BookingData, BookingWrapper, useBooking } from '@utils/context/BookingDataContext';

export default function page() {
    const params = useParams();
    const { businessName } = params
    return <BookingWrapper businessName={businessName}>
        <Book />
    </BookingWrapper>
}


const Book = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [components, setComponents] = useState<any[]>([])
    const [steps, setSteps] = useState<string[]>([])
    useEffect(() => {
        // Get businessID
        if (data.booking_policy) {
            if (data.booking_policy.deposit.enabled) {
                setSteps(["Select a service", "Pick a date and a time", "Contact Information", "Pay Booking Deposit"])
                setComponents([<ServiceSelection />, <DateTimePicker />, <ClientInfo />, <DepositPayment />])
            } else {
                setSteps(["Select a service", "Pick a date and a time", "Contact Information"])
                setComponents([<ServiceSelection />, <DateTimePicker />, <ClientInfo />])
            }
            setIsLoading(false)
        }
    }, [data]);

    return (
        <div >
            {!isLoading ? <div className='w-full pt-10 px-20  flex flex-col overflow-hidden'>
                <Stepper sx={{ width: '100%', marginBottom: 5 }}>
                    {steps.map((step: string, index: number) => (
                        <Step
                            key={step}
                            indicator={
                                <StepIndicator
                                    variant={activeStep <= index ? 'soft' : 'solid'}
                                    color={activeStep < index ? 'neutral' : 'primary'}
                                >
                                    {activeStep <= index ? index + 1 : <Check size={16} />}
                                </StepIndicator>
                            }
                            sx={[
                                activeStep > index &&
                                index !== 2 && { '&::after': { bgcolor: 'primary.solidBg' } },
                            ]}
                        >
                            <StepButton onClick={() => setActiveStep(index)}>
                                <div className='text-left'>
                                    <Text className="font-medium">{step}</Text>
                                    <Caption>Details</Caption>
                                </div>
                            </StepButton>
                        </Step>
                    ))}
                </Stepper>
                <div className='w-full h-full flex-col p-5'>
                    {components[activeStep]}
                </div>

            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress /></div>}
        </div>
    )
}

const DepositPayment = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    useEffect(() => {
        const fetchSession = async () => {
            const response = await fetch("http://localhost:3000/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    connectedAccountId: data.stripe_id, // Change Stripe Account ID to be dynamic to business
                }),
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const val = await response.json();
                console.log(val.clientSecret);
                const clientSecret = val.clientSecret;
                const opt = { clientSecret }
                setData({
                    ...data,
                    options: opt
                })
            }
        }
        if (data.stripe_id.length) {
            const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!, {
                stripeAccount: data.stripe_id,
            });
            setStripePromise(stripePromise)
            fetchSession()
        }
    }, [data.stripe_id]);
    return (
        <div>
            {
                data.options && promise ? <EmbeddedCheckoutProvider
                    stripe={promise}
                    options={data.options}

                >
                    <EmbeddedCheckout className='w-full' />
                </EmbeddedCheckoutProvider> : <div> Something went wrong</div>
            }
        </div>
    )
}

const ClientInfo = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    return (
        <div className='flex w-full flex-col items-center justify-center'>
            <div className='w-1/2 mb-4 text-left'>
                <Title>Contact Information</Title>
                <Caption>Enter your information below</Caption>
            </div>
            <Card className='w-1/2 flex flex-col gap-2'>
                <div className='flex gap-2'>
                    <Input placeholder='First Name' value={data.clientInfo.firstName} onChange={(e) => {
                        setData({
                            ...data,
                            clientInfo: {
                                ...data.clientInfo,
                                firstName: e.target.value,
                            }
                        })
                    }} />
                    <Input placeholder='Last Name' value={data.clientInfo.lastName} onChange={(e) => {
                        setData({
                            ...data,
                            clientInfo: {
                                ...data.clientInfo,
                                lastName: e.target.value
                            }
                        })
                    }} />
                </div>
                <Input placeholder='Email' value={data.clientInfo.email} onChange={(e) => {
                    setData({
                        ...data,
                        clientInfo: {
                            ...data.clientInfo,
                            email: e.target.value
                        }
                    })
                }} />
                <Input placeholder='Phone Number' value={data.clientInfo.phoneNumber} onChange={(e) => {
                    setData({
                        ...data,
                        clientInfo: {
                            ...data.clientInfo,
                            phoneNumber: e.target.value
                        }
                    })
                }} />
                <div className='flex gap-3 items-center'>
                    <Separator orientation='horizontal' />
                    <Caption>or</Caption>
                    <Separator orientation='horizontal' />
                </div>
                <Button.Root variant='soft'>
                    <Button.Label>Login to Afro Allure</Button.Label>
                </Button.Root>
                <div className='w-full flex justify-center'>
                    <Caption>Don't have an account? <Link className='underline' href={"#register"}>Register</Link></Caption>
                </div>
            </Card>
        </div>
    )
}

const DateTimePicker = ({ availability, appointments, selectedDateTime, setSelectedDateTime }: any) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [date, setDate] = useState();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any>([]);

    const getData = async (startDate: string, endDate: string) => {
        // Get availability id for server actions
        const formattedAvailability = await getAvailability(startDate, endDate, availability) as any
        const formattedUnavailability = await getUnavailability(startDate, endDate, appointments)
        console.log(startDate, endDate)
        console.log(formattedAvailability);

        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: 180, // Needs to be thought about
            availability: formattedAvailability,
            unavailability: formattedUnavailability
        })
        setSlots(availableSlotsByDay)
    }

    useEffect(() => {
        const startDate = DateTime.now().toUTC().startOf("day").toISO()
        const endDate = DateTime.now().toUTC().endOf("month").toISO()
        getData(startDate, endDate)
        setIsLoading(false)
    }, [availability, appointments]);

    const handleMonthChange = async (month: DateTime<boolean>) => {
        setIsLoading(true)
        // Set new start and end dates
        let startDate = ""
        let endDate = ""
        if (month.month === DateTime.now().month) {
            startDate = DateTime.now().toUTC().startOf("day").toISO()!
        } else {
            startDate = month.toUTC().toISO()!
        }
        endDate = month.toUTC().endOf("month").toISO()!
        await getData(startDate, endDate)
        setIsLoading(false)
    }

    const handleDateChange = async (value: DateTime) => {
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value.toISODate()!] // Get slot array based on date
            setCurrSlots(fetchedSlots)
            console.log(value.toISODate(), fetchedSlots);
        }
    }

    return (
        <Card className='flex'>
            <div className='w-1/2'>
                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <DateCalendar onMonthChange={handleMonthChange} disablePast loading={isLoading} value={date} onChange={handleDateChange} />
                </LocalizationProvider>
            </div>
            <div>
                <Title>Available Time Slots</Title>
                <div className='flex gap-2 w-full flex-wrap mt-5'>
                    {currSlots.map((slot: { from: string, to: string }, index: number) => {
                        return (
                            <div key={index}>
                                <TimeSlot startTime={slot.from} endTime={slot.to} selectedDateTime={selectedDateTime} setSelectedDateTime={setSelectedDateTime} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>

    )
}

const TimeSlot = ({ startTime, endTime, selectedDateTime, setSelectedDateTime }: {
    startTime: string, setSelectedDateTime: any, endTime: string, selectedDateTime: {
        start?: string,
        end?: string
    }
}) => {
    const start = DateTime.fromISO(startTime).toUTC().toLocaleString(DateTime.TIME_SIMPLE)
    const end = DateTime.fromISO(startTime).toUTC().toLocaleString(DateTime.TIME_SIMPLE)
    return (
        <div onClick={() => {
            setSelectedDateTime({
                start: startTime,
                end: endTime
            })
        }} style={{ borderWidth: startTime !== selectedDateTime.start && endTime !== selectedDateTime.end ? 3 : 1 }} className='text-sm font-medium border-primary-500 bg-primary-100 px-3 cursor-pointer py-2 rounded-md'>
            {start}
        </div>
    )
}

const ServiceSelection = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        if (data.services.length > 0) {
            setLoading(false)
        }
    }, [data.services]);
    return (
        <div className=''>
            <Title className='mb-5'>Select a Service</Title>
            <Input variant='outlined' placeholder='Search for a service' />
            <div className='mt-8 overflow-y-scroll'>
                <div className='flex flex-wrap gap-2 mr-5 h-[350px]'>
                    {data.services.map((service: any, index: number) => {
                        return (
                            <Skeleton variant='overlay' loading={loading}>
                                <div key={index}>
                                    <ServiceCard service={service} />
                                </div>
                            </Skeleton>

                        )
                    })}
                </div>


            </div>
        </div>
    )
}

const ServiceCard = ({ service }: any) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <div onClick={() => {
                    console.log(service);

                }} className='rounded-md border w-[400px] flex h-[150px] cursor-pointer' style={{
                    borderWidth: 2,
                    borderColor: service.id === data.selectedService ? 'indigo' : "#ECECEC"
                }}>

                    <Image style={{
                        // height: '100%',
                        // width: '35%'
                    }} objectFit='cover' width={150} height={100} src={service.photo_url} alt='locs' />

                    <div className='p-3 '>
                        <Caption className='text-xs'>Locs</Caption>
                        <Title className='font-medium'>{service.name}</Title>
                        <Text className='font-bold'>$60</Text>
                        <Caption className='text-sm'>{service.description}</Caption>
                    </div>
                </div>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className='z-30' />
                <Dialog.Content className="max-w-sm z-40">
                    <Dialog.Title>{service.name}</Dialog.Title>
                    <Dialog.Description className="mt-2">{service.description}</Dialog.Description>

                    <Dialog.Actions>
                        <Dialog.Close asChild>
                            <Button.Root variant="outlined" size="sm" intent="gray">
                                <Button.Label>Close</Button.Label>
                            </Button.Root>
                        </Dialog.Close>
                        <Dialog.Close asChild>
                            <Button.Root size="sm" onClick={() => {
                                setData({
                                    ...data,
                                    selectedService: service.id
                                })
                            }}>
                                <Button.Label>Select Service</Button.Label>
                            </Button.Root>
                        </Dialog.Close>
                    </Dialog.Actions>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
