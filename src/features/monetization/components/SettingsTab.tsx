'use client'

import { useState } from 'react'
import {
    ConnectAccountManagement,
    ConnectTaxSettings,
    ConnectTaxRegistrations,
    ConnectPaymentMethodSettings,
} from '@stripe/react-connect-js'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type SettingsView = 'account' | 'tax' | 'payment-methods'

const NAV_ITEMS: { key: SettingsView; label: string }[] = [
    { key: 'account', label: 'Manage Account' },
    { key: 'tax', label: 'Tax Settings' },
    { key: 'payment-methods', label: 'Payment Methods' },
]

export function SettingsTab() {
    const [active, setActive] = useState<SettingsView>('account')

    return (
        <div className="rounded-lg border bg-card p-6 mt-2">
            <h2 className="text-base font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">
                Manage your monetization settings and preferences.
            </p>
            <Separator className="my-4" />
            <div className="flex lg:flex-row flex-col gap-6">
                <nav className="flex lg:flex-col flex-row gap-1 lg:w-44 w-full shrink-0">
                    {NAV_ITEMS.map(({ key, label }) => (
                        <Button
                            key={key}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                'justify-start font-normal',
                                active === key && 'bg-accent text-accent-foreground font-medium'
                            )}
                            onClick={() => setActive(key)}
                        >
                            {label}
                        </Button>
                    ))}
                </nav>
                <Separator orientation="vertical" className="hidden lg:block self-stretch h-auto" />
                <div className="flex-1">
                    {active === 'account' && <ConnectAccountManagement />}
                    {active === 'tax' && (
                        <div className="w-full flex flex-col gap-4">
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
