'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveCalendar } from "./ResponsiveCalendar";
import { AppointmentsTable } from "./AppointmentsTable";
import { ServiceType } from "@/lib/service/Service";
import { BusinessPolicyType } from "@/lib/businessPolicy/BusinessPolicy";
import { columns } from "./columnDef";
import { AppointmentEvent, AppointmentTableData } from "../types";
import { Calendar, Table } from "lucide-react";
import { ManualBookingWrapper } from "../context/ManualBookingContext";
import AddAppointmentFAB from "./AddAppointmentFAB";
import { CreateAppointmentModal } from "./modals/CreateAppointmentModal";
import { RescheduleConfirmation, RescheduleConfirmationModal } from "./modals/RescheduleAppointmentModal";
import { ServiceData } from "@/features/services/types";

export const ToggleAppointmentView = ({ events, services, policy, data, planType, monthlyBookingCount, hadTrial, stripeCustomerId, businessId }: { data: AppointmentTableData[], events: AppointmentEvent[], services: any[], policy: BusinessPolicyType, planType: 'STARTER' | 'GROWTH', monthlyBookingCount: number, hadTrial: boolean, stripeCustomerId: string | null, businessId: string }) => {
    return (
        <div>
            <ManualBookingWrapper appointmentEvents={events} services={services} policy={policy}>
                <CreateAppointmentModal planType={planType} monthlyBookingCount={monthlyBookingCount} hadTrial={hadTrial} stripeCustomerId={stripeCustomerId} businessId={businessId} />
                <RescheduleConfirmationModal />
                <Tabs defaultValue="calendar" className="w-full">
                    <div className="flex justify-end">
                        <TabsList>
                            <TabsTrigger value="calendar"><Calendar size={12} /><p className="text-xs">Calendar</p></TabsTrigger>
                            <TabsTrigger value="table"><Table /><p className="text-xs">Table</p></TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="calendar">
                        <ResponsiveCalendar />
                    </TabsContent>
                    <TabsContent value="table">
                        <AppointmentsTable columns={columns} data={data} />
                    </TabsContent>
                </Tabs>
                <AddAppointmentFAB />
            </ManualBookingWrapper>

        </div>
    );
}
