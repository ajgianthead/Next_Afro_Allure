import Card from '@tailus-ui/Card';
import { Caption, Title } from '@tailus-ui/typography';
import * as Link from '@components/Link';

import React from 'react';
import Input from '@components/Input';
import Label from '@components/Label';
import Separator from "@tailus-ui/Separator"
import Button from '@tailus-ui/Button';

const Page = () => {
    return (
        <div className=''>
            <Card className='mx-6'>
                <Title>Settings</Title>
                <Caption>Manage your account settings and set notifications preferences.

                </Caption>
                <Separator className="my-4 " orientation='horizontal' />
                <div className='flex'>
                    <div className="mt-4 flex w-[25%] pr-10">
                        <div className='space-y-1 w-full'>
                            <Link.Root link="#" isActive>
                                <Link.Label>Profile</Link.Label>
                            </Link.Root>
                            <Link.Root link="#">
                                <Link.Label>Manage Account</Link.Label>
                            </Link.Root>
                            <Link.Root link="#">
                                <Link.Label>Notifications</Link.Label>
                            </Link.Root>
                            <Link.Root link="#">
                                <Link.Label>Manage Subscription</Link.Label>
                            </Link.Root>
                        </div>
                    </div>
                    <Separator orientation='vertical' className='mx-2' />
                    <div className='w-2/4 overflow-y-auto'>
                        <Title className='text-md'>Profile</Title>
                        <Caption>This is how client will see you when they book with you.</Caption>
                        <Separator className='my-4' />
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='businessName' size='sm' className=' font-medium'>Business Name</Label>
                            <Input id='businessName' value={"LadyPlutoLooks"} disabled />
                            <Caption className='text-xs'>This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.</Caption>
                        </div>
                        <div className='flex flex-col gap-2 mt-6'>
                            <Label htmlFor='email' size='sm' className=' font-medium'>Email</Label>
                            <Input id='email' value={"abijah.nez@gmail.com"} />
                            <Caption className='text-xs'>You can manage verified email addresses in your email settings.</Caption>
                        </div>
                        <div className='flex flex-col gap-2 mt-6'>
                            <Label htmlFor='email' size='sm' className=' font-medium'>URLs</Label>
                            <Caption className='text-xs'>Add links to your website, blog, or social media profiles.</Caption>
                            <Input value={"https://www.afroallure.com/ladyplutolooks"} />
                            <Input value={"https://www.google.com"} />
                            <div className='mb-1 ml-1'>
                                <Button.Root variant="outlined" size='xs' className='rounded'
                                    intent="gray">
                                    <Button.Label className='text-xs font-medium'>Add URL</Button.Label>
                                </Button.Root>
                            </div>

                        </div>
                    </div>

                </div>
            </Card>
        </div>
    );
}

export default Page;
