"use client"

import Input from '@components/Input'
import Button from '@tailus-ui/Button'
import { Caption, Text, Title } from '@tailus-ui/typography'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
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
import { DateTime } from 'luxon'
import { getAvailability, getUnavailability } from '../actions'
import { getSlots } from "slot-calculator"


const steps = ['Select a service', 'Pick a date and time', 'Contact information', "Deposit payment", "Appointment confirmation"];

export default function page() {
    const components = [<ServiceSelection />, <DateTimePicker />, <ClientInfo />, <div></div>, <div></div>]
    const [activeStep, setActiveStep] = useState<number>(1);
    return (
        <div className='w-full pt-10 px-20  flex flex-col overflow-hidden'>
            <Stepper sx={{ width: '100%', marginBottom: 5 }}>
                {steps.map((step, index) => (
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

        </div>
    )
}

const ClientInfo = () => {
    return (
        <div className='flex w-full flex-col items-center justify-center'>
            <div className='w-1/2 mb-4 text-left'>
                <Title>Contact Information</Title>
                <Caption>Enter your information below</Caption>
            </div>
            <Card className='w-1/2 flex flex-col gap-2'>
                <div className='flex gap-2'>
                    <Input placeholder='First Name' />
                    <Input placeholder='Last Name' />
                </div>
                <Input placeholder='Email' />
                <Input placeholder='Phone Number' />
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
    const [date, setDate] = useState();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any>([]);

    const getData = async (startDate: string, endDate: string) => {
        // Get availability id for server actions
        const formattedAvailability = await getAvailability(startDate, endDate, "") as any
        const formattedUnavailability = await getUnavailability(startDate, endDate, [])
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: 30, // Needs to be thought about
            availability: formattedAvailability,
            unavailability: formattedUnavailability
        })
        setSlots(availableSlotsByDay)
    }

    useEffect(() => {
        const startDate = DateTime.now().toUTC().toISO()
        const endDate = DateTime.now().toUTC().endOf("month").toISO()
        getData(startDate, endDate)
        setIsLoading(false)
    }, []);

    const handleMonthChange = async (month: DateTime<boolean>) => {
        setIsLoading(true)
        // Set new start and end dates
        let startDate = ""
        let endDate = ""
        if (month.month === DateTime.now().month) {
            startDate = DateTime.now().toUTC().toISO()!
        } else {
            startDate = month.toUTC().toISO()!
        }
        endDate = month.toUTC().endOf("month").toISO()!
        await getData(startDate, endDate)
        setIsLoading(false)
    }

    const handleDateChange = async (value: any) => {
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value] // Get slot array based on date
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
                Times
            </div>
        </Card>

    )
}

const ServiceSelection = () => {
    return (
        <div className=''>
            <Title className='mb-5'>Select a Service</Title>
            <Input variant='outlined' placeholder='Search for a service' />
            <div className='mt-8 overflow-y-scroll'>
                <div className='flex flex-wrap gap-2 mr-5 h-[450px]'>
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                    <ServiceCard />
                </div>
            </div>
        </div>
    )
}

const ServiceCard = () => {
    return (
        <div className='rounded-md border border-[#ECECEC] w-[400px] flex h-[150px]'>

            <Image style={{
                // height: '100%',
                // width: '35%'
            }} objectFit='cover' width={150} height={100} src={"https://i.pinimg.com/736x/10/4e/72/104e7265970f38f2521976416662c068.jpg"} alt='locs' />

            <div className='p-3 '>
                <Caption className='text-xs'>Locs</Caption>
                <Title className='font-medium'>Loc Retwist</Title>
                <Text className='font-bold'>$60</Text>
                <Caption className='text-sm'>This is a description for a service. This includes a wash, simple style, and complex style</Caption>
            </div>
        </div>
    )
}
