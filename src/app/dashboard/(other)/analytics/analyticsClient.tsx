'use client'

import { Caption, Text, Title } from "@tailus-ui/typography"
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import { Divider, Option, Select, Table, TabPanel } from "@mui/joy";
import Card from "@tailus-ui/Card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Rectangle, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { runPageViewReport, runTotalReport } from "../../../../../lib/analytics";
import { useUserContext } from "@utils/context/UserContext";
import { DateTime } from "luxon";


export default function AnalyticsClient() {
    const { user } = useUserContext();
    const data = [
        {
            name: 'Feburary',
            Bookings: 20
        },
        {
            name: 'March',
            Bookings: 15
        },
        {
            name: 'April',
            Bookings: 18
        },

    ];
    useEffect(() => {
        const beginningOfMonth = DateTime.now().startOf('month').toFormat('yyyy-LL-dd')
        const beginningOfNextMonth = DateTime.now().startOf('month').minus({ month: 1 }).toFormat('yyyy-LL-dd')
        const beginningOfNextNextMonth = DateTime.now().startOf('month').minus({ months: 2 }).toFormat('yyyy-LL-dd')

        const loadReportData = async () => {
            const pageViewData = await runPageViewReport({ dataRanges: [{ startDate: beginningOfMonth, endDate: 'today' }], businessName: 'admin' })
            const totalBookingsThisMonthData = await runTotalReport({ dataRanges: [{ startDate: beginningOfMonth, endDate: 'today' }], businessId: user.business_id, eventName: "appointment_booked" })
            const totalMaxBookingsThisMonthData = await runTotalReport({ dataRanges: [{ startDate: beginningOfNextNextMonth, endDate: beginningOfNextMonth }, { startDate: beginningOfNextMonth, endDate: beginningOfMonth }, { startDate: beginningOfMonth, endDate: 'today' }], businessId: user.business_id, eventName: "appointment_booked" })

            console.log({ pageViewData, totalBookingsThisMonthData, totalMaxBookingsThisMonthData });

        }
        if (user) {
            loadReportData()
        }
    }, [user]);
    const [monthlyBookingsChart, setMonthlyBookingsChart] = useState<number>(0)
    const data01 = [
        { name: 'Instagram', value: 30, color: 'pink' },
        { name: 'Organic', value: 5, color: 'green' },
        { name: 'TikTok', value: 14, color: 'black' },
    ];
    const RADIAN = Math.PI / 180;


    return (
        <div className="w-full p-5 ">
            <Title>Analytics</Title>
            <div>
                <Tabs size="sm" className="mt-3" aria-label="Basic tabs" defaultValue={0} sx={{ bgcolor: 'transparent' }}>
                    <TabList disableUnderline
                        sx={{
                            p: 0.5,
                            gap: 0.5,
                            borderRadius: 'xl',
                            bgcolor: 'background.level1',
                            [`& .${tabClasses.root}[aria-selected="true"]`]: {
                                boxShadow: 'sm',
                                bgcolor: 'background.surface',
                            },
                            maxWidth: 'max-content'
                        }}>
                        <Tab disableIndicator>Booking Analytics</Tab>
                        <Tab disableIndicator>Financial Analytics</Tab>
                    </TabList>
                    <TabPanel value={0} sx={{
                        paddingX: 0
                    }}>
                        <div className=" flex flex-col gap-2">
                            <Card className="w-full flex gap-8">
                                <div className="w-1/3 flex flex-col gap-2">
                                    <Caption>Monthly Active Users</Caption>
                                    <div className="flex justify-start">
                                        <Title>10</Title>

                                    </div>
                                </div>
                                <Divider orientation="vertical" />
                                <div className="w-1/3 flex flex-col gap-2">
                                    <Caption>Total Bookings this Month</Caption>
                                    <div className="flex justify-between">
                                        <Title>20</Title>
                                        <div className="text-green-500 flex gap-2">
                                            <TrendingUp />
                                            <Caption className="text-green-500">+5%</Caption>
                                        </div>
                                    </div>
                                </div>
                                <Divider orientation="vertical" />
                                <div className="w-1/3 flex flex-col gap-2">
                                    <Caption>Appointment Completion Rate</Caption>
                                    <div className="flex justify-between">
                                        <Title>95%</Title>
                                        <div className="text-green-500 flex gap-2">
                                            <TrendingUp />
                                            <Caption className="text-green-500">+0.5%</Caption>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <div className="flex gap-2">
                                <Card className="w-1/2 max-h-min flex flex-col gap-8">
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Caption>Total Monthly Bookings</Caption>
                                            <div className="flex gap-2">
                                                <Select onChange={(_, value) => {
                                                    setMonthlyBookingsChart(value!)
                                                }} size="sm" defaultValue={monthlyBookingsChart} className="font-bold">
                                                    <Option value={0}>Line Chart</Option>
                                                    <Option value={1}>Bar Chart</Option>
                                                </Select>
                                                <Select size="sm" defaultValue={90} className="font-bold">
                                                    <Option value={30}>This month</Option>
                                                    <Option value={60}>Last 2 months</Option>
                                                    <Option value={90}>Last 3 months</Option>
                                                </Select>

                                            </div>
                                        </div>
                                        {monthlyBookingsChart === 0 ? <LineChart
                                            className="mt-5"
                                            width={500}
                                            height={300}
                                            data={data}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line dataKey="Bookings" stroke="#8884d8" activeDot={{ r: 8 }} />

                                        </LineChart> :
                                            <BarChart
                                                className="mt-5"
                                                width={500}
                                                height={300}
                                                data={data}
                                                margin={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="Bookings" fill="#8884d8" />
                                            </BarChart>
                                        }
                                    </div>
                                </Card>
                                <Card className="w-1/2 flex flex-col gap-8">
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Caption>Web Traffic Source</Caption>
                                            <div className="flex gap-2">
                                                <Select onChange={(_, value) => {
                                                    setMonthlyBookingsChart(value!)
                                                }} size="sm" defaultValue={monthlyBookingsChart} className="font-bold">
                                                    <Option value={0}>Pie Chart</Option>
                                                    <Option value={1}>Bar Chart</Option>
                                                </Select>
                                                <Select size="sm" defaultValue={90} className="font-bold">
                                                    <Option value={30}>This month</Option>
                                                    <Option value={60}>Last 2 months</Option>
                                                    <Option value={90}>Last 3 months</Option>
                                                </Select>

                                            </div>
                                        </div>
                                        {monthlyBookingsChart === 0 ? <PieChart width={500} height={300}>
                                            <Pie
                                                dataKey="value"
                                                isAnimationActive={false}
                                                data={data01}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                            >
                                                {data01.map((entry, index) => (
                                                    <Cell fill={entry.color} />

                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart> :
                                            <BarChart
                                                className="mt-5"
                                                width={500}
                                                height={300}
                                                data={data}
                                                margin={{
                                                    top: 5,
                                                    right: 30,
                                                    left: 20,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="Bookings" fill="#8884d8" />
                                            </BarChart>
                                        }
                                    </div>
                                    <Divider orientation="horizontal" />
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex justify-between items-center mb-5">
                                            <Caption>Popular Services</Caption>
                                            <div className="flex gap-2">
                                                <Select size="sm" defaultValue={0} className="font-bold">
                                                    <Option value={0}>Table</Option>
                                                    <Option value={1}>Bar Chart</Option>
                                                    <Option value={2}>Pie Chart</Option>
                                                </Select>
                                                <Select size="sm" defaultValue={30} className="font-bold">
                                                    <Option value={30}>This month</Option>
                                                    <Option value={60}>Last 2 months</Option>
                                                    <Option value={90}>Last 3 months</Option>
                                                </Select>

                                            </div>
                                        </div>
                                        <Table borderAxis="both" aria-label="basic table">
                                            <thead>
                                                <tr>
                                                    <th>Service</th>
                                                    <th># of Appointments Booked</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Loc Retwist</td>
                                                    <td>8</td>
                                                </tr>
                                                <tr>
                                                    <td>Braids</td>
                                                    <td>6</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={1}>
                        <b>Second</b> tab panel
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}
