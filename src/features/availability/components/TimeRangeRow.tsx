'use client'

import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toTimeString, addMinute, TimeRange } from '../utils'

interface TimeRangeRowProps {
    range: TimeRange
    rangeIndex: number
    totalRanges: number
    prevEnd: string | null
    onStartChange: (value: string) => void
    onEndChange: (value: string) => void
    onAdd: () => void
    onRemove: () => void
}

export function TimeRangeRow({
    range,
    rangeIndex,
    totalRanges,
    prevEnd,
    onStartChange,
    onEndChange,
    onAdd,
    onRemove,
}: TimeRangeRowProps) {
    const startStr = toTimeString(range.start)
    const endStr = toTimeString(range.end)

    const startMin = rangeIndex === 0 ? '00:00' : (prevEnd ? addMinute(prevEnd) : '00:00')
    const endMin = startStr ? addMinute(startStr) : '00:01'

    const isLast = rangeIndex === totalRanges - 1
    const canAdd = isLast && range.start && range.end && endStr < '23:58'

    return (
        <div className="flex items-center gap-2 mt-2">
            {canAdd ? (
                <Button variant="ghost" size="sm" className="px-2" onClick={onAdd}>
                    <Plus className="size-4" />
                </Button>
            ) : (
                <div className="w-9" />
            )}

            <Input
                type="time"
                value={startStr}
                min={startMin}
                max="23:58"
                className="w-28 text-sm"
                onChange={(e) => onStartChange(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">–</span>
            <Input
                type="time"
                value={endStr}
                min={endMin}
                max="23:59"
                className="w-28 text-sm"
                onChange={(e) => onEndChange(e.target.value)}
            />

            {totalRanges > 1 && (
                <Button variant="ghost" size="sm" className="px-2" onClick={onRemove}>
                    <X className="size-4" />
                </Button>
            )}
        </div>
    )
}
