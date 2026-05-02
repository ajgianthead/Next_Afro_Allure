'use client'

import { ConnectComponentsProvider } from '@stripe/react-connect-js'
import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useStripeConnect } from '@/app/utils/hooks/useStripeConnect'
import { createStripeLoginLink } from '../server/actions'
import { EarningsTab } from './EarningsTab'
import { SettingsTab } from './SettingsTab'

interface MonetizationClientProps {
    stripeId: string
}

export function MonetizationClient({ stripeId }: MonetizationClientProps) {
    const stripeConnectInstance = useStripeConnect(stripeId)

    return (
        <div>
            <div className="p-5 flex flex-col gap-1">
                <h1 className="text-lg font-semibold">Monetization</h1>
                <p className="text-sm text-muted-foreground">
                    Below are your earnings analytics as well as account, tax, and payment processor
                    settings.{' '}
                    <strong>For the full dashboard experience, open the Stripe Dashboard below.</strong>
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-fit flex items-center gap-2"
                    onClick={async () => {
                        const url = await createStripeLoginLink(stripeId)
                        window.open(url, '_blank')
                    }}
                >
                    Open Dashboard <ExternalLink className="size-4" />
                </Button>
            </div>

            {!stripeConnectInstance ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                    <Tabs defaultValue="earnings" className="px-5">
                        <TabsList variant="line">
                            <TabsTrigger value="earnings">Earnings</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>
                        <TabsContent value="earnings">
                            <EarningsTab />
                        </TabsContent>
                        <TabsContent value="settings">
                            <SettingsTab />
                        </TabsContent>
                    </Tabs>
                </ConnectComponentsProvider>
            )}
        </div>
    )
}
