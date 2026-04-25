'use client'
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { fetchGoogleFonts, GoogleFont } from "useGoogleFonts";

const EditorContext = createContext<{ editorState: EditorConxtextProps, setEditorState: Dispatch<SetStateAction<EditorConxtextProps>> | null }>({
    editorState: {
        fonts: null,
        sections: new Set<string>(),
        businessName: "",
        services: []
    },
    setEditorState: null
});
export interface EditorConxtextProps {
    fonts: GoogleFont[] | null,
    sections: Set<string>,
    businessName: string,
    services: Service[]
}


export function EditorWrapper({ children }: any) {
    let [editorState, setEditorState] = useState<EditorConxtextProps>({
        fonts: null,
        sections: new Set<string>(),
        businessName: "",
        services: []
    });
    useEffect(() => {
        (async () => {
            const fonts = await fetchGoogleFonts()
            setEditorState({
                ...editorState,
                fonts: fonts
            })
        })()

    }, []);

    return (
        <EditorContext.Provider value={{ editorState, setEditorState }}>
            {children}
        </EditorContext.Provider>
    )
}

export function useEditorContext() {
    return useContext(EditorContext)
}
