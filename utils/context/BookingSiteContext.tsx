'use client'
import { createContext, useContext, useEffect, useState } from "react";

const BookingSiteContext = createContext<any>(false);
export function SiteWrapper({ children }: any) {
    let [templateData, setTemplateData] = useState<any>({});
    useEffect(() => {

    }, [])
    return (
        <BookingSiteContext.Provider value={{ templateData, setTemplateData }}>
            {children}
        </BookingSiteContext.Provider>
    )
}

export function useBookingSiteContext() {
    return useContext(BookingSiteContext)
}
