import { AppointmentEvent } from "../../types";
import { CalendarIcon, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from "app/for-businesses/actions";
import { dismissUpgradePromptAction } from "app/dashboard/(other)/actions";

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const CreateAppointmentModal = ({ planType, monthlyBookingCount, hadTrial, stripeCustomerId, businessId }: {
    planType: 'STARTER' | 'GROWTH';
    monthlyBookingCount: number;
    hadTrial: boolean;
    stripeCustomerId: string | null;
    businessId: string;
}) => {
    const { manualBookingData, setManualBookingData } = useManualBooking()
    const router = useRouter()
    const [upgradeLoading, setUpgradeLoading] = useState(false)

    const atLimit = planType === 'STARTER' && monthlyBookingCount >= 10
    const isOpen = manualBookingData?.openCreateAppointment ?? false

    const validateInputs = () => {
        const selectedDate = manualBookingData?.newAppointmentData.date ?? new Date()
        const startParts = manualBookingData?.newAppointmentData.start.split(':')
        const endParts = manualBookingData?.newAppointmentData.end.split(':')

        if (manualBookingData?.newAppointmentData.start.length === 0 || manualBookingData?.newAppointmentData.end.length === 0) {
            setManualBookingData!({ ...manualBookingData!, error: { hasError: true, message: 'Please enter a valid start and end time' } })
            return false
        }

        const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(startParts![0]), Number(startParts![1]))
        const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), Number(endParts![0]), Number(endParts![1]))

        if (end <= start) {
            setManualBookingData!({ ...manualBookingData!, error: { hasError: true, message: 'End time must be after start time' } })
            return false
        }
        if (manualBookingData?.newAppointmentData.serviceId.length === 0) {
            setManualBookingData!({ ...manualBookingData!, error: { hasError: true, message: 'Please select a service' } })
            return false
        }
        if (!manualBookingData?.newAppointmentData.clientData.firstName.length ||
            !manualBookingData?.newAppointmentData.clientData.lastName.length ||
            !manualBookingData?.newAppointmentData.clientData.email.length ||
            !manualBookingData?.newAppointmentData.clientData.phoneNumber.length
        ) {
            setManualBookingData!({ ...manualBookingData!, error: { hasError: true, message: 'Please enter client information' } })
            return false
        }
        return true
    }

    const handleClose = () => {
        setManualBookingData!({
            ...manualBookingData!,
            newAppointmentData: {
                start: "",
                end: "",
                date: new Date(),
                serviceId: '',
                clientData: { firstName: "", lastName: "", email: "", phoneNumber: "" },
                selectedAddons: new Set(),
                deposit: manualBookingData?.policy.deposit.enabled!
            },
            openCreateAppointment: false,
            error: { hasError: false, message: "" }
        })
    }

    const handleUpgrade = async () => {
        setUpgradeLoading(true)
        try {
            const session = stripeCustomerId
                ? await createSubscriptionForExistingCustomer(stripeCustomerId)
                : await createSubscriptionCheckout(hadTrial, businessId)
            if (session.url) router.push(session.url)
        } catch {
            toast.error('Failed to start checkout. Please try again.')
        } finally {
            setUpgradeLoading(false)
        }
    }

    const handleDismissUpgrade = async () => {
        localStorage.setItem('upgrade_modal_dismissed', JSON.stringify({ ts: Date.now() }))
        await dismissUpgradePromptAction(businessId)
        handleClose()
    }

    if (atLimit) {
        return (
            <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose() }}>
                <DialogContent className="max-w-md">
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
                        <p className="text-sm font-semibold" style={{ color: '#1A1818' }}>$25/month · 14-day free trial</p>
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

    return (
        <Dialog open={isOpen} onOpenChange={open => { if (!open) handleClose() }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Appointment</DialogTitle>
                    {manualBookingData?.error.hasError && (
                        <Caption size={'sm'} className="text-red-500">{manualBookingData.error.message}</Caption>
                    )}
                </DialogHeader>
                <div className="flex gap-5 flex-col">
                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Date</Caption>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size={'sm'}
                                    variant="outline"
                                    data-empty={!manualBookingData?.newAppointmentData.date}
                                    className="w-70 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                >
                                    <CalendarIcon />
                                    {manualBookingData?.newAppointmentData.date
                                        ? <p className="text-sm">{format(manualBookingData.newAppointmentData.date, "PPP")}</p>
                                        : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-9999">
                                <CalendarComponent
                                    disabled={(date) => date < new Date()}
                                    required
                                    mode="single"
                                    selected={manualBookingData?.newAppointmentData.date}
                                    onSelect={(e) => setManualBookingData!({
                                        ...manualBookingData!,
                                        newAppointmentData: { ...manualBookingData?.newAppointmentData!, date: e }
                                    })}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">Start Time</Caption>
                                <Input
                                    data-testid='start-time'
                                    value={manualBookingData?.newAppointmentData.start}
                                    onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, start: e.target.value } })}
                                    style={{ fontSize: 14 }}
                                    type='time'
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Caption className="font-semibold">End Time</Caption>
                                <Input
                                    data-testid='end-time'
                                    value={manualBookingData?.newAppointmentData.end}
                                    onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, end: e.target.value } })}
                                    style={{ fontSize: 14 }}
                                    type='time'
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Service</Caption>
                        <Select onValueChange={(value) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, serviceId: value } })}>
                            <SelectTrigger data-testid='select-service-btn' style={{ fontSize: 14 }} size="sm" className="w-45 text-sm">
                                <SelectValue placeholder='Select a service' className="text-sm" />
                            </SelectTrigger>
                            <SelectContent data-testid='service-name' className="z-9999">
                                {manualBookingData?.services.map((service, index) => (
                                    <div key={index}>
                                        <SelectItem data-testid='service-name' value={service.id}>{service.name}</SelectItem>
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {manualBookingData?.newAppointmentData.serviceId.length! > 0 && manualBookingData?.services.filter((service) => service.id === manualBookingData.newAppointmentData.serviceId)[0].addons.length ? (
                        <div className="flex flex-col gap-2">
                            <Caption className="font-semibold">Addon(s)</Caption>
                            <div>
                                <FieldGroup>
                                    {manualBookingData.services.filter((service) => service.id === manualBookingData.newAppointmentData.serviceId)[0].addons.map((addon, index) => {
                                        const addonId = `addon-${addon.id}`
                                        return (
                                            <div key={index}>
                                                <Field orientation={'horizontal'}>
                                                    <Checkbox
                                                        checked={manualBookingData.newAppointmentData.selectedAddons.has(addon.id)}
                                                        onCheckedChange={(checked: boolean) => {
                                                            let newSet = new Set([...manualBookingData.newAppointmentData.selectedAddons])
                                                            if (manualBookingData.newAppointmentData.selectedAddons.has(addon.id)) {
                                                                newSet.delete(addon.id)
                                                            } else {
                                                                newSet.add(addon.id)
                                                            }
                                                            setManualBookingData!({ ...manualBookingData, newAppointmentData: { ...manualBookingData.newAppointmentData, selectedAddons: newSet } })
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
                    ) : <></>}

                    <div className="flex flex-col gap-2">
                        <Caption className="font-semibold">Client Information</Caption>
                        <div className="grid grid-cols-2 grid-rows-2 gap-2">
                            <Input data-testid={'first-name'} value={manualBookingData?.newAppointmentData.clientData.firstName} onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, clientData: { ...manualBookingData?.newAppointmentData.clientData!, firstName: e.target.value } } })} style={{ fontSize: 14 }} placeholder='First Name' />
                            <Input data-testid={'last-name'} value={manualBookingData?.newAppointmentData.clientData.lastName} onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, clientData: { ...manualBookingData?.newAppointmentData.clientData!, lastName: e.target.value } } })} style={{ fontSize: 14 }} placeholder='Last Name' />
                            <Input data-testid={'email'} value={manualBookingData?.newAppointmentData.clientData.email} onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, clientData: { ...manualBookingData?.newAppointmentData.clientData!, email: e.target.value } } })} style={{ fontSize: 14 }} placeholder="Email" />
                            <Input data-testid={'phone-number'} value={manualBookingData?.newAppointmentData.clientData.phoneNumber} onChange={(e) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, clientData: { ...manualBookingData?.newAppointmentData.clientData!, phoneNumber: e.target.value } } })} style={{ fontSize: 14 }} placeholder="Phone Number" />
                        </div>
                    </div>
                    <div>
                        <FieldGroup>
                            <Field orientation={'horizontal'}>
                                <Checkbox
                                    disabled={!manualBookingData?.policy.deposit.enabled}
                                    checked={manualBookingData?.newAppointmentData.deposit}
                                    onCheckedChange={(checked: boolean) => setManualBookingData!({ ...manualBookingData!, newAppointmentData: { ...manualBookingData?.newAppointmentData!, deposit: checked } })}
                                    id='require-deposit'
                                />
                                <FieldLabel htmlFor="require-deposit">Require deposit</FieldLabel>
                            </Field>
                        </FieldGroup>
                    </div>
                </div>
                <DialogFooter className="mt-2">
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
                        onClick={async () => {
                            if (!validateInputs()) return
                            setManualBookingData!({ ...manualBookingData!, creatingAppointment: true })
                            try {
                                const appointment = await createManualAppointmentAction(manualBookingData?.newAppointmentData!) as AppointmentEvent
                                setManualBookingData!({ ...manualBookingData!, appointmentEvents: [...manualBookingData?.appointmentEvents!, appointment], creatingAppointment: false })
                                handleClose()
                            } catch (err: any) {
                                setManualBookingData!({ ...manualBookingData!, creatingAppointment: false, error: { hasError: true, message: err?.message ?? 'Failed to create appointment. Please try again.' } })
                            }
                        }}
                    >
                        {manualBookingData?.creatingAppointment ? 'Creating…' : 'Create Appointment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
