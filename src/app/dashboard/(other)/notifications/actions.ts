'use server'

import { createClient } from '@/app/utils/supabase/server';
import { Database } from '../../../../../lib/database.types';
import { fetchBusinessUser, fetchUser } from '../actions';

export const updateNotificationState = async (notiId: string) => {
    const supabase = await createClient<Database>();
    const user = await fetchUser()
    if (!user) throw new Error('Unauthorized')
    const business = await fetchBusinessUser(user.id)
    if (!business) throw new Error('Unauthorized')

    const { data: updatedNoti, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notiId)
        .eq('business_id', business.business_id)
        .select('*, appointments(*, business_users(*))')
        .single()
    if (error) return error

    return updatedNoti
}

export const deleteNotification = async (notiIds: Set<string>) => {
    const notiArray = Array.from(notiIds)
    const supabase = await createClient<Database>()
    const user = await fetchUser()
    if (!user) throw new Error('Unauthorized')
    const business = await fetchBusinessUser(user.id)
    if (!business) throw new Error('Unauthorized')

    const { data } = await supabase
        .from('notifications')
        .delete()
        .in('id', notiArray)
        .eq('business_id', business.business_id)
        .select('*, appointments(*, business_users(*))')
    return data ?? []
}
