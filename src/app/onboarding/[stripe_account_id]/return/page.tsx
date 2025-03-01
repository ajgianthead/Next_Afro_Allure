'use client';

import { stripe } from '@lib/utils'
import { createClient } from '@utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import { Caption } from '@tailus-ui/typography';
import { Database } from '../../../../../lib/database.types';

export default function Page() {
  const params = useParams();
  const stripe_account_id: any = params.stripe_account_id;

  const router = useRouter();

  useEffect(() => {
    async function checkAccount() {
      const account = await stripe.accounts.retrieve(stripe_account_id);
      if (account.requirements!.currently_due!.length > 0) {
        router.replace('/dashboard');
      } else {
        const supabase = createClient<Database>();
        const { data } = await supabase.from('business_users').update({
          completed_stripe_onboarding: true
        }).eq('stripe_acc_id', stripe_account_id).select().single();
        router.replace('/dashboard');
      }
    }
    checkAccount()
  }, [stripe_account_id, router]);

  return (
    <div >
      <div className='flex w-full flex-col gap-2 h-screen justify-center items-center'>
        <CircularProgress size='sm' />
        <Caption>Redirecting</Caption>
      </div>
    </div>
  );
}
