import { createClient } from "@utils/supabase/server";
import MonetizationClient from "./monetizationClient";
import { Database } from "../../../../../lib/database.types";
import { fetchBusinessUser, fetchUser } from "../actions";
import { redirect } from "next/navigation";
import { checkCompletedOnboarding } from "./actions";
import { Button, Card, Typography } from "@mui/joy";
import { Caption, Text } from "@tailus-ui/typography";
import { ExternalLink, ExternalLinkIcon } from "lucide-react";


export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await fetchUser()
    if (user) {
        const business = await fetchBusinessUser(user!.id)
        const isOnboarded = await checkCompletedOnboarding(business?.business_id!)
        if (isOnboarded) {
            return <MonetizationClient stripeId={business?.stripe_acc_id!} />;

        }
        return <div className="flex justify-center h-[500px] items-center">
            <div className="w-full md:w-1/2 mx-10">
                <Card>
                    <div className="flex flex-col gap-2">
                        <Text className="font-medium mb-0">Complete Stripe Onboarding</Text>
                        <Caption>Connect your account with Stripe to enable secure online payments, deposits, and payouts. Onboarding takes just a few minutes. Once complete, you’ll be able to start earning through AfroAllure.</Caption>
                        <Button target="_blank" component='a' href={business?.current_onboarding_link!} className="max-w-max flex justify-center items-center gap-1">Connect with Stripe <ExternalLinkIcon size={16} /></Button>
                    </div>
                </Card>
            </div>
        </div>
    } else {
        redirect('/login')
    }


}
