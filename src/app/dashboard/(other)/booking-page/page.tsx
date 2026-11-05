import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { bookingUrl } from '@/lib/bookingUrl'
import type { BookingTheme } from '@/features/automatedBooking/types/theme'
import { BookingPageScreen } from '@/features/siteBuilder/components/BookingPageScreen'
import { defaultSiteData, parseSiteData, type SiteData } from '@/features/siteBuilder/siteData'
import { TEMPLATE_IDS, type TemplateId } from '@/features/siteBuilder/themes'
import { fetchBusinessUser, fetchUser } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Booking Page | AfroAllure',
}

export default async function Page() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const businessUser: any = await fetchBusinessUser(user.id)
    if (!businessUser) redirect('/dashboard')

    const supabase = await createClient()
    const { data } = await supabase.from('web_editors').select('type, site_data, theme_data, builder_data' as '*').eq('business_id', businessUser.business_id).maybeSingle()
    const row = data as unknown as { type: string; site_data: any; theme_data: BookingTheme | null; builder_data: any } | null

    // The website's look, whichever builder made it.
    let site: SiteData = { ...defaultSiteData(), bookingMatchesSite: false }
    let canMatchSite = false
    const props = row?.type === 'BUILDER' ? row.builder_data?.root?.props : null
    if (props && TEMPLATE_IDS.includes(props.templateId)) {
        site = { ...defaultSiteData(props.templateId as TemplateId), scheme: props.scheme ?? '', customColors: props.customColors ?? null, fontPairing: props.fontPairing ?? '', bookingMatchesSite: props.bookingMatchesSite !== false }
        canMatchSite = true
    } else if (row?.type === 'TEMPLATE' && typeof row.site_data?.templateId === 'string') {
        site = parseSiteData(row.site_data)
        canMatchSite = true
    }

    return <BookingPageScreen site={site} canMatchSite={canMatchSite} bookingTheme={row?.theme_data ?? null} bookLink={bookingUrl(businessUser.url_name, '/book')} />
}
