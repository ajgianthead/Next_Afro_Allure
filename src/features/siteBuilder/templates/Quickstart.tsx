'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, Eyebrow, fluid, Footer, GallerySection, Header, Heading, INNER, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, Slot, TrustLine, VisitSection } from './parts'

/** Clean and friendly: centered hero, simple cards, works for any business. */
export function Quickstart() {
    const { site, info, bio, bookHref } = useSite()
    return (
        <Root>
            <Header />
            <section id="top" className={cx(PAD_X, 'pb-12 pt-12 text-center @3xl:pb-16 @3xl:pt-20')}>
                <div className={cx(INNER, 'flex flex-col items-center')}>
                    <Eyebrow className="mb-4">{info.place ?? 'Book online'}</Eyebrow>
                    <Heading as="h1" className="max-w-3xl !font-bold" style={{ fontSize: fluid(2.25, 7, 4) }}>
                        {site.content.tagline || info.businessName}
                    </Heading>
                    <p className="mt-5 max-w-xl text-[17px] leading-relaxed" style={{ color: 'var(--s-muted)' }}>{bio}</p>
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        <Button href={bookHref()} size="lg">Book an appointment</Button>
                        {info.services.length > 0 && <Button href="#services" size="lg" variant="outline">Services</Button>}
                    </div>
                    <TrustLine className="mt-6" />
                </div>
                <div className={cx(INNER, 'mt-10')}>
                    <Slot media={site.media.cover} label="a cover photo or video" className="aspect-[4/3] w-full @2xl:aspect-[21/9]" eager />
                </div>
            </section>
            <ServicesSection variant="cards" eyebrow="Services" title="Services & prices" style={{ background: 'var(--s-surface)' }} />
            <GallerySection variant="grid" eyebrow="Gallery" title="My work" />
            <AboutSection eyebrow="About me" style={{ background: 'var(--s-surface)' }} />
            <ReviewsSection variant="cards" eyebrow="Reviews" />
            <VisitSection eyebrow="Visit" title="Hours, location & policies" style={{ background: 'var(--s-surface)' }} />
            <BookBand />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
