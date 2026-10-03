"use client";
import { Inter, Fraunces } from "next/font/google";
import './global.css'
import "./globals.scss";
import '../styles/globals.css'
import { UserWrapper } from "@/app/utils/context/UserContext";
import Script from 'next/script'
import { useEffect, useRef, useState } from "react";
import * as gtag from '../../lib/gtag';
import { usePathname, useRouter } from "next/navigation";
import { CookieBanner, COOKIE_CONSENT_KEY, COOKIE_CONSENT_EVENT } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";


const inter = Inter({ subsets: ["latin"] });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600", "700"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const pathname = usePathname();
    const previousPathname = useRef(pathname);

    // GA4 must only load after the visitor accepts analytics cookies.
    const [analyticsConsent, setAnalyticsConsent] = useState(false)
    useEffect(() => {
        try {
            setAnalyticsConsent(localStorage.getItem(COOKIE_CONSENT_KEY) === 'all')
        } catch {
            // localStorage unavailable — treat as no consent
        }
        const onConsentChange = (e: Event) => {
            setAnalyticsConsent((e as CustomEvent).detail === 'all')
        }
        window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange)
        return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange)
    }, [])

    useEffect(() => {
        if (previousPathname.current !== pathname) {
            // Path changed — track pageview here (no-ops until gtag is actually loaded)
            gtag.pageview(pathname)

            previousPathname.current = pathname;
        }
    }, [pathname]);

    return (
        <UserWrapper>
            <html lang="en">
                <head>
                    {GA_ID && analyticsConsent && (
                        <>
                            <Script
                                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                                strategy="afterInteractive"
                            />
                            <Script
                                id="gtag-init"
                                strategy="afterInteractive"
                                dangerouslySetInnerHTML={{
                                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              debug_mode: ${process.env.NODE_ENV === 'development'},
              page_path: window.location.pathname,
            });
          `,
                                }}
                            />
                        </>
                    )}
                </head>
                <body className={`${inter.className} ${fraunces.variable}`}>
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
                    >
                        Skip to main content
                    </a>
                    <div id="main-content">
                        {children}
                    </div>
                    <SiteFooter />
                    <CookieBanner />
                </body>
            </html>

        </UserWrapper>

    );
}
