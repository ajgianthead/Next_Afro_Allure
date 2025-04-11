import Card from '@tailus-ui/Card';
import { Caption, Link, Text, Title } from '@tailus-ui/typography';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { data } from '@tailus-ui/visualizations/data';
import ScrollArea from "@components/ScrollArea"


export const StackedCards = () => {
  return (
    <Card variant="outlined" className="w-full lg:w-[calc(100vw-20rem)] border-none">
      <Title as="h2" size="lg" weight="medium" className="mb-1">
        Upcoming Appointments
      </Title>
      {/* <div className="py-2 h-max w-full overflow-x-scroll flex gap-2">
        <AppointmentCard />
        <AppointmentCard />
        <AppointmentCard />
        <AppointmentCard />
        <AppointmentCard />
      </div> */}
      <div className="p-10 flex justify-center items-center h-max w-full">
        <Caption className='italic'>No upcoming appointments</Caption>
      </div>
    </Card >
  );
};

const AppointmentCard = () => {
  return (
    <div>
      <div>
        <Card className='w-max' variant='outlined'>
          <Title as='h4' size="lg" weight={"semibold"}>Loc Retwist with Abijah</Title>
          <Text size={"sm"}>August 29th</Text>
          <Text size={"sm"}>3:00 PM - 6:30 PM</Text>
          <Link size={"sm"} href="#" >View Details</Link>
        </Card>
      </div>
    </div>
  )
}
