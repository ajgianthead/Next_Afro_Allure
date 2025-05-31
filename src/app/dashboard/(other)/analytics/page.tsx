'use client'

import { Caption, Text, Title } from "@tailus-ui/typography"
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import { Divider, Option, Select, Table, TabPanel } from "@mui/joy";
import Card from "@tailus-ui/Card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Rectangle, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";


export default function Page() {
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

    const [monthlyBookingsChart, setMonthlyBookingsChart] = useState<number>(0)

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
                                    <Caption>Current Active Users</Caption>
                                    <div className="flex justify-between">
                                        <Title>10</Title>
                                        <div className="text-red-500 flex gap-2">
                                            <TrendingDown />
                                            <Caption className="text-red-500">-10%</Caption>
                                        </div>
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
                                    <Caption>No-show/abandonment rate</Caption>
                                    <div className="flex justify-between">
                                        <Title>5%</Title>
                                        <div className="text-red-500 flex gap-2">
                                            <TrendingUp />
                                            <Caption className="text-red-500">+0.5%</Caption>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card className="w-full flex gap-8">
                                <div className="w-1/2 flex flex-col gap-2">
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
                                                <Option value={30}>Last 30 days</Option>
                                                <Option value={60}>Last 60 days</Option>
                                                <Option value={90}>Last 90 days</Option>
                                                <Option value={365}>Last year</Option>
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
                                <Divider orientation="vertical" />
                                <div className="w-1/2 flex flex-col gap-2">
                                    <div className="flex justify-between items-center mb-5">
                                        <Caption>Popular Services</Caption>
                                        <div className="flex gap-2">
                                            <Select size="sm" defaultValue={0} className="font-bold">
                                                <Option value={0}>Table</Option>
                                                <Option value={1}>Bar Chart</Option>
                                                <Option value={2}>Pie Chart</Option>
                                            </Select>
                                            <Select size="sm" defaultValue={30} className="font-bold">
                                                <Option value={30}>Last 30 days</Option>
                                                <Option value={60}>Last 60 days</Option>
                                                <Option value={90}>Last 90 days</Option>
                                                <Option value={365}>Last year</Option>
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
                    </TabPanel>
                    <TabPanel value={1}>
                        <b>Second</b> tab panel
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    )
}
