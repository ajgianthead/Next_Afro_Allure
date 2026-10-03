import { Loader2 } from 'lucide-react'

// Covers every nested dashboard route (appointments, clients, services,
// analytics, etc.) via Next's loading.tsx Suspense inheritance — every one
// of these pages is `force-dynamic` with inline data fetching, so without
// this every navigation showed a dead, blank pause with zero feedback.
export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center w-full py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
    )
}
