'use client'

import Button from '@tailus-ui/Button';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const Notifications = () => {
  const router = useRouter()
  return (
    <div className="relative cursor-pointer" onClick={() => {
      router.push('/dashboard/notifications')
    }}>
      <Button.Root size="md" variant="ghost" intent="gray">
        <Button.Label hidden>Notifications</Button.Label>
        <Button.Icon type="only">
          <Bell />
        </Button.Icon>
      </Button.Root>
    </div>
  )

};
