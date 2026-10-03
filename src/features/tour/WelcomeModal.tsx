'use client'

import { useState } from 'react'
import { Loader2, ArrowLeft, ArrowRight, PlayCircle, Check } from 'lucide-react'
import {
    IconCalendarEvent,
    IconWorld,
    IconClock,
    IconScissors,
    IconUsers,
    IconCurrencyDollar,
    IconChartBar,
    IconBell,
    IconMapPin,
    type Icon,
} from '@tabler/icons-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AddressErrors, BusinessAddress, EMPTY_ADDRESS, US_STATES, validateBusinessAddress } from '@/lib/businessAddress'
import { browserTimezone } from '@/lib/timezone'
import { completeWelcomeAction } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
const BRAND = {
    coral: '#FC6161',
    gold: '#C9974A',
    dark: '#0F0E0E',
    ink: '#1A1818',
    warm: '#6F6863',
    cream: '#FAF7F2',
    border: '#E8E2D6',
}

/**
 * Set this to the welcome video's embed URL (e.g. a YouTube/Vimeo/Loom
 * "embed" link) to replace the placeholder on the first slide.
 */
const WELCOME_VIDEO_EMBED_URL: string | null = null

interface Feature {
    icon: Icon
    eyebrow: string
    title: string
    body: string
    points: string[]
}

const FEATURES: Feature[] = [
    {
        icon: IconCalendarEvent,
        eyebrow: 'Appointments',
        title: 'Every booking in one calendar',
        body: 'See your day, week or full list at a glance — and add appointments yourself for walk-ins, DMs and repeat clients.',
        points: ['Day, week, list and client views', 'Confirm, reschedule or cancel in a tap', 'Clients get confirmation emails automatically'],
    },
    {
        icon: IconWorld,
        eyebrow: 'Booking Site',
        title: 'Your own booking website',
        body: 'Publish a branded page where clients pick a service, choose an open time and book — no back-and-forth.',
        points: ['Ready-made templates you can customize', 'One link to share in your bio', 'Shows only the times you are free'],
    },
    {
        icon: IconClock,
        eyebrow: 'Availability',
        title: 'You decide when you work',
        body: 'Set weekly hours and special dates. Clients can only book inside the time you open up.',
        points: ['Weekly schedules', 'Specific-date overrides', 'Booking rules for deposits, cancellations and reschedules'],
    },
    {
        icon: IconScissors,
        eyebrow: 'Services',
        title: 'Your menu, your prices',
        body: 'List every service with its price and length, and offer add-ons clients can tack on when they book.',
        points: ['Prices, lengths and photos', 'Add-ons for extras', 'Service length fills in appointment end times for you'],
    },
    {
        icon: IconUsers,
        eyebrow: 'Clients',
        title: 'Your clientele, organized',
        body: 'Clients are added to your list automatically when their appointment is confirmed.',
        points: ['Contact info in one place', 'Booking history per client', 'Block clients who are not a fit'],
    },
    {
        icon: IconBell,
        eyebrow: 'Reminders',
        title: 'Fewer no-shows',
        body: 'Turn on automatic email reminders for you and your clients — 24 hours and 1 hour before each appointment.',
        points: ['Client and business reminders', 'Booking and cancellation alerts', 'Change them anytime in Settings'],
    },
    {
        icon: IconCurrencyDollar,
        eyebrow: 'Monetization',
        title: 'Get paid online',
        body: 'Connect Stripe whenever you are ready to collect deposits and send payment links. Cash works without it.',
        points: ['Deposits at booking', 'Payment links after appointments', 'Payouts straight to your bank'],
    },
    {
        icon: IconChartBar,
        eyebrow: 'Analytics',
        title: 'Know your numbers',
        body: 'Track revenue, bookings, your best services and returning clients so you can grow with confidence.',
        points: ['Revenue and booking trends', 'Top services', 'Client retention'],
    },
]

// slide 0 = welcome, 1..N = features, last = address
const TOTAL_SLIDES = FEATURES.length + 2
const ADDRESS_SLIDE = TOTAL_SLIDES - 1

interface WelcomeModalProps {
    open: boolean
    businessName: string
    initialAddress?: Partial<BusinessAddress> | null
    onComplete: () => void
}

export function WelcomeModal({ open, businessName, initialAddress, onComplete }: WelcomeModalProps) {
    const [slide, setSlide] = useState(0)
    const [address, setAddress] = useState<BusinessAddress>({ ...EMPTY_ADDRESS, ...(initialAddress ?? {}) })
    const [errors, setErrors] = useState<AddressErrors>({})
    const [touched, setTouched] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const isAddressSlide = slide === ADDRESS_SLIDE
    const liveErrors = touched ? validateBusinessAddress(address, { required: true }) : {}
    const addressValid = Object.keys(validateBusinessAddress(address, { required: true })).length === 0

    const update = (key: keyof BusinessAddress, value: string | boolean) => {
        setAddress(prev => ({ ...prev, [key]: value }))
        setSaveError(null)
    }

    const finish = async () => {
        setTouched(true)
        const fieldErrors = validateBusinessAddress(address, { required: true })
        setErrors(fieldErrors)
        if (Object.keys(fieldErrors).length > 0) return
        setSaving(true)
        setSaveError(null)
        try {
            const res = await completeWelcomeAction(address, browserTimezone())
            if (!res.ok) {
                setErrors(res.fieldErrors ?? {})
                setSaveError(res.error)
                return
            }
            onComplete()
        } catch {
            setSaveError('Could not save your address. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    // Once the business has tried to finish, re-validate live so errors clear as they fix them.
    const shownErrors = touched ? liveErrors : errors

    return (
        // Can't be dismissed: no close button, Escape and outside clicks are
        // ignored. The only way out is saving a valid address (or "no fixed
        // location") on the last slide.
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={e => e.preventDefault()}
                onPointerDownOutside={e => e.preventDefault()}
                onInteractOutside={e => e.preventDefault()}
                className="w-[calc(100vw-2rem)] max-w-xl p-0 overflow-hidden gap-0 rounded-2xl"
                style={{ border: `1px solid ${BRAND.border}`, backgroundColor: '#FFFFFF' }}
            >
                <div className="max-h-[85dvh] overflow-y-auto">
                    <div className="p-5 sm:p-7">
                        {slide === 0 && <WelcomeSlide businessName={businessName} />}
                        {slide > 0 && !isAddressSlide && <FeatureSlide feature={FEATURES[slide - 1]} />}
                        {isAddressSlide && (
                            <AddressSlide
                                address={address}
                                errors={shownErrors}
                                onChange={update}
                                // Errors appear after the first "Finish" attempt, then update live.
                                onBlur={() => { }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer: progress + navigation */}
                <div
                    className="flex flex-col gap-3 px-5 sm:px-7 py-4"
                    style={{ borderTop: `1px solid ${BRAND.border}`, backgroundColor: BRAND.cream }}
                >
                    {saveError && (
                        <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{saveError}</p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5" aria-label={`Step ${slide + 1} of ${TOTAL_SLIDES}`}>
                            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
                                <span
                                    key={i}
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                        width: i === slide ? 18 : 6,
                                        backgroundColor: i <= slide ? BRAND.dark : BRAND.border,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {slide > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSlide(s => s - 1)}
                                    disabled={saving}
                                    className="flex items-center gap-1 rounded-full h-9 px-3 text-sm font-medium disabled:opacity-50"
                                    style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }}
                                >
                                    <ArrowLeft size={14} /> Back
                                </button>
                            )}
                            {!isAddressSlide ? (
                                <button
                                    type="button"
                                    onClick={() => setSlide(s => s + 1)}
                                    className="flex items-center gap-1 rounded-full h-9 px-4 text-sm font-medium"
                                    style={{ backgroundColor: slide === 0 ? BRAND.coral : BRAND.dark, color: '#FFFFFF' }}
                                >
                                    {slide === 0 ? 'Show me around' : 'Next'} <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={finish}
                                    disabled={saving || (touched && !addressValid)}
                                    className="flex items-center gap-1.5 rounded-full h-9 px-4 text-sm font-medium disabled:opacity-50"
                                    style={{ backgroundColor: BRAND.coral, color: '#FFFFFF' }}
                                >
                                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    Finish setup
                                </button>
                            )}
                        </div>
                    </div>
                    {slide > 0 && !isAddressSlide && (
                        <button
                            type="button"
                            onClick={() => setSlide(ADDRESS_SLIDE)}
                            className="self-end text-xs underline"
                            style={{ color: BRAND.warm }}
                        >
                            Skip to setup
                        </button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function WelcomeSlide({ businessName }: { businessName: string }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: BRAND.gold }} />
            <div>
                <DialogTitle style={{ fontFamily: SERIF, fontSize: 26, color: BRAND.ink, lineHeight: 1.2 }}>
                    Welcome to AfroAllure{businessName ? `, ${businessName}` : ''}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                    Everything you need to run your beauty business — bookings, clients, payments and growth — in one place.
                    Here's a quick look at what you can do.
                </DialogDescription>
            </div>
            <div
                className="relative w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: '16 / 9', backgroundColor: BRAND.dark }}
            >
                {WELCOME_VIDEO_EMBED_URL ? (
                    <iframe
                        src={WELCOME_VIDEO_EMBED_URL}
                        title="Welcome to AfroAllure"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    // Placeholder until the welcome video is embedded (see WELCOME_VIDEO_EMBED_URL).
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <PlayCircle size={44} strokeWidth={1.25} color="rgba(255,255,255,0.85)" />
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Welcome video coming soon</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function FeatureSlide({ feature }: { feature: Feature }) {
    const FeatureIcon = feature.icon
    return (
        <div className="flex flex-col gap-4">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(201,151,74,0.12)' }}
            >
                <FeatureIcon size={24} color={BRAND.gold} />
            </div>
            <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: BRAND.gold }}>
                    {feature.eyebrow}
                </p>
                <DialogTitle className="mt-1" style={{ fontFamily: SERIF, fontSize: 22, color: BRAND.ink, lineHeight: 1.25 }}>
                    {feature.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                    {feature.body}
                </DialogDescription>
            </div>
            <ul className="flex flex-col gap-2">
                {feature.points.map(point => (
                    <li key={point} className="flex items-start gap-2 text-sm" style={{ color: BRAND.ink }}>
                        <Check size={15} className="mt-0.5 shrink-0" color={BRAND.gold} />
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    )
}

function AddressSlide({
    address,
    errors,
    onChange,
    onBlur,
}: {
    address: BusinessAddress
    errors: AddressErrors
    onChange: (key: keyof BusinessAddress, value: string | boolean) => void
    onBlur: () => void
}) {
    return (
        <div className="flex flex-col gap-4">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(252,97,97,0.1)' }}
            >
                <IconMapPin size={24} color={BRAND.coral} />
            </div>
            <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: BRAND.coral }}>
                    Last step
                </p>
                <DialogTitle className="mt-1" style={{ fontFamily: SERIF, fontSize: 22, color: BRAND.ink, lineHeight: 1.25 }}>
                    Where do clients meet you?
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                    Your address is shared with clients once they confirm an appointment. If you travel to clients or
                    don't have a set location, check the box below. You can change this anytime in Settings.
                </DialogDescription>
            </div>

            <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                    type="checkbox"
                    checked={address.no_address}
                    onChange={e => onChange('no_address', e.target.checked)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#0F0E0E]"
                />
                <span className="text-sm" style={{ color: BRAND.ink }}>I don't have a fixed location</span>
            </label>

            {!address.no_address && (
                <div className="flex flex-col gap-3">
                    <AddressField
                        label="Street address"
                        value={address.line_1}
                        error={errors.line_1}
                        autoComplete="address-line1"
                        onChange={v => onChange('line_1', v)}
                        onBlur={onBlur}
                    />
                    <AddressField
                        label="Apt, suite, unit (optional)"
                        value={address.line_2}
                        autoComplete="address-line2"
                        onChange={v => onChange('line_2', v)}
                        onBlur={onBlur}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px] gap-3">
                        <AddressField
                            label="City"
                            value={address.city}
                            error={errors.city}
                            autoComplete="address-level2"
                            onChange={v => onChange('city', v)}
                            onBlur={onBlur}
                        />
                        <div className="grid grid-cols-2 sm:contents gap-3">
                            <div className="flex flex-col gap-1 min-w-0">
                                <label className="text-xs font-medium" style={{ color: BRAND.warm }}>State</label>
                                <select
                                    value={address.state.toUpperCase()}
                                    onChange={e => onChange('state', e.target.value)}
                                    onBlur={onBlur}
                                    autoComplete="address-level1"
                                    aria-invalid={!!errors.state}
                                    className="h-10 w-full min-w-0 rounded-xl px-2 text-base sm:text-sm outline-none"
                                    style={{ border: `1px solid ${errors.state ? '#DC2626' : BRAND.border}`, backgroundColor: '#FAFAFA', color: BRAND.ink }}
                                >
                                    <option value="">—</option>
                                    {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                                {errors.state && <p className="text-[11px]" style={{ color: '#DC2626' }}>{errors.state}</p>}
                            </div>
                            <AddressField
                                label="ZIP"
                                value={address.zip_code}
                                error={errors.zip_code}
                                inputMode="numeric"
                                maxLength={10}
                                autoComplete="postal-code"
                                onChange={v => onChange('zip_code', v.replace(/[^\d-]/g, ''))}
                                onBlur={onBlur}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function AddressField({
    label,
    value,
    error,
    onChange,
    onBlur,
    ...inputProps
}: {
    label: string
    value: string
    error?: string
    onChange: (v: string) => void
    onBlur: () => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'>) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs font-medium" style={{ color: BRAND.warm }}>{label}</label>
            <input
                {...inputProps}
                value={value}
                onChange={e => onChange(e.target.value)}
                onBlur={onBlur}
                aria-invalid={!!error}
                className="h-10 w-full min-w-0 rounded-xl px-3 text-base sm:text-sm outline-none"
                style={{ border: `1px solid ${error ? '#DC2626' : BRAND.border}`, backgroundColor: '#FAFAFA', color: BRAND.ink }}
            />
            {error && <p className="text-[11px]" style={{ color: '#DC2626' }}>{error}</p>}
        </div>
    )
}
