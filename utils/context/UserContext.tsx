'use client'

import { createClient } from "@utils/supabase/client";
import { UserAuthContext } from "@utils/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { Database } from "../../lib/database.types";

const UserContext = createContext<any>(false);
const supabase = createClient<Database>()

export function UserWrapper({ children }: any) {
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

export function useUserContext() {
    return useContext(UserContext)
}
