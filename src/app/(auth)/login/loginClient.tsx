'use client'

import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Link, Caption, Title } from '@tailus-ui/typography';
import Input from '@components/Input';
import Label from '@components/Label';
import Separator from '@tailus-ui/Separator';
import { FcGoogle } from "react-icons/fc";
import { login } from '../actions';
import Aligner from '@components/Aligner';
import Switch from '@components/Switch';
import { useState } from 'react';


export default function Login() {
    const [asBusiness, setAsBusiness] = useState(false);

    return (
        <main className="inset-0 z-10 m-auto h-fit max-w-xl px-6 py-12 lg:absolute">
            <Card className="relative h-fit p-1 mt-6 shadow-xl shadow-gray-950/10" variant="mixed">
                <div data-rounded="large" className="p-10">
                    <div>
                        <Title size="xl" className="mb-1">
                            Sign In to Afro Allure
                        </Title>
                        <Text className="my-0" size="sm">
                            Welcome back! Sign in to continue
                        </Text>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <Button.Root variant="outlined" intent="gray" size="lg" className="w-full">
                            <Button.Icon type="leading" size="sm">
                                <FcGoogle />
                            </Button.Icon>
                            <Button.Label>Google</Button.Label>
                        </Button.Root>
                    </div>

                    <form className="mx-auto mt-8 space-y-6">
                        <div className="space-y-6 rounded-[--btn-radius] shadow-sm shadow-gray-500/5">
                            <div className="relative my-6 grid items-center gap-3 [grid-template-columns:1fr_auto_1fr]">
                                <Separator className="h-px border-b" />
                                <Caption as="span" className="block" size="sm">
                                    Or continue with
                                </Caption>
                                <Separator className="h-px border-b" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input id="email" name="email" type="email" required variant="outlined" size="md" />
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <Label size="sm" htmlFor="password">
                                            Password
                                        </Label>
                                        <Link href="#" size="sm">
                                            Forgot your Password ?
                                        </Link>
                                    </div>
                                    <Input id="password" name="password" type="password" required variant="outlined" size="md" />
                                </div>
                            </div>
                        </div>
                        <Aligner fromRight className="max-w-md">
                            <Label htmlFor="airplane-mode">
                                Business Account
                            </Label>
                            <Switch.Root checked={asBusiness} onCheckedChange={(e) => {
                                setAsBusiness(e)

                            }} className="mt-1" id="airplane-mode">
                                <Switch.Thumb />
                            </Switch.Root>
                            <Caption as="p" size="base">Log in to your Afro Allure business account</Caption>
                        </Aligner>

                        <Button.Root type='submit' formAction={login} className="w-full">
                            <Button.Label>Sign In</Button.Label>
                        </Button.Root>
                    </form>
                </div>

                <Card variant="soft" data-shade="925" className="rounded-[calc(var(--card-radius)-0.25rem)] dark:bg-gray-925">
                    <Caption className="my-0" size="sm" align="center">
                        Don't have an account ?{' '}
                        <Link intent="neutral" size="sm" variant="underlined" href="/register">
                            Create account
                        </Link>
                    </Caption>
                </Card>
            </Card>
        </main>
    );
}
