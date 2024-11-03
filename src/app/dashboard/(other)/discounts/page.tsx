import Button from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Link, Text, Title } from '@tailus-ui/typography'
import { Plus } from 'lucide-react'
import React from 'react'

export default function page() {
    return (
        <div>
            <main>
                <div className='p-6 w-full'>
                    <Button.Root variant='soft' className='my-2'>Create Discount</Button.Root>
                    <div className=' inline-flex flex-wrap gap-5'>
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                        <DiscountCard />
                    </div>
                </div>
            </main>
        </div>
    )
}


const DiscountCard = () => {
    return (
        <div>
            <Card className='max-w-[400px] min-w-[350px] space-y-1'>
                <Title>Loc Discount</Title>
                <div>
                    <Caption>Expiration Date: 8/23/2024</Caption>
                    <Caption>Discount Percentage: 50%</Caption>
                </div>
                <div>
                    <Link>View Details</Link>
                </div>
            </Card>
        </div>
    );
}


