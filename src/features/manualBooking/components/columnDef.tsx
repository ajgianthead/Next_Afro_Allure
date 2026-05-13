'use client'
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateTime } from "luxon"
import { AppointmentTableData } from "../types"
import { Checkbox } from "@/components/ui/checkbox"

const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const statusColor = (status: string) => {
    switch (status) {
        case "CONFIRMED":  return "#22c55e"
        case "COMPLETED":  return "#22c55e"
        case "NO_SHOW":    return "#ef4444"
        case "DENIED":     return "#ef4444"
        case "CANCELLED":  return "#ef4444"
        case "PENDING":    return "#f59e0b"
        case "PROCESSING": return "#f59e0b"
        case "INCOMPLETE": return "#f59e0b"
        default:           return "#FC6161"
    }
}

const statusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

export const columns: ColumnDef<AppointmentTableData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
        header: ({ column }) => (
            <Button variant="ghost" className="px-0 font-semibold text-xs uppercase tracking-wide"
                style={{ color: '#6F6863' }}
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Date <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => (
            <p className="text-sm" style={{ color: '#1A1818' }}>
                {DateTime.fromJSDate(row.getValue('date')).toFormat('DDD')}
            </p>
        ),
    },
    {
        accessorKey: 'startTime',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Time</p>,
        cell: ({ row }) => <p className="text-sm" style={{ color: '#1A1818' }}>{row.getValue('startTime')}</p>,
    },
    {
        accessorKey: 'client',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Client</p>,
        cell: ({ row }) => <p className="text-sm font-medium" style={{ color: '#1A1818' }}>{row.getValue('client')}</p>,
    },
    {
        accessorKey: 'serviceName',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Service</p>,
        cell: ({ row }) => <p className="text-sm" style={{ color: '#1A1818' }}>{row.getValue('serviceName')}</p>,
    },
    {
        accessorKey: 'status',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Status</p>,
        cell: ({ row }) => {
            const status: string = row.getValue("status")
            const color = statusColor(status)
            return (
                <Badge style={{
                    backgroundColor: `${color}18`,
                    border: `1px solid ${color}40`,
                    color,
                    fontWeight: 500,
                    fontSize: '11px',
                }}>
                    {statusLabel(status)}
                </Badge>
            )
        },
        filterFn: (row, columnId, filterValue: string[]) => {
            if (!filterValue?.length) return true
            return filterValue.includes(row.getValue(columnId))
        },
    },
    {
        accessorKey: 'requiresDeposit',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Deposit</p>,
        cell: ({ row }) => {
            const value: boolean = row.getValue('requiresDeposit')
            return value
                ? <Check size={14} style={{ color: '#22c55e' }} />
                : <X size={14} style={{ color: '#E8E2D6' }} />
        },
    },
    {
        accessorKey: 'depositPrice',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Deposit Amt</p>,
        cell: ({ row }) => {
            const value: number = row.getValue('depositPrice')
            return <p className="text-sm" style={{ color: '#1A1818' }}>{fmt(value)}</p>
        },
    },
    {
        accessorKey: 'paidDeposit',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Deposit Paid</p>,
        cell: ({ row }) => {
            const value: boolean = row.getValue('paidDeposit')
            return value
                ? <Check size={14} style={{ color: '#22c55e' }} />
                : <X size={14} style={{ color: '#E8E2D6' }} />
        },
    },
    {
        accessorKey: 'amountDue',
        header: () => <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6F6863' }}>Amount Due</p>,
        cell: ({ row }) => {
            const value: number = row.getValue('amountDue')
            return (
                <p className="text-sm font-medium" style={{ color: value > 0 ? '#C9974A' : '#6F6863' }}>
                    {fmt(value)}
                </p>
            )
        },
    },
]
