'use client'

import { useState } from 'react'
import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStripeConnect } from '@/app/utils/hooks/useStripeConnect'
import { createStripeLoginLink } from '../server/actions'
import { EarningsTab } from './EarningsTab'
import { SettingsTab } from './SettingsTab'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

type Tab = 'earnings' | 'settings'

const TABS: { key: Tab; label: string }[] = [
    { key: 'earnings', label: 'Earnings' },
    { key: 'settings', label: 'Settings' },
]

function EarningsSkeleton() {
    return (
        <div className="flex flex-col gap-3 pb-6 mt-3 animate-pulse">
            <div className="w-full rounded-2xl h-28" style={{ backgroundColor: '#F0EBE3' }} />
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 rounded-2xl h-64" style={{ backgroundColor: '#F0EBE3' }} />
                <div className="flex-1 rounded-2xl h-64" style={{ backgroundColor: '#F0EBE3' }} />
            </div>
            <div className="w-full rounded-2xl h-44" style={{ backgroundColor: '#F0EBE3' }} />
        </div>
    )
}

function SettingsSkeleton() {
    return (
        <div className="mt-3 rounded-2xl animate-pulse" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
            <div className="flex flex-col lg:flex-row gap-6 p-6">
                <div className="flex flex-row lg:flex-col gap-2 lg:w-44 shrink-0">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 rounded-xl flex-1 lg:flex-none lg:w-full" style={{ backgroundColor: '#E8E2D6' }} />
                    ))}
                </div>
                <div className="flex-1 h-80 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
            </div>
        </div>
    )
}

interface MonetizationClientProps {
    stripeId: string
}

export function MonetizationClient({ stripeId }: MonetizationClientProps) {
    const stripeConnectInstance = useStripeConnect(stripeId)
    const [activeTab, setActiveTab] = useState<Tab>('earnings')

    return (
        <div className="p-4 sm:p-6 max-w-5xl">
            {/* Page header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                            Monetization
                        </h1>
                        <p className="text-sm mt-0.5 max-w-xl" style={{ color: '#6F6863' }}>
                            View your earnings, manage payouts, and configure tax and payment settings.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-fit flex items-center gap-1.5 rounded-xl shrink-0"
                        style={{ fontSize: '13px', borderColor: '#E8E2D6', color: '#1A1818' }}
                        onClick={async () => {
                            const url = await createStripeLoginLink(stripeId)
                            window.open(url, '_blank')
                        }}
                    >
                        Open Stripe Dashboard <ExternalLink size={13} />
                    </Button>
                </div>
            </div>

            {/* Card */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}>
                {/* Tab nav */}
                <div className="flex" style={{ borderBottom: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="relative px-5 py-3 transition-colors"
                                style={{
                                    color: active ? '#1A1818' : '#6F6863',
                                    fontSize: '13px',
                                    fontWeight: active ? 600 : 400,
                                }}
                            >
                                {tab.label}
                                {active && (
                                    <span
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ backgroundColor: '#0F0E0E' }}
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Tab content */}
                <div className="px-3 sm:px-5 lg:px-6">
                    {!stripeConnectInstance ? (
                        activeTab === 'earnings' ? <EarningsSkeleton /> : <SettingsSkeleton />
                    ) : (
                        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                            {activeTab === 'earnings' && <EarningsTab />}
                            {activeTab === 'settings' && <SettingsTab />}
                        </ConnectComponentsProvider>
                    )}
                </div>
            </div>
        </div>
    )
}
