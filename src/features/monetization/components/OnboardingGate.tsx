import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

interface OnboardingGateProps {
    onboardingLink: string | null
    status?: 'incomplete' | 'error' | null
}

const STATUS_MESSAGES = {
    incomplete: "Your Stripe setup isn't finished yet. Pick up where you left off whenever you're ready.",
    error: "We couldn't confirm your Stripe setup. Please try again.",
}

export function OnboardingGate({ onboardingLink, status }: OnboardingGateProps) {
    return (
        <div className="p-4 sm:p-6 max-w-xl">
            <div className="mb-6">
                <h1 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                    Monetization
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>
                    Connect your Stripe account to start accepting payments.
                </p>
            </div>

            <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}>
                {/* Gold accent bar */}
                <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#C9974A' }} />

                <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-[15px]" style={{ color: '#1A1818' }}>
                        Complete Stripe Onboarding
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: '#6F6863' }}>
                        Connect your account with Stripe to enable secure online payments, deposits, and
                        payouts. Onboarding takes just a few minutes — once complete you can start
                        collecting payments directly through AfroAllure.
                    </p>
                </div>

                {status && (
                    <div
                        className="rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.25)' }}
                    >
                        <p className="text-xs" style={{ color: '#6F6863' }}>{STATUS_MESSAGES[status]}</p>
                    </div>
                )}

                {onboardingLink ? (
                    <Button
                        asChild
                        className="w-fit rounded-xl px-5"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        <a href={onboardingLink} className="flex items-center gap-2">
                            {status === 'incomplete' ? 'Continue Stripe setup' : 'Connect with Stripe'} <ExternalLink size={13} />
                        </a>
                    </Button>
                ) : (
                    <div
                        className="rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(252,97,97,0.08)', border: '1px solid rgba(252,97,97,0.25)' }}
                    >
                        <p className="text-xs" style={{ color: '#FC6161' }}>
                            Unable to generate an onboarding link. Please refresh the page.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
