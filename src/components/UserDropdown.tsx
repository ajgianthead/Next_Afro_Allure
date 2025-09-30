import DropdownMenu from '@tailus-ui/Dropdown';
import Button from '@tailus-ui/Button';
import { Check, ChevronRight, HelpCircle, LogOut, MessageCircleQuestion, Settings, Settings2, User, UserPlus } from 'lucide-react';
import { Caption, Title } from '@tailus-ui/typography';
import { AdminAvatar } from './AdminAvatar';
import { TAILUS_AVATAR } from './../const';
import { redirect } from 'next/navigation';

export const UserDropdown = ({ businessData }: any) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-[--avatar-radius] hover:ring ring-[--ui-soft-bg] data-[state=open]:ring">
        <AdminAvatar />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          data-shade="900"
          side="bottom"
          mixed
          align="end"
          sideOffset={6}
          intent="gray"
          variant="soft"
          className="z-50 dark:[--caption-text-color:theme(colors.gray.400)]"
        >
          <div className="grid gap-3 [grid-template-columns:auto_1fr] p-3">
            <AdminAvatar />
            <div>
              <Title className="text-sm" as="span" weight="medium">
                {businessData.business_name}
              </Title>
              <Caption>{businessData.email}</Caption>

              <div className="mt-4 grid grid-cols-2 gap-3" data-rounded="large">
                <Button.Root onClick={() => {
                  redirect('/dashboard/settings')
                }} className="bg-gray-50" variant="outlined" size="xs" intent="gray">
                  <Button.Icon size="xs" type="leading">
                    <Settings />
                  </Button.Icon>
                  <Button.Label>Settings</Button.Label>
                </Button.Root>
                <Button.Root onClick={async () => {
                  const signOut = await fetch(`/api/auth/signout`, {
                    method: 'POST'
                  })
                  const res = await signOut.json();

                  redirect('/login')

                }} className="bg-gray-50" variant="outlined" size="xs" intent="gray">
                  <Button.Icon size="xs" type="leading">
                    <LogOut />
                  </Button.Icon>
                  <Button.Label>Sign Out</Button.Label>
                </Button.Root>
              </div>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
