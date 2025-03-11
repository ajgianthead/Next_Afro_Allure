'use client'
import { createContext, useContext, useState } from "react";

const EditorContext = createContext<any>(false);


export function EditorWrapper({ children }: any) {
    let [isResizing, setIsResizing] = useState<boolean>(false);
    return (
        <EditorContext.Provider value={{ isResizing, setIsResizing }}>
            {children}
        </EditorContext.Provider>
    )
}

export function useEditorContext() {
    return useContext(EditorContext)
}
