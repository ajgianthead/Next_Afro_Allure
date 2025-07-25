import { PostgrestError } from "@supabase/supabase-js";
import { fetchBusinessData, fetchBusinessPolicies } from "../actions";
import BookClient from "./bookClient";

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Schedule Appointment',
};

export default async function Page({ params }: {
    params: {
        businessName: string
    }
}) {
    const { businessName } = await params;
    const businessData = await fetchBusinessData(businessName)
    if (!(businessData instanceof PostgrestError)) {
        const policy = await fetchBusinessPolicies(businessData.result.booking_policies)
        return <BookClient businessData={{ ...businessData.result, policy }} />;
    }
}
