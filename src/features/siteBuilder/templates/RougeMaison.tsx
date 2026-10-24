'use client'

import { useSite } from './context'
import { AboutSection, BookBand, Button, cx, fluid, Footer, GallerySection, Header, Heading, INNER, MobileBookBar, PAD_X, ReviewsSection, Root, ServicesSection, Slot, TrustLine, VisitSection } from './parts'

/** Magazine cover: oversized serif name over a hard color block, editorial metadata strip. */
export function RougeMaison() {
    const { site, info, bio, bookHref } = useSite()
    return (
        <Root>
            <Header />
            <section id="top" className="grid @3xl:grid-cols-2">
                <div className={cx(PAD_X, 'flex flex-col justify-between gap-10 py-12 @3xl:py-16')} style={{ background: 'var(--s-accent)', color: 'var(--s-accent-fg)' }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em]">{info.place ?? 'By appointment'}</p>
                    <div>
                        <Heading as="h1" className="!font-bold italic" style={{ fontSize: fluid(3, 11, 7), lineHeight: 0.95 }}>
                            {info.businessName}
                        </Heading>
                        {site.content.tagline && <p className="mt-5 text-lg uppercase tracking-[0.12em]">{site.content.tagline}</p>}
                    </div>
                    <div className="flex flex-col gap-5">
                        <p className="max-w-md text-[17px] leading-relaxed opacity-85">{bio}</p>
                        <div><Button href={bookHref()} size="lg" variant="inverse">Book a session</Button></div>
                    </div>
                </div>
                <Slot media={site.media.cover} label="a cover photo or video" className="aspect-[4/5] w-full @3xl:aspect-auto @3xl:min-h-[640px]" style={{ borderRadius: 0 }} eager />
            </section>
            <div className={cx(PAD_X, 'py-4')} style={{ borderBottom: '1px solid var(--s-border)' }}>
                <div className={cx(INNER, 'uppercase tracking-[0.14em] [&_p]:!text-xs')}><TrustLine /></div>
            </div>
            <ServicesSection variant="numbered" eyebrow="The edit" title="Services" />
            <GallerySection variant="strip" eyebrow="Lookbook" title="The looks" style={{ background: 'var(--s-surface)' }} />
            <AboutSection eyebrow="Behind the brush" reverse />
            <ReviewsSection variant="quote" eyebrow="In their words" style={{ background: 'var(--s-surface)' }} />
            <VisitSection eyebrow="Details" title="Hours & policies" />
            <BookBand title="Your close-up awaits." inverse />
            <Footer />
            <MobileBookBar />
        </Root>
    )
}
