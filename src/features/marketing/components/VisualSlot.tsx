// One visual on a marketing page: real media from SLOT_MEDIA when it has been
// added for this page and slot, otherwise the built-in animated demo.
import Image from 'next/image'
import type { SampleMenu, Visual } from '../content'
import { slotMedia, type MarketingPageSlug, type SlotMedia } from '../media'
import { PhoneFrame } from '../widgets/frames'
import { WidgetView } from '../widgets/Widgets'

function MediaBody({ m }: { m: SlotMedia }) {
    if (m.kind === 'image') return <Image src={m.src} alt={m.alt} fill sizes="(max-width: 720px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
    if (m.kind === 'video') {
        return (
            <video src={m.src} poster={m.poster} aria-label={m.alt} autoPlay muted loop playsInline preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )
    }
    return (
        <iframe src={`https://www.instagram.com/reel/${encodeURIComponent(m.code)}/embed`} title={m.alt} loading="lazy" allowFullScreen
            style={{ width: '100%', height: '100%', border: 0 }} />
    )
}

function RealMedia({ m }: { m: SlotMedia }) {
    const caption = m.credit && (
        <figcaption style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: '#6F6863', textAlign: 'center', marginTop: 10 }}>
            {m.credit.name}{m.credit.instagram && <> · <a href={`https://instagram.com/${m.credit.instagram}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>@{m.credit.instagram}</a></>}
        </figcaption>
    )
    if (m.phone || m.kind === 'instagram') {
        return <figure style={{ margin: 0 }}><PhoneFrame><MediaBody m={m} /></PhoneFrame>{caption}</figure>
    }
    return (
        <figure style={{ margin: 0 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', borderRadius: 20, overflow: 'hidden', background: '#F0EBE3', boxShadow: '0 30px 60px rgba(15,14,14,.18)' }}>
                <MediaBody m={m} />
            </div>
            {caption}
        </figure>
    )
}

export function VisualSlot({ slug, visual, menu }: { slug: MarketingPageSlug; visual: Visual; menu?: SampleMenu }) {
    const m = slotMedia(slug, visual.slot)
    return m ? <RealMedia m={m} /> : <WidgetView widget={visual.widget} menu={menu} />
}
