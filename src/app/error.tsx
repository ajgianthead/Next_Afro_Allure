'use client'

import { useEffect } from 'react'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className="bg-white min-h-screen flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-md text-center">
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Something went wrong</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-3">
                    We hit a snag
                </h1>
                <p className="text-[15px] leading-relaxed text-[#6F6863] mb-8">
                    Something unexpected happened on our end. Try again, and if it keeps happening,{' '}
                    <a href="/support" className="underline text-[#0F0E0E]">let us know</a>.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="rounded-xl px-5 py-2.5 text-sm font-medium"
                        style={{ border: '1px solid #E8E2D6', color: '#1A1818' }}
                    >
                        Back to home
                    </a>
                </div>
            </div>
        </main>
    )
}
