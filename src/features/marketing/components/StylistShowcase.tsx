// Real stylists' work on a marketing page, credited by name. With nothing
// approved for this page yet it shows a "get featured" card instead: the site
// never fills the space with stock or AI-generated faces.
import Image from 'next/image'
import { mediaFor, type MarketingPageSlug, type StylistMedia } from '../media'

const INK = '#1A1818'
const MUTED = '#6F6863'
const LINE = '#E8E2D6'
const RED = '#FC6161'
const SERIF = "'Fraunces', 'Times New Roman', serif"
const SANS = "'Inter', system-ui, sans-serif"
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace"

const FEATURE_EMAIL = 'abijahnesbitt@afroallure.co'

function Credit({ credit }: { credit: StylistMedia['credit'] }) {
    return (
        <div style={{ fontFamily: SANS, fontSize: 13, color: INK, padding: '12px 4px 0' }}>
            <strong>{credit.name}</strong>
            {credit.city && <span style={{ color: MUTED }}> · {credit.city}</span>}
            {credit.instagram && (
                <div>
                    <a href={`https://instagram.com/${credit.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
                        @{credit.instagram}
                    </a>
                </div>
            )}
        </div>
    )
}

function Frame({ item }: { item: StylistMedia }) {
    const box: React.CSSProperties = { position: 'relative', aspectRatio: '4 / 5', borderRadius: 18, overflow: 'hidden', background: '#F0EBE3' }
    if (item.kind === 'image') {
        return (
            <div style={box}>
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 720px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
            </div>
        )
    }
    if (item.kind === 'video') {
        return (
            <div style={box}>
                <video src={item.src} poster={item.poster} aria-label={item.alt} controls muted playsInline preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        )
    }
    return (
        <div style={{ ...box, aspectRatio: '9 / 16' }}>
            <iframe
                src={`https://www.instagram.com/reel/${encodeURIComponent(item.code)}/embed`}
                title={item.alt}
                loading="lazy"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 0 }}
            />
        </div>
    )
}

export function StylistShowcase({ slug, eyebrow }: { slug: MarketingPageSlug; eyebrow: string }) {
    const items = mediaFor(slug)
    return (
        <section className="aa-section" style={{ background: '#fff', padding: '100px 56px', borderTop: `1px solid ${LINE}` }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, marginBottom: 18, fontWeight: 600 }}>
                    {eyebrow}
                </div>
                {items.length > 0 ? (
                    <>
                        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(30px, 3.6vw, 46px)', letterSpacing: '-.02em', margin: '0 0 36px', color: INK }}>
                            Work from stylists in our community.
                        </h2>
                        <div className="aa-mkt-media">
                            {items.map((item, i) => (
                                <figure key={i} style={{ margin: 0 }}>
                                    <Frame item={item} />
                                    <figcaption><Credit credit={item.credit} /></figcaption>
                                </figure>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ border: `1.5px dashed ${LINE}`, borderRadius: 24, padding: '48px 32px', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-.02em', margin: '0 0 12px', color: INK }}>
                            Your work could be here.
                        </h2>
                        <p style={{ fontFamily: SANS, fontSize: 15, color: MUTED, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 20px' }}>
                            We feature real stylists, credited by name, with a link to book you. Send us a photo or a reel of your work.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontFamily: SANS, fontSize: 14 }}>
                            <a href="https://instagram.com/afroallure_" target="_blank" rel="noopener noreferrer" style={{ color: INK, fontWeight: 600 }}>DM @afroallure_</a>
                            <span style={{ color: MUTED }}>or</span>
                            <a href={`mailto:${FEATURE_EMAIL}?subject=${encodeURIComponent('Feature my work on AfroAllure')}`} style={{ color: INK, fontWeight: 600 }}>email us</a>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
