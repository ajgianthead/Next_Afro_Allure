import AfroAllureLanding from './landingPage';
import { getWaitlistCount } from '@/app/waitlist/actions';

const Page = async () => {
  const waitlistCount = await getWaitlistCount()
  return (
    <div>
      <AfroAllureLanding waitlistCount={waitlistCount} />
    </div>
  );
}

export default Page;
