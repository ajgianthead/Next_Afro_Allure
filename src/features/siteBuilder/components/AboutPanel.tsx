'use client'

import Link from 'next/link'
import { BRAND, INPUT_CLASS, inputStyle } from '@/features/welcomeSetup/components/shared'
import { LIMITS, type SiteContent, type SiteData, type SiteInfo } from '../siteData'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="flex items-baseline justify-between gap-2 text-xs font-medium" style={{ color: BRAND.warm }}>
                {label}
                {hint && <span className="text-[11px] font-normal">{hint}</span>}
            </span>
            {children}
        </label>
    )
}

export function AboutPanel({ site, info, onChange }: { site: SiteData; info: SiteInfo; onChange: (content: Partial<SiteContent>) => void }) {
    const c = site.content
    const text = (key: keyof SiteContent, max: number, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <input
            {...props}
            value={c[key]}
            maxLength={max}
            onChange={e => onChange({ [key]: e.target.value })}
            className={INPUT_CLASS}
            style={inputStyle()}
        />
    )
    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
                <Field label="Headline" hint={`${c.tagline.length}/${LIMITS.tagline}`}>
                    {text('tagline', LIMITS.tagline, { placeholder: info.businessName })}
                </Field>
                <Field label="About you" hint={`${c.bio.length}/${LIMITS.bio}`}>
                    <textarea
                        value={c.bio}
                        maxLength={LIMITS.bio}
                        rows={5}
                        placeholder={info.fallbackBio}
                        onChange={e => onChange({ bio: e.target.value })}
                        className="w-full resize-y rounded-xl px-3 py-2 text-base outline-none sm:text-sm"
                        style={inputStyle()}
                    />
                </Field>
                {!c.bio && <p className="text-[11px]" style={{ color: BRAND.warm }}>Leave it empty and your site uses the sentence shown above.</p>}
            </section>

            <section className="flex flex-col gap-3">
                <div>
                    <h3 className="text-sm font-semibold" style={{ color: BRAND.ink }}>Contact & socials</h3>
                    <p className="text-xs" style={{ color: BRAND.warm }}>All optional. Your login email is never shown.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Instagram">{text('instagram', 100, { placeholder: '@yourhandle', autoCapitalize: 'none', autoCorrect: 'off' })}</Field>
                    <Field label="TikTok">{text('tiktok', 100, { placeholder: '@yourhandle', autoCapitalize: 'none', autoCorrect: 'off' })}</Field>
                    <Field label="Public phone">{text('phone', LIMITS.phone, { type: 'tel', inputMode: 'tel', placeholder: '(555) 123-4567' })}</Field>
                    <Field label="Public email">{text('email', LIMITS.email, { type: 'email', inputMode: 'email', placeholder: 'hello@yourstudio.com', autoCapitalize: 'none' })}</Field>
                </div>
            </section>

            <section className="rounded-xl p-4 text-xs leading-relaxed" style={{ backgroundColor: BRAND.cream, border: `1px solid ${BRAND.border}`, color: BRAND.warm }}>
                <p className="mb-1.5 font-semibold" style={{ color: BRAND.ink }}>Filled in for you</p>
                Your <Link href="/dashboard/services" className="underline">services</Link>,{' '}
                <Link href="/dashboard/availability" className="underline">hours</Link>,{' '}
                <Link href="/dashboard/booking-settings" className="underline">policies</Link> and reviews show on your site automatically
                and stay up to date. Only your city is shown; your full address goes out with each booking confirmation.
            </section>
        </div>
    )
}
