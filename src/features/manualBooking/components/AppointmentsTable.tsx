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
import { useState } from "react"
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
import { cancelAppointmentAction } from "../server"
import { Spinner } from "@/components/ui/spinner"

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

    // U10: Derive rows from context so the table reflects newly created/updated appointments
    // without requiring a full page reload. Status values use raw DB enums (NO_SHOW not NO SHOW).
    const tableData: AppointmentTableData[] = (manualBookingData?.appointmentEvents ?? []).map(event => ({
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
    }))

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
    return (
        <div>
            <div className="flex items-center justify-between w-full py-4">
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline"><SlidersVertical size={16} /><p className="text-sm">Filter</p></Button>
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

                    <div className=" text-xs text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => {
                        const index = Number(Object.keys(rowSelection)[0])
                        let currRow: AppointmentTableData
                        table.getFilteredSelectedRowModel().rows.forEach((row) => {
                            if (row.index === index) {
                                currRow = { ...row.original } as AppointmentTableData
                                const appointmentEvent = manualBookingData?.appointmentEvents.filter((event) => event.id === currRow.id)[0]!
                                setManualBookingData!({
                                    ...manualBookingData!,
                                    currSelectedEvent: { ...appointmentEvent },
                                    openRescheduleConfirmation: true
                                })
                            }
                        })
                    }} disabled={!(table.getFilteredSelectedRowModel().rows.length === 1)} variant={'outline'} size={'sm'} ><p className="text-sm">Reschedule Appointment</p></Button>
                    <AlertDialog open={openCancelAlert} onOpenChange={(open) => {
                        setOpenCancelAlert(open)
                    }}>
                        <AlertDialogTrigger asChild>
                            <Button disabled={!(table.getFilteredSelectedRowModel().rows.length === 1)} variant={'outline'} size={'sm'}><p className="text-sm">Cancel Appointment</p></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently cancel the appointment and will notify the client that the appointment was cancelled.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                    setOpenCancelAlert(false)
                                }}>Keep Appointment</AlertDialogCancel>
                                <AlertDialogAction disabled={cancellingAppointment} onClick={async (e) => {
                                    e.preventDefault()
                                    setCancellingAppointment(true)
                                    try {
                                        const index = Number(Object.keys(rowSelection)[0])
                                        let currRow: AppointmentTableData
                                        table.getFilteredSelectedRowModel().rows.forEach((row) => {
                                            if (row.index === index) {
                                                currRow = { ...row.original } as AppointmentTableData
                                            }
                                        })
                                        const appointmentEvent = manualBookingData?.appointmentEvents.filter((event) => event.id === currRow.id)[0]!
                                        const cancelledAppointment = await cancelAppointmentAction(appointmentEvent.id)
                                        setManualBookingData!({
                                            ...manualBookingData!,
                                            appointmentEvents: manualBookingData?.appointmentEvents.map(e =>
                                                e.id === cancelledAppointment?.id
                                                    ? { ...e, status: cancelledAppointment?.status }
                                                    : e
                                            )!
                                        })
                                        setOpenCancelAlert(false)
                                    } catch {
                                        // keep dialog open so the user can retry
                                    } finally {
                                        setCancellingAppointment(false)
                                    }
                                }}>{cancellingAppointment ? <Spinner /> : 'Cancel Appointment'}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
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
