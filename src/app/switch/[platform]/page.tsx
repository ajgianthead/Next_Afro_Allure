import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchUser } from 'app/dashboard/(other)/actions'
import SwitchPage from '../SwitchPage'
import { PLATFORMS, type PlatformSlug } from '../platforms'

type Params = Promise<{ platform: string }>

const isPlatform = (s: string): s is PlatformSlug => s in PLATFORMS

export function generateStaticParams() {
    return Object.keys(PLATFORMS).map(platform => ({ platform }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { platform } = await params
    if (!isPlatform(platform)) return {}
    const p = PLATFORMS[platform]
    return { title: p.metaTitle, description: p.metaDescription }
}

export default async function Page({ params }: { params: Params }) {
    const { platform } = await params
    if (!isPlatform(platform)) notFound()
    const user = await fetchUser()
    return <SwitchPage slug={platform} isLoggedIn={!!user} />
}
