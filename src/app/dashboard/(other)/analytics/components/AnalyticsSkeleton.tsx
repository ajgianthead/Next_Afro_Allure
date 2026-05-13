export function AnalyticsSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            {/* Section 1 — Revenue Overview */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                <div className="h-4 w-36 rounded mb-4" style={{ backgroundColor: '#E8E2D6' }} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div className="col-span-2 lg:col-span-1 h-24 rounded-xl" style={{ backgroundColor: '#0F0E0E', opacity: 0.15 }} />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                    ))}
                </div>
                <div className="h-52 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
            </div>

            {/* Section 2 — Booking Performance */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                <div className="h-4 w-44 rounded mb-4" style={{ backgroundColor: '#E8E2D6' }} />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-40 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                    <div className="flex-1 h-40 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                </div>
            </div>

            {/* Section 3 — Service Analytics */}
            <div className="rounded-2xl p-5" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                <div className="h-4 w-40 rounded mb-4" style={{ backgroundColor: '#E8E2D6' }} />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 rounded-xl mb-2" style={{ backgroundColor: '#E8E2D6' }} />
                ))}
            </div>

            {/* Section 4 + 5 stacked */}
            {[1, 2].map(i => (
                <div key={i} className="rounded-2xl p-5" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                    <div className="h-4 w-32 rounded mb-4" style={{ backgroundColor: '#E8E2D6' }} />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(j => (
                            <div key={j} className="h-20 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                        ))}
                    </div>
                </div>
            ))}

            {/* Section 6 + 7 */}
            {[1, 2].map(i => (
                <div key={i} className="rounded-2xl p-5" style={{ border: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                    <div className="h-4 w-36 rounded mb-4" style={{ backgroundColor: '#E8E2D6' }} />
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 h-32 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                        <div className="flex-1 h-32 rounded-xl" style={{ backgroundColor: '#E8E2D6' }} />
                    </div>
                </div>
            ))}
        </div>
    )
}
