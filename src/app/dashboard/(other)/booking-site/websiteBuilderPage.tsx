import { redirect } from 'next/navigation'
import { effectivePlanType } from '@/lib/beta'
import { bookingUrl } from '@/lib/bookingUrl'
import { BuilderEditor } from '@/features/builder/editor/BuilderEditor'
import { loadBuilderEditor } from '@/features/builder/server/loadEditor'
import { loadBuilderExtras } from '@/features/builder/server/loadExtras'
import { fetchBusinessUser, fetchUser } from '../actions'

/** The website builder (Website in the sidebar). */
export async function WebsiteBuilderPage() {
    const user = await fetchUser()
    if (!user) redirect('/login')
    const businessUser: any = await fetchBusinessUser(user.id)
    if (!businessUser) redirect('/dashboard')

    const loaded = await loadBuilderEditor(businessUser.business_id)
    if (!loaded) redirect('/dashboard')
    const extras = await loadBuilderExtras(businessUser.business_id, loaded.info, '')
    const plan = effectivePlanType(businessUser.plan_type) === 'GROWTH' ? 'GROWTH' : 'STARTER'

    return (
        <BuilderEditor
            page={loaded.page}
            site={loaded.site}
            metadata={{ info: loaded.info, basePath: '', planType: plan, businessId: businessUser.business_id, ...extras }}
            info={loaded.info}
            businessId={businessUser.business_id}
            plan={plan}
            siteUrl={bookingUrl(businessUser.url_name)}
            publishedAt={loaded.publishedAt}
        />
    )
}
