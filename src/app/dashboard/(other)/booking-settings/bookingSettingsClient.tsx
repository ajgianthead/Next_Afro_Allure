'use client'

import { CircularProgress, CssVarsProvider, Divider, FormControl, FormHelperText, Input as JoyInput, Option, Select } from '@mui/joy'
import { Info, Check, Lock } from 'lucide-react'
import React, { useState } from 'react'
import { handleBookingSettings } from './actions'
import Stripe from 'stripe'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button as ShadcnButton } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from 'app/for-businesses/actions'
import { useRouter } from 'next/navigation'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const BRAND = {
    black: '#0F0E0E',
    cream: '#FAF7F2',
    red: '#FC6161',
    gold: '#C9974A',
    dark: '#1A1818',
    warm: '#6F6863',
    sand: '#E8E2D6',
}

enum Level { LIGHT = "light", MODERATE = "moderate", STRICT = 'strict' }
enum Type { FLAT = "flat", PERCENT = "percent" }

export interface BookingSettings {
    deposit: {
        enabled: boolean;
        settings: { type: Type; value: number; subtraction: boolean }
    };
    lateFee: { enabled: boolean; fee?: number };
    noShowPolicy: { enabled: boolean; level?: Level }
    rescheduleLimit: string;
    rescheduleDayLimit: string;
    cancelDayLimit: string;
    importantInfo: string;
    readBeforeBooking: string;
    refundPolicy: string;
    bookAheadValue: string
}

interface PageProps {
    businessUser: Business,
    policyData: {
        book_ahead_value: string;
        business: string;
        cancel_day_limit: number | null;
        created_at: string;
        deposit: any;
        id: string;
        important_info: string | null;
        late_fee: any;
        no_show: any;
        read_before_booking: string | null;
        reschedule_day_limit: number | null;
        reschedule_limit: number | null;
        updated_at: string;
    },
    paymentConfigId?: string,
    paymentConfig?: any
}

export interface PaymentConfig {
    card: { display_preference: { preference: Stripe.PaymentMethodConfiguration.Card.DisplayPreference.Preference } },
    google_pay: { display_preference: { preference: Stripe.PaymentMethodConfiguration.GooglePay.DisplayPreference.Preference } },
    apple_pay: { display_preference: { preference: Stripe.PaymentMethodConfiguration.ApplePay.DisplayPreference.Preference } },
    amazon_pay: { display_preference: { preference: Stripe.PaymentMethodConfiguration.AmazonPay.DisplayPreference.Preference } },
    cashapp: { display_preference: { preference: Stripe.PaymentMethodConfiguration.Cashapp.DisplayPreference.Preference } }
}

export default function BookingSettingsClient({ businessUser, policyData, paymentConfig, paymentConfigId }: PageProps) {
    const [bookingPolicy, setBookingPolicy] = useState<BookingSettings>({
        deposit: policyData.deposit,
        lateFee: policyData.late_fee,
        noShowPolicy: policyData.no_show,
        rescheduleLimit: policyData.reschedule_limit!.toString(),
        rescheduleDayLimit: policyData.reschedule_day_limit!.toString(),
        cancelDayLimit: policyData.cancel_day_limit!.toString(),
        importantInfo: policyData.important_info!,
        readBeforeBooking: policyData.read_before_booking!,
        refundPolicy: "",
        bookAheadValue: policyData.book_ahead_value
    })

    enum PaymentValue {
        GooglePay = "GOOGLE_PAY",
        ApplePay = "APPLE_PAY",
        AmazonPay = "AMAZON_PAY",
        CashApp = "CASH_APP"
    }

    const [paymentMethodConfig, setPaymentMethodConfig] = useState<PaymentConfig | null>(
        paymentConfig !== undefined ? {
            card: { display_preference: { preference: paymentConfig.card?.display_preference.preference! } },
            google_pay: { display_preference: { preference: paymentConfig.google_pay?.display_preference.preference! } },
            apple_pay: { display_preference: { preference: paymentConfig.apple_pay?.display_preference.preference! } },
            amazon_pay: { display_preference: { preference: paymentConfig.amazon_pay?.display_preference.preference! } },
            cashapp: { display_preference: { preference: paymentConfig.cashapp?.display_preference.preference! } }
        } : null
    )

    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [upgradeLoading, setUpgradeLoading] = useState(false)
    const [unitOfTime, setUnitOfTime] = useState(policyData.book_ahead_value.split(' ')[1])
    const [bookingAdvanceValue, setBookingAdvanceValue] = useState(Number(policyData.book_ahead_value.split(' ')[0]))
    const [bookingAdvanceError, setBookingAdvanceError] = useState(false)

    const router = useRouter()

    const handleUpgrade = async () => {
        setUpgradeLoading(true)
        const session = businessUser.stripe_customer_id
            ? await createSubscriptionForExistingCustomer(businessUser.stripe_customer_id)
            : await createSubscriptionCheckout(businessUser.had_trial, businessUser.business_id)
        router.push(session.url!)
    }

    const handlePaymentMethodConfig = (value: PaymentValue, checked: boolean) => {
        if (value === PaymentValue.GooglePay) {
            setPaymentMethodConfig({ ...paymentMethodConfig!, google_pay: { display_preference: { preference: checked ? 'on' : 'off' } } })
        } else if (value === PaymentValue.ApplePay) {
            setPaymentMethodConfig({ ...paymentMethodConfig!, apple_pay: { display_preference: { preference: checked ? 'on' : 'off' } } })
        } else if (value === PaymentValue.AmazonPay) {
            setPaymentMethodConfig({ ...paymentMethodConfig!, amazon_pay: { display_preference: { preference: checked ? 'on' : 'off' } } })
        } else if (value === PaymentValue.CashApp) {
            setPaymentMethodConfig({ ...paymentMethodConfig!, cashapp: { display_preference: { preference: checked ? 'on' : 'off' } } })
        }
    }

    const interceptPaymentToggle = (value: PaymentValue, checked: boolean) => {
        if (businessUser.plan_type === 'STARTER') {
            setOpen(true)
            return
        }
        handlePaymentMethodConfig(value, checked)
    }

    const isOnboarded = businessUser.completed_stripe_onboarding

    return (
        <div className="p-6 max-w-2xl space-y-8">

            {/* Upgrade Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: SERIF, fontSize: '1.35rem', color: BRAND.dark }}>
                            You've reached your monthly limit
                        </DialogTitle>
                        <p className="text-sm mt-1" style={{ color: BRAND.warm }}>
                            That's amazing growth. Upgrade to keep the momentum going.
                        </p>
                    </DialogHeader>
                    <div className="space-y-2 py-1">
                        {['Unlimited bookings', 'Apple Pay, Google Pay, Cash App Pay', 'Automated reminders', 'Detailed analytics', 'Drag & drop builder'].map(f => (
                            <div key={f} className="flex items-center gap-2 text-sm" style={{ color: BRAND.dark }}>
                                <Check size={13} style={{ color: BRAND.gold }} />{f}
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: BRAND.dark }}>$25/month · 14-day free trial</p>
                        <p className="text-xs mt-0.5" style={{ color: BRAND.warm }}>No credit card required</p>
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <ShadcnButton onClick={handleUpgrade} disabled={upgradeLoading} className="w-full" style={{ backgroundColor: BRAND.red, color: 'white', border: 'none' }}>
                            {upgradeLoading ? 'Loading…' : 'Start Free Trial'}
                        </ShadcnButton>
                        <ShadcnButton variant="ghost" onClick={() => setOpen(false)} className="w-full" style={{ color: BRAND.warm }}>
                            Maybe Later
                        </ShadcnButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-semibold" style={{ fontFamily: SERIF, color: BRAND.dark }}>Booking Settings</h1>
                <p className="text-sm mt-1" style={{ color: BRAND.warm }}>Customize how clients book with you</p>
            </div>

            {/* Deposits */}
            <Section label="Deposits">
                {!isOnboarded && (
                    <a href={businessUser.current_onboarding_link!} target="_blank" className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: 'rgba(201,151,74,0.08)', color: BRAND.gold }}>
                        <Info size={13} />
                        Complete Monetization Onboarding to enable deposits
                    </a>
                )}
                <SettingRow
                    label="Require a deposit during booking"
                    description="Clients will be charged a deposit when they book"
                >
                    <Checkbox
                        checked={bookingPolicy.deposit.enabled}
                        disabled={!isOnboarded}
                        onCheckedChange={(checked: boolean) => setBookingPolicy({ ...bookingPolicy, deposit: { ...bookingPolicy.deposit, enabled: checked } })}
                    />
                </SettingRow>

                {bookingPolicy.deposit.enabled && (
                    <div className="mt-4 pl-4 border-l-2 space-y-4" style={{ borderColor: BRAND.sand }}>
                        <p className="text-xs font-medium" style={{ color: BRAND.warm }}>Deposit type</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={bookingPolicy.deposit.settings?.type === Type.PERCENT}
                                    onChange={() => setBookingPolicy({ ...bookingPolicy, deposit: { ...bookingPolicy.deposit, settings: { ...bookingPolicy.deposit.settings, type: Type.PERCENT } } })}
                                    className="accent-current"
                                    style={{ accentColor: BRAND.gold }}
                                />
                                <span className="text-sm" style={{ color: BRAND.dark }}>Percent rate</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={bookingPolicy.deposit.settings?.type === Type.FLAT}
                                    onChange={() => setBookingPolicy({ ...bookingPolicy, deposit: { ...bookingPolicy.deposit, settings: { ...bookingPolicy.deposit.settings, type: Type.FLAT } } })}
                                    style={{ accentColor: BRAND.gold }}
                                />
                                <span className="text-sm" style={{ color: BRAND.dark }}>Flat rate</span>
                            </label>
                        </div>
                        {bookingPolicy.deposit.settings?.type === Type.PERCENT && (
                            <div className="flex items-center gap-2">
                                <BrandInput
                                    type="number"
                                    value={bookingPolicy.deposit.settings?.value}
                                    onChange={(e) => setBookingPolicy({ ...bookingPolicy, deposit: { enabled: true, settings: { value: parseInt(e.target.value), type: Type.PERCENT, subtraction: bookingPolicy.deposit.settings.subtraction } } })}
                                    className="w-24"
                                />
                                <span className="text-sm" style={{ color: BRAND.warm }}>%</span>
                            </div>
                        )}
                        {bookingPolicy.deposit.settings?.type === Type.FLAT && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm" style={{ color: BRAND.warm }}>$</span>
                                <BrandInput type="number" className="w-24" />
                            </div>
                        )}
                    </div>
                )}
            </Section>

            {/* Payment Methods */}
            <Section label="Payment Methods">
                {!isOnboarded && (
                    <a href={businessUser.current_onboarding_link!} target="_blank" className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-3" style={{ backgroundColor: 'rgba(201,151,74,0.08)', color: BRAND.gold }}>
                        <Info size={13} />
                        Complete Monetization Onboarding to enable payment methods
                    </a>
                )}
                <div className="space-y-2">
                    <PaymentMethodRow
                        logo="https://img.icons8.com/color/48/mastercard-logo.png"
                        name="Debit / Credit Card"
                        checked={true}
                        disabled={true}
                        onChange={() => {}}
                        locked={false}
                    />
                    <PaymentMethodRow
                        logo="https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-google-pay-is-the-fast-simple-way-to-pay-online-in-stores-and-more-logo-color-tal-revivo.png"
                        name="Google Pay"
                        checked={paymentMethodConfig?.google_pay.display_preference.preference === 'on'}
                        disabled={!isOnboarded}
                        onChange={(checked) => interceptPaymentToggle(PaymentValue.GooglePay, checked)}
                        locked={businessUser.plan_type === 'STARTER'}
                    />
                    <PaymentMethodRow
                        logo="https://img.icons8.com/ios-glyphs/90/apple-pay.png"
                        name="Apple Pay"
                        checked={paymentMethodConfig?.apple_pay.display_preference.preference === 'on'}
                        disabled={!isOnboarded}
                        onChange={(checked) => interceptPaymentToggle(PaymentValue.ApplePay, checked)}
                        locked={businessUser.plan_type === 'STARTER'}
                    />
                    <PaymentMethodRow
                        logo="https://img.icons8.com/windows/32/amazon-pay.png"
                        name="Amazon Pay"
                        checked={paymentMethodConfig?.amazon_pay.display_preference.preference === 'on'}
                        disabled={!isOnboarded}
                        onChange={(checked) => interceptPaymentToggle(PaymentValue.AmazonPay, checked)}
                        locked={businessUser.plan_type === 'STARTER'}
                    />
                    <PaymentMethodRow
                        logo="https://img.icons8.com/fluency/48/cash-app--v1.png"
                        name="Cash App Pay"
                        checked={paymentMethodConfig?.cashapp.display_preference.preference === 'on'}
                        disabled={!isOnboarded}
                        onChange={(checked) => interceptPaymentToggle(PaymentValue.CashApp, checked)}
                        locked={businessUser.plan_type === 'STARTER'}
                    />
                </div>
            </Section>

            {/* Appointments */}
            <Section label="Appointments">
                <div className="space-y-4">
                    <InlineNumberRule
                        prefix="Clients can reschedule"
                        suffix="times before having to repay their deposit"
                        value={bookingPolicy.rescheduleLimit}
                        onChange={(v) => setBookingPolicy({ ...bookingPolicy, rescheduleLimit: v })}
                    />
                    <InlineNumberRule
                        prefix="Clients can't reschedule within"
                        suffix="days of their appointment"
                        value={bookingPolicy.rescheduleDayLimit}
                        onChange={(v) => setBookingPolicy({ ...bookingPolicy, rescheduleDayLimit: v })}
                    />
                    <InlineNumberRule
                        prefix="Clients can't cancel within"
                        suffix="days of their appointment"
                        value={bookingPolicy.cancelDayLimit}
                        onChange={(v) => setBookingPolicy({ ...bookingPolicy, cancelDayLimit: v })}
                    />
                </div>
            </Section>

            {/* Booking Site */}
            <Section label="Booking Site">
                <div className="space-y-6">
                    <div>
                        <FieldLabel>Booking ahead</FieldLabel>
                        <FieldCaption>How far out clients can book from today</FieldCaption>
                        <CssVarsProvider>
                            <FormControl error={bookingAdvanceError} className="mt-2">
                                <JoyInput
                                    value={bookingAdvanceValue}
                                    type="number"
                                    onChange={(e) => {
                                        const v = Number(e.target.value)
                                        const min = unitOfTime === 'month' ? 1 : unitOfTime === 'week' ? 4 : 28
                                        setBookingAdvanceError(v < min)
                                        setBookingAdvanceValue(v)
                                    }}
                                    endDecorator={
                                        <React.Fragment>
                                            <Divider orientation="vertical" />
                                            <Select
                                                variant="plain"
                                                value={unitOfTime}
                                                onChange={(_, value) => {
                                                    setUnitOfTime(value!)
                                                    setBookingAdvanceValue(value === 'month' ? 1 : value === 'day' ? 28 : 4)
                                                    setBookingAdvanceError(false)
                                                }}
                                                slotProps={{ listbox: { variant: 'outlined' } }}
                                                sx={{ mr: -1.5, '&:hover': { bgcolor: 'transparent' } }}
                                            >
                                                <Option value="month">month(s)</Option>
                                                <Option value="week">weeks</Option>
                                                <Option value="day">days</Option>
                                            </Select>
                                        </React.Fragment>
                                    }
                                    sx={{ width: 260 }}
                                />
                                {bookingAdvanceError && (
                                    <FormHelperText>
                                        <Info size={14} />
                                        Must allow at least 1 month, 4 weeks, or 28 days
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </CssVarsProvider>
                    </div>

                    <div>
                        <FieldLabel>Read before booking</FieldLabel>
                        <FieldCaption>Shown to clients before they start booking — policies, prep instructions, etc.</FieldCaption>
                        <BrandTextarea
                            value={bookingPolicy.readBeforeBooking}
                            onChange={(e) => setBookingPolicy({ ...bookingPolicy, readBeforeBooking: e.target.value })}
                        />
                    </div>

                    <div>
                        <FieldLabel>Refund &amp; Cancellation Policy</FieldLabel>
                        <FieldCaption>Your policy for refunds and cancellations, if any</FieldCaption>
                        <BrandTextarea
                            value={bookingPolicy.refundPolicy}
                            onChange={(e) => setBookingPolicy({ ...bookingPolicy, refundPolicy: e.target.value })}
                        />
                    </div>
                </div>
            </Section>

            {/* Save */}
            <button
                disabled={isLoading || bookingAdvanceError}
                onClick={async () => {
                    setIsLoading(true)
                    const clone = { ...bookingPolicy, bookAheadValue: `${bookingAdvanceValue} ${unitOfTime}` }
                    const res = await handleBookingSettings(clone, businessUser.business_id, paymentConfigId!, paymentMethodConfig!, { ...paymentConfig })
                    if (res === false) console.log('Stripe onboarding must be completed before enabling deposits')
                    setIsLoading(false)
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: BRAND.dark, color: 'white' }}
            >
                {isLoading && <CssVarsProvider><CircularProgress size="sm" sx={{ '--CircularProgress-trackColor': 'rgba(255,255,255,0.3)', '--CircularProgress-progressColor': 'white' }} /></CssVarsProvider>}
                {isLoading ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl p-5 border" style={{ borderColor: BRAND.sand, backgroundColor: 'white' }}>
            <p className="text-xs font-semibold tracking-widest mb-4" style={{ color: BRAND.gold }}>{label.toUpperCase()}</p>
            {children}
        </div>
    )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium" style={{ color: BRAND.dark }}>{label}</p>
                {description && <p className="text-xs mt-0.5" style={{ color: BRAND.warm }}>{description}</p>}
            </div>
            {children}
        </div>
    )
}

function PaymentMethodRow({ logo, name, checked, disabled, onChange, locked }: {
    logo: string; name: string; checked: boolean; disabled: boolean; onChange: (checked: boolean) => void; locked: boolean
}) {
    return (
        <div
            className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{ borderColor: BRAND.sand, backgroundColor: checked ? 'rgba(201,151,74,0.04)' : 'white' }}
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: BRAND.cream }}>
                    <img width={22} height={22} src={logo} alt={name} />
                </div>
                <span className="text-sm font-medium" style={{ color: BRAND.dark }}>{name}</span>
                {locked && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(201,151,74,0.1)', color: BRAND.gold }}>
                        <Lock size={10} />Growth
                    </span>
                )}
            </div>
            <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={onChange}
            />
        </div>
    )
}

function InlineNumberRule({ prefix, suffix, value, onChange }: { prefix: string; suffix: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm" style={{ color: BRAND.dark }}>{prefix}</span>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-14 text-center rounded-lg border px-2 py-1 text-sm font-medium focus:outline-none"
                style={{ borderColor: BRAND.sand, color: BRAND.dark, backgroundColor: BRAND.cream }}
            />
            <span className="text-sm" style={{ color: BRAND.dark }}>{suffix}</span>
        </div>
    )
}

function BrandInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`rounded-lg border px-3 py-1.5 text-sm focus:outline-none ${className}`}
            style={{ borderColor: BRAND.sand, color: BRAND.dark, backgroundColor: BRAND.cream }}
        />
    )
}

function BrandTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            rows={4}
            className="mt-2 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none resize-none"
            style={{ borderColor: BRAND.sand, color: BRAND.dark, backgroundColor: BRAND.cream }}
        />
    )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-medium" style={{ color: BRAND.dark }}>{children}</p>
}

function FieldCaption({ children }: { children: React.ReactNode }) {
    return <p className="text-xs mt-0.5" style={{ color: BRAND.warm }}>{children}</p>
}
