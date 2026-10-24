import { redirect } from 'next/navigation'
import { effectivePlanType } from '@/lib/beta'
import { createClient } from '@/app/utils/supabase/server'
import { fetchBusinessUser, fetchUser } from '../actions'
import { SiteBuilder, type SiteMode } from '@/features/siteBuilder/components/SiteBuilder'
import { loadSiteInfo } from '@/features/siteBuilder/server/loadSite'
import { defaultSiteData, parseSiteData } from '@/features/siteBuilder/siteData'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Booking Site | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const businessUser: any = await fetchBusinessUser(user.id)
    if (!businessUser) redirect('/dashboard')

    const supabase = await createClient()
    const [{ data: editor }, info] = await Promise.all([
        supabase.from('web_editors').select('type, site_data').eq('business_id', businessUser.business_id).maybeSingle(),
        loadSiteInfo(businessUser.business_id),
    ])
    if (!info) redirect('/dashboard')

    const mode: SiteMode = !editor ? 'new'
        : editor.type === 'TEMPLATE' ? 'template'
            : editor.type === 'CUSTOM' ? 'custom'
                : 'sections'
    // Settings saved earlier are kept when a site moved to the Custom Builder, so switching back restores them.
    const hasSettings = !!editor?.site_data && Object.keys(editor.site_data as object).length > 0
    const initialSite = hasSettings ? parseSiteData(editor!.site_data) : defaultSiteData()

    return (
        <SiteBuilder
            info={info}
            initialSite={initialSite}
            mode={mode}
            businessId={businessUser.business_id}
            urlName={businessUser.url_name}
            published={!!businessUser.published_site}
            planType={effectivePlanType(businessUser.plan_type)}
            gatable={{ hadTrial: businessUser.had_trial, stripeCustomerId: businessUser.stripe_customer_id, businessId: businessUser.business_id }}
        />
    )
}
