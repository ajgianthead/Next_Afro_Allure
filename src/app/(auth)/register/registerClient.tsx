'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Check } from 'lucide-react'
import { createBusinessUser } from '../actions'
import { createSubscriptionCheckout } from 'app/for-businesses/actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function AgreementCheckbox({
    id,
    checked,
    onChange,
    disabled,
    children,
}: {
    id: string
    checked: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
    children: React.ReactNode
}) {
    return (
        <label
            htmlFor={id}
            className="flex items-start gap-3 cursor-pointer select-none"
            style={{ opacity: disabled ? 0.5 : 1 }}
        >
            <button
                id={id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className="shrink-0 flex items-center justify-center rounded-md transition-colors mt-0.5"
                style={{
                    width: 18,
                    height: 18,
                    border: checked ? 'none' : '1.5px solid #C9974A',
                    backgroundColor: checked ? '#C9974A' : 'transparent',
                }}
            >
                {checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
            </button>
            <span className="text-xs leading-relaxed" style={{ color: '#6F6863' }}>
                {children}
            </span>
        </label>
    )
}

export default function Register() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const subscription = searchParams.get('subscription')

    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [agreement, setAgreement] = useState({ terms: false, privacy: false })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const canSubmit =
        formData.name.trim().length > 0 &&
        formData.email.trim().length > 0 &&
        formData.password.length >= 6 &&
        agreement.terms &&
        agreement.privacy

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSubmit || loading) return
        setLoading(true)
        setError(null)
        try {
            const result = await createBusinessUser(formData.email, formData.name, formData.password)
            if (result instanceof Error) {
                setError(result.message)
                setLoading(false)
                return
            }
            if (subscription) {
                const sessionUrl = (await createSubscriptionCheckout(result.hadTrial, result.id, result.stripeCustomerId)).url!
                router.replace(sessionUrl)
                return
            }
            router.replace(`/onboarding/${result.stripeAccountId}`)
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <main
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ backgroundColor: '#FAF7F2' }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <p style={{ fontFamily: SERIF, fontSize: 26, color: '#0F0E0E', letterSpacing: '-0.01em' }}>
                        AfroAllure
                    </p>
                    <p className="mt-1 text-sm" style={{ color: '#6F6863' }}>
                        Register your business
                    </p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-8"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E2D6' }}
                >
                    <h1 style={{ fontFamily: SERIF, fontSize: 22, color: '#1A1818', marginBottom: 24 }}>
                        Create your account
                    </h1>

                    {error && (
                        <div
                            className="flex items-center gap-2 text-sm rounded-xl px-3.5 py-3 mb-5"
                            style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}
                        >
                            <AlertCircle size={14} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Business Name */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="name"
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: '#6F6863' }}
                            >
                                Business Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                autoComplete="organization"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                style={{
                                    border: '1px solid #E8E2D6',
                                    backgroundColor: '#FDFCFA',
                                    color: '#1A1818',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: '#6F6863' }}
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                style={{
                                    border: '1px solid #E8E2D6',
                                    backgroundColor: '#FDFCFA',
                                    color: '#1A1818',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="password"
                                className="text-xs font-semibold uppercase tracking-widest"
                                style={{ color: '#6F6863' }}
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors disabled:opacity-50"
                                style={{
                                    border: '1px solid #E8E2D6',
                                    backgroundColor: '#FDFCFA',
                                    color: '#1A1818',
                                }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#FC6161')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E8E2D6')}
                            />
                            {formData.password.length > 0 && formData.password.length < 6 && (
                                <p className="text-xs" style={{ color: '#C9974A' }}>
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        {/* Agreements */}
                        <div
                            className="flex flex-col gap-3 pt-2 pb-1"
                            style={{ borderTop: '1px solid #F0EBE3' }}
                        >
                            <AgreementCheckbox
                                id="terms"
                                checked={agreement.terms}
                                onChange={v => setAgreement({ ...agreement, terms: v })}
                                disabled={loading}
                            >
                                I agree to the{' '}
                                <Link href="/beta-user-agreement" target="_blank" className="font-semibold hover:opacity-70" style={{ color: '#FC6161' }}>
                                    Beta Participation Agreement
                                </Link>{' '}
                                and{' '}
                                <Link href="/terms-of-service" target="_blank" className="font-semibold hover:opacity-70" style={{ color: '#FC6161' }}>
                                    Terms of Service
                                </Link>.
                            </AgreementCheckbox>

                            <AgreementCheckbox
                                id="privacy"
                                checked={agreement.privacy}
                                onChange={v => setAgreement({ ...agreement, privacy: v })}
                                disabled={loading}
                            >
                                I have read the{' '}
                                <Link href="/privacy-policy" target="_blank" className="font-semibold hover:opacity-70" style={{ color: '#FC6161' }}>
                                    Privacy Policy
                                </Link>{' '}
                                and understand how my data will be used.
                            </AgreementCheckbox>
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit || loading}
                            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: '#FC6161', color: '#FFFFFF', marginTop: 4 }}
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm mt-5" style={{ color: '#6F6863' }}>
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="font-medium transition-opacity hover:opacity-70"
                        style={{ color: '#FC6161' }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    )
}
