import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../../lib/database.types";

export class UserAuth {
    constructor(
        public id: string
    ) { }

    static async register(supabase: SupabaseClient<Database>, email: string, password: string) {
        try {
            const { data: user, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        account_type: 'business'
                    }
                }
            })
            if (error) throw Error(error.message)
            return new UserAuth(user.user?.id!)
        } catch (error) {

        }
    }
    static async login(supabase: SupabaseClient<Database>, email: string, password: string) {
        try {
            const { data: user, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })
            if (error) throw Error(error.message)
            return new UserAuth(user.user?.id!)
        } catch (error: any) {
            throw Error(error.message)
        }
    }

    static async signOut(supabase: SupabaseClient<Database>, email: string, password: string) {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw Error(error.message)
            return 'User successfully signed out'
        } catch (error: any) {
            throw Error(error.message)
        }
    }
}
