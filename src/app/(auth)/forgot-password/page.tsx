import ForgotPassword from './forgotPasswordClient'

export const metadata = {
    title: 'Reset your password | AfroAllure',
}

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const { error } = await searchParams
    return <ForgotPassword linkExpired={error === 'link_expired'} />
}
