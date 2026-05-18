import AfroAllureLanding from './landingPage';
import { getWaitlistCount } from '@/app/waitlist/actions';
import { getFoundingMemberCount } from '@/lib/foundingMember';

const Page = async () => {
  const [waitlistCount, foundingMemberCount] = await Promise.all([
    getWaitlistCount(),
    getFoundingMemberCount(),
  ])
  return (
    <div>
      <AfroAllureLanding waitlistCount={waitlistCount} foundingMemberCount={foundingMemberCount} />
    </div>
  );
}

export default Page;
