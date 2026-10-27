'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, Eyebrow, fluid, Footer, GallerySection, Header, Heading, INNER, MediaView, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, TrustLine, VisitSection } from './parts'

const MARQUEE_CSS = '@keyframes site-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'

/** Bold barber poster: full-bleed cover, condensed uppercase type, a moving strip of services. */
export function FadeHouse() {
    const { site, info, bookHref, editing } = useSite()
    const cover = site.media.cover
    const names = info.services.map(s => s.name)
    return (
        <Root>
            <section id="top" className="relative flex min-h-[calc(var(--site-vh,1svh)*88)] flex-col @3xl:min-h-[640px]" style={{ background: 'var(--s-fg)', color: cover ? '#ffffff' : 'var(--s-bg)' }}>
                {cover && (
                    <div className="absolute inset-0">
                        <MediaView media={cover} alt={info.businessName} eager />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.35))' }} />
                    </div>
                )}
                {!cover && editing && (
                    <div className="absolute inset-4 top-20 flex items-center justify-center text-xs font-medium" style={{ border: '1.5px dashed currentColor', opacity: 0.5 }}>
                        Add a cover photo or video
                    </div>
                )}
                <div className="relative"><Header transparent /></div>
                <div className={cx(PAD_X, 'relative mt-auto pb-12 pt-28 @3xl:pb-20')}>
                    <div className={INNER}>
                        <Eyebrow className="mb-4">{info.place ?? 'Book your cut'}</Eyebrow>
                        <Heading as="h1" className="uppercase !font-normal" style={{ fontSize: fluid(3, 13, 8), lineHeight: 0.92, letterSpacing: '0.01em' }}>
                            {site.content.tagline || info.businessName}
                        </Heading>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Button href={bookHref()} size="lg">Book now</Button>
                            {info.services.length > 0 && <Button href="#services" size="lg" variant="outline">Prices</Button>}
                        </div>
                        <div className="mt-6 opacity-80 [&_p]:!text-current"><TrustLine /></div>
                    </div>
                </div>
            </section>
            {names.length > 0 && (
                <div className="overflow-hidden py-4" style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }} aria-hidden>
                    <style>{MARQUEE_CSS}</style>
                    <div className="flex w-max gap-10 whitespace-nowrap motion-safe:animate-[site-marquee_28s_linear_infinite]" style={{ fontFamily: 'var(--s-heading)' }}>
                        {[...names, ...names, ...names, ...names].map((n, i) => <span key={i} className="text-xl uppercase tracking-wide">{n} ✦</span>)}
                    </div>
                </div>
            )}
            <ServicesSection variant="numbered" eyebrow="The menu" title="Cuts & prices" />
            <GallerySection variant="grid" eyebrow="Fresh" title="Recent cuts" style={{ background: 'var(--s-surface)' }} />
            <AboutSection eyebrow="The barber" />
            <ReviewsSection variant="cards" eyebrow="Word on the street" title="Reviews" />
            <VisitSection eyebrow="Pull up" title="Hours & shop rules" style={{ background: 'var(--s-surface)' }} />
            <BookBand title="Next chair’s open." />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
