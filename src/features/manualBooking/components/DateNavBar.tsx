'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DateTime } from 'luxon'
import { Button } from '@/components/ui/button'
import { AppointmentView } from './ViewSwitcher'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

interface Props {
    date: Date
    view: Extract<AppointmentView, 'day' | 'week' | 'calendar'>
    onPrev: () => void
    onNext: () => void
    onToday: () => void
}

function formatLabel(date: Date, view: Props['view']): string {
    const dt = DateTime.fromJSDate(date)
    if (view === 'day') return dt.toFormat('EEEE, MMMM d, yyyy')
    if (view === 'week') {
        const start = dt.startOf('week')
        const end = dt.endOf('week')
        return start.month === end.month
            ? `${start.toFormat('MMM d')} – ${end.toFormat('d, yyyy')}`
            : `${start.toFormat('MMM d')} – ${end.toFormat('MMM d, yyyy')}`
    }
    return dt.toFormat('MMMM yyyy')
}

export function DateNavBar({ date, view, onPrev, onNext, onToday }: Props) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline" size="icon" onClick={onPrev}
                style={{ borderColor: '#E8E2D6', color: '#1A1818', width: 30, height: 30 }}
            >
                <ChevronLeft size={13} />
            </Button>
            <Button
                variant="outline" size="sm" onClick={onToday}
                style={{ borderColor: '#E8E2D6', color: '#1A1818', fontSize: 12, height: 30 }}
            >
                Today
            </Button>
            <Button
                variant="outline" size="icon" onClick={onNext}
                style={{ borderColor: '#E8E2D6', color: '#1A1818', width: 30, height: 30 }}
            >
                <ChevronRight size={13} />
            </Button>
            <span style={{ fontFamily: SERIF, color: '#1A1818', fontSize: 15, fontWeight: 600 }}>
                {formatLabel(date, view)}
            </span>
        </div>
    )
}
