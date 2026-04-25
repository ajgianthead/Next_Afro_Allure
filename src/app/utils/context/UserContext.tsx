'use client'

import { createClient } from "@/app/utils/supabase/client";
import { UserAuthContext } from "@/app/utils/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Database } from "../../../../lib/database.types";

interface UserContextValue {
    user: UserAuthContext;
    setUser: Dispatch<SetStateAction<UserAuthContext>>;
}

const UserContext = createContext<UserContextValue | null>(null);
const supabase = await createClient<Database>()

export function UserWrapper({ children }: { children: React.ReactNode }) {
    let [user, setUser] = useState<UserAuthContext>({
        user_id: undefined,
        role: undefined,
        business_id: undefined,
        client_id: undefined
    });
    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
                if (session?.user.user_metadata.account_type === 'business') {
                    let { data, error } = await supabase.from('business_users').select("business_id").eq("user_id", session?.user.id)
                    if (error) {
                        console.error(error)
                    }
                    if (data?.length) {
                        setUser({
                            user_id: session?.user.id,
                            role: session?.user.user_metadata.account_type,
                            business_id: data[0].business_id,
                            client_id: undefined
                        })
                    }
                } else if (session?.user.user_metadata.account_type === 'client') {
                    let { data, error } = await supabase.from('client_users').select("client_id").eq("user_id", session?.user.id)
                    if (error) {
                        console.error(error)
                    }
                    if (data?.length) {
                        setUser({
                            user_id: session?.user.id,
                            role: session?.user.user_metadata.account_type,
                            client_id: data[0].client_id,
                            business_id: undefined
                        })
                    }
                }

            }
            if (event === "SIGNED_OUT") {
                setUser({
                    user_id: undefined,
                    role: undefined,
                    client_id: undefined,
                    business_id: undefined
                })
            }
        })
        return () => {
            data.subscription.unsubscribe();
        }
    }, [])
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUserContext(): UserContextValue {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUserContext must be used inside UserWrapper');
    return context;
}
