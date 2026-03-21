// lib/extractFonts.ts
type FontUsage = {
    family: string;
    weights: Set<number>;
};

export function extractFontsFromPuckData(data: any) {
    const fonts = new Map<string, FontUsage>();

    function recordFont(family?: unknown, weight?: unknown) {
        if (typeof family !== "string") return;

        const w = typeof weight === "number" ? weight : 400;

        if (!fonts.has(family)) {
            fonts.set(family, { family, weights: new Set() });
        }

        fonts.get(family)!.weights.add(w);
    }

    function walkComponent(component: any) {
        if (!component || typeof component !== "object") return;

        const props = component.props ?? {};

        // 🔍 font detection (common patterns)
        recordFont(props.fontFamily, props.fontWeight);
        recordFont(
            props.typography?.fontFamily,
            props.typography?.fontWeight
        );
        recordFont(props.style?.fontFamily, props.style?.fontWeight);

        // 🔁 recurse nested props
        Object.values(props).forEach((value) => {
            if (typeof value === "object") walkAny(value);
        });

        // 🔁 recurse children
        if (Array.isArray(component.content)) {
            component.content.forEach(walkComponent);
        }
    }

    function walkAny(value: any) {
        if (!value || typeof value !== "object") return;

        if (Array.isArray(value)) {
            value.forEach(walkAny);
        } else {
            // detect raw fontFamily anywhere
            if (value.fontFamily) {
                recordFont(value.fontFamily, value.fontWeight);
            }

            Object.values(value).forEach(walkAny);
        }
    }

    // 🚪 ENTRY POINT (THIS IS CRITICAL)
    if (!Array.isArray(data?.content)) {
        console.warn("No content array found in editor data");
        return [];
    }

    data.content.forEach(walkComponent);

    return Array.from(fonts.values()).map((f) => ({
        family: f.family,
        weights: Array.from(f.weights),
    }));
}

export function normalizeFont(font: string) {
    return font
        .replace(/['"]/g, "")     // remove quotes
        .split(",")[0]            // drop fallbacks
        .trim();                  // clean whitespace
}

type GoogleFont = { family: string; weights?: number[] };

export function buildGoogleFontsUrl(fonts: GoogleFont[]): string {
    const families = fonts.map(f => {
        if (f.weights?.length) {
            return `${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`;
        }
        return f.family.replace(/ /g, "+");
    });
    return `https://fonts.googleapis.com/css2?family=${families.join("&family=")}&display=swap`;
}
