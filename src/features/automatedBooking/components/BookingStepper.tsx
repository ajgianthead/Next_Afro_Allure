'use client'

import React from 'react'
import { Check } from 'lucide-react'

export function BookingStepper({ steps, activeStep }: { steps: string[]; activeStep: number }) {
    return (
        <div className="flex items-start w-full mb-6">
            {steps.map((label, i) => (
                <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                        <div
                            className="flex items-center justify-center shrink-0 transition-colors"
                            style={{
                                width: 28, height: 28, borderRadius: '50%',
                                backgroundColor: i <= activeStep ? 'var(--t-primary)' : 'var(--t-border)',
                                color: i <= activeStep ? 'var(--t-primary-text)' : 'var(--t-muted)',
                                fontSize: 12, fontWeight: 600,
                            }}
                        >
                            {i < activeStep ? <Check size={13} strokeWidth={2.5} /> : i + 1}
                        </div>
                        <span
                            className="text-center leading-tight truncate w-full px-1"
                            style={{
                                fontSize: 10,
                                color: i === activeStep ? 'var(--t-text)' : 'var(--t-muted)',
                            }}
                        >
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className="shrink-0 mt-3.5"
                            style={{
                                height: 1, flex: 1,
                                backgroundColor: i < activeStep ? 'var(--t-primary)' : 'var(--t-border)',
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}
