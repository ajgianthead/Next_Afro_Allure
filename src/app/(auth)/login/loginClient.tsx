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
import { AuthError } from '@supabase/supabase-js';
import { Alert, CircularProgress } from '@mui/joy';
import { useRouter } from 'next/navigation';


export default function Login() {
    const [asBusiness, setAsBusiness] = useState(false);
    const [error, setError] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const router = useRouter()
    const [cred, setCred] = useState({
        email: "",
        password: ""
    })
    const handleSubmit = async () => {
        setLoading(true)
        const res = await login(cred)
        if (res instanceof AuthError) {
            setError(res.message)
        }
        else {
            router.replace('/dashboard')
        }
    }

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



                    <form className="mx-auto mt-8 space-y-6">
                        <div className="space-y-6 rounded-[--btn-radius] shadow-sm shadow-gray-500/5">
                            {error ? <Alert variant='soft' color='danger' >Error: {error}</Alert>
                                : <></>}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="email">
                                        Email
                                    </Label>
                                    <Input value={cred.email} onChange={(e) => {
                                        setCred({
                                            ...cred,
                                            email: e.target.value
                                        })
                                    }} id="email" name="email" type="email" required variant="outlined" size="md" />
                                </div>
                                <div className="space-y-2.5">
                                    {/* <div className="flex items-center justify-between">
                                        <Label size="sm" htmlFor="password">
                                            Password
                                        </Label>
                                        <Link href="#" size="sm">
                                            Forgot your Password ?
                                        </Link>
                                    </div> */}
                                    <Input value={cred.password} onChange={(e) => {
                                        setCred({
                                            ...cred,
                                            password: e.target.value
                                        })
                                    }} id="password" name="password" type="password" required variant="outlined" size="md" />
                                </div>
                            </div>
                        </div>


                        <Button.Root disabled={loading} type='submit' onClick={handleSubmit} className="w-full">
                            <Button.Label>{loading ? <CircularProgress size='sm' /> : "Sign In"}</Button.Label>
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
