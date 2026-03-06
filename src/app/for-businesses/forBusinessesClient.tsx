// Assume you're using Tailwind CSS or similar
'use client'
import { Button, Card, CardContent, CardCover, Chip, Divider, IconButton, Link, List, ListItem, ListItemDecorator, Tooltip, Typography } from "@mui/joy";
import Image, { StaticImageData } from "next/image";
import LOGO from '../../../public/images/logo_transparent_background.png'
import { BadgeDollarSign, Calendar, Check, Globe, Lightbulb, Menu, MessageCircleMore, TrendingUp } from "lucide-react";
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import HERO_BACKGROUND from '../../../public/images/magicpattern-grid-pattern-1753632850729.png'
import HAIR_BACKGROUND from '../../../public/images/hairbackground.jpg'

import HERO_IMAGE from '../../../public/images/localhost_3000_dashboard_appointments.png'
import MONEY_IMG from '../../../public/images/localhost_3000_dashboard_monetization.png'

import LandingPageNavDrawer from "../landingPageNavDrawer";
import { motion } from "motion/react"
import { Caption } from "@tailus-ui/typography";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { fetchBusinessUser, fetchUser } from "app/dashboard/(other)/actions";
import { User } from "@supabase/supabase-js";
import { createSubscriptionCheckout } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaApplePay, FaGooglePay } from "react-icons/fa";
import { SiCashapp } from "react-icons/si";
import { FooterCentered } from "app/landingPage";



export const theme = extendTheme({
    "colorSchemes": {
        "light": {
            "palette": {
                "primary": {
                    "50": "#FFEBEB",
                    "100": "#FECFCF",
                    "200": "#FEB4B4",
                    "300": "#FD9898",
                    "400": "#FD7D7D",
                    "500": "#FC6161",
                    "600": "#D54949",
                    "700": "#AF3131",
                    "800": "#881818",
                    "900": "#610000"
                }
            }
        },
        "dark": {
            "palette": {}
        }
    }
})

interface PageProps {
    user: User | null
    business: Business | null
}

export default function ForBusinesses({ user, business }: PageProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingFree, setIsLoadingFree] = useState<boolean>(false)

    return (
        <CssVarsProvider theme={theme}>
            <div className="bg-white text-gray-900 font-sans">
                <nav className="w-full py-2 hidden md:flex justify-center bg-white sticky top-0 z-50">
                    <div className="w-[1280px]  flex justify-between">
                        <div>
                            <Image src={LOGO} alt="logo-img" width={150} />
                        </div>
                        <div className="flex gap-20">
                            <div className="flex gap-10">
                                <Link href="/" color="neutral" fontSize={12}>Home</Link>

                                <Link href="#features" color="neutral" fontSize={12}>Features</Link>
                                <Link color="neutral" href='#pricing' fontSize={12}>Pricing</Link>
                            </div>
                            {!user ? <div className="flex items-center gap-5">
                                <Button component='a' role="link" href="/register">Register your Business</Button>
                                <Button component='a' role="link" href="/login" variant="outlined">Login</Button>
                            </div> : <div className="flex items-center gap-5">
                                <Button component='a' role="link" href="/dashboard">Business Dashboard <ArrowRightIcon /></Button>
                            </div>}
                        </div>

                    </div>
                </nav>
                <div className="md:hidden sticky top-0 z-50">
                    <LandingPageNavDrawer forBusinesses={true} />
                </div>
                <header className="relative bg-white flex flex-col z-10 items-center justify-center text-center w-full gap-5">
                    <div className="w-full h-[430px]">
                        <Image className="absolute z-[0] lg:object-cover object-fit  top-0" width={1600} src={HAIR_BACKGROUND} alt="background" />
                        <div className="w-full h-full bg-[linear-gradient(45deg,_var(--tw-gradient-stops))] from-white to-[#ffffff60] absolute ">
                            <div className=" pt-24 grid lg:grid-cols-3 grid-cols-1">
                                <div className="text-start lg:ml-32 ml-10 flex flex-col gap-6 col-span-2">
                                    <div>
                                        <p className="text-5xl font-bold">
                                            Get <span className="text-[#FC6161]">Discovered.</span>
                                        </p>
                                        <p className="text-5xl font-bold">
                                            Get <span className="text-[#FC6161]">Booked.</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-normal">AfroAllure gives Black stylists the tools to create a professional online presence, accept bookings, and manage their services — all in one place.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button component='a' role="link" href="/register" className="flex items-center gap-1">Join for Free<ArrowRightIcon /></Button>
                                    </div></div>

                            </div>
                        </div>

                    </div>


                </header>
                <section className="py-16 px-6 bg-white md:px-16 z-20 relative" id="features">
                    <div className="bg-white">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-medium font-[Inter] lg:px-32 text-center justify-self-end text-[#FC6161]">Features</p>
                            <div className="mb-10">
                                <p className="text-6xl font-normal font-[Inter] mb-2  lg:px-32 text-center">Everything You Need to Run & Automate Your Business</p>
                                <p className="text-center text-lg lg:px-32">Everything you need to run a modern beauty business—booking, payments, branding, and client management—without unnecessary complexity.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-rows-2 md:grid-cols-6 gap-2">
                            <div className="col-span-3">
                                <Feature

                                    title="Smart Booking Calendar"
                                    desc="Automated, conflict-free scheduling that lets clients book only when you're available"
                                    image={HERO_IMAGE}
                                />
                            </div>
                            <div className="col-span-3">
                                <Feature
                                    title="Integrated Payments"
                                    desc="Get paid fast and securely. Accept deposits and/or full payments online"
                                    image={MONEY_IMG}
                                /></div>
                            <div className="col-span-4">
                                <Feature
                                    title="Business & Earnings Analytics"
                                    desc="Track your income, appointments, and top-performing services at a glance"
                                    image={MONEY_IMG}
                                />
                            </div>
                            <div className="col-span-2">
                                <Feature
                                    title="Free Public Booking Page"
                                    desc="Showcase your services, pricing, and availability with a beautiful, mobile-ready booking page"
                                    image={MONEY_IMG}
                                />
                            </div>
                        </div></div>

                </section>

                <section id="about" className="flex w-full justify-center z-20 relative py-24  text-white bg-[#272635]">
                    <div className="w-[1280px] gap-5 flex items-center text-center flex-col">
                        <Typography level="h4"></Typography>
                        <div className="lg:px-48">
                            <Typography sx={{ color: 'white' }} level="h2">Why AfroAllure?</Typography>
                        </div>
                        <div className="flex justify-center px-20 items-center flex-col gap-2">
                            <Typography sx={{ color: 'white' }}>AfroAllure was created for stylists, barbers, braiders, and beauty pros who are tired of being overlooked. We know how hard it is to grow a business when you're hidden by the algorithm, underbooked, or working in a city where your work isn’t seen or understood. Most platforms prioritize scale over people—owning your clients, locking features behind fees, and forcing you into systems that don’t fit how beauty businesses actually work.
                            </Typography>
                            <Typography sx={{ color: 'white' }}>That’s why AfroAllure gives you the tools to run your business your way — from booking and payments to client management and visibility. And the best part? It’s made specifically with Black beauty in mind, so you're not just another listing — you're part of a movement.
                            </Typography>
                            <Typography sx={{ color: 'white', marginTop: 3 }} className="font-bold">AfroAllure flips that.
                            </Typography>
                        </div>
                    </div>
                </section>
                <section className="py-16 px-6 bg-white md:px-16 z-20 relative" id="pricing">
                    <div className="bg-white">
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-medium font-[Inter] lg:px-32 text-center justify-self-end text-[#FC6161]">Pricing</p>
                            <div className="mb-10">
                                <p className="text-6xl font-normal font-[Inter] mb-2  lg:px-32 text-center">Plans & Pricing</p>
                                <p className="text-center text-lg lg:px-32">Select a plan and start growing your business</p>
                            </div>
                        </div>
                        <div className=" lg:px-48 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Card variant="outlined">
                                <CardContent>
                                    <Card variant="soft">
                                        <CardContent>
                                            <Chip size="sm" variant="outlined" color="neutral">
                                                Starter
                                            </Chip>
                                            <div className="flex flex-col gap-3">
                                                <Typography level="h2">Free</Typography>
                                                <Caption>Free Forever</Caption>
                                                <Button disabled={isLoading} loading={isLoadingFree} onClick={() => {
                                                    setIsLoadingFree(true)
                                                    router.push('/register')
                                                    setIsLoadingFree(false)

                                                }}>Join for free <ArrowRightIcon /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Caption>Starter Plan includes:</Caption>
                                    <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Limit of 10 monthly bookings
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Basic Webpage Builder
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Appointment Comfirmation Emails
                                        </ListItem>
                                        <ListItem>

                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Clientele Management
                                        </ListItem>
                                        <ListItem>

                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Booking Notifications
                                        </ListItem>
                                        <ListItem>

                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Debit & Credit Card Payment Processing
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                            <Card variant="outlined">
                                <CardContent>
                                    <Card variant="soft">
                                        <CardContent>
                                            <div className="flex gap-1">
                                                <Chip size="sm" variant="outlined" color="neutral">
                                                    Growth
                                                </Chip>
                                                <Chip size="sm" variant="solid" color="primary">
                                                    Recommended
                                                </Chip>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <Typography level="h2" sx={{ mr: 'auto' }}>
                                                    $25{' '}
                                                    <Typography textColor="text.tertiary" sx={{ fontSize: 'sm' }}>
                                                        / month
                                                    </Typography>
                                                </Typography>
                                                <div><Caption>14-Day free trial included. No credit card required</Caption>
                                                </div>

                                                <Button loading={isLoading} disabled={isLoadingFree} onClick={async () => {
                                                    setIsLoading(true)
                                                    if (business === null) {
                                                        router.push('/register?subscription=true')
                                                    } else {
                                                        const customerId = business?.stripe_customer_id
                                                        const session = await createSubscriptionCheckout(business.had_trial, business?.business_id!, customerId?.length ? customerId : undefined)
                                                        router.push(session.url!)
                                                    }
                                                    setIsLoading(false)
                                                }}>Start 14-day free trial <ArrowRightIcon /></Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Caption>Growth Plan includes:</Caption>
                                    <List size="sm" sx={{ mx: 'calc(-1 * var(--ListItem-paddingX))' }}>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            <b className="text-[#FC6161]">Everything in Starter Plan</b>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Unlimited Monthly Bookings
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Customizable Drag & Drop Webpage Builder
                                        </ListItem>
                                        <ListItem>
                                            <div className="flex items-start gap-2">
                                                <ListItemDecorator>
                                                    <Check />
                                                </ListItemDecorator>
                                                <div className="flex flex-col items-start">
                                                    Multiple Payment Processing Methods, including:
                                                    <div className="flex gap-3 items-center">
                                                        <FaGooglePay size={40} />
                                                        <FaApplePay size={40} />
                                                        <SiCashapp size={25} />

                                                    </div>
                                                </div>
                                            </div>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Email Appointment Reminders
                                        </ListItem>
                                        <ListItem>
                                            <ListItemDecorator>
                                                <Check />
                                            </ListItemDecorator>
                                            Booking Analytics
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </section>
                <section className="flex w-full justify-center z-20 relative py-24 bg-[#272635]">
                    <div className="w-[1280px] gap-5 flex items-center text-center flex-col">
                        <div className="lg:px-48">
                            <Typography sx={{ color: 'white' }} level="h2">Now in Open Beta — Finally, a Booking Platform That Gets It</Typography>
                        </div>
                        <div className="lg:px-48">
                            <Typography sx={{ color: 'white' }}>We're publicly beta testing AfroAllure to build the best possible platform for Black stylists.
                                During this phase, you get early access to core features and can help shape the platform. All for <strong>FREE </strong>
                                This is your chance to grow with us — and stay ahead of the curve.</Typography>
                        </div>
                        <Button sx={{ color: 'white' }} variant="outlined" component='a' role="link" href="/register">Start Booking with AfroAllure</Button>
                    </div>
                </section>

                <FooterCentered />
            </div >
        </CssVarsProvider>

    );
}

const AnimatedImage = motion.create(Image)

function Feature({ title, desc, image }: { title: string, desc: string, image: StaticImageData }) {
    return (
        <Card variant="soft" sx={{
            boxShadow: 10,
            height: '100%'
        }}>
            <div>
                <Image src={image} alt="image" />
            </div>
            <CardContent className='text-center flex justify-end'>
                <div>
                    <p className="text-xl font-semibold">{title}</p>
                    <p className="text-md text-slate-400 font-normal">{desc}</p>
                </div>
            </CardContent>
        </Card>
    );
}
