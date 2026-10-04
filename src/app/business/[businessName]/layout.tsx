import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { bookingUrl } from '@/lib/bookingUrl'

/**
 * Keeps links shared before a business's URL name changed working: if no
 * business has this url_name but one lists it in legacy_url_names (filled by
 * the subdomain-slug migration and by URL edits), send visitors there.
 */
export default async function BusinessLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ businessName: string }>
}) {
    const { businessName } = await params
    const name = decodeURIComponent(businessName)
    const supabase = await createClient()

    const { data: current } = await supabase
        .from('business_users')
        .select('business_id')
        .eq('url_name', name)
        .limit(1)
    if (!current || current.length === 0) {
        const { data: renamed } = await supabase
            .from('business_users')
            .select('url_name')
            .contains('legacy_url_names', [name.toLowerCase()])
            .limit(1)
        if (renamed && renamed[0]?.url_name) redirect(bookingUrl(renamed[0].url_name))
    }

    return <>{children}</>
}
