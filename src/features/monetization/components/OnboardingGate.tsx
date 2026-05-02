import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingGateProps {
    onboardingLink: string | null
}

export function OnboardingGate({ onboardingLink }: OnboardingGateProps) {
    return (
        <div className="flex justify-center h-125 items-center">
            <div className="w-full md:w-1/2 mx-10">
                <div className="rounded-lg border bg-card p-6 flex flex-col gap-3">
                    <p className="font-medium">Complete Monetization Onboarding</p>
                    <p className="text-sm text-muted-foreground">
                        Connect your account with Stripe to enable secure online payments, deposits, and
                        payouts. Onboarding takes just a few minutes. Once complete, you&apos;ll be able
                        to start earning through AfroAllure.
                    </p>
                    {onboardingLink ? (
                        <Button asChild className="w-fit">
                            <a href={onboardingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                                Connect with Stripe <ExternalLink className="size-4" />
                            </a>
                        </Button>
                    ) : (
                        <p className="text-sm text-destructive">
                            Unable to generate onboarding link. Please refresh the page.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
