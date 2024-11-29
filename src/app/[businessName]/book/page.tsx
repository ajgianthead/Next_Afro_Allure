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
import { bookAppointment, getAvailability, getUnavailability } from '../actions'
import { getSlots, OutputSlot } from "slot-calculator"
import { useParams } from 'next/navigation'
import { Json } from '../../../../lib/database.types'
import CircularProgress from '@mui/joy/CircularProgress'
import Dialog from '@components/Dialog';
import { Elements, EmbeddedCheckout, EmbeddedCheckoutProvider, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BookingData, BookingWrapper, useBooking } from '@utils/context/BookingDataContext';
import { QueryResult } from 'pg';

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

    const handleSubmit = () => {
        // Validate data and input -> Make sure everthing is there
        // POST request to appointments table via a postgres transaction
    }

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
                            <StepButton disabled onClick={() => setActiveStep(index)}>
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
                <div className='w-full flex justify-between pb-2'>
                    <Button.Root disabled={activeStep === 0} onClick={() => {
                        setActiveStep(activeStep - 1)
                    }}>
                        <Button.Label>Back</Button.Label>
                    </Button.Root>
                    {activeStep < steps.length - 1 ? <Button.Root disabled={(activeStep === 0 && data.selectedService.length === 0) || (activeStep === 1 && Object.values(data.selectedDateTime).length === 0) || (activeStep === 2 && Object.values(data.clientInfo).length !== 4)} onClick={() => {
                        setActiveStep(activeStep + 1)
                    }}>
                        <Button.Label>Next</Button.Label>
                    </Button.Root> : <Button.Root onClick={async () => {
                        const selectedServiceData = data.services.filter((service: Service, index: number) => service.id === data.selectedService)
                        //const appointment = await bookAppointment(data.business_id, data.booking_policy.id, data.selectedService, data.clientInfo, { ...data.selectedDateTime, appointmentLength: selectedServiceData[0].length }, null, null)

                    }}>
                        <Button.Label>Book Appointment</Button.Label>
                    </Button.Root>}
                </div>
            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress /></div>}

        </div>
    )
}

const DepositPayment = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [id, setID] = useState<string>("")
    const selectedServiceData = data.services.filter((service: Service, index: number) => service.id === data.selectedService)
    useEffect(() => {
        const fetchSession = async () => {
            const response = await fetch("http://localhost:3000/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    connectedAccountId: data.stripe_id,
                    app_fee: 123,
                    price: selectedServiceData[0].price
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
                const paymentIntentId = val.id;
                setID(paymentIntentId)
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
                data.options && promise && id.length > 0 ? <Elements
                    stripe={promise}
                    options={data.options}

                >
                    <CheckoutForm service={selectedServiceData[0]} paymentIntentID={id} />
                </Elements> : <div> Something went wrong</div>
            }
        </div>
    )
}

const CheckoutForm = ({ service, paymentIntentID }: { service: any, paymentIntentID: string }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const elements = useElements();
    const stripe = useStripe();
    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        // const res = await fetch('http://localhost:3000/api/bookingAuto', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         paymentIntentID: paymentIntentID,
        //         businessId: data.business_id,
        //         policyId: data.booking_policy.id,
        //         serviceId: data.selectedService,
        //         client_metadata: data.clientInfo,
        //         timeSlot: { start: data.selectedDateTime.start!, end: data.selectedDateTime.end!, appointmentLength: service.length },
        //         elements: elements,
        //         stripe: stripe
        //     })
        // })
        // const result = await res.json();
        // console.log(result.appointment);

        await bookAppointment(paymentIntentID, data.business_id, data.booking_policy.id, service, data.clientInfo, { start: data.selectedDateTime.start!, end: data.selectedDateTime.end!, appointmentLength: service.length }).then(async (appointment: any) => {
            console.log(appointment)
            const { error } = await stripe?.confirmPayment({
                //`Elements` instance that was used to create the Payment Element
                elements,
                confirmParams: {
                    return_url: `http://localhost:3000/appointment/${appointment.id}/${data.stripe_id}/complete`,

                },
            })!;
            if (error) {
                throw Error(error.message)
            }
        })
    }
    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement className='w-full' />
            <Button.Root disabled={!stripe}>
                <Button.Label>Book Appointment</Button.Label>
            </Button.Root>
        </form>
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

const DateTimePicker = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [date, setDate] = useState<any>(Object.values(data.selectedDateTime).length ? DateTime.fromISO(data.selectedDateTime.start!).startOf('day') : undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any>([]);

    const getData = async (startDate: string, endDate: string) => {
        // Get availability id for server actions
        console.log(data.appointments);
        const formattedAvailability = await getAvailability(startDate, endDate, data.availabilities)
        const formattedUnavailability = await getUnavailability(startDate, endDate, data.appointments!)

        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: 180, // Needs to be thought about
            availability: formattedAvailability,
            unavailability: formattedUnavailability
        })
        setSlots(availableSlotsByDay)
        return availableSlotsByDay
    }

    useEffect(() => {
        const initialize = async () => {
            if (Object.keys(data.availabilities!).length && data.appointments?.length) {
                const startDate = DateTime.now().startOf("day").toISO()
                const endDate = DateTime.now().endOf("month").toISO()
                const res = await getData(startDate, endDate)
                if (Object.values(data.selectedDateTime).length) {
                    const fetchedSlots = res[DateTime.fromISO(data.selectedDateTime.start!).toISODate()!]
                    setCurrSlots(fetchedSlots)
                }

            }
            setIsLoading(false)
        }
        (async () => {
            await initialize()
        })()
    }, [data.availabilities, data.appointments]);

    const handleMonthChange = async (month: DateTime<boolean>) => {
        setIsLoading(true)
        // Set new start and end dates
        let startDate = ""
        let endDate = ""
        if (month.month === DateTime.now().month) {
            startDate = DateTime.now().startOf("day").toISO()!
        } else {
            startDate = month.toISO()!
        }
        endDate = month.endOf("month").toISO()!
        await getData(startDate, endDate)
        setIsLoading(false)
    }

    const handleDateChange = async (value: DateTime) => {
        console.log(value);
        setDate(value)
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value.toISODate()!] // Get slot array based on date
            setCurrSlots(fetchedSlots)
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
                                <TimeSlot startTime={slot.from} endTime={slot.to} />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>

    )
}

export const TimeSlot = ({ startTime, endTime }: {

    startTime: string, endTime: string
}) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const start = DateTime.fromISO(startTime).toLocaleString(DateTime.TIME_SIMPLE)
    const end = DateTime.fromISO(endTime).toLocaleString(DateTime.TIME_SIMPLE)
    return (
        <div onClick={() => {
            setData({
                ...data,
                selectedDateTime: {
                    start: startTime,
                    end: endTime
                }

            })
            console.log({
                start: startTime,
                end: endTime
            });

        }} style={{ borderWidth: startTime !== data.selectedDateTime.start && endTime !== data.selectedDateTime.end ? 1 : 3 }} className='text-sm font-medium border-primary-500 bg-primary-100 px-3 cursor-pointer py-2 rounded-md'>
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
