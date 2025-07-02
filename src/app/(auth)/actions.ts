'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'
import { Database } from '../../../lib/database.types'

export async function login(cred: { email: string; password: string }) {
    const supabase = createClient<Database>()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: cred.email,
        password: cred.password,
    }

    const { data: user, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { type: 'error', res: error.message }
    }

    return { type: 'user', res: user.user }

    revalidatePath('/', 'layout')
    redirect('/dashboard')


}


