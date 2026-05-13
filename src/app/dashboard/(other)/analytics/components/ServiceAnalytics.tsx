'use client'

import { Crown } from 'lucide-react'
import { ServiceAnalytics } from '../actions'
import { fmt } from '../analytics-client'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

interface Props {
    services: ServiceAnalytics[]
}

export function ServiceAnalyticsSection({ services }: Props) {
    if (!services.length) {
        return (
            <p className="text-sm py-4" style={{ color: '#6F6863' }}>
                No service data yet. Complete some appointments to see analytics.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {services.map((svc, i) => (
                <div
                    key={svc.service_id ?? i}
                    className="rounded-xl p-4"
                    style={{ border: '1px solid #E8E2D6' }}
                >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span
                                className="text-[11px] font-semibold shrink-0"
                                style={{ color: '#6F6863', width: '1.25rem', textAlign: 'right' }}
                            >
                                {i + 1}
                            </span>
                            <div className="flex items-center gap-1.5 min-w-0">
                                {i === 0 && <Crown size={13} style={{ color: '#C9974A', flexShrink: 0 }} />}
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: '#1A1818' }}
                                >
                                    {svc.service_name ?? 'Unknown Service'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {svc.addon_revenue > 0 && (
                                <span
                                    className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: 'rgba(201,151,74,0.12)', color: '#C9974A' }}
                                >
                                    +{fmt(svc.addon_revenue)} add-ons
                                </span>
                            )}
                            <p className="text-sm font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                                {fmt(svc.total_revenue)}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full mb-2" style={{ backgroundColor: '#F0EBE3' }}>
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${svc.revenue_percent ?? 0}%`,
                                backgroundColor: '#FC6161',
                            }}
                        />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px]" style={{ color: '#6F6863' }}>
                            {svc.total_bookings} bookings
                        </span>
                        {svc.repeat_client_count > 0 && (
                            <span className="text-[11px]" style={{ color: '#6F6863' }}>
                                ↩ {svc.repeat_client_count} returning
                            </span>
                        )}
                        {svc.cancellation_count > 0 && (
                            <span className="text-[11px]" style={{ color: '#FC6161' }}>
                                {svc.cancellation_count} cancelled
                            </span>
                        )}
                        <span className="text-[11px]" style={{ color: '#6F6863' }}>
                            avg {fmt(svc.average_price)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
