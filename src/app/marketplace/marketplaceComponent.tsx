'use client'

import React, { useEffect, useState } from 'react';
import LOGO from '../../../public/images/logo_transparent_background.png'
import BUSINESS_LOGO from '../../../public/images/business_logo.jpg'
import { AspectRatio, Autocomplete, Button, CircularProgress, Divider, Input, Link, Option, Select, Skeleton, Tooltip, Typography } from '@mui/joy';
import Image from 'next/image';
import { LocateFixed } from 'lucide-react';
import { findNearbyStylists, getPopularServicesFromMultipleBusinesses } from './actions';
import { PostgrestError } from '@supabase/supabase-js';


export const MarketplaceComponent = () => {
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const categories = ['Locs', 'Braids', 'Nails', 'Makeup', 'Wig Install', 'Lashes']
    const [businessesNearUser, setBusinessesNearUser] = useState<any[] | null>(null)
    const [popularServices, setPopularServices] = useState<any[] | null>(null)
    const getPopularServices = async (businesses: any[]) => {
        const services = await getPopularServicesFromMultipleBusinesses(businesses, Intl.DateTimeFormat().resolvedOptions().timeZone)
        console.log(services)
        return services
    }
    useEffect(() => {
        (async () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                        const businesses = await findNearbyStylists(position.coords.latitude, position.coords.longitude, 10)
                        if (!(businesses instanceof PostgrestError)) {
                            setBusinessesNearUser(businesses)
                            const services = await getPopularServices(businesses)
                            setPopularServices(services)
                        }
                    },
                    (err) => {
                        setError(err.message);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                setError("Geolocation is not supported by this browser.");
            }
        })()

    }, []);
    const [error, setError] = useState<any>(null)
    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!location && businessesNearUser !== null) {
        return <div className='flex w-full h-screen justify-center items-center'><CircularProgress /></div>;
    }
    return (
        <div>
            <nav className="w-full py-2 hidden md:flex justify-center bg-white sticky top-0 z-50">
                <div className="w-[1280px] flex justify-between">
                    <div>
                        <Image src={LOGO} alt="logo-img" width={150} />
                    </div>
                    <div className="flex gap-20">
                        <div className="flex gap-10">
                            <Link href="#features" color="neutral" fontSize={12}>Send Feedback</Link>
                            <Link color="neutral" href='#about' fontSize={12}>Help</Link>
                        </div>
                    </div>

                </div>
            </nav>
            <div className='w-full flex justify-center mt-10'>
                <div className='w-[1280px]'>
                    <Typography level='h1'>Stylist Marketplace</Typography>
                    <div className='my-5 flex gap-2'>
                        <Autocomplete size='sm' defaultValue={location !== null ? undefined : 'Current Location'} startDecorator={<LocateFixed size={16} />} className='max-w-min' placeholder='Select Location' options={['Current Location']} />
                        <Button variant='plain' className='gap-2'>Search for a stylist/service</Button>
                    </div>
                    <div className='mt-10'>
                        <Typography level='h4'>Professionals Near You</Typography>
                        <div className='mt-2 flex gap-2  overflow-y-scroll scrollbar-hide'>
                            {businessesNearUser ? businessesNearUser.map((business, index) => {
                                return (
                                    <div key={index} className='w-[136px] cursor-pointer'>
                                        <div className='flex flex-col items-center border p-4 rounded'>
                                            <Image
                                                src={BUSINESS_LOGO}
                                                alt="business_logo"
                                                width={100}
                                                height={100}
                                                className="rounded-full object-cover"
                                            />
                                            <div className='text-center mt-2'>
                                                <p className='text-lg font-medium'>{business.business_name}</p>
                                                <p className='text-sm font-light'>
                                                    {business.distance_meters
                                                        ? `${(Number(business.distance_meters) / 1609.34).toFixed(2)} miles away`
                                                        : 'Distance unavailable'}
                                                </p>
                                            </div>
                                        </div>



                                    </div>
                                )
                            }) : <div className='flex gap-2 overflow-y-scroll scrollbar-hide w-full'>
                                <div className='w-[136px] h-[182px]'>
                                    <AspectRatio ratio={'3/4'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                                <div className='w-[136px] h-[182px]'>
                                    <AspectRatio ratio={'3/4'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                                <div className='w-[136px] h-[182px]'>
                                    <AspectRatio ratio={'3/4'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                            </div>}
                        </div>
                    </div>
                    <div className='mt-10'>
                        <Typography level='h4'>Popular Services Near You</Typography>
                        <div className='mt-2 flex gap-2  overflow-y-scroll scrollbar-hide'>
                            {popularServices !== null ? popularServices.map((service, index) => {
                                return (
                                    <div key={index}>
                                        <ServiceCard service={service.service_data} business_name={service.business.business_name} />
                                    </div>
                                )
                            }) : <div className='flex gap-2 overflow-y-scroll scrollbar-hide w-full'>
                                <div className='w-[182px] h-[136xpx]'>
                                    <AspectRatio ratio={'12/9'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                                <div className='w-[182px] h-[136xpx]'>
                                    <AspectRatio ratio={'12/9'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                                <div className='w-[182px] h-[136xpx]'>
                                    <AspectRatio ratio={'12/9'}>
                                        <Skeleton>

                                        </Skeleton>
                                    </AspectRatio>
                                </div>
                            </div>}
                        </div>
                    </div>
                    <div className='mt-10'>
                        <Typography level='h4'>Categories</Typography>
                        <div className='mt-2 flex gap-2  overflow-y-scroll scrollbar-hide'>
                            {categories.map((name, index) => {
                                return (
                                    <div key={index}>
                                        <CategoryCard name={name} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className='mt-10'>
                        <Typography level='h4'>Deals and Promotions</Typography>
                        <div className='mt-2 flex gap-2  overflow-y-scroll scrollbar-hide'>
                            {categories.map((name, index) => {
                                return (
                                    <div key={index}>
                                        <div className="relative border rounded-md w-[240px] p-3 h-[210px] overflow-hidden">
                                            <Typography level="h4">15% off all Braiding Services</Typography>
                                            <Typography>LadyPlutoLooks</Typography>

                                            {/* Clipped logo */}
                                            <div className="absolute bottom-[-30px] right-[-30px] w-[150px] h-[150px] overflow-hidden">
                                                <Image
                                                    src={BUSINESS_LOGO}
                                                    alt="business_logo"
                                                    width={150}
                                                    height={150}
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const CategoryCard = ({ name }: { name: string }) => {
    return (
        <div className=' flex items-center justify-center w-[240px] h-[110px] cursor-pointer py-10 border rounded-lg'>
            <Typography sx={{
                fontSize: 20,
                fontWeight: 600,
                textAlign: 'center',

            }}>{name}</Typography>
        </div>
    )
}

const ServiceCard = ({ service, business_name }: { service: any, business_name: string }) => {
    return (
        <div className=' flex justify-start flex-col max-w-[250px] w-[250px]  cursor-pointer px-5 py-5 border rounded-lg'>
            <Typography sx={{
                fontSize: 20,
                fontWeight: 700,


            }}>{service.name}</Typography>
            <p>{business_name}</p>
            <p>${service.price / 100}</p>
            {/* <p className='flex gap-1'>{service.categories.map((category: any, index: number) => {
                return <p className='text-sm font-light' key={index}> {`${category}`}</p>
            })}</p> */}

        </div>
    )
}

