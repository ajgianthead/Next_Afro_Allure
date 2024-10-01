import Input from '@components/Input'
import { Caption, Text, Title } from '@tailus-ui/typography'
import Image from 'next/image'
import React from 'react'

export default function page() {
    return (
        <div className='w-full h-screen flex overflow-hidden'>
            <div className='w-[40%] h-full flex-col p-5'>
                <Input variant='outlined' placeholder='Search for a service' />
                <div className='mt-8 overflow-scroll h-full'>
                    <div className='flex flex-col gap-2 mr-5'>
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                        <ServiceCard />
                    </div>
                </div>
            </div>

            <div className='w-[60%] h-full flex-col p-5'>1</div>
        </div>
    )
}

const ServiceCard = () => {
    return (
        <div className='rounded-md border border-[#ECECEC] w-[100%] flex h-[150px]'>

            <Image style={{
                // height: '100%',
                // width: '35%'
            }} objectFit='cover' width={150} height={100} src={"https://i.pinimg.com/736x/10/4e/72/104e7265970f38f2521976416662c068.jpg"} alt='locs' />

            <div className='p-3 '>
                <Caption className='text-xs'>Locs</Caption>
                <Title className='font-medium'>Loc Retwist</Title>
                <Text className='font-bold'>$60</Text>
                <Caption className='text-sm'>This is a description for a service. This includes a wash, simple style, and complex style</Caption>
            </div>
        </div>
    )
}
