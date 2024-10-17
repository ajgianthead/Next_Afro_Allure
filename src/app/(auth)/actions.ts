'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'
import { Database } from '../../../lib/database.types'

export async function login(formData: FormData) {
    const supabase = createClient<Database>()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function register(formData: FormData) {
    const supabase = createClient<Database>()

    // TODO: Validate user inputs
    const isBusiness = formData.get('isBusiness') as unknown as boolean;
    let registerInfo = {
        businessName: "",
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        isBusiness: isBusiness
    }
    if (isBusiness) {
        registerInfo.businessName = formData.get('name') as string
    }

    // Register user and put user in business_users table
    const { error } = await supabase.auth.signUp(registerInfo).then(async (data) => {
        if (isBusiness) {
            return await supabase.from('business_users').insert([
                {
                    // TODO: Get a business id #
                    business_name: registerInfo.businessName,
                    user_id: data.data.user?.id,
                    email: data.data.user?.email,
                }
            ])
        }
        return await supabase.from('client_users').insert([
            {
                // TODO: Get id number
                user_id: data.data.user?.id,
                email: data.data.user?.email,
                updatedAt: Date.now()
            }
        ])
    })


    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
