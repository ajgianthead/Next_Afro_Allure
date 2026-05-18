'use client'

import { LayoutList, Clock, CalendarDays, Calendar, Users, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AppointmentView = 'list' | 'day' | 'week' | 'calendar' | 'clients'

interface Props {
    active: AppointmentView
    onChange: (v: AppointmentView) => void
}

const VIEWS: { id: AppointmentView; label: string; Icon: LucideIcon }[] = [
    { id: 'list',     label: 'List',     Icon: LayoutList },
    { id: 'day',      label: 'Day',      Icon: Clock },
    { id: 'week',     label: 'Week',     Icon: CalendarDays },
    { id: 'calendar', label: 'Calendar', Icon: Calendar },
    { id: 'clients',  label: 'Clients',  Icon: Users },
]

export function ViewSwitcher({ active, onChange }: Props) {
    return (
        <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{ backgroundColor: '#F0EBE3' }}
        >
            {VIEWS.map(({ id, label, Icon }) => {
                const isActive = active === id
                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-lg transition-all duration-150 font-medium',
                            'px-2.5 py-1.5 md:px-3 md:py-2',
                        )}
                        style={{
                            backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                            color: isActive ? '#FC6161' : '#6F6863',
                            boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            fontSize: 13,
                        }}
                    >
                        <Icon size={14} />
                        <span className="hidden md:block">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}
