import SupportForm from './SupportForm'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const metadata = {
    title: 'Support | AfroAllure',
}

export default function SupportPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-2xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-3">Get Support</h1>
                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    Stuck on something? Tell us what&rsquo;s going on and we&rsquo;ll get back to you.
                </p>
                <SupportForm />
            </div>
        </main>
    )
}
