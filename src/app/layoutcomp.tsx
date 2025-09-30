"use client";
import { Inter } from "next/font/google";
import "./globals.scss";
import { UserWrapper } from "@utils/context/UserContext";
import { NextUIProvider } from "@nextui-org/react";
import '@fontsource/inter';
import Script from 'next/script'
import { useEffect, useRef } from "react";
import * as gtag from '../../lib/gtag';
import { usePathname, useRouter } from "next/navigation";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    const pathname = usePathname();
    const previousPathname = useRef(pathname);

    useEffect(() => {
        if (previousPathname.current !== pathname) {
            // Path changed — track pageview here


            // e.g., call your GA pageview function
            // gtag.pageview(pathname);
            gtag.pageview(pathname)

            previousPathname.current = pathname;
        }
    }, [pathname]);

    return (
        <UserWrapper>
            <html lang="en">
                <head>
                    {GA_ID && (
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
                <body className={inter.className}>
                    <NextUIProvider>
                        {children}
                    </NextUIProvider>
                </body>
            </html>

        </UserWrapper>

    );
}
