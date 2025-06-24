import Button from '@tailus-ui/Button';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export const Link = ({ isActive = false, label, link, children, disabled = false }: { isActive?: boolean; children?: ReactNode; label?: string; link: string; disabled?: boolean }) => {
  return (
    <Button.Root
      disabled={disabled}
      href={link}
      variant={isActive ? 'outlined' : 'ghost'}
      intent="gray"
      className={twMerge(
        'justify-start gap-3.5 px-4',
        isActive && 'bg-white dark:bg-gray-500/10 dark:!shadow-none dark:[--btn-border-color:theme(colors.transparent)]'
      )}
      aria-label={label}
    >
      <Button.Icon size="sm" type="leading">
        {children}
      </Button.Icon>
      <Button.Label className="text-sm">{label}</Button.Label>
    </Button.Root>
  );
};

export const Root = ({ isActive = false, link, children, disabled = false }: { isActive?: boolean; children: ReactNode; link: string, disabled?: boolean }) => (
  <Button.Root
    disabled={disabled}
    href={link}
    variant={isActive ? 'soft' : 'ghost'}
    intent="primary"
    className={twMerge(
      'justify-start gap-3.5 px-4 hover:bg-[theme(colors.gray.200)] ',
      isActive && 'bg-[theme(colors.primary.50)] text-white  dark:bg-gray-500/10 dark:!shadow-none dark:[--btn-border-color:theme(colors.transparent)]'
    )}
  >
    {children}
  </Button.Root>
);

export const Icon = ({ children }: { children: ReactNode }) => (
  <Button.Icon size="sm" type="leading">
    {children}
  </Button.Icon>
);

export const Label = ({ children }: { children: ReactNode }) => <Button.Label className="text-sm">{children}</Button.Label>;
