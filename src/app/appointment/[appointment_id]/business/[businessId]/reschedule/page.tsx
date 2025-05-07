'use client'

import { fa } from '@faker-js/faker'
import CircularProgress from '@mui/joy/CircularProgress'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import Button from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { BookingData, useBooking } from '@utils/context/BookingDataContext'
import { getAvailability, getUnavailability, rescheduleAppointment } from 'app/[businessName]/actions'
import { TimeSlot } from 'app/[businessName]/book/page'
import { CircleCheckBig } from 'lucide-react'
import { DateTime } from 'luxon'
import { useParams } from 'next/navigation'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { getSlots } from 'slot-calculator'

export default function Page() {
    const { appointment_id, businessId } = useParams<{ appointment_id: string, businessId: string }>()
    const [date, setDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any>([]);
    const [appointments, setAppointments] = useState<any[]>([])

    const getData = async (startDate: string, endDate: string, availabilities: any[], appointments: any[]) => {
        console.log(businessId);
        // Get availability id for server actions
        const appointment = appointments.filter((appointment: Appointment, index: number) => appointment.id === appointment_id)[0]
        const availability = availabilities.filter((availability) => availability.id === appointment.service_data.availability)[0]
        // Check if reschedules is at its reschedule limit
        if (!(appointment.reschedules > 0)) {
            setCanReschedule(false)
        } else {
            setCanReschedule(true)
        }
        setAppointment(appointment)
        setAvailability(availability.availability_data[0])
        setSelectedDateTime({
            start: DateTime.fromJSDate(new Date(appointment.start)).toISO()!,
            end: DateTime.fromJSDate(new Date(appointment.end)).toISO()!
        })
        const formattedAvailability = await getAvailability(startDate, endDate, availability.availability_data[0])
        const formattedUnavailability = await getUnavailability(startDate, endDate, appointments!)
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            // TODO: Loop by the minute DAMNNN
            duration: 1, // Needs to be thought about
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
    }
    const [selectedDateTime, setSelectedDateTime] = useState<{
        start: string;
        end: string;
    }>({
        start: "",
        end: ""
    });
    const [appointment, setAppointment] = useState<any>({});
    const [availability, setAvailability] = useState<any>({})
    const [availabilities, setAvailabilities] = useState<Availability[]>([])
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`http://localhost:3000/api/${businessId}/availabilities`, {
                method: 'GET'
            })
            const result = await res.json();
            const availabilities = result.result.availabilities
            setAvailabilities(availabilities)
            const _res = await fetch(`http://localhost:3000/api/${businessId}/appointments`, {
                method: "GET"
            })
            const appointments = await _res.json();

            return {
                availabilities: availabilities,
                appointments: appointments.appointments
            }
        }
        const initialize = async (availabilities: any, appointments: any) => {
            const startDate = DateTime.now().startOf("day").toISO()
            const endDate = DateTime.now().endOf("month").toISO()
            await getData(startDate, endDate, availabilities, appointments)
            setIsLoading(false)
        }
        const start = async () => {
            if (!appointments?.length && !availabilities.length) {
                fetchData().then(async ({ availabilities, appointments }) => {
                    await initialize(availabilities, appointments)
                    setAppointments(appointments)
                })
            }
        }
        start()
    }, [availabilities, appointments, selectedDateTime]);

    const handleMonthChange = async (month: DateTime<boolean>) => {
        if (appointments.length && Object.keys(availability).length) {
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
            await getData(startDate, endDate, availabilities, appointments)
            setIsLoading(false)
        }
    }
    const [isDisabled, setIsDisabled] = useState<boolean>(true)
    const handleDateChange = async (value: DateTime) => {
        setDate(value)
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value.toISODate()!] // Get slot array based on date
            let res = []
            for (let i = 0; i < fetchedSlots.length; i++) {
                let timeStart = DateTime.fromISO(fetchedSlots[i][0])
                let movingTime = DateTime.fromISO(fetchedSlots[i][0])
                let timeEnd = DateTime.fromISO(fetchedSlots[i][fetchedSlots[i].length - 1])
                const appointmentLength = appointment.service_data.length;

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
    const [sendingData, setSendingData] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    const [canReschedule, setCanReschedule] = useState<boolean | null>(null)
    return (
        <div>{canReschedule === null ? <div className='w-full h-screen flex justify-center items-center'>
            <CircularProgress />
        </div> : canReschedule === false ? <div className='w-full px-5 flex-col text-center h-screen gap-2 flex justify-center items-center'>
            <Caption>You have reached the maximum number of reschedule requests according to this business's policies.</Caption>
            <Caption>Contact INSERT BUSINESS NAME directly about rescheduling your appointment</Caption>
        </div> : <div>
            {confirmed ? <RescheduleConfirmation /> : <div className='flex justify-center items-center w-full h-screen'>
                <div className='w-[1280px] flex flex-col justify-center items-center'>
                    <Card className='flex items-start gap-10'>
                        <div className=''>
                            <LocalizationProvider dateAdapter={AdapterLuxon}>
                                <DateCalendar onMonthChange={handleMonthChange} disablePast loading={isLoading} value={date} onChange={handleDateChange} />
                            </LocalizationProvider>
                        </div>
                        <div className='pt-[12px] pr-20'>
                            <Title>Available Time Slots</Title>
                            <div className='flex gap-2 w-full flex-wrap mt-5'>
                                {currSlots.map((slot: string, index: number) => {
                                    return (
                                        <div key={index} onClick={() => {
                                            let selected = {
                                                start: slot,
                                                end: DateTime.fromISO(slot).plus({ minutes: appointment.service_data.length }).toISO()!
                                            }
                                            setSelectedDateTime(selected)
                                            if (DateTime.fromJSDate(new Date(appointment.start)).toISO() === selected.start && DateTime.fromJSDate(new Date(appointment.end)).toISO() === selected.end) {
                                                setIsDisabled(true)
                                            } else {
                                                setIsDisabled(false)
                                            }
                                        }}>
                                            <div style={{ borderWidth: slot !== selectedDateTime.start ? 1 : 3 }} className='text-sm font-medium border-primary-500 bg-primary-100 px-3 cursor-pointer py-2 rounded-md'>
                                                {DateTime.fromISO(slot).toLocaleString(DateTime.TIME_SIMPLE)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </Card>
                    <div className='w-full mt-10 px-20 flex justify-end items-end'>
                        <Button.Root disabled={isDisabled} onClick={async () => {
                            setSendingData(true)
                            setIsDisabled(true)
                            await rescheduleAppointment(appointment_id, {
                                start: selectedDateTime.start,
                                end: selectedDateTime.end,
                                appointmentLength: appointment.service_data.length
                            }, businessId, availability.id).then((res) => {
                                if (res) {
                                    setConfirmed(true)
                                }
                            })

                        }}>
                            <Button.Label>{
                                sendingData ? <CircularProgress size='sm' /> : "Reschedule Appointment"
                            }</Button.Label>
                        </Button.Root>
                    </div>
                </div>
            </div>}
        </div>
        }</div>
    )
}

const RescheduleConfirmation = () => {
    return (
        <div className='flex h-screen gap-2 px-5 flex-col w-screen justify-center items-center'>
            <div className='flex gap-3'>
                <CircleCheckBig color='green' />
                <Title>Appointment Successfully Rescheduled</Title></div>
            <div className='text-center'>
                <Caption>If you have any questions regarding your appointment, please contact {"INSERT BUSINESS NAME"} </Caption>
            </div>
        </div>
    )
}
