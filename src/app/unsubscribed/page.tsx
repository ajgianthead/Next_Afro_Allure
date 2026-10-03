const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

export const metadata = {
    title: 'Unsubscribed | AfroAllure',
}

export default function UnsubscribedPage() {
    return (
        <main className="bg-white min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md text-center">
                <h1 style={{ fontFamily: SERIF }} className="text-3xl text-[#1A1818] mb-3">
                    You&rsquo;ve been unsubscribed
                </h1>
                <p className="text-[15px] leading-relaxed text-[#6F6863]">
                    You&rsquo;ll still receive transactional emails about your account, such as booking confirmations and
                    billing notices.
                </p>
            </div>
        </main>
    )
}
