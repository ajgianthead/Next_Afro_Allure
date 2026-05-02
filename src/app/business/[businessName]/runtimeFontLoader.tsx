"use client";

import { buildGoogleFontsUrl } from "@lib/extractFonts";
import { useEffect } from "react";

type FontUsage = {
    family: string;
    weights: number[];
};

export function RuntimeFontLoader({
    fonts,
}: {
    fonts: FontUsage[];
}) {
    useEffect(() => {
        if (!fonts.length) return;

        const href = buildGoogleFontsUrl(fonts);
        if (!href) return;

        // Avoid duplicates
        if (document.querySelector(`link[href="${href}"]`)) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;

        document.head.appendChild(link);


    }, [fonts]);


    return null;
}
