'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import { DateTime } from "luxon";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getAvailability, getUnavailability } from "../../../app/business/[businessName]/actions";
import { getSlots } from "slot-calculator";
import { Caption, Title } from "@/components/tailus-ui/typography";
import { Card, CircularProgress, Divider } from "@mui/joy";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useBooking } from "../hooks/useBookingData";

export const DateTimePicker = () => {
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [date, setDate] = useState<DateTime<true> | DateTime<false> | undefined>(
        Object.values(data.selectedDateTime).length
            ? DateTime.fromISO(data.selectedDateTime.start!).setZone(userZone).startOf('day')
            : undefined
    );
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slotsLoading, setSlotsLoading] = useState<boolean>(false)
    const [slots, setSlots] = useState<any>({})
    const [currSlots, setCurrSlots] = useState<any[]>([]);

    const getServiceLength = () =>
        data.services.find((s: ServiceType) => s.id === data.selectedService)?.length ?? 60

    const getData = async (startDate: string, endDate: string) => {
        const serviceLength = getServiceLength()
        let availability = data.services.find((s) => s.id === data.selectedService)?.availability
        let currAvailability = data.availabilities?.find((el: any) => el.id === availability)
        const formattedAvailability = await getAvailability(startDate, endDate, currAvailability, userZone)
        const formattedUnavailability = await getUnavailability(startDate, endDate, data.appointments!, userZone)
        const { availableSlotsByDay } = getSlots({
            from: startDate,
            to: endDate,
            duration: serviceLength,
            availability: formattedAvailability,
            unavailability: formattedUnavailability,
            outputTimezone: userZone,
        })
        const days = Object.keys(availableSlotsByDay)
        const slotValues = Object.values(availableSlotsByDay)

        let result: Record<string, string[][]> = {};
        for (let i = 0; i < slotValues.length; i++) {
            if (!slotValues[i].length) continue
            result[days[i]] = [[slotValues[i][0].from]]
            for (let j = 0; j < slotValues[i].length; j++) {
                if (j === slotValues[i].length - 1) {
                    let temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slotValues[i][j].to)
                    result[days[i]] = temp
                    continue
                }
                if (slotValues[i][j].to !== slotValues[i][j + 1].from) {
                    let temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slotValues[i][j].to)
                    temp.push([slotValues[i][j + 1].from])
                    result[days[i]] = temp
                }
                continue;
            }
        }

        setSlots(result)
        return result
    }

    const buildSlotsForDay = (fetchedSlots: string[][]): DateTime[] => {
        const serviceLength = getServiceLength()
        let res: DateTime[] = []
        for (let i = 0; i < fetchedSlots.length; i++) {
            let timeStart = DateTime.fromISO(fetchedSlots[i][0]).setZone(userZone)
            let movingTime = timeStart
            const timeEnd = DateTime.fromISO(fetchedSlots[i][fetchedSlots[i].length - 1]).setZone(userZone)
            while (movingTime < timeEnd) {
                movingTime = timeStart.plus({ minutes: serviceLength })
                if (movingTime <= timeEnd) {
                    res.push(timeStart)
                    timeStart = timeStart.plus({ minutes: 10 })
                } else {
                    break;
                }
            }
        }
        return res
    }

    useEffect(() => {
        const initialize = async () => {
            if (Object.keys(data.availabilities!).length && data.appointments?.length) {
                const startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
                const endDate = DateTime.now().setZone(userZone).endOf("month").toISO()!
                const result = await getData(startDate, endDate)
                if (data.selectedDateTime.start) {
                    const key = DateTime.fromISO(data.selectedDateTime.start).setZone(userZone).toISODate()!
                    const fetchedSlots = result[key]
                    if (fetchedSlots?.length) {
                        setCurrSlots(buildSlotsForDay(fetchedSlots))
                    }
                }
            }
            setIsLoading(false)
        }
        initialize()
    }, [data.availabilities, data.appointments])

    const handleMonthChange = async (month: DateTime<boolean>) => {
        const bookAheadValue: string = data.booking_policy.bookAheadValue
        setIsLoading(true)
        let startDate = ""
        let endDate = ""
        if (month.month === DateTime.now().setZone(userZone).month) {
            startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
            endDate = month.setZone(userZone).endOf("month").toISO()!
        } else if (bookAheadValue !== '1 month' && bookAheadValue !== '28 day' && bookAheadValue !== '4 week') {
            startDate = month.setZone(userZone).toISO()!
            endDate = month.setZone(userZone).endOf("month").toISO()!
        } else {
            const splitValue = bookAheadValue.split(' ')
            const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
            startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
            endDate = DateTime.fromISO(startDate).setZone(userZone).plus(plusData).toISO()!
        }
        await getData(startDate, endDate)
        setIsLoading(false)
    }

    const handleDateChange = async (value: DateTime) => {
        setDate(value)
        setSlotsLoading(true)
        const key = value.toISODate()!
        const fetchedSlots = slots[key]
        if (!fetchedSlots || fetchedSlots.length === 0) {
            setCurrSlots([])
            setSlotsLoading(false)
            return
        }
        setCurrSlots(buildSlotsForDay(fetchedSlots))
        setSlotsLoading(false)
    }

    const handleDisabledDays = (day: DateTime<true> | DateTime<false>) => {
        const bookAheadValue: string = data.booking_policy.bookAheadValue;
        const startDate = DateTime.now().setZone(userZone).startOf('month')
        let endDate;
        if (bookAheadValue === '1 month' || bookAheadValue === '28 day' || bookAheadValue === '4 week') {
            endDate = DateTime.now().setZone(userZone).endOf('month')
        } else {
            const splitValue = bookAheadValue.split(' ')
            const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
            endDate = DateTime.now().setZone(userZone).startOf('month').plus(plusData);
        }
        return !(day >= startDate && day <= endDate)
    }

    return (
        <div className="flex flex-col md:p-4">
            <div className="mb-5">
                <Title>Select Date & Time</Title>
                <Caption>Pick a date and time from the available time slots</Caption>
            </div>
            <div className="flex-1 min-h-0">
                <Card
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        height: "65%",
                    }}
                >
                    <div
                        className="flex justify-center"
                        style={{ borderRight: "1px solid #E0E0E0", padding: 16, height: "100%" }}
                    >
                        <LocalizationProvider dateAdapter={AdapterLuxon}>
                            <DateCalendar
                                value={date}
                                onChange={handleDateChange}
                                onMonthChange={handleMonthChange}
                                shouldDisableDate={handleDisabledDays}
                                disablePast
                                loading={isLoading}
                                sx={{
                                    height: "100%",
                                    "& .MuiPickersDay-root": { height: 42, width: 42, fontSize: 14 },
                                    "& .MuiDayCalendar-weekDayLabel": { fontSize: 12 },
                                }}
                            />
                        </LocalizationProvider>
                    </div>
                    {date && (
                        <div style={{ display: "flex", flexDirection: "column", padding: 16, height: "100%", overflowY: "auto" }}>
                            <Title style={{ fontSize: 16, fontWeight: 600 }}>
                                {date.toFormat("cccc, LLLL dd")}
                            </Title>
                            <Divider sx={{ my: 2 }} />
                            <div style={{ flex: 1, minHeight: 0 }}>
                                {slotsLoading ? (
                                    <div className="flex justify-center items-center h-24">
                                        <CircularProgress size="sm" />
                                    </div>
                                ) : currSlots.length === 0 ? (
                                    <Caption className="text-center text-gray-400 mt-4">
                                        No availability on this date. Please select another.
                                    </Caption>
                                ) : (
                                    <div
                                        className="grid-cols-1 md:grid-cols-2"
                                        style={{ display: "grid", gap: 8, overflowY: 'scroll' }}
                                    >
                                        {currSlots.map((time: DateTime, index: number) => (
                                            <TimeSlot key={index} startTime={time} userZone={userZone} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}

const TimeSlot = ({ startTime, userZone }: { startTime: DateTime, userZone: string }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const serviceLength = data.services.find((s) => s.id === data.selectedService)?.length ?? 60
    const start = startTime.setZone(userZone).toLocaleString(DateTime.TIME_SIMPLE)
    const endTime = startTime.setZone(userZone).plus({ minutes: serviceLength }).toISO()!
    const selected = startTime.toISO() === data.selectedDateTime.start && endTime === data.selectedDateTime.end

    return (
        <div
            onClick={() => setData((prev) => ({
                ...prev,
                selectedDateTime: { start: startTime.toISO()!, end: endTime }
            }))}
            style={{ borderWidth: selected ? 3 : 1 }}
            className={`text-md font-medium text-center px-3 cursor-pointer py-3 rounded-md transition-colors ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-[#ECECEC] bg-white hover:border-gray-300'}`}
        >
            {start}
        </div>
    )
}
