"use client"

import {
    ColumnDef,
    flexRender,
    SortingState,
    getSortedRowModel,
    getCoreRowModel,
    useReactTable,
    ColumnFiltersState,
    getFilteredRowModel,

} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState, useMemo } from "react"
import { DateTime } from "luxon"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { SlidersVertical } from "lucide-react"
import { useManualBooking } from "../hooks/useManualBooking"
import { AppointmentTableData } from "../types"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelAppointmentAction, sendConfirmationLinkAction } from "../server"
import { Spinner } from "@/components/ui/spinner"
import { markAppointmentAs } from "@/app/dashboard/(other)/appointments/actions"
import { CircleCheckBig, UserX, Mail, Check } from "lucide-react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function AppointmentsTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const { manualBookingData, setManualBookingData } = useManualBooking()

    const tableData = useMemo<AppointmentTableData[]>(
        () => (manualBookingData?.appointmentEvents ?? []).map(event => ({
            id: event.id,
            serviceName: event.serviceData.name,
            date: event.start,
            startTime: DateTime.fromJSDate(event.start).toFormat('t'),
            status: event.status ?? '',
            client: `${event.clientData.firstName} ${event.clientData.lastName}`,
            requiresDeposit: event.requiresDeposit,
            depositPrice: event.depositPrice,
            paidDeposit: event.paidDeposit,
            amountDue: event.amountDue,
        })),
        [manualBookingData?.appointmentEvents]
    )

    const [rowSelection, setRowSelection] = useState({})
    const table = useReactTable({
        data: tableData as TData[],
        columns,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection
        },
        getCoreRowModel: getCoreRowModel(),
    })
    const [cancellingAppointment, setCancellingAppointment] = useState<boolean>(false)
    const [openCancelAlert, setOpenCancelAlert] = useState<boolean>(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [sendingLink, setSendingLink] = useState(false)
    const [linkSent, setLinkSent] = useState(false)

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedAppt = selectedRows.length === 1 ? selectedRows[0].original as AppointmentTableData : null
    const isConfirmed = selectedAppt?.status === 'CONFIRMED'
    const isPending = selectedAppt?.status === 'PENDING'

    const handleMarkAs = async (newStatus: 'COMPLETED' | 'NO_SHOW') => {
        if (!selectedAppt || updatingStatus) return
        setUpdatingStatus(true)
        try {
            const result = await markAppointmentAs(newStatus, selectedAppt.amountDue, selectedAppt.id)
            if (result) {
                setManualBookingData!({
                    ...manualBookingData!,
                    appointmentEvents: manualBookingData!.appointmentEvents.map(ev =>
                        ev.id === selectedAppt.id
                            ? { ...ev, status: result.status, amountDue: result.amount_due ?? ev.amountDue }
                            : ev
                    )
                })
                setRowSelection({})
            }
        } catch {
            // silent — user can retry
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleSendConfirmationLink = async () => {
        if (!selectedAppt || sendingLink) return
        setSendingLink(true)
        setLinkSent(false)
        try {
            await sendConfirmationLinkAction(selectedAppt.id)
            setLinkSent(true)
            setTimeout(() => setLinkSent(false), 3000)
        } catch {
            // silent — user can retry
        } finally {
            setSendingLink(false)
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" style={{ borderColor: '#E8E2D6', color: '#1A1818' }}>
                                <SlidersVertical size={14} />
                                <p className="text-sm">Filter</p>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-75 p-4 space-y-5">

                            {/* STATUS */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium">Status</p>

                                    <div className="flex gap-2">
                                        <button
                                            className="text-xs text-muted-foreground hover:underline"
                                            onClick={() =>
                                                table.getColumn("status")?.setFilterValue([])
                                            }
                                        >
                                            Clear
                                        </button>
                                        <button
                                            className="text-xs text-muted-foreground hover:underline"
                                            onClick={() =>
                                                table.getColumn("status")?.setFilterValue([
                                                    "CONFIRMED", "PENDING", "CANCELLED", "NO_SHOW", "EXPIRED", "PROCESSING", "DENIED", "COMPLETED"
                                                ])
                                            }
                                        >
                                            All
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2">
                                    {/* U11: Use raw DB enum values (NO_SHOW) to match context-derived table data */}
                                    {["CONFIRMED", "PENDING", "CANCELLED", "NO_SHOW", "EXPIRED", "PROCESSING", "DENIED", "COMPLETED"].map((status) => {
                                        const current =
                                            (table.getColumn("status")?.getFilterValue() as string[]) ?? []

                                        const checked = current.includes(status)
                                        const label = status.replace(/_/g, ' ')

                                        return (
                                            <label
                                                key={status}
                                                className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) => {
                                                        let newValue = [...current]
                                                        if (e.target.checked) {
                                                            newValue.push(status)
                                                        } else {
                                                            newValue = newValue.filter((s) => s !== status)
                                                        }
                                                        table.getColumn("status")?.setFilterValue(newValue)
                                                    }}
                                                />
                                                {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* CLIENT */}
                            <div>
                                <p className="text-xs font-medium mb-1">Client</p>
                                <Input
                                    placeholder="Search client..."
                                    value={(table.getColumn("client")?.getFilterValue() as string) ?? ""}
                                    onChange={(e) =>
                                        table.getColumn("client")?.setFilterValue(e.target.value)
                                    }
                                />
                            </div>

                            {/* SERVICE */}
                            <div>
                                <p className="text-xs font-medium mb-1">Service</p>
                                <Input
                                    placeholder="Search service..."
                                    value={(table.getColumn("serviceName")?.getFilterValue() as string) ?? ""}
                                    onChange={(e) =>
                                        table.getColumn("serviceName")?.setFilterValue(e.target.value)
                                    }
                                />
                            </div>

                            {/* DATE RANGE */}
                            <div>
                                <p className="text-xs font-medium mb-2">Date</p>

                                <div className="flex gap-2 mb-2">
                                    <Input
                                        type="date"
                                        onChange={(e) =>
                                            table.getColumn("date")?.setFilterValue((prev: any) => ({
                                                ...prev,
                                                from: e.target.value,
                                            }))
                                        }
                                    />
                                    <Input
                                        type="date"
                                        onChange={(e) =>
                                            table.getColumn("date")?.setFilterValue((prev: any) => ({
                                                ...prev,
                                                to: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                {/* QUICK PRESETS */}
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70"
                                        onClick={() => {
                                            const today = new Date().toISOString().split("T")[0]
                                            table.getColumn("date")?.setFilterValue({
                                                from: today,
                                                to: today,
                                            })
                                        }}
                                    >
                                        Today
                                    </button>

                                    <button
                                        className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70"
                                        onClick={() => {
                                            const now = new Date()
                                            const end = new Date()
                                            end.setDate(now.getDate() + 7)

                                            table.getColumn("date")?.setFilterValue({
                                                from: now.toISOString().split("T")[0],
                                                to: end.toISOString().split("T")[0],
                                            })
                                        }}
                                    >
                                        Next 7 Days
                                    </button>
                                </div>
                            </div>

                            {/* CLEAR ALL */}
                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => table.resetColumnFilters()}
                            >
                                Clear All Filters
                            </Button>

                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="text-xs" style={{ color: '#6F6863' }}>
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} selected
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Send Confirmation Link — PENDING only */}
                    <Button
                        onClick={handleSendConfirmationLink}
                        disabled={!isPending || sendingLink}
                        variant="outline"
                        size="sm"
                        style={{
                            borderColor: '#E8E2D6',
                            color: linkSent ? '#22c55e' : '#1A1818',
                        }}
                    >
                        {sendingLink ? <Spinner /> : linkSent
                            ? <Check size={14} style={{ color: '#22c55e' }} />
                            : <Mail size={14} />}
                        <p className="text-sm">{linkSent ? 'Sent!' : 'Send Confirmation'}</p>
                    </Button>

                    {/* Reschedule — CONFIRMED only */}
                    <Button
                        onClick={() => {
                            if (!selectedAppt) return
                            const appointmentEvent = manualBookingData?.appointmentEvents.find(ev => ev.id === selectedAppt.id)!
                            setManualBookingData!({
                                ...manualBookingData!,
                                currSelectedEvent: { ...appointmentEvent },
                                openRescheduleConfirmation: true
                            })
                        }}
                        disabled={!isConfirmed}
                        variant="outline"
                        size="sm"
                        style={{ borderColor: '#E8E2D6', color: '#1A1818' }}
                    >
                        <p className="text-sm">Reschedule</p>
                    </Button>

                    {/* Cancel — CONFIRMED only */}
                    <AlertDialog open={openCancelAlert} onOpenChange={setOpenCancelAlert}>
                        <AlertDialogTrigger asChild>
                            <Button disabled={!isConfirmed} variant="outline" size="sm"
                                style={{ borderColor: '#E8E2D6', color: '#FC6161' }}>
                                <p className="text-sm">Cancel</p>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently cancel the appointment and notify the client.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setOpenCancelAlert(false)}>Keep Appointment</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={cancellingAppointment}
                                    onClick={async (e) => {
                                        e.preventDefault()
                                        if (!selectedAppt) return
                                        setCancellingAppointment(true)
                                        try {
                                            const appointmentEvent = manualBookingData?.appointmentEvents.find(ev => ev.id === selectedAppt.id)!
                                            const cancelled = await cancelAppointmentAction(appointmentEvent.id)
                                            setManualBookingData!({
                                                ...manualBookingData!,
                                                appointmentEvents: manualBookingData!.appointmentEvents.map(ev =>
                                                    ev.id === cancelled?.id ? { ...ev, status: cancelled.status } : ev
                                                )
                                            })
                                            setOpenCancelAlert(false)
                                            setRowSelection({})
                                        } catch {
                                            // keep dialog open
                                        } finally {
                                            setCancellingAppointment(false)
                                        }
                                    }}
                                >
                                    {cancellingAppointment ? <Spinner /> : 'Cancel Appointment'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Mark As — CONFIRMED only */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={!isConfirmed} size="sm"
                                style={{ backgroundColor: isConfirmed ? '#0F0E0E' : undefined, color: isConfirmed ? '#FFFFFF' : undefined }}>
                                {updatingStatus ? <Spinner /> : <p className="text-sm">Mark As</p>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Update Status</DropdownMenuLabel>
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => handleMarkAs('COMPLETED')} className="font-medium">
                                    <CircleCheckBig size={16} className="text-green-500" />
                                    Completed — Cash
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleMarkAs('NO_SHOW')} className="font-medium">
                                    <UserX size={16} className="text-red-500" />
                                    No Show
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #E8E2D6' }}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
