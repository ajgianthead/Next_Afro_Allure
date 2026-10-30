'use client'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { fetchGoogleFonts, GoogleFont } from "useGoogleFonts";

const EditorContext = createContext<{
    editorState: EditorConxtextProps,
    setEditorState: Dispatch<SetStateAction<EditorConxtextProps>> | null,
    /** The old drag-and-drop editor turns dragging off while an element is being resized. */
    isResizing: boolean,
    setIsResizing: (resizing: boolean) => void,
}>({
    editorState: {
        fonts: null,
        sections: new Set<string>(),
        businessName: "",
        services: []
    },
    setEditorState: null,
    isResizing: false,
    setIsResizing: () => {},
});
export interface EditorConxtextProps {
    fonts: GoogleFont[] | null,
    sections: Set<string>,
    businessName: string,
    /** Only id and name are used (the card's "link to service" picker). */
    services: { id: string, name: string }[]
}


export function EditorWrapper({ children }: any) {
    let [editorState, setEditorState] = useState<EditorConxtextProps>({
        fonts: null,
        sections: new Set<string>(),
        businessName: "",
        services: []
    });
    const [isResizing, setIsResizing] = useState(false)
    useEffect(() => {
        (async () => {
            const fonts = await fetchGoogleFonts()
            setEditorState(prev => ({ ...prev, fonts }))
        })()

    }, []);

    return (
        <EditorContext.Provider value={{ editorState, setEditorState, isResizing, setIsResizing }}>
            {children}
        </EditorContext.Provider>
    )
}

export function useEditorContext() {
    return useContext(EditorContext)
}
