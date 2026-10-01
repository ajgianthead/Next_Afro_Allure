import Link from 'next/link'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const metadata = {
    title: 'Page Not Found | AfroAllure',
}

export default function NotFound() {
    return (
        <main className="bg-white min-h-screen flex items-center justify-center px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="max-w-md text-center">
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">404</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-3">
                    We couldn&rsquo;t find that page
                </h1>
                <p className="text-[15px] leading-relaxed text-[#6F6863] mb-8">
                    The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
                </p>
                <Link
                    href="/"
                    className="inline-block rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#FC6161', color: '#FFFFFF' }}
                >
                    Back to home
                </Link>
            </div>
        </main>
    )
}
