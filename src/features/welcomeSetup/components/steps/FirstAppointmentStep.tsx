'use client'

import { useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { Loader2 } from 'lucide-react'
import { IconCalendarPlus } from '@tabler/icons-react'
import { StylePicker } from '@/features/automatedBooking/components/StylePicker'
import { parseStyleOptions, quoteBooking, QuoteError, type StyleSelection } from '@/features/services/pricing'
import { formatDuration, formatPrice } from '@/features/services/utils'
import type { ServiceData } from '@/features/services/types'
import { createManualAppointmentAction } from '@/features/manualBooking/server'
import { addMinutesToTime, combineDateAndTime, minStartTimeFor, validateAppointmentTimes } from '@/features/manualBooking/utils/appointmentTime'
import { browserTimezone } from '@/lib/timezone'
import { BRAND, INPUT_CLASS, StepHeader, TextField, inputStyle } from '../shared'

// StylePicker is themed with booking-site CSS variables; give it the dashboard's look.
const PICKER_THEME = {
    '--t-primary': '#0F0E0E', '--t-primary-text': '#FFFFFF', '--t-border': '#E8E2D6', '--t-card': '#FFFFFF',
    '--t-text': '#1A1818', '--t-muted': '#6F6863', '--t-bg': '#FAF7F2', '--t-input-r': '10px',
} as React.CSSProperties

const toDate = (ymd: string) => {
    const dt = DateTime.fromISO(ymd)
    return dt.isValid ? dt.toJSDate() : undefined
}

export interface BookedAppointment {
    clientName: string
    serviceName: string
    when: string
}

export function FirstAppointmentStep({ services, onBooked }: {
    services: ServiceData[]
    onBooked: (booked: BookedAppointment) => void
}) {
    const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
    const [selection, setSelection] = useState<StyleSelection>({})
    const [date, setDate] = useState(DateTime.now().toISODate()!)
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')
    const [endEdited, setEndEdited] = useState(false)
    const [client, setClient] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' })
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const service = services.find(s => s.id === serviceId)
    const styleOptions = useMemo(() => parseStyleOptions(service?.style_options), [service])

    // Same pricing as online booking: the size/length/hair choice sets the price and time.
    const quoteFor = (svc: ServiceData | undefined, sel: StyleSelection | null) => {
        if (!svc) return { quote: null, error: 'Pick a service.' }
        try {
            return { quote: quoteBooking(svc, parseStyleOptions(svc.style_options) ? sel : null), error: null }
        } catch (err) {
            return { quote: null, error: err instanceof QuoteError ? err.message : 'Unable to price this service.' }
        }
    }
    const priced = quoteFor(service, selection)

    const defaultEnd = (startTime: string, svc: ServiceData | undefined, sel: StyleSelection | null) => {
        const minutes = quoteFor(svc, sel).quote?.durationMinutes ?? svc?.length
        return startTime && minutes ? addMinutesToTime(startTime, minutes) : ''
    }
    const refreshEnd = (startTime: string, svc: ServiceData | undefined, sel: StyleSelection | null) => {
        if (!endEdited) setEnd(defaultEnd(startTime, svc, sel))
    }

    const submit = async () => {
        setError(null)
        const day = toDate(date)
        const timeError = validateAppointmentTimes(day, start, end)
        if (timeError) return setError(timeError)
        if (!service) return setError('Pick a service.')
        if (priced.error) return setError(priced.error)
        if (!client.firstName.trim() || !client.lastName.trim() || !client.email.trim() || !client.phoneNumber.trim()) {
            return setError("Enter your client's name, email and phone number.")
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email.trim())) return setError('Enter a valid client email.')

        setSaving(true)
        try {
            const startDt = combineDateAndTime(day!, start)
            const res = await createManualAppointmentAction({
                startISO: startDt.toISO()!,
                endISO: combineDateAndTime(day!, end).toISO()!,
                serviceId: service.id,
                clientData: client,
                deposit: false,
                selectedAddons: [],
                styleSelection: styleOptions ? selection : null,
                timezone: browserTimezone(),
            })
            if (!res.ok) return setError(res.error)
            onBooked({
                clientName: `${client.firstName.trim()} ${client.lastName.trim()}`,
                serviceName: service.name,
                when: startDt.toFormat("ccc, LLL d 'at' h:mm a"),
            })
        } catch {
            setError('Could not book the appointment. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconCalendarPlus} eyebrow="Optional" title="Add your first appointment" tone="coral">
                Already have a client booked? Add them here and they&apos;ll get a confirmation email. You can also skip
                this and do it later from Appointments.
            </StepHeader>

            <div className="flex flex-col gap-1">
                <label htmlFor="welcome-appt-service" className="text-xs font-medium" style={{ color: BRAND.warm }}>Service</label>
                <select
                    id="welcome-appt-service"
                    value={serviceId}
                    onChange={e => {
                        const next = services.find(s => s.id === e.target.value)
                        setServiceId(e.target.value)
                        setSelection({})
                        setEndEdited(false)
                        setEnd(defaultEnd(start, next, null))
                    }}
                    className={`${INPUT_CLASS} px-2`}
                    style={inputStyle()}
                >
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {styleOptions && (
                <div style={PICKER_THEME}>
                    <StylePicker
                        options={styleOptions}
                        selection={selection}
                        onChange={next => {
                            setSelection(next)
                            refreshEnd(start, service, next)
                        }}
                    />
                </div>
            )}

            {priced.quote && (
                <p className="text-sm" style={{ color: BRAND.ink }}>
                    <strong>{formatPrice(priced.quote.totalCents)}</strong>
                    <span style={{ color: BRAND.warm }}> · {formatDuration(priced.quote.durationMinutes)}</span>
                </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextField
                    label="Date"
                    type="date"
                    value={date}
                    min={DateTime.now().toISODate()!}
                    onChange={v => setDate(v)}
                />
                <TextField
                    label="Start"
                    type="time"
                    value={start}
                    min={minStartTimeFor(toDate(date))}
                    onChange={v => {
                        setStart(v)
                        refreshEnd(v, service, selection)
                    }}
                />
                <TextField
                    label="End"
                    type="time"
                    value={end}
                    onChange={v => {
                        setEndEdited(true)
                        setEnd(v)
                    }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField label="Client first name" value={client.firstName} autoComplete="off" onChange={firstName => setClient({ ...client, firstName })} />
                <TextField label="Client last name" value={client.lastName} autoComplete="off" onChange={lastName => setClient({ ...client, lastName })} />
                <TextField label="Client email" type="email" value={client.email} autoComplete="off" onChange={email => setClient({ ...client, email })} />
                <TextField label="Client phone" type="tel" value={client.phoneNumber} autoComplete="off" onChange={phoneNumber => setClient({ ...client, phoneNumber })} />
            </div>

            {error && <p role="alert" className="text-xs" style={{ color: BRAND.error }}>{error}</p>}

            <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="flex items-center justify-center gap-2 h-10 rounded-full text-sm font-medium disabled:opacity-50"
                style={{ backgroundColor: BRAND.coral, color: '#FFFFFF' }}
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Book appointment
            </button>
        </div>
    )
}
