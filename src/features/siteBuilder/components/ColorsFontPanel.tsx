'use client'

import { Check, AlertTriangle } from 'lucide-react'
import { buildGoogleFontsUrl } from '@/lib/extractFonts'
import { BRAND } from '@/features/welcomeSetup/components/shared'
import type { SiteData } from '../siteData'
import { contrastRatio, FONT_PAIRINGS, isHexColor, templateMeta, type SchemeColors } from '../themes'

// Every pairing's heading font, so the choices preview in their own type.
const PAIRING_FONTS_URL = buildGoogleFontsUrl(FONT_PAIRINGS.map(f => ({ family: f.heading.family, weights: [f.heading.weights[f.heading.weights.length - 1]] })))

export function SchemeSwatches({ site, onChange, showCustom = true }: {
    site: SiteData
    onChange: (patch: Partial<SiteData>) => void
    showCustom?: boolean
}) {
    const meta = templateMeta(site.templateId)
    const current = site.scheme === 'custom' ? 'custom' : (meta.schemes.find(s => s.id === site.scheme) ?? meta.schemes[0]).id
    const custom: SchemeColors = site.customColors ?? { bg: meta.schemes[0].bg, fg: meta.schemes[0].fg, accent: meta.schemes[0].accent }
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Color scheme">
            {meta.schemes.map(s => (
                <Swatch key={s.id} name={s.name} colors={s} active={current === s.id} onClick={() => onChange({ scheme: s.id })} />
            ))}
            {showCustom && (
                <Swatch name="Custom" colors={custom} active={current === 'custom'} onClick={() => onChange({ scheme: 'custom', customColors: custom })} />
            )}
        </div>
    )
}

function Swatch({ name, colors, active, onClick }: { name: string; colors: SchemeColors; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onClick}
            className="flex min-h-14 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
            style={{ border: `2px solid ${active ? BRAND.dark : BRAND.border}`, backgroundColor: '#FFFFFF' }}
        >
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: colors.bg, boxShadow: `inset 0 0 0 1px ${BRAND.border}` }}>
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-tl-full" style={{ backgroundColor: colors.accent }} />
                <span className="text-[11px] font-bold" style={{ color: colors.fg }}>Aa</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: BRAND.ink }}>{name}</span>
            {active && <Check size={14} color={BRAND.dark} className="shrink-0" />}
        </button>
    )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <label className="flex min-h-12 items-center gap-3 rounded-xl px-3" style={{ border: `1px solid ${BRAND.border}` }}>
            <input
                type="color"
                value={isHexColor(value) && value.length === 7 ? value : '#000000'}
                onChange={e => onChange(e.target.value)}
                className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full"
                aria-label={label}
            />
            <span className="flex-1 text-sm" style={{ color: BRAND.ink }}>{label}</span>
            <input
                value={value}
                onChange={e => {
                    const v = e.target.value.trim()
                    if (/^#?[0-9a-f]{0,6}$/i.test(v)) onChange(v.startsWith('#') ? v : `#${v}`)
                }}
                className="w-20 bg-transparent text-right font-mono text-base uppercase outline-none sm:text-xs"
                style={{ color: BRAND.warm }}
                aria-label={`${label} hex code`}
                maxLength={7}
            />
        </label>
    )
}

export function ColorsFontPanel({ site, onChange }: { site: SiteData; onChange: (patch: Partial<SiteData>) => void }) {
    const meta = templateMeta(site.templateId)
    const currentFont = FONT_PAIRINGS.find(f => f.id === site.fontPairing)?.id ?? meta.defaultFont
    const custom = site.scheme === 'custom' ? site.customColors : null
    const setCustom = (patch: Partial<SchemeColors>) => onChange({ customColors: { ...(custom ?? { bg: meta.schemes[0].bg, fg: meta.schemes[0].fg, accent: meta.schemes[0].accent }), ...patch } })
    const lowContrast = custom && isHexColor(custom.bg) && isHexColor(custom.fg) && contrastRatio(custom.bg, custom.fg) < 4.5

    return (
        <div className="flex flex-col gap-7">
            <link rel="stylesheet" href={PAIRING_FONTS_URL} precedence="default" />
            <section className="flex flex-col gap-3">
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: BRAND.ink }}>Color scheme</h3>
                    <p className="text-xs" style={{ color: BRAND.warm }}>Your booking page uses the same colors.</p>
                </div>
                <SchemeSwatches site={site} onChange={onChange} />
                {custom && (
                    <div className="flex flex-col gap-2">
                        <ColorField label="Background" value={custom.bg} onChange={bg => setCustom({ bg })} />
                        <ColorField label="Text" value={custom.fg} onChange={fg => setCustom({ fg })} />
                        <ColorField label="Accent (buttons)" value={custom.accent} onChange={accent => setCustom({ accent })} />
                        {lowContrast && (
                            <p className="flex items-start gap-2 text-xs" style={{ color: '#B45309' }}>
                                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                Text may be hard to read on this background. Try a darker text or lighter background.
                            </p>
                        )}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: BRAND.ink }}>Font</h3>
                    <p className="text-xs" style={{ color: BRAND.warm }}>Headings use the first font, everything else the second.</p>
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Font">
                    {FONT_PAIRINGS.map(f => {
                        const active = currentFont === f.id
                        return (
                            <button
                                key={f.id}
                                type="button"
                                role="radio"
                                aria-checked={active}
                                onClick={() => onChange({ fontPairing: f.id })}
                                className="flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-xl px-3 py-2.5 text-left"
                                style={{ border: `2px solid ${active ? BRAND.dark : BRAND.border}`, backgroundColor: '#FFFFFF' }}
                            >
                                <span className="text-xl leading-tight" style={{ fontFamily: `"${f.heading.family}", ${f.heading.fallback}`, color: BRAND.ink }}>{f.name}</span>
                                <span className="truncate text-[11px]" style={{ color: BRAND.warm }}>{f.heading.family}{f.body.family !== f.heading.family ? ` + ${f.body.family}` : ''}</span>
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
