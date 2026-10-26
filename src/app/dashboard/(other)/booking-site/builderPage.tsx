import { redirect } from 'next/navigation'
import { effectivePlanType } from '@/lib/beta'
import { createClient } from '@/app/utils/supabase/server'
import { fetchBusinessUser, fetchUser } from '../actions'
import { SiteBuilder, type SiteMode } from '@/features/siteBuilder/components/SiteBuilder'
import { loadSiteInfo } from '@/features/siteBuilder/server/loadSite'
import { defaultSiteData, parseSiteData } from '@/features/siteBuilder/siteData'
import type { BookingTheme } from '@/features/automatedBooking/types/theme'

/**
 * The Simple Builder, shared by /dashboard/booking-site (Website) and
 * /dashboard/booking-page (Booking page) so each has its own sidebar entry.
 */
export async function BuilderPage({ section }: { section: 'website' | 'booking' }) {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const businessUser: any = await fetchBusinessUser(user.id)
    if (!businessUser) redirect('/dashboard')

    const supabase = await createClient()
    const [{ data: editor }, info] = await Promise.all([
        supabase.from('web_editors').select('type, site_data, theme_data').eq('business_id', businessUser.business_id).maybeSingle(),
        loadSiteInfo(businessUser.business_id),
    ])
    if (!info) redirect('/dashboard')

    // A site exists once a template was chosen; a row with only a booking-page
    // look (styled before making a website) still starts at the template gallery.
    const hasSite = !!editor?.site_data && typeof (editor.site_data as Record<string, unknown>).templateId === 'string'
    const mode: SiteMode = !editor ? 'new'
        : editor.type === 'TEMPLATE' ? (hasSite ? 'template' : 'new')
            : editor.type === 'CUSTOM' ? 'custom'
                : 'sections'
    // Settings saved earlier are kept when a site moved to the Custom Builder, so switching back restores them.
    const initialSite = editor?.site_data ? { ...defaultSiteData(), ...parseSiteData(editor.site_data), ...(hasSite ? {} : { templateId: defaultSiteData().templateId }) } : defaultSiteData()

    return (
        <SiteBuilder
            info={info}
            initialSite={initialSite}
            mode={mode}
            initialSection={section}
            bookingTheme={(editor?.theme_data as BookingTheme | null) ?? null}
            businessId={businessUser.business_id}
            urlName={businessUser.url_name}
            published={!!businessUser.published_site}
            planType={effectivePlanType(businessUser.plan_type)}
            gatable={{ hadTrial: businessUser.had_trial, stripeCustomerId: businessUser.stripe_customer_id, businessId: businessUser.business_id }}
        />
    )
}
