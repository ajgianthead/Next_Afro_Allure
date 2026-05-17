'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTour } from '@/features/tour/useTour'
import { ChevronDown } from 'lucide-react'
import { AnalyticsData } from './actions'
import { AnalyticsTour } from '@/features/tour/tours/AnalyticsTour'
import { RevenueOverviewSection } from './components/RevenueOverview'
import { BookingPerformanceSection } from './components/BookingPerformance'
import { ServiceAnalyticsSection } from './components/ServiceAnalytics'
import { ClientAnalyticsSection } from './components/ClientAnalytics'
import { ClientInsightsSection } from './components/ClientInsights'
import { GrowthTrendsSection } from './components/GrowthTrends'
import { FinancialSummarySection } from './components/FinancialSummary'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export const fmtNum = (n: number) =>
    new Intl.NumberFormat('en-US').format(n)

const SECTIONS = [
    { id: 'revenue', label: 'Revenue Overview' },
    { id: 'bookings', label: 'Booking Performance' },
    { id: 'services', label: 'Service Analytics' },
    { id: 'clients', label: 'Client Analytics' },
    { id: 'insights', label: 'Client Insights' },
    { id: 'growth', label: 'Growth Trends' },
    { id: 'financial', label: 'Financial Summary' },
]

function SectionCard({
    id,
    title,
    children,
    defaultOpen,
    tourTarget,
    forceOpen = false,
}: {
    id: string
    title: string
    children: React.ReactNode
    defaultOpen: boolean
    tourTarget?: string
    forceOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    useEffect(() => { setOpen(defaultOpen) }, [defaultOpen])
    // When the tour proactively requests this section to expand, honour it.
    useEffect(() => { if (forceOpen) setOpen(true) }, [forceOpen])

    return (
        <div
            id={id}
            data-tour={tourTarget}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 lg:cursor-default"
                style={{ borderBottom: open ? '1px solid #F0EBE3' : 'none' }}
            >
                <span
                    className="text-sm font-semibold uppercase tracking-widest"
                    style={{ color: '#6F6863', fontFamily: 'Inter, sans-serif', fontSize: '11px' }}
                >
                    {title}
                </span>
                <ChevronDown
                    size={15}
                    className="lg:hidden transition-transform"
                    style={{ color: '#6F6863', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>
            {open && <div className="p-4 sm:p-5">{children}</div>}
        </div>
    )
}

interface AnalyticsClientProps {
    data: AnalyticsData
    business: { business_id: string; business_name: string }
}

export function AnalyticsClient({ data, business }: AnalyticsClientProps) {
    const [isDesktop, setIsDesktop] = useState(true)
    const [activeSection, setActiveSection] = useState('revenue')
    // Tracks which sections the tour has requested to be force-expanded
    const [tourExpanded, setTourExpanded] = useState<Set<string>>(new Set())

    const { registerStepSetup, unregisterStepSetup } = useTour()

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 1024)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    useEffect(() => {
        const expand = (id: string) =>
            setTourExpanded(prev => new Set([...prev, id]))

        registerStepSetup('analytics-services', () => expand('services'))
        registerStepSetup('analytics-clients', () => expand('clients'))
        registerStepSetup('analytics-due',      () => expand('insights'))

        return () => {
            unregisterStepSetup('analytics-services')
            unregisterStepSetup('analytics-clients')
            unregisterStepSetup('analytics-due')
        }
    }, [registerStepSetup, unregisterStepSetup])

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                        break
                    }
                }
            },
            { rootMargin: '-30% 0px -60% 0px' }
        )
        SECTIONS.forEach(s => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    return (
        <div className="flex gap-6 p-4 sm:p-6 max-w-6xl">
            {/* Sticky left nav — desktop only */}
            <nav className="hidden lg:flex flex-col gap-1 w-44 shrink-0 sticky top-6 self-start">
                <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                    style={{ color: '#6F6863' }}
                >
                    Analytics
                </p>
                {SECTIONS.map(s => {
                    const active = activeSection === s.id
                    return (
                        <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="text-left rounded-xl px-3 py-2 text-[13px] transition-colors"
                            style={{
                                backgroundColor: active ? '#F0EBE3' : 'transparent',
                                color: active ? '#1A1818' : '#6F6863',
                                fontWeight: active ? 600 : 400,
                            }}
                        >
                            {s.label}
                        </a>
                    )
                })}
            </nav>

            {/* Sections */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="mb-2">
                    <h1 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        Analytics
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>
                        Track earnings, booking trends, client retention, and growth.
                    </p>
                </div>

                <AnalyticsTour />
                <SectionCard id="revenue" title="Revenue Overview" defaultOpen={true} tourTarget="analytics-revenue">
                    <RevenueOverviewSection overview={data.overview} byMonth={data.byMonth} financial={data.financial} />
                </SectionCard>

                <SectionCard id="bookings" title="Booking Performance" defaultOpen={isDesktop}>
                    <BookingPerformanceSection booking={data.booking} />
                </SectionCard>

                <SectionCard id="services" title="Service Analytics" defaultOpen={isDesktop} tourTarget="analytics-services" forceOpen={tourExpanded.has('services')}>
                    <ServiceAnalyticsSection services={data.service} />
                </SectionCard>

                <SectionCard id="clients" title="Client Analytics" defaultOpen={isDesktop} tourTarget="analytics-clients" forceOpen={tourExpanded.has('clients')}>
                    <ClientAnalyticsSection client={data.client} />
                </SectionCard>

                <SectionCard id="insights" title="Client Insights" defaultOpen={isDesktop} tourTarget="analytics-due" forceOpen={tourExpanded.has('insights')}>
                    <ClientInsightsSection clientList={data.clientList} />
                </SectionCard>

                <SectionCard id="growth" title="Growth Trends" defaultOpen={isDesktop}>
                    <GrowthTrendsSection growth={data.growth} />
                </SectionCard>

                <SectionCard id="financial" title="Financial Summary" defaultOpen={isDesktop}>
                    <FinancialSummarySection financial={data.financial} />
                </SectionCard>
            </div>
        </div>
    )
}
