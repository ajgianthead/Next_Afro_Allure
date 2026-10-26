'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { buildGoogleFontsUrl } from '@/lib/extractFonts'
import { BRAND } from '@/features/welcomeSetup/components/shared'
import { DEFAULT_BOOKING_THEME, type BookingTheme } from '@/features/automatedBooking/types/theme'
import type { SiteData } from '../siteData'
import { BOOKING_FONTS, BOOKING_RADII, bookingThemeFromChoice, isHexColor, resolveTheme, siteFontWeights, toBookingTheme, type BookingThemeChoice } from '../themes'
import { saveBookingThemeAction } from '../server/actions'

const COLOR_FIELDS: { key: keyof BookingThemeChoice; label: string }[] = [
    { key: 'primaryColor', label: 'Buttons' },
    { key: 'backgroundColor', label: 'Background' },
    { key: 'cardColor', label: 'Cards' },
    { key: 'textColor', label: 'Text' },
    { key: 'accentColor', label: 'Accent' },
]

const choiceFrom = (t: BookingTheme): BookingThemeChoice => ({
    primaryColor: t.primaryColor,
    backgroundColor: t.backgroundColor,
    cardColor: t.cardColor,
    textColor: t.textColor,
    accentColor: t.accentColor,
    fontFamily: t.fontFamily,
    bodyFontFamily: t.bodyFontFamily,
    buttonRadius: t.buttonRadius,
})

/** A small picture of the booking page in these colors. */
function BookingPreview({ theme }: { theme: BookingTheme }) {
    const fonts = [theme.fontFamily, theme.bodyFontFamily].filter((f, i, a) => a.indexOf(f) === i)
    const href = buildGoogleFontsUrl(fonts.map(f => ({ family: f, weights: siteFontWeights(f) ?? [400, 600] })))
    return (
        <div className="overflow-hidden p-4" style={{ backgroundColor: theme.backgroundColor, borderRadius: 16, border: `1px solid ${BRAND.border}`, fontFamily: `"${theme.bodyFontFamily}", system-ui, sans-serif`, color: theme.textColor }} aria-hidden>
            <link rel="stylesheet" href={href} precedence="default" />
            <div className="mb-3 flex items-center gap-2 text-[11px]" style={{ color: theme.mutedColor }}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: theme.primaryColor, color: theme.primaryTextColor }}>1</span>
                Service
                <span className="h-px flex-1" style={{ backgroundColor: theme.borderColor }} />
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]" style={{ border: `1px solid ${theme.borderColor}` }}>2</span>
                Time
            </div>
            <p className="mb-2 text-lg font-semibold" style={{ fontFamily: `"${theme.fontFamily}", Georgia, serif` }}>Select Service</p>
            <div className="mb-3 flex items-center justify-between p-3 text-sm" style={{ backgroundColor: theme.cardColor, border: `2px solid ${theme.primaryColor}`, borderRadius: theme.cardRadius }}>
                <span className="font-medium">Knotless braids</span>
                <span className="font-bold" style={{ color: theme.primaryColor }}>$180</span>
            </div>
            <div className="mb-3 px-3 py-2 text-xs" style={{ backgroundColor: theme.cardColor, border: `1px solid ${theme.borderColor}`, borderRadius: theme.inputRadius, color: theme.mutedColor }}>Your name</div>
            <div className="flex justify-end">
                <span className="px-5 py-2 text-sm font-medium" style={{ backgroundColor: theme.primaryColor, color: theme.primaryTextColor, borderRadius: theme.buttonRadius }}>Next</span>
            </div>
        </div>
    )
}

export function BookingThemePanel({ site, canMatchSite, initialTheme, onSaved }: {
    /** The website's current settings, for "match my website". */
    site: SiteData
    /** True once the business has a template website to match. */
    canMatchSite: boolean
    initialTheme: BookingTheme | null
    onSaved: (result: { theme: BookingTheme; matchesSite: boolean }) => void
}) {
    const saved = useMemo(() => ({ ...DEFAULT_BOOKING_THEME, ...(initialTheme ?? {}) }), [initialTheme])
    const [match, setMatch] = useState(canMatchSite && site.bookingMatchesSite)
    const [choice, setChoice] = useState<BookingThemeChoice>(() => choiceFrom(saved))
    const [saving, setSaving] = useState(false)

    const siteTheme = toBookingTheme(resolveTheme(site.templateId, site.scheme, site.customColors, site.fontPairing))
    const preview = match ? siteTheme : bookingThemeFromChoice(choice, saved)
    const set = (patch: Partial<BookingThemeChoice>) => setChoice(prev => ({ ...prev, ...patch }))

    const save = async () => {
        setSaving(true)
        const res = await saveBookingThemeAction(match ? { matchSite: true } : { matchSite: false, choice })
        setSaving(false)
        if (!res.ok) return toast.error(res.error)
        if (!res.data.matchesSite) setChoice(choiceFrom(res.data.theme))
        onSaved(res.data)
        toast.success('Booking page saved')
    }

    return (
        <div className="flex flex-col gap-5">
            <p className="text-xs leading-relaxed" style={{ color: BRAND.warm }}>
                How your booking page looks, where clients pick a service and time. Your services, hours and policies always come from your account.
            </p>

            {canMatchSite && (
                <div className="flex flex-col gap-2" role="radiogroup" aria-label="Booking page style">
                    {([[true, 'Match my website', 'Same colors and fonts as your site, kept in sync.'], [false, 'Style it myself', 'Pick colors, fonts and button shape just for booking.']] as const).map(([value, title, body]) => (
                        <button
                            key={String(value)}
                            type="button"
                            role="radio"
                            aria-checked={match === value}
                            onClick={() => setMatch(value)}
                            className="flex items-start gap-3 rounded-xl p-3 text-left"
                            style={{ border: `2px solid ${match === value ? BRAND.dark : BRAND.border}` }}
                        >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ border: `2px solid ${match === value ? BRAND.dark : BRAND.border}`, backgroundColor: match === value ? BRAND.dark : 'transparent' }}>
                                {match === value && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                            </span>
                            <span>
                                <span className="block text-sm font-semibold" style={{ color: BRAND.ink }}>{title}</span>
                                <span className="block text-xs" style={{ color: BRAND.warm }}>{body}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <BookingPreview theme={preview} />

            {!match && (
                <>
                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold" style={{ color: BRAND.ink }}>Colors</h3>
                        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                            {COLOR_FIELDS.map(({ key, label }) => (
                                <label key={key} className="flex min-h-12 items-center gap-3 rounded-xl px-3" style={{ border: `1px solid ${BRAND.border}` }}>
                                    <input
                                        type="color"
                                        value={isHexColor(choice[key]) && choice[key].length === 7 ? choice[key] : '#000000'}
                                        onChange={e => set({ [key]: e.target.value })}
                                        className="h-8 w-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full"
                                        aria-label={label}
                                    />
                                    <span className="flex-1 text-sm" style={{ color: BRAND.ink }}>{label}</span>
                                    <input
                                        value={choice[key]}
                                        maxLength={7}
                                        onChange={e => {
                                            const v = e.target.value.trim()
                                            if (/^#?[0-9a-f]{0,6}$/i.test(v)) set({ [key]: v.startsWith('#') ? v : `#${v}` })
                                        }}
                                        className="w-20 bg-transparent text-right font-mono text-base uppercase outline-none sm:text-xs"
                                        style={{ color: BRAND.warm }}
                                        aria-label={`${label} hex code`}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                        {([['fontFamily', 'Heading font'], ['bodyFontFamily', 'Text font']] as const).map(([key, label]) => (
                            <label key={key} className="flex flex-col gap-1">
                                <span className="text-xs font-medium" style={{ color: BRAND.warm }}>{label}</span>
                                <select
                                    value={choice[key]}
                                    onChange={e => set({ [key]: e.target.value })}
                                    className="h-11 rounded-xl px-2 text-base outline-none sm:text-sm"
                                    style={{ border: `1px solid ${BRAND.border}`, backgroundColor: '#FAFAFA', color: BRAND.ink }}
                                >
                                    {!BOOKING_FONTS.includes(choice[key]) && <option value={choice[key]}>{choice[key]}</option>}
                                    {BOOKING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </label>
                        ))}
                    </section>

                    <section className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold" style={{ color: BRAND.ink }}>Button shape</h3>
                        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Button shape">
                            {BOOKING_RADII.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={choice.buttonRadius === r.value}
                                    onClick={() => set({ buttonRadius: r.value })}
                                    className="flex h-12 items-center justify-center text-sm font-medium"
                                    style={{ borderRadius: r.value === '9999px' ? 999 : r.value, border: `2px solid ${choice.buttonRadius === r.value ? BRAND.dark : BRAND.border}`, color: BRAND.ink }}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </section>
                </>
            )}

            <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save booking page
            </button>
        </div>
    )
}
