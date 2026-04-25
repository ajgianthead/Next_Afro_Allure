'use client'
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTime } from "luxon";
import { AppointmentTableData } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

const statusColor = (status: string) => {
    switch (status) {
        case "CONFIRMED":
            return "#22c55e";
        case "COMPLETED":
            return "#22c55e";
        case "NO_SHOW":
            return "#ef4444";
        case "DENIED":
            return "#ef4444";
        case "PENDING":
            return "#f59e0b";
        case "PROCESSING":
            return "#f59e0b";
        case "CANCELLED":
            return "#ef4444";
        default:
            return "#FC6161";
    }
};



export const columns: ColumnDef<AppointmentTableData>[] = [

    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {

        accessorKey: 'date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date: string = DateTime.fromJSDate(row.getValue('date')).toFormat('DDD')
            return <p>{date}</p>
        }

    },
    {
        accessorKey: 'startTime',
        header: "Time",
        cell: ({ row }) => {
            const time: string = row.getValue('startTime')
            return <p>{time}</p>
        }
    },
    {
        accessorKey: 'client',
        header: "Client"
    },
    {
        accessorKey: 'serviceName',
        header: "Service Name"
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status: string = row.getValue("status")
            return <Badge style={{
                backgroundColor: `${statusColor(status)}20`,
                border: `1px solid ${statusColor(status)}`,
                color: statusColor(status)
            }}>{status as string}</Badge>
        },
        filterFn: (row, columnId, filterValue: string[]) => {
            if (!filterValue?.length) return true
            return filterValue.includes(row.getValue(columnId))
        },
    },
    {
        accessorKey: 'requiresDeposit',
        header: 'Requires Deposit',
        cell: ({ row }) => {
            const value: boolean = row.getValue('requiresDeposit')
            return value ? <Check color="green" size={16} /> : <X size={16} color="red" />
        }
    },
    {
        accessorKey: 'depositPrice',
        header: 'Deposit Price',
        cell: ({ row }) => {
            const value: number = row.getValue('depositPrice')
            return <p>${value / 100}</p>
        }
    },
    {
        accessorKey: 'paidDeposit',
        header: 'Paid Deposit',
        cell: ({ row }) => {
            const value: boolean = row.getValue('paidDeposit')
            return value ? <Check color="green" size={16} /> : <X size={16} color="red" />
        }
    }, {
        accessorKey: 'amountDue',
        header: 'Amount Due',
        cell: ({ row }) => {
            const value: number = row.getValue('amountDue')
            return <p>${value / 100}</p>
        }
    },
]
