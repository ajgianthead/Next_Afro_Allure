'use server'

import { createClient } from '@/app/utils/supabase/server';
import React from 'react';
import { Database } from '../../../../../lib/database.types';

export const updateNotificationState = async (notiId: string) => {
    const supabase = await createClient<Database>();
    const { data: updatedNoti, error } = await supabase.from('notifications').update({
        read: true
    }).eq('id', notiId).select('*, appointments(*, business_users(*))').single()
    if (error) return error

    return updatedNoti
}

export const deleteNotification = async (notiIds: Set<string>) => {
    const notiArray = Array.from(notiIds)
    const supabase = await createClient<Database>()
    const { data } = await supabase.from('notifications').delete().in('id', notiArray).select('*, appointments(*, business_users(*))')
    return data!
}

