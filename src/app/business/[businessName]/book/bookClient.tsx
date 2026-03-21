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
import { ArrowLeftCircleIcon, Check } from 'lucide-react'
import Card from '@tailus-ui/Card'
import Separator from "@tailus-ui/Separator"
import Link from 'next/link'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import Skeleton from '@mui/joy/Skeleton';
import { DateTime } from 'luxon'
import { bookAppointment, getAvailability, getUnavailability } from '../actions'
import { getSlots } from "slot-calculator"
import { useParams, useRouter } from 'next/navigation'
import CircularProgress from '@mui/joy/CircularProgress'
import Dialog from '@components/Dialog';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { BookingData, BookingWrapper, useBooking } from '@utils/context/BookingDataContext';
import { Card as MUICard, Button as MUIButton, Checkbox, Snackbar, Modal, DialogContent, DialogTitle, ModalClose, Typography, ModalDialog, Divider } from '@mui/joy';

export default function BookClient({ businessData }: {
    businessData: any
}) {
    const params = useParams();
    useEffect(() => {
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'business_page_view', {
                business_slug: businessData.url_name, // or dynamically pulled from the route
                page_type: 'book',
            });
        }
    }, []);
    return <BookingWrapper businessData={businessData}>
        <Book businessName={businessData.url_name} />
    </BookingWrapper>
}


const Book = ({ businessName }: { businessName: string }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [components, setComponents] = useState<any[]>([])
    const [steps, setSteps] = useState<string[]>([])
    const [agreedAfroAllure, setAgreedAfroAllure] = useState<boolean>(false)
    const [agreedBusiness, setAgreedBusiness] = useState<boolean>(false)
    useEffect(() => {
        // Get businessID
        if (data.booking_policy) {
            if (data.booking_policy.deposit.enabled) {
                setSteps(["Select a service", "Pick a date and a time", "Contact Information", "Pay Booking Deposit"])
                setComponents([<ServiceSelection />, <DateTimePicker />, <ClientInfo setAgreedAfroAllure={setAgreedAfroAllure} setAgreedBusiness={setAgreedBusiness} agreedAfroAllure={agreedAfroAllure} agreedBusiness={agreedBusiness} />, <DepositPayment setRbbOpen={setRbbOpen} setAgreedAfroAllure={setAgreedAfroAllure} setAgreedBusiness={setAgreedBusiness} agreedAfroAllure={agreedAfroAllure} agreedBusiness={agreedBusiness} setError={setError} setOpenErrorDialog={setOpenErrorDialog} />])
            } else {
                setSteps(["Select a service", "Pick a date and a time", "Contact Information"])
                setComponents([<ServiceSelection />, <DateTimePicker />, <ClientInfo setRbbOpen={setRbbOpen} setAgreedAfroAllure={setAgreedAfroAllure} setAgreedBusiness={setAgreedBusiness} agreedAfroAllure={agreedAfroAllure} agreedBusiness={agreedBusiness} />])
            }
            setIsLoading(false)
        }
    }, [data, agreedAfroAllure, agreedBusiness]);
    const [submitting, setSubmitting] = useState<boolean>(false)
    const router = useRouter()
    const handleSubmit = async () => {
        const clientInfo = { ...data.clientInfo }
        if (clientInfo.firstName.length > 0) {
            if (clientInfo.lastName.length > 0) {
                if (clientInfo.email.length > 0) {
                    if (clientInfo.phoneNumber.length > 0) {
                        const body = {
                            business: data.business_id,
                            start: data.selectedDateTime.start,
                            end: data.selectedDateTime.end,
                            status: "CONFIRMED",
                            client_metadata: data.clientInfo,
                            service_data: data.services.filter((service) => service.id === data.selectedService)[0],
                            policy_id: data.booking_policy.id,
                            require_deposit: false,
                            paid_deposit: false,
                            deposit_charge_id: "",
                            reschedules: data.booking_policy.reschedule_limit,
                            deposit_price: null,
                            selected_addons: data.selectedAddons
                        }
                        const response = await fetch(`/api/appointments`, {
                            method: "POST",
                            body: JSON.stringify(body)
                        });
                        if (!response.ok) {
                            // Handle errors on the client side here
                            const { error } = await response.json();
                            return false
                        } else {
                            return true
                        }
                    }
                }
            }
        } else {
            // setError state and make toast appear
            setError("Enter client information")
            setOpenErrorDialog(true)
        }

    }
    const [error, setError] = useState<string>("")
    const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
    const [rbbOpen, setRbbOpen] = useState(data.booking_policy.read_before_booking.length > 0)

    return (
        <div className='flex justify-center items-center flex-col'>
            <Modal open={rbbOpen} onClose={() => {
                setRbbOpen(false)
            }}>
                <ModalDialog sx={{
                    padding: 4
                }}>
                    <ModalClose size='sm' />
                    <DialogTitle>
                        Please Read Before Booking
                    </DialogTitle>
                    <Typography>
                        {data.booking_policy.read_before_booking}
                    </Typography>
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
                {/* <Stepper sx={{ width: '100%', marginBottom: 5 }}>
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
                </Stepper> */}

                <div className='w-full h-full flex-col p-5'>
                    <div className='mb-5'>
                        <CircularProgress size="md" determinate value={((activeStep + 1) / steps.length) * 100}>
                            {`${activeStep + 1} / ${steps.length}`}
                        </CircularProgress>
                    </div>

                    {components[activeStep]}
                </div>
                <div className='w-full flex justify-between pb-2'>
                    <Button.Root disabled={activeStep === 0} onClick={() => {
                        setActiveStep(activeStep - 1)
                    }}>
                        <Button.Label>Back</Button.Label>
                    </Button.Root>
                    {activeStep < steps.length - 1 ? <Button.Root disabled={(activeStep === 0 && data.selectedService.length === 0) || (activeStep === 1 && Object.values(data.selectedDateTime).length === 0) || activeStep === 2 && (data.clientInfo.firstName.length === 0 || data.clientInfo.lastName.length === 0 || data.clientInfo.email.length === 0 || data.clientInfo.phoneNumber.length === 0)} onClick={() => {
                        setActiveStep(activeStep + 1)
                    }}>
                        <Button.Label>Next</Button.Label>
                    </Button.Root> : (!data.booking_policy.deposit.enabled ? <Button.Root disabled={!(agreedAfroAllure && agreedBusiness) || submitting} onClick={async () => {
                        setSubmitting(true)
                        const res = await handleSubmit()
                        if (res) {
                            router.push(`/${businessName}/book/complete`)
                        }
                        setSubmitting(false)
                    }}>
                        <Button.Label>{submitting ? <CircularProgress size='sm' /> : "Book Appointment"}</Button.Label>
                    </Button.Root> : <></>)}
                </div>
            </div> : <div className='w-full h-screen flex justify-center items-center'>
                <CircularProgress /></div>}

        </div>
    )
}

const DepositPayment = ({ setError, setOpenErrorDialog, setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setError: any, setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any, setOpenErrorDialog: any }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [promise, setStripePromise] = useState<Promise<Stripe | null>>()
    const [id, setID] = useState<string>("")
    const selectedServiceData = data.services.filter((service: Service, index: number) => service.id === data.selectedService)
    useEffect(() => {
        const fetchSession = async () => {
            const response = await fetch("/api/checkout", {
                method: "POST",
                body: JSON.stringify({
                    connectedAccountId: data.stripe_id,
                    app_fee: 123,
                    price: selectedServiceData[0].price,
                    appointmentID: "",
                    appointmentType: 'automated'
                }),
            });
            if (!response.ok) {
                // Handle errors on the client side here
                const { error } = await response.json();
                throw new Error("An error occurred: ", error);
            } else {
                const val = await response.json();

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
            const stripePromise = loadStripe(process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! : process.env.NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY!, {
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
                    <CheckoutForm setRbbOpen={setRbbOpen} setAgreedAfroAllure={setAgreedAfroAllure} setAgreedBusiness={setAgreedBusiness} agreedAfroAllure={agreedAfroAllure} agreedBusiness={agreedBusiness} setError={setError} setOpenErrorDialog={setOpenErrorDialog} service={selectedServiceData[0]} paymentIntentID={id} />
                </Elements> : <div> Something went wrong</div>
            }
        </div>
    )
}

const CheckoutForm = ({ service, paymentIntentID, setError, setOpenErrorDialog, setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any, service: any, paymentIntentID: string, setError: any, setOpenErrorDialog: any }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const elements = useElements();
    const stripe = useStripe();
    const [selectedAddons, setSelectedAddons] = useState<any[]>([])
    const [addonSum, setAddonSum] = useState<number>(0)
    useEffect(() => {
        const addons = data.services.filter((service, index) => service.id === data.selectedService)[0].addonDetails
        let selected_addons: any = []
        let sum = 0
        addons.forEach((addon: any, index: number) => {
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
        if (!stripe || !elements) {
            return;
        }
        await bookAppointment(data.selectedAddons, paymentIntentID, data.business_id, data.booking_policy.id, service, data.clientInfo, { start: data.selectedDateTime.start!, end: data.selectedDateTime.end!, appointmentLength: service.length }, Intl.DateTimeFormat().resolvedOptions().timeZone).then(async (appointment: any) => {
            const clientInfo = { ...data.clientInfo }
            if (clientInfo.firstName.length > 0) {
                if (clientInfo.lastName.length > 0) {
                    if (clientInfo.email.length > 0) {
                        if (clientInfo.phoneNumber.length > 0) {
                            const { error } = await stripe?.confirmPayment({
                                //`Elements` instance that was used to create the Payment Element
                                elements,
                                redirect: 'if_required',
                                confirmParams: {
                                    return_url: `/appointment/${appointment.id}/${data.stripe_id}/complete`,

                                },
                            })!;
                            if (error) {
                                throw Error(error.message)
                            }
                        }
                    }
                }
            } else {
                // setError state and make toast appear
                setError("Enter client information")
                setOpenErrorDialog(true)
            }

        })
    }
    return (
        <div className='flex lg:flex-row flex-col gap-2 justify-between w-full  max-w-[1280px]'>
            <div className='lg:w-1/2 w-full m-2'>
                <MUICard sx={{
                    width: '100%',
                    height: '100%',
                    padding: 3
                }}>
                    <div className='flex flex-col justify-between h-full'>
                        <div>
                            <div className='text-center lg:text-left'>
                                <Title>Appointment Summary</Title>
                                <Caption>This amount is the deposit price needed to confirm your appointment</Caption>
                            </div>
                            <div className='flex gap-2 w-full mt-5'>
                                <div className='w-full flex flex-col gap-5'>
                                    <div className='flex lg:flex-row flex-col gap-2'>
                                        <div className='w-full lg:w-1/2 lg:text-left justify-center text-center'>
                                            <Text className='font-medium'>Date:</Text>
                                            <Caption>April 20th, 2025</Caption>
                                        </div>
                                        <div className='w-full lg:w-1/2 lg:text-left text-center' >
                                            <Text className='font-medium'>Time:</Text>
                                            <Caption>4:00 PM ~ 7:00 PM</Caption>
                                        </div>
                                    </div>
                                    <div className="flex lg:flex-row flex-col gap-5">
                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                            <Text className='font-medium'>Service Information:</Text>
                                            <Caption>Name: {service.name}</Caption>
                                            <Caption>Price: ${service.price / 100}</Caption>
                                            <Caption>Deposit Required: <strong>{data.booking_policy.deposit.enabled ? 'YES' : 'NO'}</strong></Caption>
                                        </div>
                                        <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                            <Text className='font-medium'>Client Information:</Text>
                                            <div className='w-full flex flex-col gap-1'>
                                                <Caption>Name: {data.clientInfo.firstName + " " + data.clientInfo.lastName}</Caption>
                                                <Caption>Email: {data.clientInfo.email}</Caption>
                                                <Caption>Phone Number: ({data.clientInfo.phoneNumber.slice(0, 3)}) {data.clientInfo.phoneNumber.slice(3, 6)}-{data.clientInfo.phoneNumber.slice(6)}</Caption>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-full lg:w-1/2 lg:text-left text-center'>
                                        <Text className='font-medium'>Add-ons:</Text>
                                        {selectedAddons.map((addon: any, index: number) => {
                                            return (
                                                <Caption key={index}>{addon.name}: ${addon.price / 100}</Caption>
                                            )
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className='flex w-full lg:justify-end justify-center mt-5'>
                            <Title>Due Now: ${data.booking_policy.deposit.settings.type === 'flat' ? data.booking_policy.deposit.settings.value : ((service.price / 100) + addonSum) * (data.booking_policy.deposit.settings.value / 100)}</Title>
                        </div>
                    </div>
                </MUICard>
            </div>
            <div className='w-full lg:w-1/2 h-full m-2'>
                <MUICard sx={{
                    width: '100%',
                    height: '100%',
                    padding: 3
                }}>
                    <Caption><i>*You are required to pay a deposit to confirm this appointment</i></Caption>
                    <form onSubmit={handleSubmit}>
                        <PaymentElement className='w-full' />
                        <div className="space-y-2 mt-2">
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
                        </div>
                        <Button.Root disabled={!(agreedAfroAllure && agreedBusiness)}>
                            <Button.Label>Book Appointment</Button.Label>
                        </Button.Root>
                    </form>
                </MUICard>
            </div>
        </div>

    )
}

const ClientInfo = ({ setRbbOpen, agreedAfroAllure, agreedBusiness, setAgreedAfroAllure, setAgreedBusiness }: { setRbbOpen?: any, agreedBusiness: boolean, setAgreedBusiness: any, agreedAfroAllure: boolean, setAgreedAfroAllure: any }) => {
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

const DateTimePicker = () => {
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [date, setDate] = useState<DateTime<true> | DateTime<false> | undefined>(
        Object.values(data.selectedDateTime).length
            ? DateTime.fromISO(data.selectedDateTime.start!).setZone(userZone).startOf('day')
            : undefined
    );
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any[]>([]);

    const getData = async (startDate: string, endDate: string) => {
        // Get availability id for server actions
        let availability = data.services.filter((service) => service.id === data.selectedService)[0].availability
        let currAvailability = data.availabilities?.filter((el: any) => el.id === availability)[0]
        const formattedAvailability = await getAvailability(startDate, endDate, currAvailability?.availability_data, userZone)
        const formattedUnavailability = await getUnavailability(startDate, endDate, data.appointments!, userZone)
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: 60, // Needs to be thought about
            availability: formattedAvailability,
            unavailability: formattedUnavailability,
            outputTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone

        })
        const days = Object.keys(availableSlotsByDay)
        const slots = Object.values(availableSlotsByDay)

        // Loop through days
        let result: Record<string, string[][]> = {};
        for (let i = 0; i < slots.length; i++) {
            result[days[i]] = [[slots[i][0].from]]
            for (let j = 0; j < slots[i].length; j++) {
                if (j === slots[i].length - 1) {
                    let temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slots[i][j].to)
                    result[days[i]] = temp
                    continue
                }
                if (slots[i][j].to !== slots[i][j + 1].from) {
                    let temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slots[i][j].to)
                    temp.push([slots[i][j + 1].from])
                    result[days[i]] = temp
                }
                continue;
            }
        }

        setSlots(result)
        return result
    }

    useEffect(() => {
        const initialize = async () => {
            if (Object.keys(data.availabilities!).length && data.appointments?.length) {
                const startDate = DateTime.now().setZone(userZone).startOf("day").toISO();
                const endDate = DateTime.now().setZone(userZone).endOf("month").toISO();
                const result = await getData(startDate!, endDate!)
                if (Object.values(data.selectedDateTime).length) {
                    const fetchedSlots = result[
                        DateTime.fromISO(data.selectedDateTime.start!).setZone(userZone).toISODate()!
                    ]; let res = []
                    for (let i = 0; i < fetchedSlots.length; i++) {
                        let timeStart = DateTime.fromISO(fetchedSlots[i][0]).setZone(userZone);
                        let movingTime = DateTime.fromISO(fetchedSlots[i][0]).setZone(userZone);
                        let timeEnd = DateTime.fromISO(fetchedSlots[i][fetchedSlots[i].length - 1]).setZone(userZone);
                        const appointmentLength = data.services.filter((service: Service, index: number) => data.selectedService === service.id)[0].length
                        while (movingTime < timeEnd) {
                            movingTime = timeStart
                            movingTime = movingTime.plus({ minutes: appointmentLength })
                            if (movingTime <= timeEnd) { // length
                                res.push(timeStart)
                                timeStart = timeStart.plus({ minutes: 10 }) // increment
                            } else {
                                break;
                            }
                        }
                    }
                    setCurrSlots(res)
                    console.log(res)
                }

            }
            setIsLoading(false)
        }
        (async () => {
            await initialize()
        })()
    }, [data.availabilities, data.appointments]);

    const handleMonthChange = async (month: DateTime<boolean>) => {
        const bookAheadValue: string = data.booking_policy.book_ahead_value
        setIsLoading(true)
        // Set new start and end dates
        let startDate = ""
        let endDate = ""
        if (month.month === DateTime.now().setZone(userZone).month) {
            startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!;
            endDate = month.setZone(userZone).endOf("month").toISO()!;
            await getData(startDate, endDate)
            setIsLoading(false)
        } else {
            console.log(bookAheadValue);
            if (bookAheadValue !== '1 month' && bookAheadValue !== '28 day' && bookAheadValue !== '4 week') {
                startDate = month.setZone(userZone).toISO()!;
                endDate = month.setZone(userZone).endOf("month").toISO()!;
                await getData(startDate, endDate)
            } else {
                const splitValue = bookAheadValue.split(' ')
                const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
                startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!;
                endDate = DateTime.fromISO(startDate).setZone(userZone).plus(plusData).toISO()!;
                await getData(startDate, endDate)
            }
            setIsLoading(false)

        }
    }

    const handleDateChange = async (value: DateTime) => {
        setDate(value)
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value.toISODate()!]
            // Get slot array based on date
            let res = []
            for (let i = 0; i < fetchedSlots.length; i++) {
                let timeStart = DateTime.fromISO(fetchedSlots[i][0]).setZone(userZone);
                let movingTime = DateTime.fromISO(fetchedSlots[i][0]).setZone(userZone);
                let timeEnd = DateTime.fromISO(fetchedSlots[i][fetchedSlots[i].length - 1]).setZone(userZone);
                const appointmentLength = data.services.filter((service: Service, index: number) => data.selectedService === service.id)[0].length
                while (movingTime < timeEnd) {
                    movingTime = timeStart
                    movingTime = movingTime.plus({ minutes: appointmentLength })
                    if (movingTime <= timeEnd) { // length
                        res.push(timeStart)
                        timeStart = timeStart.plus({ minutes: 10 }) // increment
                    } else {
                        break;
                    }
                }
            }
            setCurrSlots(res)
        }
    }
    const handleDisabledDays = (day: DateTime<true> | DateTime<false>) => {
        const bookAheadValue: string = data.booking_policy.book_ahead_value;
        const startDate = DateTime.now().setZone(userZone).startOf('month')
        let endDate;
        if (bookAheadValue === '1 month' || bookAheadValue === '28 day' || bookAheadValue === '4 week') {
            endDate = DateTime.now().setZone(userZone).endOf('month')
        } else {
            const splitValue = bookAheadValue.split(' ')
            const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
            endDate = DateTime.now().setZone(userZone).startOf('month').plus(plusData);
        }
        if (day >= startDate && day <= endDate) {
            return false
        }
        return true
    }

    return (
        <div>
            <div className='mb-5'>
                <Title>Select Date & Time</Title>
                <Caption>Pick a date and time from the available time slots</Caption>
            </div>
            <Card className='grid grid-cols-1 md:grid-cols-2 justify-items-stretch h-auto md:h-[400px]'>
                <div className='md:border-r-1 overflow-hidden w-full'>
                    <LocalizationProvider dateAdapter={AdapterLuxon}>
                        <DateCalendar sx={{
                            width: '100%',

                            '&.MuiDateCalendar-root': {
                                margin: '5px',
                                height: '400px',
                                width: '100%',
                                maxHeight: 'none',
                                '& .MuiPickersCalendarHeader-root': {
                                    // borderBottom: '1px solid #c3c3c3',
                                    // marginRight: 2
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    fontSize: '12px',
                                },
                                '& div[role="row"]': {
                                    justifyContent: 'space-around',
                                },
                                '& .MuiDayCalendar-slideTransition': {
                                    minHeight: '500px',
                                },
                                '& .MuiPickersDay-root': {
                                    height: '50px',
                                    width: '50px',
                                    fontSize: '14px',
                                },
                            },
                        }} onMonthChange={handleMonthChange} shouldDisableDate={handleDisabledDays} disablePast value={date} loading={isLoading} onChange={handleDateChange} />
                    </LocalizationProvider>
                </div>
                {date ? <div className='pl-5'>
                    <Title>{`${date?.toFormat('cccc')}, ${date?.toFormat('LLLL dd')}`}</Title>
                    <div className='my-2'>
                        <Divider />
                    </div>
                    <div className='grid grid-cols-2 gap-2 w-full mt-5 overflow-y-scroll h-[250px]'>
                        {
                            currSlots.map((time: DateTime, index: number) => {
                                return (
                                    <div key={index}>
                                        <TimeSlot startTime={time} userZone={userZone} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div> : <></>}
            </Card>
        </div>

    )
}

const TimeSlot = ({ startTime, userZone }: {
    startTime: DateTime,
    userZone: string
}) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const start = startTime.setZone(userZone).toLocaleString(DateTime.TIME_SIMPLE)
    const endTime = startTime.setZone(userZone).plus({ minutes: data.services.filter((service) => service.id === data.selectedService)[0].length }).toISO()!

    const selected = startTime.toISO() !== data.selectedDateTime.start && endTime !== data.selectedDateTime.end
    return (
        <div onClick={() => {
            setData({
                ...data,
                selectedDateTime: {
                    start: startTime.toISO()!,
                    end: endTime
                }

            })


        }} style={{ borderWidth: selected ? 1 : 3 }} className='text-md font-medium text-center border-[#ECECEC] bg-white px-3 cursor-pointer py-3 rounded-md'>
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
            <div className='mb-5'>
                <Title>Select Service</Title>
                <Caption>Pick a service to start the booking process</Caption>
            </div>
            <div className='mt-8 overflow-y-scroll'>
                <div className='flex flex-wrap gap-2 mr-5 h-[350px]'>
                    {data.services.map((service: any, index: number) => {
                        return (
                            <Skeleton key={index} variant='overlay' loading={loading}>
                                <div>
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
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set<string>([...data.selectedAddons]))
    return (
        <Dialog.Root onOpenChange={(open) => {
            if (!open) {
                setSelectedAddons(new Set<string>([...data.selectedAddons]))
            }
        }}>
            <Dialog.Trigger asChild>
                <div onClick={() => {


                }} className='rounded-md border w-[400px] flex h-[150px] cursor-pointer' style={{
                    borderWidth: 2,
                    borderColor: service.id === data.selectedService ? 'indigo' : "#ECECEC"
                }}>

                    {service.photo_url.length ? <Image style={{
                        // height: '100%',
                        // width: '35%'
                    }} objectFit='cover' width={150} height={100} src={service.photo_url} alt='locs' /> : <></>}

                    <div className='p-3 '>
                        <div className='flex gap-1'>
                            {service && service.categories.map((category: string, index: number) => {
                                return (
                                    <Caption className='text-xs'>{category}</Caption>
                                )
                            })}
                        </div>

                        <Title className='font-medium'>{service.name}</Title>
                        <Text className='font-bold'>${service.price / 100}</Text>
                        <Caption className='text-sm'>{service.description}</Caption>
                    </div>
                </div>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className='z-30' />
                <Dialog.Content className="max-w-sm z-40">
                    <Dialog.Title>{service.name}</Dialog.Title>
                    <Caption>{service.description}</Caption>
                    <Text>${service.price / 100}</Text>

                    <Text className='mt-5 mb-2'>Select Addons:</Text>
                    <div className='flex flex-col gap-1'>
                        {service.addonDetails.map((addon: any, index: number) => {
                            return (
                                <Checkbox onChange={(e) => {
                                    if (selectedAddons.has(addon.id)) {
                                        let temp = new Set([...selectedAddons]);
                                        temp.delete(addon.id)
                                        setSelectedAddons(temp)
                                    } else {
                                        let temp = new Set([...selectedAddons]);
                                        temp.add(addon.id)
                                        setSelectedAddons(temp)
                                    }
                                }} checked={selectedAddons.has(addon.id)} key={index} label={`${addon.name} - $${addon.price / 100}`} />
                            )
                        })}
                    </div>

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
                                    selectedService: service.id,
                                    selectedAddons: [...selectedAddons]
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
