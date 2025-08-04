'use client'

import { Caption, Text, Title } from "@tailus-ui/typography"
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab, { tabClasses } from '@mui/joy/Tab';
import { Divider, Option, Select, Table, TabPanel, Typography } from "@mui/joy";
import Card from "@tailus-ui/Card";
import { Info, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { GA4ReportRow, runPageViewReport, runTotalReport } from "../../../../../lib/analytics";
import { useUserContext } from "@utils/context/UserContext";
import { DateTime } from "luxon";
import { formatAppointmentAnalyticalData } from "./actions";

interface PageProps {
    pageViews: GA4ReportRow[],
    monthlyBookings: number,
    business_user: Business,
    appointmentCompletionRate: number,
    defaultMonthlyAppointmentsData: {
        name: string;      // Month name, e.g., "February"
        Bookings: number;  // Number of appointments/bookings in that month
    }[];
    appointments: Appointment[],
    serviceCountMap?: Map<string, any[]>;
    webTrafficData?: {
        name: string;
        value: number | string;
        color?: string;
    }[]
}


export default function AnalyticsClient({ pageViews, webTrafficData, serviceCountMap, appointments, monthlyBookings, business_user, defaultMonthlyAppointmentsData, appointmentCompletionRate }: PageProps) {
    const [monthlyBookingsChart, setMonthlyBookingsChart] = useState<number>(0)

    const RADIAN = Math.PI / 180;
    const [pageViewData, setPageViewData] = useState<GA4ReportRow[]>(pageViews)
    const [totalMonthlyBookings, setTotalMonthlyBookings] = useState<number>(monthlyBookings)
    const [monthlyAppointmentsData, setMonthlyAppointmentsData] = useState<{
        name: string;      // Month name, e.g., "February"
        Bookings: number;  // Number of appointments/bookings in that month
    }[]>(defaultMonthlyAppointmentsData)
    const [serviceCountKeys, setServiceCountKeys] = useState<string[]>(serviceCountMap ? Array.from(serviceCountMap?.keys()!) : [])

    return (
        <div className="w-full p-5 ">
            <div className="mb-5">
                <Title>Analytics</Title>
                <Caption>View insightful analytics about your booking site, appointments, and services</Caption>
            </div>
            <div>
                <div className=" flex flex-col lg:gap-2 gap-1">
                    <Card className="w-full flex lg:flex-row flex-col items-center gap-8">
                        <div className="w-1/3 flex flex-col items-center lg:items-start lg:gap-2 gap-1">
                            <div className="flex justify-between w-full items-center">
                                <Caption className="flex items-center gap-2 lg:flex-row flex-col-reverse text-center  w-full justify-center lg:justify-start">Page Views this Month <Info size={16} className="cursor-pointer" /></Caption>

                            </div>
                            <div className="flex justify-start">
                                <Title>{pageViewData.length !== 0 ? pageViewData[0].eventCount : 0}</Title>

                            </div>
                        </div>
                        <Divider orientation="vertical" />
                        <div className="w-1/3 flex flex-col items-center lg:items-start lg:gap-2 gap-1">
                            <Caption className="flex items-center gap-2 lg:flex-row flex-col-reverse text-center  w-full justify-center lg:justify-start">Total Bookings this Month <Info size={16} className="cursor-pointer" /></Caption>
                            <div className="flex justify-between">
                                <Title>{totalMonthlyBookings} </Title>

                            </div>
                        </div>
                        <Divider orientation="vertical" />
                        <div className="w-1/3 flex flex-col items-center lg:items-start lg:gap-2 gap-1">
                            <Caption className="flex items-center gap-2 lg:flex-row flex-col-reverse text-center  w-full justify-center lg:justify-start">Appointment Completion Rate <Info size={16} className="cursor-pointer" /></Caption>
                            <div className="flex justify-between">
                                <Title>{appointmentCompletionRate.toFixed(2)}%</Title>

                            </div>
                        </div>
                    </Card>
                    <div className="flex gap-2 lg:flex-row flex-col">
                        <Card className="lg:w-1/2 w-full max-h-min flex flex-col gap-8">
                            <div className="w-full flex flex-col gap-2">
                                <div className="flex lg:flex-row flex-col gap-2  lg:justify-between items-center">
                                    <Caption>Total Monthly Bookings</Caption>
                                    <div className="flex gap-2">
                                        <Select onChange={(_, value) => {
                                            setMonthlyBookingsChart(value!)
                                        }} size="sm" defaultValue={monthlyBookingsChart} className="font-bold">
                                            <Option value={0}>Line Chart</Option>
                                            <Option value={1}>Bar Chart</Option>
                                        </Select>
                                        <Select onChange={async (_, value) => {
                                            const xDayAppointments = appointments.filter((appointment) => DateTime.fromISO(appointment.created_at) >= DateTime.now().minus({ days: value! }))
                                            const result = await formatAppointmentAnalyticalData(xDayAppointments)
                                            setMonthlyAppointmentsData(result)
                                        }} size="sm" defaultValue={90} className="font-bold">
                                            <Option value={30}>Last 30 Days</Option>
                                            <Option value={60}>Last 60 Days</Option>
                                            <Option value={90}>Last 90 Days</Option>
                                        </Select>

                                    </div>
                                </div>
                                {monthlyAppointmentsData.length ? <div style={{
                                    width: '100%',
                                    height: 300
                                }}>
                                    <ResponsiveContainer width={'100%'} height={'100%'}>
                                        {monthlyBookingsChart === 0 ? <LineChart
                                            className="mt-5"
                                            data={monthlyAppointmentsData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid color="" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line dataKey="Bookings" stroke="#FC6161" activeDot={{ r: 8 }} />

                                        </LineChart> :
                                            <BarChart
                                                className="mt-5"
                                                width={500}
                                                height={300}
                                                data={monthlyAppointmentsData}
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
                                                <Bar dataKey="Bookings" fill="#FC6161" />
                                            </BarChart>
                                        }
                                    </ResponsiveContainer>
                                </div> : <div className="flex py-36 justify-center">
                                    <Caption>No data to display</Caption>
                                </div>}
                            </div>
                        </Card>
                        <Card className="lg:w-1/2 w-full flex flex-col gap-8">
                            <div className="w-full flex flex-col gap-2">
                                <div className="flex lg:flex-row flex-col gap-2  lg:justify-between items-center">
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
                                <div style={{
                                    width: '100%',
                                    height: 300
                                }}>
                                    <ResponsiveContainer width={'100%'} height={'100%'}>
                                        {monthlyBookingsChart === 0 ? <PieChart>
                                            <Pie
                                                dataKey="value"
                                                isAnimationActive={false}
                                                data={webTrafficData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                            >
                                                {webTrafficData!.map((entry, index) => (
                                                    <Cell fill={entry.color} />

                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart> :
                                            <BarChart
                                                className="mt-5"
                                                width={500}
                                                height={300}
                                                data={monthlyAppointmentsData}
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
                                    </ResponsiveContainer>
                                </div>

                            </div>

                        </Card>
                    </div>
                    <Card>
                        <div className="w-full flex flex-col gap-2">
                            <div className="flex justify-between items-center mb-5">
                                <Caption className="flex gap-2 items-center">Popular Services <Info size={16} className="cursor-pointer" /></Caption>

                            </div>
                            {serviceCountKeys.length ? <Table borderAxis="both" aria-label="basic table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th># of Appointments Booked</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceCountKeys.map((key, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{serviceCountMap?.get(key)![2]}</td>
                                                <td>{serviceCountMap?.get(key)![0]}</td>
                                                <td>${serviceCountMap?.get(key)![1]}</td>
                                            </tr>
                                        )
                                    })}
                                    {/* <tr>
                                        <td>Loc Retwist</td>
                                        <td>8</td>
                                        <td>$210.98</td>
                                    </tr>
                                    <tr>
                                        <td>Braids</td>
                                        <td>6</td>
                                        <td>$100.04</td>
                                    </tr> */}

                                </tbody>
                            </Table> :
                                <div className="flex py-12 justify-center">
                                    <Caption>No data to display</Caption>
                                </div>
                            }
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
