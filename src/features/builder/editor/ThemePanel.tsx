'use client'

import { useState } from 'react'
import { Check, Eraser } from 'lucide-react'
import { buildGoogleFontsUrl } from '@/lib/extractFonts'
import { FONT_PAIRINGS, resolveTheme, templateMeta, TEMPLATES, type SchemeColors } from '@/features/siteBuilder/themes'
import { LOGO_SIZE_DEFAULT, type LogoShape } from '../types'
import { LogoBackgroundDialog } from './LogoBackgroundDialog'
import { ColorInput, MediaInput, Segmented, Slider, TextInput, Toggle } from './controls'
import { useEditor } from './EditorContext'
import { useTheme } from './useSection'

const LOGO_SHAPES: { value: LogoShape; label: string; radius: string }[] = [
    { value: 'original', label: 'Original', radius: '0' },
    { value: 'square', label: 'Square', radius: '0' },
    { value: 'rounded', label: 'Rounded', radius: '30%' },
    { value: 'circle', label: 'Circle', radius: '50%' },
]

const PAIRING_FONTS_URL = buildGoogleFontsUrl(FONT_PAIRINGS.map(f => ({ family: f.heading.family, weights: [f.heading.weights[f.heading.weights.length - 1]] })))

/** The name and logo the whole website shows (menu bar, footer, hero…). Also in the Menu bar and Footer tabs. */
export function NameLogoFields() {
    const { theme, setTheme } = useTheme()
    const { info } = useEditor()
    const [cleaning, setCleaning] = useState(false)
    const siteBg = resolveTheme(theme.templateId, theme.scheme, theme.customColors, theme.fontPairing).bg
    const size = theme.logoSize ?? LOGO_SIZE_DEFAULT
    return (
        <>
            <TextInput label="Name on your website" value={theme.siteName ?? ''} max={60} placeholder={info.businessName}
                onChange={siteName => setTheme({ siteName })} help="Shown in the menu bar, footer and anywhere your name appears. Empty uses your account name; emails and receipts keep your account name." />
            <MediaInput label="Logo" value={theme.logo} onChange={logo => setTheme({ logo })} help="Shown in the menu bar and footer. Without one, your name is shown." />
            {theme.logo && <>
                <Slider label="Logo size" unit="px" value={size} min={20} max={120} step={2} onChange={logoSize => setTheme({ logoSize })}
                    onReset={theme.logoSize !== undefined ? () => setTheme({ logoSize: undefined }) : undefined} help="Height in the menu bar; the footer scales with it. Phones show at most 56px." />
                <Segmented label="Logo shape" value={theme.logoShape ?? 'original'} onChange={logoShape => setTheme({ logoShape })}
                    options={LOGO_SHAPES.map(o => ({ value: o.value, label: <span className="inline-flex items-center gap-1.5"><span aria-hidden className="inline-block h-3 w-3 border border-current" style={{ borderRadius: o.radius }} />{o.label}</span> }))}
                    help={theme.logoShape && theme.logoShape !== 'original' ? 'Square shapes crop the logo to fill them.' : undefined} />
                <button type="button" className="bld-btn" onClick={() => setCleaning(true)}><Eraser size={14} /> Remove background</button>
                {cleaning && <LogoBackgroundDialog logo={theme.logo} siteBg={siteBg} onApply={logo => setTheme({ logo })} onClose={() => setCleaning(false)} />}
            </>}
        </>
    )
}

/** Site-wide look: colors, fonts, logo, corners. Every section follows it unless it sets its own. */
export function ThemePanel() {
    const { theme, setTheme } = useTheme()
    const meta = templateMeta(theme.templateId)
    const scheme = theme.scheme === 'custom' ? null : meta.schemes.find(s => s.id === theme.scheme) ?? meta.schemes[0]
    const custom: SchemeColors = theme.customColors ?? { bg: meta.schemes[0].bg, fg: meta.schemes[0].fg, accent: meta.schemes[0].accent }
    const font = theme.fontPairing || meta.defaultFont

    return (
        <div className="grid gap-5 p-3.5">
            <link rel="stylesheet" href={PAIRING_FONTS_URL} />
            <section className="grid gap-3">
                <h3 className="bld-label">Name and logo</h3>
                <NameLogoFields />
            </section>

            <section className="grid gap-2">
                <h3 className="bld-label">Style</h3>
                <p className="bld-help">Sets the corners, buttons and color choices. Your sections stay as they are.</p>
                <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                        <button key={t.id} type="button" className="bld-card !gap-1" aria-pressed={t.id === theme.templateId}
                            onClick={() => setTheme({ templateId: t.id, scheme: t.schemes[0].id, customColors: null, fontPairing: '', radius: undefined, buttonRadius: undefined, buttonCase: undefined })}>
                            <span className="flex gap-1">{[t.schemes[0].bg, t.schemes[0].fg, t.schemes[0].accent].map(c => <span key={c} className="h-4 w-4 rounded-full" style={{ background: c, border: '1px solid var(--b-line)' }} />)}</span>
                            <span className="bld-card-name">{t.name}</span>
                            <span className="bld-card-sub">{t.tagline}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-2">
                <h3 className="bld-label">Colors</h3>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Color scheme">
                    {meta.schemes.map(s => (
                        <Swatch key={s.id} name={s.name} colors={s} active={scheme?.id === s.id} onClick={() => setTheme({ scheme: s.id })} />
                    ))}
                    <Swatch name="Custom" colors={custom} active={!scheme} onClick={() => setTheme({ scheme: 'custom', customColors: custom })} />
                </div>
                {!scheme && <>
                    <ColorInput label="Background" value={custom.bg} onChange={bg => bg && setTheme({ customColors: { ...custom, bg } })} />
                    <ColorInput label="Text" value={custom.fg} onChange={fg => fg && setTheme({ customColors: { ...custom, fg } })} />
                    <ColorInput label="Accent and buttons" value={custom.accent} onChange={accent => accent && setTheme({ customColors: { ...custom, accent } })} />
                </>}
            </section>

            <section className="grid gap-2">
                <h3 className="bld-label">Fonts</h3>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Fonts">
                    {FONT_PAIRINGS.map(f => (
                        <button key={f.id} type="button" role="radio" aria-checked={f.id === font} className="bld-card !gap-0.5" onClick={() => setTheme({ fontPairing: f.id })}>
                            <span className="truncate text-[17px] leading-tight" style={{ fontFamily: `"${f.heading.family}", serif` }}>{f.name}</span>
                            <span className="bld-card-sub truncate">{f.heading.family} + {f.body.family}</span>
                        </button>
                    ))}
                </div>
            </section>


            <section className="grid gap-3">
                <h3 className="bld-label">Corners and buttons</h3>
                <Slider label="Photo and card corners" unit="px" value={theme.radius ?? meta.radius} min={0} max={32}
                    onChange={radius => setTheme({ radius })} onReset={theme.radius !== undefined ? () => setTheme({ radius: undefined }) : undefined} />
                <Slider label="Button corners" unit="px" value={Math.min(theme.buttonRadius ?? meta.buttonRadius, 40)} min={0} max={40}
                    onChange={buttonRadius => setTheme({ buttonRadius: buttonRadius >= 40 ? 999 : buttonRadius })} onReset={theme.buttonRadius !== undefined ? () => setTheme({ buttonRadius: undefined }) : undefined} />
                <Segmented label="Button text" value={theme.buttonCase ?? meta.buttonCase} onChange={buttonCase => setTheme({ buttonCase })}
                    options={[{ value: 'none', label: 'Book now' }, { value: 'uppercase', label: 'BOOK NOW' }]} />
            </section>

            <Toggle label="Book bar on phones" checked={theme.mobileBookBar !== false} onChange={mobileBookBar => setTheme({ mobileBookBar })}
                help="A Book button that stays at the bottom of the screen on phones." />
            <Toggle label="Booking page matches the site" checked={theme.bookingMatchesSite !== false} onChange={bookingMatchesSite => setTheme({ bookingMatchesSite })}
                help="When you publish, the booking page takes these colors and fonts. Turn off to style it separately under Booking page." />
        </div>
    )
}

function Swatch({ name, colors, active, onClick }: { name: string; colors: SchemeColors; active: boolean; onClick: () => void }) {
    return (
        <button type="button" role="radio" aria-checked={active} onClick={onClick} className="bld-card !flex-row !items-center">
            <span className="relative flex h-7 w-7 flex-none items-center justify-center overflow-hidden rounded-full" style={{ background: colors.bg, border: '1px solid var(--b-line)' }}>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5" style={{ background: colors.accent }} />
                <span className="relative h-2 w-2 rounded-full" style={{ background: colors.fg }} />
            </span>
            <span className="bld-card-name min-w-0 flex-1">{name}</span>
            {active && <Check size={14} style={{ color: 'var(--b-coral)' }} />}
        </button>
    )
}
