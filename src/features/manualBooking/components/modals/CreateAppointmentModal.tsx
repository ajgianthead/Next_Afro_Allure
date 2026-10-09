import { CalendarIcon, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DateTime } from "luxon";

import { useManualBooking } from "../../hooks/useManualBooking";
import { Caption } from "@/components/tailus-ui/typography";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns"
import { createManualAppointmentAction } from "../../server";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpgrade } from '@/features/billing/components/UpgradeDialog'
import { dismissUpgradePromptAction } from "app/dashboard/(other)/actions";
import { AppointmentData } from "../../types";
import { addMinutesToTime, combineDateAndTime, minStartTimeFor, validateAppointmentTimes } from "../../utils/appointmentTime";
import { browserTimezone } from "@/lib/timezone";
import { parseStyleOptions, quoteBooking, QuoteError, type StyleSelection } from "@/features/services/pricing";
import { StylePicker } from "@/features/automatedBooking/components/StylePicker";
import { TRIAL_DAYS } from '@/features/billing/plans'

// StylePicker is themed with booking-site CSS variables; give it the dashboard's look.
const PICKER_THEME = {
    '--t-primary': '#0F0E0E', '--t-primary-text': '#FFFFFF', '--t-border': '#E8E2D6', '--t-card': '#FFFFFF',
    '--t-text': '#1A1818', '--t-muted': '#6F6863', '--t-bg': '#FAF7F2', '--t-input-r': '10px',
} as import('react').CSSProperties

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

// 16px text stops iOS Safari from zooming into focused inputs; min-w-0 +
// appearance-none stop native time inputs from forcing their intrinsic
// width and overflowing the modal on iPhones.
const INPUT_CLASS = "h-10 w-full min-w-0 max-w-full appearance-none text-base sm:text-sm [&::-webkit-date-and-time-value]:text-left"

export const CreateAppointmentModal = ({ planType, monthlyBookingCount, hadTrial, stripeCustomerId, businessId, canTakeOnlinePayments }: {
    planType: 'STARTER' | 'GROWTH';
    monthlyBookingCount: number;
    hadTrial: boolean;
    stripeCustomerId: string | null;
    businessId: string;
    canTakeOnlinePayments: boolean;
}) => {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const router = useRouter()
    const { openUpgrade } = useUpgrade()
    const [upgradeLoading, setUpgradeLoading] = useState(false)
    // Once the business edits the end time by hand, stop overwriting it with
    // the service-length default.
    const [endEdited, setEndEdited] = useState(false)

    const atLimit = planType === 'STARTER' && monthlyBookingCount >= 10
    const isOpen = manualBookingData?.openCreateAppointment ?? false
    const form = manualBookingData?.newAppointmentData
    const depositAvailable = !!manualBookingData?.policy.deposit.enabled && canTakeOnlinePayments

    const selectedService = useMemo(
        () => manualBookingData?.services.find(s => s.id === form?.serviceId),
        [manualBookingData?.services, form?.serviceId]
    )

    useEffect(() => { if (isOpen) setEndEdited(false) }, [isOpen])

    const updateForm = (patch: Partial<AppointmentData>) => {
        setManualBookingData!(prev => ({
            ...prev,
            newAppointmentData: { ...prev.newAppointmentData, ...patch },
            error: { hasError: false, message: '' },
        }))
    }

    const styleOptions = useMemo(() => parseStyleOptions(selectedService?.style_options), [selectedService])

    // Same pricing as online booking — for the live price and default end time.
    const quoteFor = (serviceId: string | undefined, selection: StyleSelection | null | undefined, addonIds: Set<string>) => {
        const service = manualBookingData?.services.find(s => s.id === serviceId)
        if (!service) return { quote: null, error: null as string | null }
        const addons = ((service.addons as any[]) ?? []).filter((a: any) => addonIds.has(a.id))
            .map((a: any) => ({ id: a.id, name: a.name, price: Number(a.price ?? 0) }))
        try {
            return { quote: quoteBooking(service, parseStyleOptions(service.style_options) ? selection ?? null : null, addons), error: null }
        } catch (err) {
            return { quote: null, error: err instanceof QuoteError ? err.message : 'Unable to price this service' }
        }
    }
    const priced = quoteFor(form?.serviceId, form?.styleSelection, form?.selectedAddons ?? new Set())

    const defaultEndFor = (start: string, serviceId: string, selection?: StyleSelection | null) => {
        const service = manualBookingData?.services.find(s => s.id === serviceId)
        const minutes = quoteFor(serviceId, selection, new Set()).quote?.durationMinutes ?? service?.length
        if (!start || !minutes) return null
        return addMinutesToTime(start, minutes)
    }

    const handleStartChange = (start: string) => {
        const patch: Partial<AppointmentData> = { start }
        if (!endEdited && form?.serviceId) {
            const end = defaultEndFor(start, form.serviceId, form.styleSelection)
            if (end) patch.end = end
        }
        updateForm(patch)
    }

    const handleStyleChange = (styleSelection: StyleSelection) => {
        // The chosen size/length sets the default end time (still editable).
        const patch: Partial<AppointmentData> = { styleSelection }
        if (!endEdited && form?.serviceId) {
            const end = defaultEndFor(form.start ?? '', form.serviceId, styleSelection)
            if (end) patch.end = end
        }
        updateForm(patch)
    }

    const handleServiceChange = (serviceId: string) => {
        // Service length sets a default end time; the business can still change it.
        const patch: Partial<AppointmentData> = { serviceId, selectedAddons: new Set(), styleSelection: null }
        const end = defaultEndFor(form?.start ?? '', serviceId)
        if (end) {
            patch.end = end
            setEndEdited(false)
        }
        updateForm(patch)
    }

    const handleEndChange = (end: string) => {
        setEndEdited(true)
        updateForm({ end })
    }

    const setError = (message: string) =>
        setManualBookingData!(prev => ({ ...prev, error: { hasError: true, message } }))

    const validateInputs = () => {
        const timeError = validateAppointmentTimes(form?.date, form?.start ?? '', form?.end ?? '')
        if (timeError) { setError(timeError); return false }
        if (!form?.serviceId) { setError('Please select a service'); return false }
        if (priced.error) { setError(priced.error); return false }
        const c = form.clientData
        if (!c.firstName.trim() || !c.lastName.trim() || !c.email.trim() || !c.phoneNumber.trim()) {
            setError('Please enter client information'); return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
            setError('Please enter a valid client email'); return false
        }
        return true
    }

    const handleClose = () => {
        setEndEdited(false)
        setManualBookingData!(prev => ({
            ...prev,
            newAppointmentData: {
                start: "",
                end: "",
                date: new Date(),
                serviceId: '',
                clientData: { firstName: "", lastName: "", email: "", phoneNumber: "" },
                selectedAddons: new Set(),
                styleSelection: null,
                deposit: depositAvailable
            },
            openCreateAppointment: false,
            creatingAppointment: false,
            error: { hasError: false, message: "" }
        }))
    }

    const handleSubmit = async () => {
        if (!form || !validateInputs()) return
        setManualBookingData!(prev => ({ ...prev, creatingAppointment: true }))
        const res = await createManualAppointmentAction({
            startISO: combineDateAndTime(form.date, form.start).toISO()!,
            endISO: combineDateAndTime(form.date, form.end).toISO()!,
            serviceId: form.serviceId,
            clientData: form.clientData,
            deposit: depositAvailable && form.deposit,
            selectedAddons: [...form.selectedAddons],
            styleSelection: styleOptions ? form.styleSelection ?? null : null,
            timezone: browserTimezone(),
        })
        if (!res.ok) {
            setManualBookingData!(prev => ({ ...prev, creatingAppointment: false, error: { hasError: true, message: res.error } }))
            return
        }
        // Add the new appointment and close in one update — previously the
        // close ran with a stale snapshot and wiped the new appointment out of
        // the list until the page was refreshed.
        setManualBookingData!(prev => ({
            ...prev,
            appointmentEvents: [...prev.appointmentEvents, res.data],
        }))
        handleClose()
        toast.success('Appointment created')
        router.refresh()
    }

    const handleUpgrade = () => openUpgrade()

    const handleDismissUpgrade = async () => {
        localStorage.setItem('upgrade_modal_dismissed', JSON.stringify({ ts: Date.now() }))
        await dismissUpgradePromptAction(businessId)
        handleClose()
    }

    if (atLimit) {
        return (
            <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose() }}>
                <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: SERIF, fontSize: '1.35rem', color: '#1A1818' }}>
                            You've reached your monthly limit
                        </DialogTitle>
                        <p className="text-sm mt-1" style={{ color: '#6F6863' }}>
                            That's amazing growth. Upgrade to keep the momentum going.
                        </p>
                    </DialogHeader>
                    <div className="space-y-2 py-1">
                        {[
                            'Unlimited bookings',
                            'Drag & drop builder',
                            'Apple Pay, Google Pay, Cash App',
                            'Automated reminders',
                            'Detailed analytics',
                        ].map(f => (
                            <div key={f} className="flex items-center gap-2 text-sm" style={{ color: '#1A1818' }}>
                                <Check size={13} style={{ color: '#C9974A' }} />
                                {f}
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#1A1818' }}>$25/month · {TRIAL_DAYS}-day free trial</p>
                        <p className="text-xs" style={{ color: '#6F6863' }}>No credit card required</p>
                    </div>
                    <DialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button
                            onClick={handleUpgrade}
                            disabled={upgradeLoading}
                            className="w-full"
                            style={{ backgroundColor: '#FC6161', color: 'white', border: 'none' }}
                        >
                            {upgradeLoading ? 'Loading…' : 'Start Free Trial'}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDismissUpgrade}
                            className="w-full"
                            style={{ color: '#6F6863' }}
                        >
                            Maybe Later
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    const today = DateTime.now().startOf('day').toJSDate()
    const minStart = minStartTimeFor(form?.date)
    const durationMins = form?.date && form.start && form.end
        ? combineDateAndTime(form.date, form.end).diff(combineDateAndTime(form.date, form.start), 'minutes').minutes
        : null

    return (
        <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose() }}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle>Create Appointment</DialogTitle>
                    {manualBookingData?.error.hasError && (
                        <Caption size={'sm'} className="text-red-500">{manualBookingData.error.message}</Caption>
                    )}
                </DialogHeader>
                <div className="flex gap-5 flex-col min-w-0">
                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Date</Caption>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size={'sm'}
                                    variant="outline"
                                    data-empty={!form?.date}
                                    className="h-10 w-full sm:w-70 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                >
                                    <CalendarIcon />
                                    {form?.date
                                        ? <p className="text-sm">{format(form.date, "PPP")}</p>
                                        : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-9999">
                                <CalendarComponent
                                    // Same-day bookings are allowed; only earlier days are blocked.
                                    disabled={(date) => date < today}
                                    required
                                    mode="single"
                                    selected={form?.date}
                                    onSelect={(date) => { if (date) updateForm({ date }) }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="grid grid-cols-2 gap-3 min-w-0">
                            <div className="flex flex-col gap-2 min-w-0">
                                <Caption className="font-semibold">Start Time</Caption>
                                <Input
                                    data-testid='start-time'
                                    value={form?.start ?? ''}
                                    min={minStart}
                                    onChange={(e) => handleStartChange(e.target.value)}
                                    className={INPUT_CLASS}
                                    type='time'
                                />
                            </div>
                            <div className="flex flex-col gap-2 min-w-0">
                                <Caption className="font-semibold">End Time</Caption>
                                <Input
                                    data-testid='end-time'
                                    value={form?.end ?? ''}
                                    min={form?.start || undefined}
                                    onChange={(e) => handleEndChange(e.target.value)}
                                    className={INPUT_CLASS}
                                    type='time'
                                />
                            </div>
                        </div>
                        {durationMins !== null && durationMins > 0 && (
                            <p className="text-xs" style={{ color: '#6F6863' }}>
                                {durationMins >= 60 ? `${Math.floor(durationMins / 60)}h ` : ''}{durationMins % 60 ? `${durationMins % 60}m` : ''}
                                {selectedService && !endEdited ? ` · based on ${selectedService.name}'s length — you can change the end time` : ''}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                        <Caption className="font-semibold">Service</Caption>
                        <Select value={form?.serviceId || undefined} onValueChange={handleServiceChange}>
                            <SelectTrigger data-testid='select-service-btn' size="sm" className="h-10 w-full sm:w-60 text-base sm:text-sm">
                                <SelectValue placeholder='Select a service' className="text-sm" />
                            </SelectTrigger>
                            <SelectContent data-testid='service-name' className="z-9999">
                                {manualBookingData?.services.map((service) => (
                                    <SelectItem key={service.id} data-testid='service-name' value={service.id}>{service.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {styleOptions && (
                        <div className="flex flex-col gap-2 rounded-xl p-3" style={{ ...PICKER_THEME, border: '1px solid #E8E2D6' }}>
                            <StylePicker options={styleOptions} selection={form?.styleSelection ?? {}} onChange={handleStyleChange} />
                        </div>
                    )}

                    {selectedService && (
                        <p className="text-sm" style={{ color: priced.quote ? '#1A1818' : '#6F6863' }}>
                            {priced.quote
                                ? <>Price: <strong>${(priced.quote.totalCents / 100).toFixed(2).replace(/\.00$/, '')}</strong></>
                                : priced.error}
                        </p>
                    )}

                    {selectedService?.addons?.length ? (
                        <div className="flex flex-col gap-2">
                            <Caption className="font-semibold">Addon(s)</Caption>
                            <div>
                                <FieldGroup>
                                    {selectedService.addons.map((addon) => {
                                        const addonId = `addon-${addon.id}`
                                        return (
                                            <div key={addon.id}>
                                                <Field orientation={'horizontal'}>
                                                    <Checkbox
                                                        checked={form!.selectedAddons.has(addon.id)}
                                                        onCheckedChange={() => {
                                                            const next = new Set(form!.selectedAddons)
                                                            if (next.has(addon.id)) next.delete(addon.id)
                                                            else next.add(addon.id)
                                                            updateForm({ selectedAddons: next })
                                                        }}
                                                        id={addonId}
                                                    />
                                                    <FieldLabel htmlFor={addonId}>
                                                        {addon.name} — ${(addon.price / 100).toFixed(2)}
                                                    </FieldLabel>
                                                </Field>
                                            </div>
                                        )
                                    })}
                                </FieldGroup>
                            </div>
                        </div>
                    ) : null}

                    <div className="flex flex-col gap-2 min-w-0">
                        <Caption className="font-semibold">Client Information</Caption>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                            <Input data-testid={'first-name'} autoComplete="off" value={form?.clientData.firstName ?? ''} onChange={(e) => updateForm({ clientData: { ...form!.clientData, firstName: e.target.value } })} className={INPUT_CLASS} placeholder='First Name' />
                            <Input data-testid={'last-name'} autoComplete="off" value={form?.clientData.lastName ?? ''} onChange={(e) => updateForm({ clientData: { ...form!.clientData, lastName: e.target.value } })} className={INPUT_CLASS} placeholder='Last Name' />
                            <Input data-testid={'email'} type="email" inputMode="email" autoComplete="off" value={form?.clientData.email ?? ''} onChange={(e) => updateForm({ clientData: { ...form!.clientData, email: e.target.value } })} className={INPUT_CLASS} placeholder="Email" />
                            <Input data-testid={'phone-number'} type="tel" inputMode="tel" autoComplete="off" value={form?.clientData.phoneNumber ?? ''} onChange={(e) => updateForm({ clientData: { ...form!.clientData, phoneNumber: e.target.value } })} className={INPUT_CLASS} placeholder="Phone Number" />
                        </div>
                    </div>
                    <div>
                        <FieldGroup>
                            <Field orientation={'horizontal'}>
                                <Checkbox
                                    disabled={!depositAvailable}
                                    checked={depositAvailable && !!form?.deposit}
                                    onCheckedChange={(checked: boolean) => updateForm({ deposit: checked })}
                                    id='require-deposit'
                                />
                                <FieldLabel htmlFor="require-deposit">
                                    Require deposit
                                    {!canTakeOnlinePayments && (
                                        <span className="text-xs font-normal" style={{ color: '#6F6863' }}> (set up Monetization to collect deposits)</span>
                                    )}
                                </FieldLabel>
                            </Field>
                        </FieldGroup>
                    </div>
                </div>
                <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row">
                    <Button
                        variant={'outline'}
                        disabled={manualBookingData?.creatingAppointment}
                        style={{ fontSize: 14 }}
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        data-testid={'submit-appointment'}
                        disabled={manualBookingData?.creatingAppointment}
                        style={{ fontSize: 14 }}
                        onClick={handleSubmit}
                    >
                        {manualBookingData?.creatingAppointment ? 'Creating…' : 'Create Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
