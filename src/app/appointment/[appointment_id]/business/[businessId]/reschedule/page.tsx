'use client'

import { fa } from '@faker-js/faker'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider'
import Button from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Title } from '@tailus-ui/typography'
import { BookingData, useBooking } from '@utils/context/BookingDataContext'
import { getAvailability, getUnavailability, rescheduleAppointment } from 'app/[businessName]/actions'
import { TimeSlot } from 'app/[businessName]/book/page'
import { DateTime } from 'luxon'
import { useParams } from 'next/navigation'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { getSlots } from 'slot-calculator'

export default function page() {
    const { appointment_id, businessId } = useParams<{ appointment_id: string, businessId: string }>()
    const [date, setDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any>([]);
    const [availability, setAvailability] = useState<null | any>({});
    const [appointments, setAppointments] = useState<any[]>([])

    const getData = async (startDate: string, endDate: string, availability: any, appointments: any[]) => {
        // Get availability id for server actions
        const appointment = appointments.filter((appointment: Appointment, index: number) => appointment.id === appointment_id)[0]
        // Check if reschedules is at its reschedule limit
        //
        //
        //
        //
        setAppointment(appointment)
        setSelectedDateTime({
            start: DateTime.fromJSDate(new Date(appointment.start)).toISO()!,
            end: DateTime.fromJSDate(new Date(appointment.end)).toISO()!
        })
        const formattedAvailability = await getAvailability(startDate, endDate, availability)
        const formattedUnavailability = await getUnavailability(startDate, endDate, appointments!)
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: appointment.service_data.length, // Needs to be thought about
            availability: formattedAvailability,
            unavailability: formattedUnavailability
        })
        setSlots(availableSlotsByDay)
    }
    const [selectedDateTime, setSelectedDateTime] = useState<{
        start: string;
        end: string;
    }>({
        start: "",
        end: ""
    });
    const [ogAppointment, setOGAppointment] = useState<{
        start: string;
        end: string;
    }>({
        start: "",
        end: ""
    })
    const [appointment, setAppointment] = useState<any>({});

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`http://localhost:3000/api/${businessId}/availabilities`, {
                method: 'GET'
            })
            const result = await res.json();
            const availability = result.result
            const _res = await fetch(`http://localhost:3000/api/${businessId}/appointments`, {
                method: "GET"
            })
            const appointments = await _res.json();
            console.log(appointments);

            return {
                availability: availability[0],
                appointments: appointments.appointments
            }
        }
        const initialize = async (availability: any, appointments: any) => {
            const startDate = DateTime.now().startOf("day").toISO()
            const endDate = DateTime.now().endOf("month").toISO()
            await getData(startDate, endDate, availability, appointments)
            setIsLoading(false)


        }
        const start = async () => {
            if (!Object.keys(availability).length || !appointments?.length) {
                fetchData().then(async ({ availability, appointments }) => {
                    await initialize(availability, appointments)
                    setAvailability(availability)
                    setAppointments(appointments)
                })
            }
        }
        start()
    }, [availability, appointments, selectedDateTime]);

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
            await getData(startDate, endDate, availability, appointments)
            setIsLoading(false)
        }
    }
    const [isDisabled, setIsDisabled] = useState<boolean>(true)
    const handleDateChange = async (value: DateTime) => {
        console.log(value);
        setDate(value)
        if (Object.keys(slots).length) { // If slots exist
            const fetchedSlots = slots[value.toISODate()!] // Get slot array based on date
            setCurrSlots(fetchedSlots)
        }
    }
    return (
        <div className='flex justify-center items-center w-full h-screen'>
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
                            {currSlots.map((slot: { from: string, to: string }, index: number) => {
                                return (
                                    <div key={index} onClick={() => {
                                        let selected = {
                                            start: slot.from,
                                            end: slot.to
                                        }
                                        setSelectedDateTime(selected)
                                        if (DateTime.fromJSDate(new Date(appointment.start)).toISO() === selected.start && DateTime.fromJSDate(new Date(appointment.end)).toISO() === selected.end) {
                                            setIsDisabled(true)
                                        } else {
                                            setIsDisabled(false)
                                        }
                                    }}>
                                        <div style={{ borderWidth: slot.from !== selectedDateTime.start && slot.to !== selectedDateTime.end ? 1 : 3 }} className='text-sm font-medium border-primary-500 bg-primary-100 px-3 cursor-pointer py-2 rounded-md'>
                                            {DateTime.fromISO(slot.from).toLocaleString(DateTime.TIME_SIMPLE)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </Card>
                <div className='w-full mt-10 px-20 flex justify-end items-end'>
                    <Button.Root disabled={isDisabled} onClick={async () => {
                        const res = await rescheduleAppointment(appointment_id, {
                            start: selectedDateTime.start,
                            end: selectedDateTime.end,
                            appointmentLength: appointment.service_data.length
                        }, businessId)
                        console.log(res);

                    }}>
                        <Button.Label>Reschedule</Button.Label>
                    </Button.Root>
                </div>
            </div>
        </div>
    )
}
