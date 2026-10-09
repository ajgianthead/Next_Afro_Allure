import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { fetchUser } from 'app/dashboard/(other)/actions'
import { MarketingPage } from '@/features/marketing/components/MarketingPage'
import { FEATURE_REDIRECTS, FEATURES, type FeatureSlug } from '@/features/marketing/features'

type Params = Promise<{ feature: string }>

const isFeature = (s: string): s is FeatureSlug => s in FEATURES

export function generateStaticParams() {
    return Object.keys(FEATURES).map(feature => ({ feature }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { feature } = await params
    if (!isFeature(feature)) return {}
    const c = FEATURES[feature]
    return {
        title: c.metaTitle,
        description: c.metaDescription,
        alternates: { canonical: `/features/${feature}` },
        openGraph: { title: c.metaTitle, description: c.metaDescription, url: `/features/${feature}` },
    }
}

export default async function Page({ params }: { params: Params }) {
    const { feature } = await params
    // Renamed pages keep their old links working.
    if (FEATURE_REDIRECTS[feature]) permanentRedirect(`/features/${FEATURE_REDIRECTS[feature]}`)
    if (!isFeature(feature)) notFound()
    const user = await fetchUser()
    return <MarketingPage content={FEATURES[feature]} isLoggedIn={!!user} />
}
