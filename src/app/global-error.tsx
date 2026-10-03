'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: 'Inter, Arial, sans-serif', backgroundColor: '#FFFFFF' }}>
                <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                    <div style={{ maxWidth: 420, textAlign: 'center' }}>
                        <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A09790', marginBottom: 12 }}>
                            Something went wrong
                        </p>
                        <h1 style={{ fontFamily: '"Fraunces", "Times New Roman", serif', fontSize: 32, color: '#1A1818', marginBottom: 12 }}>
                            We hit a snag
                        </h1>
                        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#6F6863', marginBottom: 32 }}>
                            Something unexpected happened. Try reloading the page.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 500,
                                backgroundColor: '#FC6161', color: '#FFFFFF', border: 'none', cursor: 'pointer',
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </main>
            </body>
        </html>
    )
}
