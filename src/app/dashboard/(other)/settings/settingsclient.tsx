'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { PostgrestError } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from 'app/for-businesses/actions'
import { saveAccountSettings, cancelSubscription, reactivateSubscription, createBillingPortalSession } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export interface AccountSettings {
    business_address: {
        no_address: boolean
        line_1: string
        line_2: string
        city: string
        state: string
        zip_code: string
    }
    notifications: {
        email: boolean
        email_24: boolean
        email_1: boolean
    }
    app_reminders: {
        email_24: boolean
        email_1: boolean
    }
}

export interface SubscriptionInfo {
    id: string
    status: string
    current_period_end: number
    cancel_at_period_end: boolean
    trial_end: number | null
}

const DEFAULT_SETTINGS: AccountSettings = {
    business_address: { no_address: false, line_1: '', line_2: '', city: '', state: '', zip_code: '' },
    notifications: { email: true, email_24: false, email_1: false },
    app_reminders: { email_24: false, email_1: false },
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function BrandInput({
    value,
    onChange,
    placeholder,
    disabled,
    type = 'text',
}: {
    value: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    type?: string
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                border: '1px solid #E8E2D6',
                color: '#1A1818',
                backgroundColor: disabled ? '#FAF7F2' : '#FAFAFA',
            }}
            onFocus={e => { if (!disabled) e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,151,74,0.3)' }}
            onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
        />
    )
}

function BrandCheckbox({
    checked,
    onChange,
    label,
    disabled,
}: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
    disabled?: boolean
}) {
    return (
        <label
            className="flex items-center gap-3 select-none"
            style={{ opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            <div
                className="w-4 h-4 rounded shrink-0 flex items-center justify-center transition-colors"
                style={{
                    border: `1.5px solid ${checked && !disabled ? '#0F0E0E' : '#E8E2D6'}`,
                    backgroundColor: checked && !disabled ? '#0F0E0E' : 'transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                onClick={() => { if (!disabled) onChange(!checked) }}
            >
                {checked && !disabled && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <span className="text-sm" style={{ color: '#1A1818' }}>{label}</span>
        </label>
    )
}

function Section({
    title,
    description,
    children,
    last,
}: {
    title: string
    description?: string
    children: React.ReactNode
    last?: boolean
}) {
    return (
        <div
            className="py-5 flex flex-col gap-3 sm:flex-row sm:gap-8"
            style={{ borderBottom: last ? undefined : '1px solid #F0EBE3' }}
        >
            <div className="sm:w-48 shrink-0">
                <p className="text-sm font-semibold" style={{ color: '#1A1818' }}>{title}</p>
                {description && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6F6863' }}>{description}</p>
                )}
            </div>
            <div className="flex-1 flex flex-col gap-2.5">{children}</div>
        </div>
    )
}

function UpgradePrompt({ onUpgrade, loading }: { onUpgrade: () => void; loading: boolean }) {
    return (
        <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.2)' }}
        >
            <Lock size={13} className="shrink-0" style={{ color: '#C9974A' }} />
            <p className="text-xs flex-1" style={{ color: '#6F6863' }}>
                This is a <strong style={{ color: '#1A1818' }}>Growth plan</strong> feature.
            </p>
            <button
                onClick={onUpgrade}
                disabled={loading}
                className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#FC6161', color: 'white' }}
            >
                {loading ? <Loader2 size={11} className="animate-spin" /> : 'Upgrade →'}
            </button>
        </div>
    )
}

function StatusBadge({ label, color }: { label: string; color: 'green' | 'gold' | 'amber' | 'red' | 'neutral' }) {
    const colors = {
        green: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a' },
        gold: { bg: 'rgba(201,151,74,0.12)', text: '#C9974A' },
        amber: { bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
        red: { bg: 'rgba(252,97,97,0.1)', text: '#FC6161' },
        neutral: { bg: '#F0EBE3', text: '#6F6863' },
    }
    const { bg, text } = colors[color]
    return (
        <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: bg, color: text }}
        >
            {label}
        </span>
    )
}

function CancelDialog({
    open,
    onClose,
    onConfirm,
    loading,
    mode,
    periodEnd,
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
    mode: 'trial' | 'subscription'
    periodEnd: number
}) {
    const fmt = (ts: number) =>
        new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
            <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl">
                <DialogHeader>
                    <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818' }}>
                        {mode === 'trial' ? 'Cancel your trial?' : 'Cancel your subscription?'}
                    </DialogTitle>
                    <DialogDescription style={{ color: '#6F6863' }}>
                        {mode === 'trial'
                            ? `Your trial will end immediately and you'll be downgraded to the Starter plan.`
                            : `You'll keep Growth access until ${fmt(periodEnd)}, then be downgraded to Starter.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
                        Keep plan
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-xl"
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                    >
                        {loading && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        {mode === 'trial' ? 'Cancel trial' : 'Yes, cancel'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// ─── Account section ──────────────────────────────────────────────────────────

function AccountSection({
    businessName,
    email,
    accountSettings,
    setEmail,
    setAccountSettings,
}: {
    businessName: string
    email: string
    accountSettings: AccountSettings
    setEmail: (v: string) => void
    setAccountSettings: React.Dispatch<React.SetStateAction<AccountSettings>>
}) {
    const addr = accountSettings.business_address

    const updateAddr = (key: keyof AccountSettings['business_address'], val: string | boolean) =>
        setAccountSettings(prev => ({
            ...prev,
            business_address: { ...prev.business_address, [key]: val },
        }))

    return (
        <div>
            <Section
                title="Business Name"
                description="Your public display name on AfroAllure. Contact support to change it."
            >
                <BrandInput value={businessName} disabled />
            </Section>

            <Section
                title="Email"
                description="Used for booking alerts and account communications."
            >
                <BrandInput type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Section>

            <Section
                title="Business Address"
                description="Shared with clients once they confirm their appointment. Toggle off if you travel to clients."
                last
            >
                <BrandCheckbox
                    checked={addr.no_address}
                    onChange={v => updateAddr('no_address', v)}
                    label="I don't have a fixed location"
                />
                {!addr.no_address && (
                    <div className="flex flex-col gap-2 mt-1">
                        <BrandInput
                            value={addr.line_1}
                            onChange={e => updateAddr('line_1', e.target.value)}
                            placeholder="Street address"
                        />
                        <BrandInput
                            value={addr.line_2}
                            onChange={e => updateAddr('line_2', e.target.value)}
                            placeholder="Apt, suite, unit (optional)"
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <BrandInput
                                value={addr.city}
                                onChange={e => updateAddr('city', e.target.value)}
                                placeholder="City"
                            />
                            <BrandInput
                                value={addr.state}
                                onChange={e => updateAddr('state', e.target.value)}
                                placeholder="State"
                            />
                            <BrandInput
                                value={addr.zip_code}
                                onChange={e => updateAddr('zip_code', e.target.value)}
                                placeholder="ZIP"
                            />
                        </div>
                    </div>
                )}
            </Section>
        </div>
    )
}

// ─── Preferences section ──────────────────────────────────────────────────────

function PreferencesSection({
    accountSettings,
    setAccountSettings,
    planType,
    onUpgrade,
    upgradeLoading,
}: {
    accountSettings: AccountSettings
    setAccountSettings: React.Dispatch<React.SetStateAction<AccountSettings>>
    planType: 'STARTER' | 'GROWTH'
    onUpgrade: () => void
    upgradeLoading: boolean
}) {
    const isStarter = planType === 'STARTER'

    const updateNotif = (key: keyof AccountSettings['notifications'], val: boolean) =>
        setAccountSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: val } }))

    const updateReminder = (key: keyof AccountSettings['app_reminders'], val: boolean) =>
        setAccountSettings(prev => ({ ...prev, app_reminders: { ...prev.app_reminders, [key]: val } }))

    return (
        <div>
            <Section
                title="Booking Notifications"
                description="Email alerts you receive when clients book, cancel, or reschedule."
            >
                <BrandCheckbox
                    checked={accountSettings.notifications.email}
                    onChange={v => updateNotif('email', v)}
                    label="Email me when a client books or cancels"
                />
                {isStarter ? (
                    <UpgradePrompt onUpgrade={onUpgrade} loading={upgradeLoading} />
                ) : (
                    <>
                        <BrandCheckbox
                            checked={accountSettings.notifications.email_24}
                            onChange={v => updateNotif('email_24', v)}
                            label="Remind me 24 hours before each appointment"
                        />
                        <BrandCheckbox
                            checked={accountSettings.notifications.email_1}
                            onChange={v => updateNotif('email_1', v)}
                            label="Remind me 1 hour before each appointment"
                        />
                    </>
                )}
            </Section>

            <Section
                title="Client Reminders"
                description="Automatically email your clients before their upcoming appointments."
                last
            >
                {isStarter ? (
                    <UpgradePrompt onUpgrade={onUpgrade} loading={upgradeLoading} />
                ) : (
                    <>
                        <BrandCheckbox
                            checked={accountSettings.app_reminders.email_24}
                            onChange={v => updateReminder('email_24', v)}
                            label="Remind clients 24 hours before their appointment"
                        />
                        <BrandCheckbox
                            checked={accountSettings.app_reminders.email_1}
                            onChange={v => updateReminder('email_1', v)}
                            label="Remind clients 1 hour before their appointment"
                        />
                    </>
                )}
            </Section>
        </div>
    )
}

// ─── Subscription section ─────────────────────────────────────────────────────

function SubscriptionSection({
    subscription,
    business,
    onSubChange,
}: {
    subscription: SubscriptionInfo | null
    business: Business
    onSubChange: (s: SubscriptionInfo | null) => void
}) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const fmt = (ts: number) =>
        new Date(ts * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    const handleCancel = async () => {
        if (!subscription) return
        setLoading('cancel')
        try {
            await cancelSubscription(subscription.id)
            onSubChange({ ...subscription, cancel_at_period_end: true })
            toast.success('Subscription will cancel at the end of your billing period.')
        } catch {
            toast.error('Failed to cancel. Please try again.')
        } finally {
            setLoading(null)
            setShowCancelConfirm(false)
        }
    }

    const handleReactivate = async () => {
        if (!subscription) return
        setLoading('reactivate')
        try {
            await reactivateSubscription(subscription.id)
            onSubChange({ ...subscription, cancel_at_period_end: false })
            toast.success('Subscription reactivated.')
        } catch {
            toast.error('Failed to reactivate. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    const handlePortal = async () => {
        if (!business.stripe_customer_id) return
        setLoading('portal')
        try {
            const url = await createBillingPortalSession(business.stripe_customer_id)
            router.push(url)
        } catch {
            toast.error('Failed to open billing portal. Please try again.')
            setLoading(null)
        }
    }

    const handleUpgrade = async () => {
        setLoading('upgrade')
        try {
            const session = business.stripe_customer_id
                ? await createSubscriptionForExistingCustomer(business.stripe_customer_id)
                : await createSubscriptionCheckout(business.had_trial, business.business_id)
            if (session.url) router.push(session.url)
        } catch {
            toast.error('Failed to start checkout. Please try again.')
            setLoading(null)
        }
    }

    // Starter / cancelled
    if (!subscription || subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Starter</span>
                    <StatusBadge label="Free" color="neutral" />
                </div>
                <p className="text-xs" style={{ color: '#6F6863' }}>
                    Up to 10 bookings/month. Upgrade to Growth for unlimited bookings, automated reminders, and more.
                </p>
                <div>
                    <Button
                        onClick={handleUpgrade}
                        disabled={!!loading}
                        className="rounded-xl px-5"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        {loading === 'upgrade' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Upgrade to Growth — $25/mo
                    </Button>
                </div>
            </Section>
        )
    }

    // Trialing
    if (subscription.status === 'trialing') {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Growth</span>
                    <StatusBadge label="Trial" color="gold" />
                </div>
                <p className="text-xs" style={{ color: '#6F6863' }}>
                    Free trial ends {fmt(subscription.trial_end!)}. Add a payment method to keep Growth after your trial.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={handlePortal}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        {loading === 'portal' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Add payment method
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ fontSize: '13px' }}
                    >
                        Cancel trial
                    </Button>
                </div>
                <CancelDialog
                    open={showCancelConfirm}
                    onClose={() => setShowCancelConfirm(false)}
                    onConfirm={handleCancel}
                    loading={loading === 'cancel'}
                    mode="trial"
                    periodEnd={subscription.trial_end!}
                />
            </Section>
        )
    }

    // Active, not cancelling
    if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Growth</span>
                    <StatusBadge label="Active" color="green" />
                </div>
                <p className="text-xs" style={{ color: '#6F6863' }}>
                    Next billing date: {fmt(subscription.current_period_end)}.
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        onClick={handlePortal}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ fontSize: '13px' }}
                    >
                        {loading === 'portal' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Manage payment method
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ fontSize: '13px', color: '#FC6161', borderColor: '#FC6161' }}
                    >
                        Cancel subscription
                    </Button>
                </div>
                <CancelDialog
                    open={showCancelConfirm}
                    onClose={() => setShowCancelConfirm(false)}
                    onConfirm={handleCancel}
                    loading={loading === 'cancel'}
                    mode="subscription"
                    periodEnd={subscription.current_period_end}
                />
            </Section>
        )
    }

    // Active, cancelling at period end
    if (subscription.status === 'active' && subscription.cancel_at_period_end) {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Growth</span>
                    <StatusBadge label="Cancelling" color="amber" />
                </div>
                <div
                    className="rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.25)' }}
                >
                    <p className="text-xs" style={{ color: '#6F6863' }}>
                        Your subscription will be cancelled on{' '}
                        <strong style={{ color: '#1A1818' }}>{fmt(subscription.current_period_end)}</strong>.
                        You have full access until then.
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={handleReactivate}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        {loading === 'reactivate' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Reactivate subscription
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handlePortal}
                        disabled={!!loading}
                        className="rounded-xl px-4"
                        style={{ fontSize: '13px' }}
                    >
                        {loading === 'portal' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Manage payment method
                    </Button>
                </div>
            </Section>
        )
    }

    // Paused (trial ended, no payment method)
    if (subscription.status === 'paused') {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Growth</span>
                    <StatusBadge label="Paused" color="amber" />
                </div>
                <div
                    className="rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: 'rgba(201,151,74,0.08)', border: '1px solid rgba(201,151,74,0.25)' }}
                >
                    <p className="text-xs" style={{ color: '#6F6863' }}>
                        Your subscription is paused — your trial ended without a payment method on file.
                        Add one to resume Growth.
                    </p>
                </div>
                <div>
                    <Button
                        onClick={handlePortal}
                        disabled={!!loading}
                        className="rounded-xl px-5"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        {loading === 'portal' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Add payment method
                    </Button>
                </div>
            </Section>
        )
    }

    // Past due
    if (subscription.status === 'past_due') {
        return (
            <Section title="Current Plan" last>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: '#1A1818' }}>Growth</span>
                    <StatusBadge label="Payment failed" color="red" />
                </div>
                <div
                    className="rounded-xl px-3 py-2.5"
                    style={{ backgroundColor: 'rgba(252,97,97,0.08)', border: '1px solid rgba(252,97,97,0.25)' }}
                >
                    <p className="text-xs" style={{ color: '#6F6863' }}>
                        Your last payment failed. Update your payment method to keep your Growth access.
                    </p>
                </div>
                <div>
                    <Button
                        onClick={handlePortal}
                        disabled={!!loading}
                        className="rounded-xl px-5"
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF', fontSize: '13px' }}
                    >
                        {loading === 'portal' && <Loader2 size={13} className="animate-spin mr-1.5" />}
                        Update payment method
                    </Button>
                </div>
            </Section>
        )
    }

    return null
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'account' | 'preferences' | 'subscription'

const TABS: { key: Tab; label: string }[] = [
    { key: 'account', label: 'Account' },
    { key: 'preferences', label: 'Preferences' },
    { key: 'subscription', label: 'Subscription' },
]

export default function SettingsClient({
    business,
    subscription: initialSubscription,
}: {
    business: Business
    subscription: SubscriptionInfo | null
}) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('account')
    const [accountSettings, setAccountSettings] = useState<AccountSettings>(
        (business.account_settings as unknown as AccountSettings) ?? DEFAULT_SETTINGS
    )
    const [currentEmail, setCurrentEmail] = useState(business.email)
    const [saving, setSaving] = useState(false)
    const [upgradeLoading, setUpgradeLoading] = useState(false)
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(initialSubscription)

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await saveAccountSettings(accountSettings, business.business_id, currentEmail)
            if (result instanceof PostgrestError) {
                toast.error('Failed to save settings. Please try again.')
            } else {
                setAccountSettings((result.account_settings as unknown as AccountSettings) ?? accountSettings)
                toast.success('Settings saved.')
            }
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleUpgrade = async () => {
        setUpgradeLoading(true)
        try {
            const session = business.stripe_customer_id
                ? await createSubscriptionForExistingCustomer(business.stripe_customer_id)
                : await createSubscriptionCheckout(business.had_trial, business.business_id)
            if (session.url) router.push(session.url)
        } catch {
            toast.error('Failed to start checkout. Please try again.')
        } finally {
            setUpgradeLoading(false)
        }
    }

    const showSaveFooter = activeTab !== 'subscription'

    return (
        <div className="p-4 sm:p-6 max-w-3xl">
            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-lg font-semibold" style={{ fontFamily: SERIF, color: '#1A1818' }}>
                    Settings
                </h1>
                <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>
                    Manage your account details, notification preferences, and subscription.
                </p>
            </div>

            {/* Card */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            >
                {/* Tab nav */}
                <div className="flex" style={{ borderBottom: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                    {TABS.map(tab => {
                        const active = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className="relative px-5 py-3 transition-colors"
                                style={{ color: active ? '#1A1818' : '#6F6863', fontSize: '13px', fontWeight: active ? 600 : 400 }}
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

                {/* Section content */}
                <div className="px-5 sm:px-6">
                    {activeTab === 'account' && (
                        <AccountSection
                            businessName={business.business_name}
                            email={currentEmail}
                            accountSettings={accountSettings}
                            setEmail={setCurrentEmail}
                            setAccountSettings={setAccountSettings}
                        />
                    )}
                    {activeTab === 'preferences' && (
                        <PreferencesSection
                            accountSettings={accountSettings}
                            setAccountSettings={setAccountSettings}
                            planType={(business.plan_type as 'STARTER' | 'GROWTH') ?? 'STARTER'}
                            onUpgrade={handleUpgrade}
                            upgradeLoading={upgradeLoading}
                        />
                    )}
                    {activeTab === 'subscription' && (
                        <SubscriptionSection
                            subscription={subscription}
                            business={business}
                            onSubChange={setSubscription}
                        />
                    )}
                </div>

                {/* Footer — hidden on subscription tab since actions are immediate */}
                {showSaveFooter && (
                    <div
                        className="flex justify-end px-5 sm:px-6 py-4"
                        style={{ borderTop: '1px solid #E8E2D6' }}
                    >
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl px-5"
                            style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                        >
                            {saving && <Loader2 size={13} className="animate-spin mr-1.5" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
