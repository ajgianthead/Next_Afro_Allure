'use client'

import { DateTime } from 'luxon'

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SHORT: Record<string, string> = {
    Monday: 'MON', Tuesday: 'TUE', Wednesday: 'WED',
    Thursday: 'THU', Friday: 'FRI', Saturday: 'SAT', Sunday: 'SUN',
}

interface AvailabilityCardProps {
    availability: any
    isDefault: boolean
    onClick: () => void
}

export function AvailabilityCard({ availability, isDefault, onClick }: AvailabilityCardProps) {
    const data = availability.availability_data
    const activeDays = data.week
        .map((d: any, i: number) => (d.isChecked ? SHORT[WEEK_DAYS[i]] : null))
        .filter(Boolean)
        .join(', ')

    return (
        <div
            onClick={onClick}
            className="rounded-lg border bg-card p-4 pr-20 min-w-max cursor-pointer hover:bg-accent/50 transition-colors"
        >
            <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{data.name}</p>
                {isDefault && (
                    <span className="text-xs text-purple-500 font-medium bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 rounded">
                        Default
                    </span>
                )}
            </div>
            <p className="text-xs text-muted-foreground italic">{activeDays}</p>
            <p className="text-xs text-muted-foreground italic mt-1">
                Created: <span className="underline">{DateTime.fromISO(availability.created_at).toFormat('D')}</span>
            </p>
            <p className="text-xs text-muted-foreground italic">
                Updated: <span className="underline">{DateTime.fromISO(availability.updated_at).toFormat('D')}</span>
            </p>
        </div>
    )
}
