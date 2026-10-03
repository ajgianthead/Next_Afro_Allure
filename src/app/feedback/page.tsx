import FeedbackForm from './FeedbackForm'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const metadata = {
    title: 'Feedback | AfroAllure',
}

export default function FeedbackPage() {
    return (
        <main className="bg-white min-h-screen">
            <div className="max-w-2xl mx-auto px-6 py-16" style={{ fontFamily: 'Inter, sans-serif' }}>
                <h1 style={{ fontFamily: SERIF }} className="text-4xl text-[#1A1818] mb-3">Share Your Feedback</h1>
                <p className="text-[15px] leading-relaxed text-[#3A3634]">
                    Bug, feature idea, general thought, complaint, or praise — whatever it is, we want to hear it.
                </p>
                <FeedbackForm />
            </div>
        </main>
    )
}
