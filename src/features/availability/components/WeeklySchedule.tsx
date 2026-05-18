'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TimeRangeRow } from './TimeRangeRow'
import { WeekDay, TimeRange, toTimeString } from '../utils'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_RANGE: TimeRange = { start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }

interface WeeklyScheduleProps {
    week: WeekDay[]
    onChange: (week: WeekDay[]) => void
}

export function WeeklySchedule({ week, onChange }: WeeklyScheduleProps) {
    const updateWeek = (dayIndex: number, updated: WeekDay) => {
        const next = week.map((d, i) => (i === dayIndex ? updated : d))
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-4">
            {WEEK_DAYS.map((day, dayIndex) => {
                const dayData = week[dayIndex]
                return (
                    <div key={day}>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={dayData.isChecked}
                                onCheckedChange={(checked) => {
                                    updateWeek(dayIndex, {
                                        isChecked: !!checked,
                                        timeRanges: checked ? [{ ...DEFAULT_RANGE }] : [{ ...DEFAULT_RANGE }],
                                    })
                                }}
                            />
                            <Label className="font-medium">{day}</Label>
                        </div>

                        {dayData.isChecked && dayData.timeRanges.map((range, rangeIndex) => {
                            const prevEnd = rangeIndex > 0
                                ? toTimeString(dayData.timeRanges[rangeIndex - 1].end)
                                : null

                            return (
                                <TimeRangeRow
                                    key={rangeIndex}
                                    range={range}
                                    rangeIndex={rangeIndex}
                                    totalRanges={dayData.timeRanges.length}
                                    prevEnd={prevEnd}
                                    onStartChange={(val) => {
                                        const [h, m] = val.split(':').map(Number)
                                        const ranges = dayData.timeRanges.map((r, i) =>
                                            i === rangeIndex ? { ...r, start: { hour: h, minute: m } } : r
                                        )
                                        updateWeek(dayIndex, { ...dayData, timeRanges: ranges })
                                    }}
                                    onEndChange={(val) => {
                                        const [h, m] = val.split(':').map(Number)
                                        const ranges = dayData.timeRanges.map((r, i) =>
                                            i === rangeIndex ? { ...r, end: { hour: h, minute: m } } : r
                                        )
                                        updateWeek(dayIndex, { ...dayData, timeRanges: ranges })
                                    }}
                                    onAdd={() => {
                                        const ranges = [...dayData.timeRanges, { start: null, end: null }]
                                        updateWeek(dayIndex, { ...dayData, timeRanges: ranges })
                                    }}
                                    onRemove={() => {
                                        const ranges = dayData.timeRanges.filter((_, i) => i !== rangeIndex)
                                        updateWeek(dayIndex, { ...dayData, timeRanges: ranges })
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
