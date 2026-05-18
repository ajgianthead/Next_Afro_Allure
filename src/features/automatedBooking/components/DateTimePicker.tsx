'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import { DateTime } from "luxon";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getAvailability, getUnavailability } from "../../../app/business/[businessName]/actions";
import { getSlots } from "slot-calculator";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useBooking } from "../hooks/useBookingData";


export const DateTimePicker = () => {
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        data.selectedDateTime.start
            ? DateTime.fromISO(data.selectedDateTime.start).setZone(userZone).toJSDate()
            : undefined
    );
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [slotsLoading, setSlotsLoading] = useState<boolean>(false)
    const [slots, setSlots] = useState<Record<string, string[][]>>({})
    const [currSlots, setCurrSlots] = useState<DateTime[]>([]);

    const getServiceLength = () =>
        data.services.find((s: ServiceType) => s.id === data.selectedService)?.length ?? 60

    const getData = async (startDate: string, endDate: string) => {
        const serviceLength = getServiceLength()
        const availability = data.services.find((s) => s.id === data.selectedService)?.availability
        const currAvailability = data.availabilities?.find((el: any) => el.id === availability)
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

        const result: Record<string, string[][]> = {}
        for (let i = 0; i < slotValues.length; i++) {
            if (!slotValues[i].length) continue
            result[days[i]] = [[slotValues[i][0].from]]
            for (let j = 0; j < slotValues[i].length; j++) {
                if (j === slotValues[i].length - 1) {
                    const temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slotValues[i][j].to)
                    result[days[i]] = temp
                    continue
                }
                if (slotValues[i][j].to !== slotValues[i][j + 1].from) {
                    const temp = [...result[days[i]]]
                    temp[temp.length - 1].push(slotValues[i][j].to)
                    temp.push([slotValues[i][j + 1].from])
                    result[days[i]] = temp
                }
            }
        }

        setSlots(result)
        return result
    }

    const buildSlotsForDay = (fetchedSlots: string[][]): DateTime[] => {
        const serviceLength = getServiceLength()
        const res: DateTime[] = []
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
                    break
                }
            }
        }
        return res
    }

    useEffect(() => {
        const initialize = async () => {
            if (data.availabilities && Object.keys(data.availabilities).length) {
                const startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
                const endDate = DateTime.now().setZone(userZone).endOf("month").toISO()!
                const result = await getData(startDate, endDate)
                if (data.selectedDateTime.start) {
                    const key = DateTime.fromISO(data.selectedDateTime.start).setZone(userZone).toISODate()!
                    const fetchedSlots = result[key]
                    if (fetchedSlots?.length) setCurrSlots(buildSlotsForDay(fetchedSlots))
                }
            }
            setIsLoading(false)
        }
        initialize()
    }, [data.availabilities, data.appointments])

    const handleMonthChange = async (month: Date) => {
        const bookAheadValue: string = data.booking_policy.bookAheadValue
        setIsLoading(true)
        const luxonMonth = DateTime.fromJSDate(month).setZone(userZone)
        let startDate = ""
        let endDate = ""
        if (luxonMonth.month === DateTime.now().setZone(userZone).month) {
            startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
            endDate = luxonMonth.endOf("month").toISO()!
        } else if (bookAheadValue !== '1 month' && bookAheadValue !== '28 day' && bookAheadValue !== '4 week') {
            startDate = luxonMonth.toISO()!
            endDate = luxonMonth.endOf("month").toISO()!
        } else {
            const splitValue = bookAheadValue.split(' ')
            const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
            startDate = DateTime.now().setZone(userZone).startOf("day").toISO()!
            endDate = DateTime.fromISO(startDate).setZone(userZone).plus(plusData).toISO()!
        }
        await getData(startDate, endDate)
        setIsLoading(false)
    }

    const handleDateSelect = async (day: Date | undefined) => {
        if (!day) return
        setSelectedDate(day)
        setSlotsLoading(true)
        const luxonDay = DateTime.fromJSDate(day).setZone(userZone)
        const key = luxonDay.toISODate()!
        const fetchedSlots = slots[key]
        if (!fetchedSlots || fetchedSlots.length === 0) {
            setCurrSlots([])
            setSlotsLoading(false)
            return
        }
        setCurrSlots(buildSlotsForDay(fetchedSlots))
        setSlotsLoading(false)
    }

    const isDisabled = (day: Date): boolean => {
        const bookAheadValue: string = data.booking_policy.bookAheadValue
        const luxon = DateTime.fromJSDate(day).setZone(userZone)
        const startDate = DateTime.now().setZone(userZone).startOf('month')
        let endDate: DateTime
        if (bookAheadValue === '1 month' || bookAheadValue === '28 day' || bookAheadValue === '4 week') {
            endDate = DateTime.now().setZone(userZone).endOf('month')
        } else {
            const splitValue = bookAheadValue.split(' ')
            const plusData = splitValue[1] === 'month' ? { month: Number(splitValue[0]) } : (splitValue[1] === 'week' ? { weeks: Number(splitValue[0]) } : { days: Number(splitValue[0]) })
            endDate = DateTime.now().setZone(userZone).startOf('month').plus(plusData)
        }
        return !(luxon >= startDate && luxon <= endDate)
    }

    const selectedLuxon = selectedDate ? DateTime.fromJSDate(selectedDate).setZone(userZone) : null

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--t-text)', fontFamily: 'var(--t-font)' }}>Select Date & Time</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--t-muted)' }}>Pick a date and time from the available slots</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--t-primary)' }} />
                </div>
            ) : (
                <div
                    className="grid md:grid-cols-2 grid-cols-1 overflow-hidden"
                    style={{
                        border: '1px solid var(--t-border)',
                        borderRadius: 'var(--t-card-r)',
                        backgroundColor: 'var(--t-card)',
                    }}
                >
                    {/* Calendar */}
                    <div
                        className="flex justify-center py-4"
                        style={{ borderRight: '1px solid var(--t-border)' }}
                    >
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            onMonthChange={handleMonthChange}
                            disabled={isDisabled}
                            fromDate={new Date()}
                        />
                    </div>

                    {/* Time slots */}
                    <div className="flex flex-col p-4" style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {selectedLuxon ? (
                            <>
                                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--t-text)', fontFamily: 'var(--t-font)' }}>
                                    {selectedLuxon.toFormat("cccc, LLLL dd")}
                                </p>
                                <div style={{ height: 1, backgroundColor: 'var(--t-border)', marginBottom: 12 }} />
                                {slotsLoading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--t-primary)' }} />
                                    </div>
                                ) : currSlots.length === 0 ? (
                                    <p className="text-sm text-center mt-6" style={{ color: 'var(--t-muted)' }}>
                                        No availability on this date. Please select another.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {currSlots.map((time, i) => (
                                            <TimeSlot key={i} startTime={time} userZone={userZone} />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm mt-6 text-center" style={{ color: 'var(--t-muted)' }}>
                                Select a date to see available times
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const TimeSlot = ({ startTime, userZone }: { startTime: DateTime; userZone: string }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const serviceLength = data.services.find((s) => s.id === data.selectedService)?.length ?? 60
    const start = startTime.setZone(userZone).toLocaleString(DateTime.TIME_SIMPLE)
    const endTime = startTime.setZone(userZone).plus({ minutes: serviceLength }).toISO()!
    const selected = startTime.toISO() === data.selectedDateTime.start && endTime === data.selectedDateTime.end

    return (
        <button
            type="button"
            onClick={() => setData((prev) => ({
                ...prev,
                selectedDateTime: { start: startTime.toISO()!, end: endTime }
            }))}
            className="text-sm font-medium text-center px-3 py-2.5 transition-colors"
            style={{
                borderRadius: 'var(--t-input-r)',
                border: selected ? `2px solid var(--t-primary)` : '1px solid var(--t-border)',
                backgroundColor: selected ? 'var(--t-primary)' : 'var(--t-card)',
                color: selected ? 'var(--t-primary-text)' : 'var(--t-text)',
            }}
        >
            {start}
        </button>
    )
}
