'use client'

import { IconMapPin } from '@tabler/icons-react'
import { AddressErrors, BusinessAddress, US_STATES } from '@/lib/businessAddress'
import { BRAND, INPUT_CLASS, StepHeader, TextField, inputStyle } from '../shared'

export function LocationStep({
    address,
    errors,
    onChange,
}: {
    address: BusinessAddress
    errors: AddressErrors
    onChange: (key: keyof BusinessAddress, value: string | boolean) => void
}) {
    return (
        <div className="flex flex-col gap-4">
            <StepHeader icon={IconMapPin} eyebrow="Your location" title="Where do clients meet you?" tone="coral">
                Your address is shared with clients once they confirm an appointment. If you travel to clients or
                don&apos;t have a set location, check the box below. You can change this anytime in Settings.
            </StepHeader>

            <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                    type="checkbox"
                    checked={address.no_address}
                    onChange={e => onChange('no_address', e.target.checked)}
                    className="h-4 w-4 shrink-0 cursor-pointer accent-[#0F0E0E]"
                />
                <span className="text-sm" style={{ color: BRAND.ink }}>I don&apos;t have a fixed location</span>
            </label>

            {!address.no_address && (
                <div className="flex flex-col gap-3">
                    <TextField
                        label="Street address"
                        value={address.line_1}
                        error={errors.line_1}
                        autoComplete="address-line1"
                        onChange={v => onChange('line_1', v)}
                    />
                    <TextField
                        label="Apt, suite, unit (optional)"
                        value={address.line_2}
                        autoComplete="address-line2"
                        onChange={v => onChange('line_2', v)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_110px] gap-3">
                        <TextField
                            label="City"
                            value={address.city}
                            error={errors.city}
                            autoComplete="address-level2"
                            onChange={v => onChange('city', v)}
                        />
                        <div className="grid grid-cols-2 sm:contents gap-3">
                            <div className="flex flex-col gap-1 min-w-0">
                                <label htmlFor="welcome-address-state" className="text-xs font-medium" style={{ color: BRAND.warm }}>State</label>
                                <select
                                    id="welcome-address-state"
                                    value={address.state.toUpperCase()}
                                    onChange={e => onChange('state', e.target.value)}
                                    autoComplete="address-level1"
                                    aria-invalid={!!errors.state}
                                    className={`${INPUT_CLASS} px-2`}
                                    style={inputStyle(!!errors.state)}
                                >
                                    <option value="">—</option>
                                    {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                                {errors.state && <p className="text-[11px]" style={{ color: BRAND.error }}>{errors.state}</p>}
                            </div>
                            <TextField
                                label="ZIP"
                                value={address.zip_code}
                                error={errors.zip_code}
                                inputMode="numeric"
                                maxLength={10}
                                autoComplete="postal-code"
                                onChange={v => onChange('zip_code', v.replace(/[^\d-]/g, ''))}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
