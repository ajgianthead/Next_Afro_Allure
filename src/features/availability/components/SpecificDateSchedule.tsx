'use client'

import { Calendar } from 'react-multi-date-picker'
import { DateTime } from 'luxon'
import { TimeRangeRow } from './TimeRangeRow'
import { TimeRange, toTimeString } from '../utils'

const DEFAULT_RANGE: TimeRange = { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }

interface SpecificDateScheduleProps {
    specificDates: Record<string, TimeRange[]>
    onChange: (specificDates: Record<string, TimeRange[]>) => void
}

export function SpecificDateSchedule({ specificDates, onChange }: SpecificDateScheduleProps) {
    const handleDateClick = (_focused: any, clicked: any) => {
        const date = clicked.toString() as string
        const next = { ...specificDates }
        if (next[date]) {
            delete next[date]
        } else {
            next[date] = [{ ...DEFAULT_RANGE }]
        }
        onChange(next)
    }

    const updateRanges = (date: string, ranges: TimeRange[]) => {
        onChange({ ...specificDates, [date]: ranges })
    }

    return (
        <div className="flex flex-col gap-4">
            <Calendar multiple onFocusedDateChange={handleDateClick} />

            {Object.keys(specificDates).map((date) => {
                const ranges = specificDates[date]
                const label = DateTime.fromFormat(date, 'y/MM/dd').toFormat('DDD')

                return (
                    <div key={date}>
                        <p className="text-sm font-medium text-muted-foreground mt-2">{label}</p>
                        {ranges.map((range, rangeIndex) => {
                            const prevEnd = rangeIndex > 0
                                ? toTimeString(ranges[rangeIndex - 1].end)
                                : null

                            return (
                                <TimeRangeRow
                                    key={rangeIndex}
                                    range={range}
                                    rangeIndex={rangeIndex}
                                    totalRanges={ranges.length}
                                    prevEnd={prevEnd}
                                    onStartChange={(val) => {
                                        const [h, m] = val.split(':').map(Number)
                                        const next = ranges.map((r, i) =>
                                            i === rangeIndex ? { ...r, start: { hour: h, minute: m } } : r
                                        )
                                        updateRanges(date, next)
                                    }}
                                    onEndChange={(val) => {
                                        const [h, m] = val.split(':').map(Number)
                                        const next = ranges.map((r, i) =>
                                            i === rangeIndex ? { ...r, end: { hour: h, minute: m } } : r
                                        )
                                        updateRanges(date, next)
                                    }}
                                    onAdd={() => {
                                        updateRanges(date, [...ranges, { start: null, end: null }])
                                    }}
                                    onRemove={() => {
                                        updateRanges(date, ranges.filter((_, i) => i !== rangeIndex))
                                    }}
                                />
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}
