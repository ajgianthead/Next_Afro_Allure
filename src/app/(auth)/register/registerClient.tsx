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
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Checkbox, Typography } from '@mui/joy';
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
    const searchParams = useSearchParams();
    const subscription = searchParams.get('subscription')
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
        const result = await register({ name: formData.name, email: formData.email, password: formData.password }, subscription === 'true')
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

            if (subscription) {
                router.replace(result.sessionUrl)
            } else {
                router.replace(`/onboarding/${result.user.business_users?.stripe_acc_id}`)
            }

        }

    }
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)
    const [agreement, setAgreement] = useState<{
        privacy: boolean
        terms: boolean
    }>({
        privacy: false,
        terms: false
    })
    return (
        <main className="inset-0 z-10 m-auto h-fit max-w-xl px-6 py-12 lg:absolute">
            <Card className="relative h-fit p-1 mt-18 shadow-xl shadow-gray-950/10" variant="mixed">
                <div data-rounded="large" className="p-10">
                    <div>
                        <Title size="xl" className="mb-1">
                            Register with Afro Allure
                        </Title>
                        <Text className="my-0" size="sm">
                            Welcome to Afro Allure! Fill the form below to register your business with the platform
                        </Text>
                    </div>



                    <div className="mx-auto mt-8 space-y-6">
                        <div className="space-y-4 rounded-[--btn-radius] shadow-sm shadow-gray-500/5">

                            {error ? <Alert variant='soft' color='danger' >Error: {error}</Alert>
                                : <></>}
                            <div className="space-y-4">
                                <div className="space-y-2.5">
                                    <Label size="sm" htmlFor="name">
                                        Business Name
                                    </Label>
                                    <Input disabled={isLoading} value={formData.name} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            name: e.target.value
                                        })
                                    }} id="name" name="name" required variant="outlined" size="md" />
                                </div>
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

                        <div className='flex flex-col gap-2'>
                            <div className="flex items-start gap-2">
                                <Checkbox id="agree" checked={agreement.terms} onChange={(e) => {
                                    setAgreement({
                                        ...agreement,
                                        terms: e.target.checked
                                    })
                                }} />
                                <Caption>
                                    I have read and agree to the{' '}
                                    <Link
                                        href="/beta-user-agreement"
                                        className="font-bold text-sm text-[#FC6161]"
                                        target="_blank"
                                    >
                                        Beta Participation Agreement
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        className="font-bold text-sm text-[#FC6161]"
                                        target="_blank"
                                        href="/terms-of-service"
                                    >
                                        Terms of Service
                                    </Link>.
                                </Caption>
                            </div>
                            <div className="flex items-start gap-2">
                                <Checkbox id="privacy" onChange={(e) => {
                                    setAgreement({
                                        ...agreement,
                                        privacy: e.target.checked
                                    })
                                }} checked={agreement.privacy} />
                                <Caption>
                                    I have read and understand the {' '}
                                    <Link
                                        href="/privacy-policy"
                                        className="font-bold text-sm text-[#FC6161]"
                                        target="_blank"
                                    >
                                        Privacy Policy
                                    </Link>{', '}
                                    including how my personal data will be collected, stored, and used.
                                </Caption>
                            </div>

                        </div>


                        <Button.Root disabled={isLoading || !(formData.name.length > 0 && formData.email.length > 0 && formData.password.length > 0 && agreement.privacy && agreement.terms)} onClick={createBusiness} className="w-full">
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
