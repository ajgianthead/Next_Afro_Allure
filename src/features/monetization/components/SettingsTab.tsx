'use client'

import { useState } from 'react'
import {
    ConnectAccountManagement,
    ConnectTaxSettings,
    ConnectTaxRegistrations,
    ConnectPaymentMethodSettings,
} from '@stripe/react-connect-js'

type SettingsView = 'account' | 'tax' | 'payment-methods'

const NAV_ITEMS: { key: SettingsView; label: string }[] = [
    { key: 'account', label: 'Manage Account' },
    { key: 'tax', label: 'Tax Settings' },
    { key: 'payment-methods', label: 'Payment Methods' },
]

export function SettingsTab() {
    const [active, setActive] = useState<SettingsView>('account')

    return (
        <div
            className="mt-3 mb-6 rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
        >
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar nav — bottom border on mobile, right border on desktop */}
                <nav
                    className="flex flex-row lg:flex-col gap-1 p-3 shrink-0 lg:w-48 border-b lg:border-b-0 lg:border-r overflow-x-auto"
                    style={{ borderColor: '#E8E2D6' }}
                >
                    {NAV_ITEMS.map(({ key, label }) => {
                        const isActive = active === key
                        return (
                            <button
                                key={key}
                                onClick={() => setActive(key)}
                                className="text-left rounded-xl px-3 py-2 transition-colors text-[13px] shrink-0 lg:w-full whitespace-nowrap"
                                style={{
                                    backgroundColor: isActive ? '#F0EBE3' : 'transparent',
                                    color: isActive ? '#1A1818' : '#6F6863',
                                    fontWeight: isActive ? 600 : 400,
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = '#FAF7F2'
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                                }}
                            >
                                {label}
                            </button>
                        )
                    })}
                </nav>

                {/* Content */}
                <div className="flex-1 p-5 lg:p-6 min-w-0">
                    {active === 'account' && <ConnectAccountManagement />}
                    {active === 'tax' && (
                        <div className="flex flex-col gap-4">
                            <ConnectTaxSettings />
                            <ConnectTaxRegistrations />
                        </div>
                    )}
                    {active === 'payment-methods' && <ConnectPaymentMethodSettings />}
                </div>
            </div>
        </div>
    )
}
