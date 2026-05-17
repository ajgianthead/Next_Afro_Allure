'use client'

import type { TooltipRenderProps } from 'react-joyride'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export function TourTooltip({
    backProps,
    closeProps,
    index,
    isLastStep,
    primaryProps,
    size,
    skipProps,
    step,
    tooltipProps,
}: TooltipRenderProps) {
    const tourLabel = (step.data as { tourLabel?: string } | undefined)?.tourLabel ?? 'TOUR'

    return (
        <div
            {...tooltipProps}
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8E2D6',
                borderRadius: 16,
                padding: '20px',
                maxWidth: 320,
                width: 320,
                boxShadow: '0 20px 60px -20px rgba(15,14,14,0.15)',
                position: 'relative',
                fontFamily: 'Inter, sans-serif',
            }}
        >
            {/* Close (×) button */}
            <button
                {...skipProps}
                style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6F6863',
                    padding: 4,
                    lineHeight: 1,
                    fontSize: 16,
                    fontWeight: 400,
                }}
                aria-label="Skip tour"
            >
                ×
            </button>

            {/* Step pill */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(201,151,74,0.1)',
                borderRadius: 9999,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 3,
                paddingBottom: 3,
                marginBottom: 8,
            }}>
                <span style={{
                    color: '#C9974A',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                }}>
                    {tourLabel} · STEP {index + 1} OF {size}
                </span>
            </div>

            {/* Title */}
            {step.title && (
                <h3 style={{
                    fontFamily: SERIF,
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#1A1818',
                    margin: 0,
                    marginBottom: 8,
                    lineHeight: 1.3,
                }}>
                    {step.title as string}
                </h3>
            )}

            {/* Body */}
            <p style={{
                fontSize: 14,
                color: '#3A3532',
                lineHeight: 1.6,
                margin: 0,
                marginBottom: 20,
            }}>
                {step.content as string}
            </p>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Progress dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {Array.from({ length: size }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                borderRadius: '50%',
                                backgroundColor: i === index ? '#FC6161' : '#E8E2D6',
                                width: i === index ? 8 : 6,
                                height: i === index ? 8 : 6,
                                transition: 'all 0.2s',
                            }}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {index > 0 && (
                        <button
                            {...backProps}
                            style={{
                                background: 'none',
                                border: '1.5px solid #E8E2D6',
                                borderRadius: 9999,
                                color: '#6F6863',
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 500,
                                padding: '6px 16px',
                                fontFamily: 'Inter, sans-serif',
                                lineHeight: 1,
                            }}
                        >
                            Back
                        </button>
                    )}
                    <button
                        {...primaryProps}
                        style={{
                            backgroundColor: '#FC6161',
                            border: 'none',
                            borderRadius: 9999,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: 13,
                            fontWeight: 600,
                            padding: '6px 16px',
                            fontFamily: 'Inter, sans-serif',
                            lineHeight: 1,
                        }}
                    >
                        {isLastStep ? 'Got it' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    )
}
