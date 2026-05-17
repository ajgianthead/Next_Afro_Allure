'use client'

import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { ManualBookingWrapper } from '../context/ManualBookingContext'
import { AppointmentEvent, AppointmentTableData } from '../types'
import { BusinessPolicyType } from '@/lib/businessPolicy/BusinessPolicy'
import { ViewSwitcher, AppointmentView } from './ViewSwitcher'
import { DateNavBar } from './DateNavBar'
import { CreateAppointmentModal } from './modals/CreateAppointmentModal'
import { RescheduleConfirmationModal } from './modals/RescheduleAppointmentModal'
import { AppointmentDetailModal } from './appointments/AppointmentDetailModal'
import { ListView } from './appointments/ListView'
import { DayView } from './appointments/DayView'
import { WeekView } from './appointments/WeekView'
import { ClientView } from './appointments/ClientView'
import { CalendarView } from './appointments/CalendarView'
import AddAppointmentFAB from './AddAppointmentFAB'
import { AppointmentsTour } from '@/features/tour/tours/AppointmentsTour'
import { useTour } from '@/features/tour/useTour'

const DATE_NAV_VIEWS: AppointmentView[] = ['day', 'week']
const STORAGE_KEY = 'aa_appointments_view'

interface Props {
    events: AppointmentEvent[]
    services: any[]
    policy: BusinessPolicyType
    data: AppointmentTableData[]
    planType: 'STARTER' | 'GROWTH'
    monthlyBookingCount: number
    hadTrial: boolean
    stripeCustomerId: string | null
    businessId: string
}

export function AppointmentsClient({
    events, services, policy, data, planType,
    monthlyBookingCount, hadTrial, stripeCustomerId, businessId,
}: Props) {
    // SSR-safe: always 'list' on first render, switch to saved/desktop preference after mount
    const [view, setView] = useState<AppointmentView>('list')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedEvent, setSelectedEvent] = useState<AppointmentEvent | null>(null)
    const [mounted, setMounted] = useState(false)
    const { registerStepSetup, unregisterStepSetup } = useTour()

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem(STORAGE_KEY) as AppointmentView | null
        if (saved) { setView(saved); return }
        if (window.innerWidth >= 1024) setView('day')
    }, [])

    // When the tour needs to highlight the list view but a different view is active,
    // switch to list so the target element is in the DOM.
    useEffect(() => {
        registerStepSetup('appointments-list', () => {
            handleViewChange('list')
        })
        return () => unregisterStepSetup('appointments-list')
    }, [registerStepSetup, unregisterStepSetup])

    const handleViewChange = (v: AppointmentView) => {
        setView(v)
        localStorage.setItem(STORAGE_KEY, v)
    }

    const navigate = (dir: 'prev' | 'next' | 'today') => {
        if (dir === 'today') { setCurrentDate(new Date()); return }
        const dt = DateTime.fromJSDate(currentDate)
        const unit = view === 'day' ? 'day' : view === 'week' ? 'week' : 'month'
        const next = dir === 'prev' ? dt.minus({ [unit]: 1 }) : dt.plus({ [unit]: 1 })
        setCurrentDate(next.toJSDate())
    }

    const showDateNav = DATE_NAV_VIEWS.includes(view)

    return (
        <ManualBookingWrapper appointmentEvents={events} services={services} policy={policy}>
            <CreateAppointmentModal
                planType={planType}
                monthlyBookingCount={monthlyBookingCount}
                hadTrial={hadTrial}
                stripeCustomerId={stripeCustomerId}
                businessId={businessId}
            />
            <RescheduleConfirmationModal />
            <AppointmentDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
            />

            <AppointmentsTour />
            <div className="flex flex-col gap-4">
                {/* Header: view switcher + date nav */}
                <div data-tour="appointments-view-switcher" className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <ViewSwitcher active={view} onChange={handleViewChange} />
                    {showDateNav && mounted && (
                        <DateNavBar
                            date={currentDate}
                            view={view as 'day' | 'week' | 'calendar'}
                            onPrev={() => navigate('prev')}
                            onNext={() => navigate('next')}
                            onToday={() => navigate('today')}
                        />
                    )}
                </div>

                {/* View content */}
                {view === 'list' && (
                    <div data-tour="appointments-list">
                        <ListView onSelectEvent={setSelectedEvent} />
                    </div>
                )}
                {view === 'day' && (
                    <DayView currentDate={currentDate} onSelectEvent={setSelectedEvent} />
                )}
                {view === 'week' && (
                    <WeekView currentDate={currentDate} onSelectEvent={setSelectedEvent} />
                )}
                {view === 'calendar' && <CalendarView />}
                {view === 'clients' && (
                    <ClientView onSelectEvent={setSelectedEvent} />
                )}
            </div>

            <AddAppointmentFAB />
        </ManualBookingWrapper>
    )
}
