'use client';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import { Caption } from '@tailus-ui/typography';
import { updateStripeOnboardInfo } from './actions';

export default function Page() {
  const params = useParams();
  const stripe_account_id: any = params.stripe_account_id;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await updateStripeOnboardInfo(stripe_account_id) !== -1
      router.replace('/dashboard');
    })()
  }, []);

  return (
    <div >
      <div className='flex w-full flex-col gap-2 h-screen justify-center items-center'>
        <CircularProgress size='sm' />
        <Caption>Redirecting</Caption>
      </div>
    </div>
  );
}
