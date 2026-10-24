'use client'

import { useId } from 'react'
import type { Icon } from '@tabler/icons-react'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'

export const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'
export const BRAND = {
    coral: '#FC6161',
    gold: '#C9974A',
    dark: '#0F0E0E',
    ink: '#1A1818',
    warm: '#6F6863',
    cream: '#FAF7F2',
    border: '#E8E2D6',
    error: '#DC2626',
}

// 16px text on phones stops iOS Safari zooming into focused inputs.
export const INPUT_CLASS = 'h-10 w-full min-w-0 rounded-xl px-3 text-base sm:text-sm outline-none'
export const inputStyle = (hasError = false) => ({
    border: `1px solid ${hasError ? BRAND.error : BRAND.border}`,
    backgroundColor: '#FAFAFA',
    color: BRAND.ink,
})

/** Icon, eyebrow, title and intro at the top of each step. */
export function StepHeader({ icon: StepIcon, eyebrow, title, children, tone = 'gold' }: {
    icon: Icon
    eyebrow: string
    title: string
    children?: React.ReactNode
    tone?: 'gold' | 'coral'
}) {
    const color = tone === 'gold' ? BRAND.gold : BRAND.coral
    return (
        <div className="flex flex-col gap-4">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: tone === 'gold' ? 'rgba(201,151,74,0.12)' : 'rgba(252,97,97,0.1)' }}
            >
                <StepIcon size={24} color={color} />
            </div>
            <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color }}>{eyebrow}</p>
                <DialogTitle className="mt-1" style={{ fontFamily: SERIF, fontSize: 22, color: BRAND.ink, lineHeight: 1.25 }}>
                    {title}
                </DialogTitle>
                {children && (
                    <DialogDescription className="mt-2 text-sm leading-relaxed" style={{ color: BRAND.warm }}>
                        {children}
                    </DialogDescription>
                )}
            </div>
        </div>
    )
}

export function TextField({
    label,
    value,
    error,
    onChange,
    ...inputProps
}: {
    label: string
    value: string
    error?: string
    onChange: (value: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
    const id = useId()
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor={id} className="text-xs font-medium" style={{ color: BRAND.warm }}>{label}</label>
            <input
                {...inputProps}
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                aria-invalid={!!error}
                className={INPUT_CLASS}
                style={inputStyle(!!error)}
            />
            {error && <p className="text-[11px]" style={{ color: BRAND.error }}>{error}</p>}
        </div>
    )
}

/** A small "Growth" lock shown on features Starter doesn't include. */
export function GrowthBadge() {
    return (
        <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(201,151,74,0.14)', color: BRAND.gold }}
        >
            Growth
        </span>
    )
}
