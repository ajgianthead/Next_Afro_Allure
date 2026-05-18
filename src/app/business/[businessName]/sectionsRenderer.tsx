import { Fraunces } from 'next/font/google'
import Image from 'next/image'
import { formatDuration, formatPrice } from '@/features/services/utils'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' })

const COL: React.CSSProperties = { display: 'flex', flexDirection: 'column' }

export function SectionsRenderer({
    sections,
    urlName,
    brandColor,
    services = [],
}: {
    sections: any[]
    urlName: string
    brandColor: string
    services?: any[]
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {sections
                .filter((s: any) => s.visible !== false)
                .map((section: any, index: number) => {
                    if (section.type === 'hero') {
                        return <HeroSection key={index} data={section.data} urlName={urlName} brandColor={brandColor} />
                    }
                    if (section.type === 'about') {
                        return <AboutSection key={index} data={section.data} />
                    }
                    if (section.type === 'services') {
                        return <ServicesSection key={index} data={section.data} services={services} urlName={urlName} brandColor={brandColor} />
                    }
                    if (section.type === 'book_cta') {
                        return <BookCtaSection key={index} data={section.data} urlName={urlName} brandColor={brandColor} />
                    }
                    if (section.type === 'announcement') {
                        return <AnnouncementSection key={index} data={section.data} />
                    }
                    if (section.type === 'testimonials') {
                        return <TestimonialsSection key={index} data={section.data} />
                    }
                    if (section.type === 'contact') {
                        return <ContactSection key={index} data={section.data} />
                    }
                    if (section.type === 'location') {
                        return <LocationSection key={index} data={section.data} />
                    }
                    if (section.type === 'image') {
                        return (
                            <div key={index} style={{ width: '100%' }}>
                                <Image src={section.url} alt="" width={1366} height={768} style={{ width: '100%', objectFit: 'cover' }} />
                            </div>
                        )
                    }
                    if (section.type === 'text') {
                        return (
                            <div
                                key={index}
                                style={{ width: '100%', maxWidth: '48rem', margin: '0 auto', padding: '2.5rem 1.5rem' }}
                                dangerouslySetInnerHTML={{ __html: section.html }}
                            />
                        )
                    }
                    return null
                })}
        </div>
    )
}

function ContactSection({ data }: { data: any }) {
    const rows: { label: string; href: string; display: string }[] = []
    if (data.email) rows.push({ label: 'Email', href: `mailto:${data.email}`, display: data.email })
    if (data.phone) rows.push({ label: 'Phone', href: `tel:${data.phone.replace(/\D/g, '')}`, display: data.phone })
    if (data.instagram) rows.push({ label: 'Instagram', href: `https://instagram.com/${data.instagram}`, display: `@${data.instagram}` })
    if (data.facebook) rows.push({ label: 'Facebook', href: `https://facebook.com/${data.facebook}`, display: data.facebook })
    if (rows.length === 0) return null
    return (
        <div style={{ ...COL, width: '100%', padding: '4rem 1.5rem' }}>
            <div style={{ ...COL, maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
                <h2
                    className={fraunces.className}
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: 24, color: '#1A1818' }}
                >
                    Contact
                </h2>
                <div style={{ ...COL, gap: 12 }}>
                    {rows.map(({ label, href, display }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.8125rem', color: '#9E9892', width: 72, flexShrink: 0 }}>{label}</span>
                            <a
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1rem', color: '#1A1818', textDecoration: 'underline', textUnderlineOffset: 3 }}
                            >
                                {display}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function LocationSection({ data }: { data: any }) {
    const query = data.street_address
        ? `${data.street_address}${data.city_state ? ', ' + data.city_state : ''}`
        : data.city_state
    const mapsHref = query ? `https://maps.google.com/?q=${encodeURIComponent(query)}` : null
    const hasAddress = data.street_address || data.city_state
    if (!hasAddress) return null
    return (
        <div style={{ ...COL, width: '100%', padding: '4rem 1.5rem' }}>
            <div style={{ ...COL, maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
                <h2
                    className={fraunces.className}
                    style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: 16, color: '#1A1818' }}
                >
                    Location
                </h2>
                {data.street_address && (
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1rem', color: '#1A1818', marginBottom: 2 }}>
                        {data.street_address}
                    </p>
                )}
                {data.city_state && (
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1rem', color: '#1A1818', marginBottom: data.directions_note ? 8 : 16 }}>
                        {data.city_state}
                    </p>
                )}
                {data.directions_note && (
                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.875rem', color: '#6F6863', marginBottom: 16 }}>
                        {data.directions_note}
                    </p>
                )}
                {mapsHref && (
                    <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.9375rem', fontWeight: 600, color: '#1A1818', textDecoration: 'underline', textUnderlineOffset: 3 }}
                    >
                        Get directions →
                    </a>
                )}
            </div>
        </div>
    )
}

function BookCtaSection({ data, urlName, brandColor }: { data: any; urlName: string; brandColor: string }) {
    return (
        <div style={{ ...COL, alignItems: 'center', background: brandColor, padding: '80px 24px', textAlign: 'center', width: '100%' }}>
            <h2
                className={fraunces.className}
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: data.subheadline ? 12 : 32 }}
            >
                {data.headline}
            </h2>
            {data.subheadline && (
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.0625rem', color: 'rgba(255,255,255,0.85)', maxWidth: 500, marginBottom: 32 }}>
                    {data.subheadline}
                </p>
            )}
            <a
                href={`/business/${urlName}/book`}
                style={{ display: 'inline-block', background: '#fff', color: brandColor, padding: '14px 36px', borderRadius: 8, fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '1rem', textDecoration: 'none' }}
            >
                {data.cta_label || 'Book Now'}
            </a>
        </div>
    )
}

function AnnouncementSection({ data }: { data: any }) {
    return (
        <div style={{ ...COL, alignItems: 'center', background: data.background_color ?? '#FFF3CD', width: '100%', padding: '16px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.9375rem', color: data.text_color ?? '#1A1818', fontWeight: 500, maxWidth: 720, lineHeight: 1.6 }}>
                {data.text}
            </p>
        </div>
    )
}

function TestimonialsSection({ data }: { data: any }) {
    const items: any[] = data.items ?? []
    if (items.length === 0) return null
    return (
        <div style={{ ...COL, width: '100%', padding: '4rem 1.5rem' }}>
            <div style={{ ...COL, maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
                {data.headline && (
                    <h2
                        className={fraunces.className}
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: 32, color: '#1A1818', textAlign: 'center' }}
                    >
                        {data.headline}
                    </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {items.map((item: any, i: number) => (
                        <div key={i} style={{ ...COL, padding: 24, border: '1px solid #E8E4DF', borderRadius: 12, background: '#FAFAF9' }}>
                            <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.9375rem', color: '#3D3936', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>
                                "{item.text}"
                            </p>
                            {item.name && (
                                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#1A1818' }}>
                                    — {item.name}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ServicesSection({ data, services, urlName, brandColor }: { data: any; services: any[]; urlName: string; brandColor: string }) {
    return (
        <div style={{ ...COL, width: '100%', padding: '4rem 1.5rem' }}>
            <div style={{ ...COL, maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
                {data.headline && (
                    <h2
                        className={fraunces.className}
                        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: 32, color: '#1A1818' }}
                    >
                        {data.headline}
                    </h2>
                )}
                <div style={{ ...COL, gap: 12 }}>
                    {services.map((service: any) => (
                        <a
                            key={service.id}
                            href={`/business/${urlName}/book?service=${service.id}`}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                        >
                            <div style={{
                                padding: '20px 24px',
                                border: '1px solid #E8E4DF',
                                borderRadius: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 16,
                            }}>
                                <div style={{ ...COL, minWidth: 0 }}>
                                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#1A1818', marginBottom: 2 }}>
                                        {service.name}
                                    </p>
                                    {service.description && (
                                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.875rem', color: '#6F6863', lineHeight: 1.5, marginBottom: 2 }}>
                                            {service.description}
                                        </p>
                                    )}
                                    {data.show_duration && service.length > 0 && (
                                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.8125rem', color: '#9E9892' }}>
                                            {formatDuration(service.length)}
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    {data.show_price && (
                                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#1A1818' }}>
                                            {formatPrice(service.price)}
                                        </p>
                                    )}
                                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '0.8125rem', color: brandColor, fontWeight: 600, marginTop: 4 }}>
                                        Book →
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}

function AboutSection({ data }: { data: any }) {
    return (
        <div style={{ ...COL, width: '100%', padding: '4rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center', maxWidth: '56rem', margin: '0 auto', width: '100%' }}>
                {data.image_url && (
                    <img
                        src={data.image_url}
                        alt={data.display_name || ''}
                        style={{ width: 176, height: 176, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                )}
                <div style={COL}>
                    {data.display_name && (
                        <h2
                            className={fraunces.className}
                            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 700, marginBottom: 12, color: '#1A1818' }}
                        >
                            Hello, I'm {data.display_name}
                        </h2>
                    )}
                    {data.bio && (
                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '1.0625rem', lineHeight: 1.7, color: '#6F6863' }}>
                            {data.bio}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

function HeroSection({ data, urlName, brandColor }: { data: any; urlName: string; brandColor: string }) {
    const bg = data.image_url
        ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${data.image_url}) center/cover no-repeat`
        : (data.background_color ?? '#1A1818')

    return (
        <div
            style={{
                ...COL,
                alignItems: 'center',
                background: bg,
                color: data.text_color ?? '#FFFFFF',
                padding: '80px 24px',
                textAlign: 'center',
                width: '100%',
            }}
        >
            <h1
                className={fraunces.className}
                style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    fontWeight: 700,
                    marginBottom: data.subheadline ? 16 : 32,
                    lineHeight: 1.1,
                }}
            >
                {data.headline}
            </h1>
            {data.subheadline && (
                <p
                    style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '1.125rem',
                        marginBottom: 32,
                        opacity: 0.85,
                        maxWidth: 560,
                    }}
                >
                    {data.subheadline}
                </p>
            )}
            <a
                href={`/business/${urlName}/book`}
                style={{
                    display: 'inline-block',
                    backgroundColor: brandColor,
                    color: '#fff',
                    padding: '14px 36px',
                    borderRadius: 8,
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textDecoration: 'none',
                }}
            >
                {data.cta_label || 'Book Now'}
            </a>
        </div>
    )
}
