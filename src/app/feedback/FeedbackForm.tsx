'use client'

import { useState } from 'react'
import { submitFeedback } from './actions'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

const TYPES = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'general', label: 'General Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'praise', label: 'Praise' },
]

export default function FeedbackForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const result = await submitFeedback(formData)
        setLoading(false)
        if (result && 'error' in result) {
            setError(result.error)
            return
        }
        setSubmitted(true)
    }

    if (submitted) {
        return (
            <p className="text-[15px] leading-relaxed text-[#3A3634]" role="status">
                Thanks for your feedback — we read every submission.
            </p>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            {error && (
                <div role="alert" className="text-sm rounded-lg px-3.5 py-3" style={{ backgroundColor: 'rgba(252,97,97,0.08)', color: '#DC2626' }}>
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label htmlFor="fb-type" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Type
                </label>
                <select
                    id="fb-type"
                    name="type"
                    defaultValue="general"
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                >
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="fb-message" className="text-xs font-semibold uppercase tracking-widest text-[#6F6863]">
                    Message
                </label>
                <textarea
                    id="fb-message"
                    name="message"
                    required
                    rows={5}
                    disabled={loading}
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                    style={{ border: '1px solid #E8E2D6', backgroundColor: '#FDFCFA', color: '#1A1818' }}
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
            >
                {loading ? 'Sending…' : 'Submit Feedback'}
            </button>
        </form>
    )
}
