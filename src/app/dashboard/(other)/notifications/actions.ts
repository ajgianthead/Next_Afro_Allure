'use server'

import { createClient } from '@utils/supabase/server';
import React from 'react';
import { Database } from '../../../../../lib/database.types';

export const updateNotificationState = async (notiId: string) => {
    const supabase = createClient<Database>();
    const { data: updatedNoti, error } = await supabase.from('notifications').update({
        read: true
    }).eq('id', notiId).select().single()
    if (error) return error

    return updatedNoti
}

