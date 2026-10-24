'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, Eyebrow, fluid, Footer, GallerySection, Header, Heading, INNER, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, Slot, TrustLine, VisitSection } from './parts'

/** Soft minimal: generous space, rounded cards, a centered calm hero. */
export function AtelierClair() {
    const { site, info, bio, bookHref } = useSite()
    return (
        <Root>
            <Header />
            <section id="top" className={cx(PAD_X, 'pb-12 pt-12 @3xl:pb-20 @3xl:pt-20')}>
                <div className={cx(INNER, 'flex flex-col items-center text-center')}>
                    <Eyebrow className="mb-5">{info.place ?? 'Welcome'}</Eyebrow>
                    <Heading as="h1" className="max-w-3xl" style={{ fontSize: fluid(2.4, 7.5, 4.75), lineHeight: 1.05 }}>
                        {site.content.tagline || info.businessName}
                    </Heading>
                    <p className="mt-5 max-w-xl text-[17px] leading-relaxed @3xl:text-lg" style={{ color: 'var(--s-muted)' }}>{bio}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Button href={bookHref()} size="lg">Book an appointment</Button>
                        {info.services.length > 0 && <Button href="#services" size="lg" variant="outline">Explore services</Button>}
                    </div>
                    <TrustLine className="mt-6" />
                </div>
                <div className={cx(INNER, 'mt-12 @3xl:mt-16')}>
                    <Slot media={site.media.cover} label="a cover photo or video" className="aspect-[4/5] w-full @2xl:aspect-[16/9]" eager />
                </div>
            </section>
            <ServicesSection variant="cards" eyebrow="Services" title="What we offer" align="center" />
            <GallerySection variant="grid" eyebrow="Portfolio" title="Recent work" />
            <AboutSection eyebrow="About" style={{ background: 'var(--s-surface)' }} />
            <ReviewsSection variant="cards" eyebrow="Reviews" />
            <VisitSection eyebrow="Visit" />
            <BookBand title="Take a little time for you." />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
