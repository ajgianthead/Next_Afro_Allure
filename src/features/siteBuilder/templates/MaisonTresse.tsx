'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, Eyebrow, fluid, Footer, GallerySection, Header, Heading, INNER, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, Slot, TrustLine, VisitSection } from './parts'

/** Editorial luxury: serif headlines, hairline rules, a tall portrait cover. */
export function MaisonTresse() {
    const { site, info, bio, bookHref } = useSite()
    return (
        <Root>
            <Header centered />
            <section id="top" className={cx(PAD_X, 'pb-14 pt-10 @3xl:pb-24 @3xl:pt-16')}>
                <div className={cx(INNER, 'grid items-center gap-10 @3xl:grid-cols-[1.1fr_1fr] @3xl:gap-16')}>
                    <div className="flex flex-col gap-6">
                        <Eyebrow>{info.place ? `Atelier · ${info.place}` : 'By appointment'}</Eyebrow>
                        <Heading as="h1" className="!font-normal" style={{ fontSize: fluid(2.6, 8.5, 5.5), lineHeight: 1.02 }}>
                            {site.content.tagline || info.businessName}
                        </Heading>
                        <p className="max-w-lg text-[17px] leading-relaxed @3xl:text-lg" style={{ color: 'var(--s-muted)' }}>{bio}</p>
                        <div className="flex flex-wrap gap-3">
                            <Button href={bookHref()} size="lg">Reserve a chair</Button>
                            {info.services.length > 0 && <Button href="#services" size="lg" variant="outline">View services</Button>}
                        </div>
                        <TrustLine className="pt-2" />
                    </div>
                    <Slot media={site.media.cover} label="a cover photo or video" className="aspect-[4/5] w-full" eager />
                </div>
            </section>
            <div className={PAD_X}><div className={INNER} style={{ borderTop: '1px solid var(--s-border)' }} /></div>
            <ServicesSection variant="list" eyebrow="The menu" title="Services" />
            <GallerySection variant="mosaic" eyebrow="Portfolio" title="Recent work" style={{ background: 'var(--s-surface)' }} />
            <AboutSection eyebrow="The artist" />
            <ReviewsSection variant="quote" eyebrow="Kind words" style={{ background: 'var(--s-surface)' }} />
            <VisitSection eyebrow="Visit" />
            <BookBand title="Your chair is waiting." inverse />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
