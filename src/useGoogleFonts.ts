export type GoogleFont = {
    family: string;
    variants: string[];
    category: string;
};

const loadedFonts = new Set<string>();


export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
    const res = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY}`
    );

    const data = await res.json();

    return data.items.map((font: any) => ({
        family: font.family,
        variants: font.variants,
        category: font.category,
    }));
}


export function loadGoogleFont(family: string): Promise<void> {
    return new Promise((resolve) => {
        if (loadedFonts.has(family)) return resolve();

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`;
        document.head.appendChild(link);

        loadedFonts.add(family);

        // give the browser a moment to start loading the font
        setTimeout(() => resolve(), 50);
    });
}

const PRELOAD_COUNT = 20;

export const preloadFonts = (fonts: { family: string }[]) => {
    fonts.slice(0, PRELOAD_COUNT).forEach(font => {
        loadGoogleFont(font.family);
    });
};

const CHUNK_SIZE = 20;
let currentIndex = 20; // first 20 are preloaded
let index = 0;


export function resetFontChunkLoader() {
    currentIndex = 20;
}

export function loadNextFontChunk(fontFamilies: string[]) {
    const chunk = fontFamilies.slice(
        currentIndex,
        currentIndex + CHUNK_SIZE
    );

    if (!chunk.length) return;

    requestIdleCallback(() => {
        chunk.forEach(loadGoogleFont);
    });

    currentIndex += CHUNK_SIZE;
}
export function loadAllFontsProgressively(fontFamilies: string[]) {
    if (index >= fontFamilies.length) return;

    const chunk = fontFamilies.slice(index, index + CHUNK_SIZE);

    requestIdleCallback(() => {
        chunk.forEach(loadGoogleFont);
        index += CHUNK_SIZE;

        // Schedule next chunk
        loadAllFontsProgressively(fontFamilies);
    });
}

