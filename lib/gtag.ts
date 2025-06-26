export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID; // replace with your GA4 ID

// Sends a page_view event to GA
export const pageview = (url: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            page_path: url,
        });
    }
};
