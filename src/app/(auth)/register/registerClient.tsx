'use client'

import Card from '@tailus-ui/Card';
import Button from '@tailus-ui/Button';
import { Text, Link, Caption, Title } from '@tailus-ui/typography';
import Input from '@components/Input';
import Label from '@components/Label';
import Separator from '@tailus-ui/Separator';
import { FcGoogle } from "react-icons/fc";
import Aligner from '@components/Aligner';
import Switch from '@components/Switch';
import { useState } from 'react';
import { createClient } from '@utils/supabase/client';
import { Database } from '../../../../lib/database.types';
import CircularProgress from '@mui/joy/CircularProgress';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/joy';
import { register } from '../actions';
import { PostgrestError } from '@supabase/supabase-js';


interface RegisterForm {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export default function Register() {
    const [asBusiness, setAsBusiness] = useState(false);
    const [formData, setFormData] = useState<RegisterForm>({
        name: "",
        email: "",
        password: "",
        phone: ""
    })
    const router = useRouter()
    const createBusiness = async () => {
        setIsLoading(true)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        if (asBusiness) {
            const result = await register({ name: formData.name, email: formData.email, password: formData.password })
            if (result === "Business name is already taken") {
                setError(result)
                setIsLoading(false)
            }
            else if (result === "Email is already in use") {
                setError(result)
                setIsLoading(false)
            }
            else if (result instanceof PostgrestError) {
                setError(result.message)
                setIsLoading(false)

            } else {
                router.replace(`/onboarding/${result.business_users?.stripe_acc_id}`)
                setIsLoading(false)

            }
        } else {
            const result = await fetch("/api/auth/register/client_user", {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify({
                    "email": formData.email,
                    "password": formData.password,
                    "phone_number": formData.phone
                }),
            })
            //let res = await result.json()
        }

    }
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)
    return (
        <main className="inset-0 z-10 m-auto h-fit max-w-xl px-6 py-12 lg:absolute">
            <Card className="relative h-fit p-1 mt-28 shadow-xl shadow-gray-950/10" variant="mixed">
                <div data-rounded="large" className="p-10">
                    <div>
                        <Title size="xl" className="mb-1">
                            Register with Afro Allure
                        </Title>
                        <Text className="my-0" size="sm">
                            Welcome to Afro Allure! Register either as a regular user or as a business
                        </Text>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <Button.Root disabled={isLoading} variant="outlined" intent="gray" size="lg" className="w-full">
                            <Button.Icon type="leading" size="sm">
                                <FcGoogle />
                            </Button.Icon>
                            <Button.Label>Google</Button.Label>
                        </Button.Root>
                    </div>

                    <div className="mx-auto mt-8 space-y-6">
                        <div className="space-y-4 rounded-[--btn-radius] shadow-sm shadow-gray-500/5">
                            <div className="relative my-6 grid items-center gap-3 [grid-template-columns:1fr_auto_1fr]">
                                <Separator className="h-px border-b" />
                                <Caption as="span" className="block" size="sm">
                                    Or continue with
                                </Caption>
                                <Separator className="h-px border-b" />
                            </div>
                            {error ? <Alert variant='soft' color='danger' >Error: {error}</Alert>
                                : <></>}
                            <div className="space-y-4">
                                {asBusiness ? <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="name">
                                        Business Name
                                    </Label>
                                    <Input disabled={isLoading} value={formData.name} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            name: e.target.value
                                        })
                                    }} id="name" name="name" required variant="outlined" size="md" />
                                </div> : <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="phone">
                                        Phone Number
                                    </Label>
                                    <Input disabled={isLoading} value={formData.phone} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value
                                        })
                                    }} id="phone" name="phone" required variant="outlined" size="md" />
                                </div>}
                                <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input disabled={isLoading} value={formData.email} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            email: e.target.value
                                        })
                                    }} id="email" name="email" type="email" required variant="outlined" size="md" />
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <Label size="sm" htmlFor="password">
                                            Password
                                        </Label>
                                    </div>
                                    <Input disabled={isLoading} value={formData.password} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            password: e.target.value
                                        })
                                    }} id="password" name="password" type="password" required variant="outlined" size="md" />
                                </div>
                            </div>
                        </div>
                        <Aligner fromRight className="max-w-md">
                            <Label htmlFor="airplane-mode">
                                Register as Business
                            </Label>
                            <Switch.Root disabled={isLoading} checked={asBusiness} onCheckedChange={(e) => {
                                setAsBusiness(e)

                            }} className="mt-1" id="isBusiness" name='isBusiness'>
                                <Switch.Thumb />
                            </Switch.Root>
                            <Caption as="p" size="base">Join Afro Allure as a business by toggling the switch</Caption>
                        </Aligner>

                        <Button.Root disabled={isLoading} onClick={createBusiness} className="w-full">
                            <Button.Label className='flex items-center'>{isLoading ? <CircularProgress size='sm' /> : "Create an Account"}</Button.Label>
                        </Button.Root>
                    </div>
                </div>

                <Card variant="soft" data-shade="925" className="rounded-[calc(var(--card-radius)-0.25rem)] dark:bg-gray-925">
                    <Caption className="my-0" size="sm" align="center">
                        Already have an account ?{' '}
                        <Link intent="neutral" size="sm" variant="underlined" href={!isLoading ? "/login" : ""}>
                            Sign In
                        </Link>
                    </Caption>
                </Card>
            </Card>
        </main>
    );
}
