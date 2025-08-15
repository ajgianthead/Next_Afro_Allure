// Assume you're using Tailwind CSS or similar
'use client'

import { Button, Card, IconButton, Link, Tooltip, Typography } from "@mui/joy";
import Image from "next/image";
import LOGO from '../../public/images/logo_transparent_background.png'
import { BadgeDollarSign, Calendar, Globe, Lightbulb, Menu, MessageCircleMore, TrendingUp } from "lucide-react";
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import HERO_BACKGROUND from '../../public/images/magicpattern-grid-pattern-1753632850729.png'
import HERO_IMAGE from '../../public/images/localhost_3000_dashboard_appointments.png'
import MONEY_IMG from '../../public/images/localhost_3000_dashboard_monetization.png'

import LandingPageNavDrawer from "./landingPageNavDrawer";
import { motion } from "motion/react"
import { Caption } from "@tailus-ui/typography";

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


export default function LandingPage() {
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
                                <Tooltip title='Feature Coming Soon' arrow size="sm">
                                    <Link disabled color="neutral" fontSize={12}>Marketplace</Link>
                                </Tooltip>
                                <Link href="#features" color="neutral" fontSize={12}>Features</Link>
                                <Link color="neutral" href='#about' fontSize={12}>About</Link>
                            </div>
                            <div className="flex items-center gap-5">
                                <Button component='a' role="link" href="/register">Register your Business</Button>
                                <Button component='a' role="link" href="/login" variant="outlined">Login</Button>
                            </div>
                        </div>

                    </div>
                </nav>
                <div className="md:hidden sticky top-0 z-50">
                    <LandingPageNavDrawer />
                </div>
                <header className="relative bg-white flex flex-col px-10 z-10 items-center text-center w-full gap-5 pt-24 mb-10">
                    <Image className="absolute z-[-1] w-full h-[730px] blur-lg bg-cover top-0" src={HERO_BACKGROUND} alt="background" />
                    <div className="flex flex-col items-center gap-5">
                        <div className=" lg:px-48">
                            <Typography level="h1">Empowering black-owned beauty businesses with advanced tools and features</Typography>

                        </div>
                        <div className=" lg:px-72">
                            <Typography>AfroAllure connects Black stylists and professionals with the people who need them — offering powerful tools for booking, branding, and business success.</Typography>
                        </div>
                        <div className="flex gap-2">
                            <Button component='a' role="link" href="/register">Join the Beta Today</Button>
                            <Button variant="outlined">Learn More </Button>
                        </div>
                        <div className="w-2/3 bg-white ">
                            <AnimatedImage initial={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0, transition: { duration: 2 } }} src={HERO_IMAGE} alt="hero-image" className="border-black border-solid rounded-xl shadow-lg" />
                        </div>
                    </div>

                </header>
                <section id="about" className="flex w-full justify-center z-20 relative py-24  text-white bg-[#272635]">
                    <div className="w-[1280px] gap-5 flex items-center text-center flex-col">
                        <Caption className="text-white font-medium">About</Caption>
                        <Typography level="h4"></Typography>
                        <div className="lg:px-48">
                            <Typography sx={{ color: 'white' }} level="h2">Built to put Black beauty professionals on the map</Typography>
                        </div>
                        <div className="flex justify-center px-20 items-center flex-col gap-2">
                            <Typography sx={{ color: 'white' }}>AfroAllure was created for stylists, barbers, braiders, and beauty pros who are tired of being overlooked. We know how hard it is to grow a business when you're hidden by the algorithm, underbooked, or working in a city where your work isn’t seen or understood.</Typography>
                            <Typography sx={{ color: 'white' }}>That’s why AfroAllure gives you the tools to run your business your way — from booking and payments to client management and visibility. And the best part? It’s made specifically with Black beauty in mind, so you're not just another listing — you're part of a movement.
                            </Typography>
                            <Typography sx={{ color: 'white', marginTop: 3 }} className="font-bold">You’ve got the talent. We’ve got the platform.

                            </Typography>
                        </div>
                    </div>
                </section>

                <section className="py-16 px-6 md:px-16" id="features">
                    <h2 className="text-3xl font-bold mb-8 text-center">Everything You Need to Run Your Business</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <Feature

                            title="Smart Booking Calendar"
                            desc="Automated, conflict-free scheduling that lets clients book only when you're available"
                            icon={<Calendar color="purple" />}
                        />
                        <Feature
                            title="Integrated Payments"
                            desc="Get paid fast and securely. Accept deposits and/or full payments online"
                            icon={<BadgeDollarSign color="green" />}
                        />
                        <Feature
                            title="Business & Earnings Analytics"
                            desc="Track your income, appointments, and top-performing services at a glance"
                            icon={<TrendingUp color="lightgreen" />}
                        />
                        <Feature
                            title="Free Public Booking Page"
                            desc="Showcase your services, pricing, and availability with a beautiful, mobile-ready booking page"
                            icon={<Globe color="lightblue" />}
                        />
                        <Feature
                            title="Client Communication Tools"
                            desc="Send appointment reminders, confirmations, and direct updates to your clients."
                            icon={<MessageCircleMore color="brown" />}
                        />
                        <Feature
                            title="All-in-One Simplicity"
                            desc="No confusing tech. Just powerful tools made simple — and made for you."
                            icon={<Lightbulb color="orange" />}
                        />
                    </div>
                </section>
                <section className="xl:pb-80 pb-24 xl:mt-48 mt-20  w-full flex justify-center overflow-x-hidden">
                    <div className="w-[1280px] flex-col xl:flex-row flex justify-start items-center overflow-x-hidden">
                        <div className="xl:w-2/5 w-full flex flex-col gap-5 px-10">
                            <div>
                                <Caption className="font-medium mb-2">Monetization</Caption>
                                <Typography level="h2">Turn Every Appointment Into Opportunity</Typography>

                            </div>
                            <Typography>AfroAllure helps you <strong>earn more</strong> with built-in monetization tools — whether you're working solo or running a team.</Typography>
                            <ul className="pl-5 flex flex-col gap-1 mt-2 list-disc">
                                <li>Integrated payments with deposits, tips, and add-ons</li>
                                <li>Loyalty program to reward repeat clients <span className=" italic">(Coming Soon)</span></li>
                                <li>Product upsells at checkout <span className=" italic">(Coming Soon)</span></li>
                                <li>Analytics to track your best-earning services</li>
                            </ul>

                        </div>
                        <div className="xl:absolute relative xl:mt-0 mt-10 xl:mx-0 mx-10 xl:block hidden">
                            <AnimatedImage initial={{ opacity: 0, translateX: 900 }}
                                whileInView={{ opacity: 1, translateX: 600, transition: { duration: 2 } }} width={1200} height={300} src={MONEY_IMG} alt="montization-image" className="border-black border-solid rounded-xl shadow-lg " />
                        </div>
                        <div className="xl:absolute relative xl:mt-0 mt-10 xl:mx-0 mx-10 xl:hidden block">
                            <AnimatedImage initial={{ opacity: 0, translateX: 200 }}
                                whileInView={{ opacity: 1, translateX: 0, transition: { duration: 2 } }} width={1200} height={300} src={MONEY_IMG} alt="montization-image" className="border-black border-solid rounded-xl shadow-lg " />
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
                        <Button sx={{ color: 'white' }} variant="outlined" component='a' role="link" href="/register">Become a Beta Stylist</Button>
                    </div>
                </section>

                <footer className="py-8 px-6 md:px-16 text-center text-gray-600">
                    &copy; {new Date().getFullYear()} AfroAllure. All rights reserved.
                </footer>
            </div >
        </CssVarsProvider>

    );
}

const AnimatedImage = motion.create(Image)

function Feature({ title, desc, icon }: { title: string, desc: string, icon: any }) {
    return (
        <Card variant="outlined" sx={{
            boxShadow: 10,
        }}>
            <h3 className="text-xl flex gap-2 font-semibold">{icon}{title}</h3>
            <p>{desc}</p>
        </Card>
    );
}
