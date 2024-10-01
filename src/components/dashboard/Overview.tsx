import Card from '@tailus-ui/Card';
import { Caption, Link, Text, Title } from '@tailus-ui/typography';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { data } from '@tailus-ui/visualizations/data';
import ScrollArea from "@components/ScrollArea"


export const StackedCards = () => {
  return (
    <Card variant="outlined" className="w-full border-none">
      <Title as="h2" size="lg" weight="medium" className="mb-1">
        Upcoming Appointments
      </Title>
      <ScrollArea.Root className=" py-2">
        <ScrollArea.Viewport>
          <div className='flex gap-2 '>
            <Card className='min-w-[252.5px]' variant='outlined'>
              <Title as='h4' size="lg" weight={"semibold"}>Loc Retwist with Abijah</Title>
              <Text size={"sm"}>August 29th</Text>
              <Text size={"sm"}>3:00 PM - 6:30 PM</Text>
              <Link size={"sm"} href="#" >View Details</Link>
            </Card>


          </div>
        </ScrollArea.Viewport>

        <ScrollArea.Scrollbar data-orientation="horizontal" orientation="horizontal" />

      </ScrollArea.Root>


      {/* <div className="mt-6 grid gap-6 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
        <div>
          <Caption as="span">New Orders</Caption>

          <div className="mt-2 flex items-center justify-between gap-3">
            <Title as="span">{data[3].Primary * 230}</Title>
            <div className="flex items-center gap-1.5 [--body-text-color:theme(colors.success.600)] dark:[--body-text-color:theme(colors.success.400)]">
              <TrendingUp className="size-4 text-[--body-text-color]" />
              <Text size="sm" className="my-0">
                32%
              </Text>
            </div>
          </div>
        </div>
        <div className="pt-6 sm:pl-6 sm:pt-0">
          <Caption as="span">New Customers</Caption>

          <div className="mt-2 flex items-center justify-between gap-3">
            <Title as="span">{data[3].Accent * 100}</Title>
            <div className="flex items-center gap-1.5 [--body-text-color:theme(colors.danger.600)] dark:[--body-text-color:theme(colors.danger.400)]">
              <TrendingDown className="size-4 text-[--body-text-color]" />
              <Text size="sm" className="my-0">
                15%
              </Text>
            </div>
          </div>
        </div>
        <div className="pt-6 sm:hidden sm:pl-6 sm:pt-0 lg:block">
          <Caption as="span">New Customers</Caption>

          <div className="mt-2 flex items-center justify-between gap-3">
            <Title as="span">{data[3].Accent * 100}</Title>
            <div className="flex items-center gap-1.5 [--body-text-color:theme(colors.danger.600)] dark:[--body-text-color:theme(colors.danger.400)]">
              <TrendingDown className="size-4 text-[--body-text-color]" />
              <Text size="sm" className="my-0">
                15%
              </Text>
            </div>
          </div>
        </div>
      </div> */}
    </Card >
  );
};
