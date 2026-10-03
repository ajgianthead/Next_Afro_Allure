import DataDeletionClient from './dataDeletionClient'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const metadata = {
    title: 'Request Data Deletion | AfroAllure',
}

export default function DataDeletionPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <p className="text-xs uppercase tracking-widest text-[#A09790] mb-3">Legal</p>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-4">Request Data Deletion</h1>
                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    Tell us who you are and we&rsquo;ll delete your personal information from AfroAllure, subject to what we&rsquo;re
                    legally required to retain (such as records needed for tax or dispute purposes).
                </p>
                <DataDeletionClient />
            </div>
        </main>
    )
}
