import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchUser } from 'app/dashboard/(other)/actions'
import { MarketingPage } from '@/features/marketing/components/MarketingPage'
import { ALL_SPECIALTIES as SPECIALTIES, type AnySpecialtySlug as SpecialtySlug } from '@/features/marketing/specialties'

type Params = Promise<{ specialty: string }>

const isSpecialty = (s: string): s is SpecialtySlug => s in SPECIALTIES

export function generateStaticParams() {
    return Object.keys(SPECIALTIES).map(specialty => ({ specialty }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { specialty } = await params
    if (!isSpecialty(specialty)) return {}
    const c = SPECIALTIES[specialty]
    return {
        title: c.metaTitle,
        description: c.metaDescription,
        alternates: { canonical: `/for/${specialty}` },
        openGraph: { title: c.metaTitle, description: c.metaDescription, url: `/for/${specialty}` },
    }
}

export default async function Page({ params }: { params: Params }) {
    const { specialty } = await params
    if (!isSpecialty(specialty)) notFound()
    const user = await fetchUser()
    return <MarketingPage content={SPECIALTIES[specialty]} isLoggedIn={!!user} />
}
