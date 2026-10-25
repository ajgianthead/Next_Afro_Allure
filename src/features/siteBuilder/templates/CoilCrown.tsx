'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, Eyebrow, fluid, Footer, GallerySection, Header, Heading, INNER, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, Slot, TrustLine, VisitSection } from './parts'

/** Expressive and warm: a sun-shaped accent, a photo collage, colorful cards. */
export function CoilCrown() {
    const { site, info, bio, bookHref, editing } = useSite()
    const [first, second] = site.media.gallery
    const collage = !!(first || second || editing)
    return (
        <Root>
            <Header />
            <section id="top" className={cx(PAD_X, 'relative overflow-hidden pb-14 pt-10 @3xl:pb-24 @3xl:pt-16')}>
                <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-90 @3xl:h-[30rem] @3xl:w-[30rem]" style={{ background: 'var(--s-accent)' }} />
                <div className={cx(INNER, 'relative grid items-center gap-10 @3xl:grid-cols-2 @3xl:gap-14')}>
                    <div className="flex flex-col gap-6">
                        <Eyebrow>{info.place ?? 'Crowns by appointment'}</Eyebrow>
                        <Heading as="h1" className="!font-normal" style={{ fontSize: fluid(2.6, 9, 5.75), lineHeight: 1 }}>
                            {site.content.tagline || info.businessName}
                        </Heading>
                        <p className="max-w-lg text-[17px] leading-relaxed @3xl:text-lg" style={{ color: 'var(--s-muted)' }}>{bio}</p>
                        <div className="flex flex-wrap gap-3">
                            <Button href={bookHref()} size="lg">Book your crown</Button>
                            {info.services.length > 0 && <Button href="#services" size="lg" variant="outline">See services</Button>}
                        </div>
                        <TrustLine />
                    </div>
                    {collage ? (
                        <div className="grid aspect-square grid-cols-5 grid-rows-5 gap-3">
                            <Slot media={site.media.cover} label="a cover photo or video" className="col-span-3 row-span-5" eager />
                            <Slot media={first} label="a photo" className="col-span-2 row-span-3" />
                            <Slot media={second} label="a photo" className="col-span-2 row-span-2" />
                        </div>
                    ) : (
                        <Slot media={site.media.cover} label="a cover photo or video" className="aspect-square w-full" eager />
                    )}
                </div>
            </section>
            <ServicesSection variant="cards" eyebrow="Services" title="The menu" style={{ background: 'var(--s-surface)' }} />
            <GallerySection variant="mosaic" eyebrow="Portfolio" title="Crowns we love" />
            <AboutSection eyebrow="Your loctician" style={{ background: 'var(--s-surface)' }} />
            <ReviewsSection variant="cards" eyebrow="Love notes" title="From the chair" />
            <VisitSection eyebrow="Visit" />
            <BookBand title="Let’s grow something beautiful." />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
