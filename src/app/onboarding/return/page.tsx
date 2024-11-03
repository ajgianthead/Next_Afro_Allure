import { stripe } from '@lib/utils'
import { createClient } from '@utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { Database } from '../../../../lib/database.types';

export default async function page({ params }: { params: { stripe_account_id: string } }) {
  const { stripe_account_id } = params;
  const account = await stripe.accounts.retrieve(stripe_account_id)
  if (account.requirements.currently_due.length > 0) {
    redirect('/dashboard')
  } else {
    const supabase = createClient<Database>();
    const { data, error } = await supabase.from('business_users').update({
      completed_stripe_onboarding: true
    }).select().single();
    redirect('/dashboard')
  }
  return (
    <div>page</div>
  )
}
