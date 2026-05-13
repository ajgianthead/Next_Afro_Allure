'use client'

import { Ban, Loader2, Plus, UserX } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    addCreateNewClient,
    banClientFromList,
    deleteClient,
    unbanClient,
    updateClientInfo,
    type BannedClientDisplay,
    type Client,
} from 'app/dashboard/(other)/clients/actions'
import { PostgrestError } from '@supabase/supabase-js'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-xs font-medium" style={{ color: '#6F6863' }}>
            {children}
        </label>
    )
}

function BrandInput({
    value,
    onChange,
    placeholder,
    required,
    autoFocus,
    type = 'text',
}: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    required?: boolean
    autoFocus?: boolean
    type?: string
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-shadow"
            style={{
                border: '1px solid #E8E2D6',
                color: '#1A1818',
                backgroundColor: '#FAFAFA',
            }}
            onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,151,74,0.3)')}
            onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
        />
    )
}

export const ClientsTable = ({
    clientData,
    businessId,
    bannedClients,
}: {
    clientData: Client[]
    businessId: string
    bannedClients: BannedClientDisplay[]
}) => {
    const [clients, setClients] = useState<Client[]>([...clientData])
    const [banned, setBanned] = useState<BannedClientDisplay[]>([...bannedClients])

    const [open, setOpen] = useState(false)
    const [openBanList, setOpenBanList] = useState(false)
    const [editing, setEditing] = useState(false)
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [banning, setBanning] = useState(false)
    const [unbanning, setUnbanning] = useState<string | null>(null)

    const [clientInfo, setClientInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    })

    const resetForm = () => {
        setClientInfo({ firstName: '', lastName: '', email: '', phoneNumber: '' })
        setEditing(false)
        setSelectedClientId(null)
        setOpen(false)
    }

    const selectedClient = clients.find(c => c.client_id === selectedClientId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        if (editing && selectedClient) {
            const res = await updateClientInfo(
                {
                    client_id: selectedClient.client_id!,
                    first_name: clientInfo.firstName,
                    last_name: clientInfo.lastName,
                    email: clientInfo.email,
                    phone_number: clientInfo.phoneNumber,
                },
                businessId
            )
            if (typeof res === 'string' || res instanceof PostgrestError) {
                toast.error(typeof res === 'string' ? res : res.message)
            } else {
                setClients(prev => prev.map(c => (c.client_id === res.client_id ? (res as Client) : c)))
                resetForm()
            }
        } else {
            const res = await addCreateNewClient(
                {
                    first_name: clientInfo.firstName,
                    last_name: clientInfo.lastName,
                    email: clientInfo.email,
                    phone_number: clientInfo.phoneNumber,
                },
                businessId
            )
            if (typeof res === 'string' || res instanceof PostgrestError) {
                toast.error(typeof res === 'string' ? res : res.message)
            } else {
                setClients(prev => [...prev, res as Client])
                resetForm()
            }
        }

        setSaving(false)
    }

    const handleDelete = async () => {
        if (!selectedClient) return
        setDeleting(true)
        const res = await deleteClient(selectedClient.client_id!, businessId)
        if (res instanceof PostgrestError) {
            toast.error(res.message)
        } else {
            setClients(prev => prev.filter(c => c.client_id !== selectedClient.client_id))
            resetForm()
        }
        setDeleting(false)
    }

    const handleBan = async () => {
        if (!selectedClient) return
        setBanning(true)
        const res = await banClientFromList(selectedClient.client_id!, businessId)
        if (res instanceof PostgrestError) {
            toast.error(res.message)
        } else {
            // Add to banned display list — fetch full info from current client record
            setBanned(prev => [
                ...prev,
                {
                    id: (res as any).id,
                    business_id: businessId,
                    client_id: selectedClient.client_id!,
                    created_at: (res as any).created_at ?? new Date().toISOString(),
                    email: selectedClient.email,
                    phone_number: selectedClient.phone_number,
                    first_name: selectedClient.first_name,
                    last_name: selectedClient.last_name,
                },
            ])
            setClients(prev => prev.filter(c => c.client_id !== selectedClient.client_id))
            resetForm()
        }
        setBanning(false)
    }

    const handleUnban = async (client: BannedClientDisplay) => {
        setUnbanning(client.id)
        const res = await unbanClient(client.id)
        if (res instanceof PostgrestError) {
            toast.error(res.message)
        } else {
            setBanned(prev => prev.filter(b => b.id !== client.id))
        }
        setUnbanning(null)
    }

    const busy = saving || deleting || banning

    const openEdit = (client: Client) => {
        setSelectedClientId(client.client_id!)
        setClientInfo({
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email,
            phoneNumber: client.phone_number,
        })
        setEditing(true)
        setOpen(true)
    }

    return (
        <div className="p-4 sm:p-5 flex flex-col gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                    <h1 className="text-lg font-semibold" style={{ color: '#1A1818' }}>
                        Manage Clientele
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: '#6F6863' }}>
                        Add, edit, and remove clients. Ban clients to block future bookings.
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl flex-1 sm:flex-none"
                        style={{ borderColor: '#E8E2D6', color: '#1A1818', fontSize: '13px' }}
                        onClick={() => setOpenBanList(true)}
                    >
                        <Ban size={14} className="mr-1.5" />
                        Banned List
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-xl flex-1 sm:flex-none"
                        style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                        onClick={() => setOpen(true)}
                    >
                        <Plus size={14} className="mr-1.5" />
                        Add Client
                    </Button>
                </div>
            </div>

            {/* Table / Card list */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #E8E2D6', backgroundColor: '#FFFFFF' }}
            >
                {clients.length > 0 ? (
                    <>
                        {/* Mobile card list */}
                        <ul className="sm:hidden">
                            {clients.map((client, i) => (
                                <li
                                    key={client.client_id}
                                    className="px-4 py-3.5 cursor-pointer active:bg-[#FAF7F2]"
                                    style={{ borderBottom: i < clients.length - 1 ? '1px solid #F0EBE3' : undefined }}
                                    onClick={() => openEdit(client)}
                                >
                                    <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                        {client.first_name} {client.last_name}
                                    </p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: '#6F6863' }}>
                                        {client.email}
                                    </p>
                                    <p className="text-xs" style={{ color: '#6F6863' }}>
                                        {client.phone_number}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        {/* Desktop table */}
                        <table className="w-full hidden sm:table">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E8E2D6', backgroundColor: '#FAF7F2' }}>
                                    {['First Name', 'Last Name', 'Email', 'Phone Number'].map(h => (
                                        <th
                                            key={h}
                                            className="text-left px-5 py-3 text-[10px] font-semibold tracking-widest uppercase"
                                            style={{ color: '#6F6863' }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, i) => (
                                    <tr
                                        key={client.client_id}
                                        className="cursor-pointer transition-colors"
                                        style={{ borderBottom: i < clients.length - 1 ? '1px solid #F0EBE3' : undefined }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                                        onClick={() => openEdit(client)}
                                    >
                                        <td className="px-5 py-3.5 text-sm" style={{ color: '#1A1818' }}>
                                            {client.first_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm" style={{ color: '#1A1818' }}>
                                            {client.last_name}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm" style={{ color: '#6F6863' }}>
                                            {client.email}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm" style={{ color: '#6F6863' }}>
                                            {client.phone_number}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <UserX size={32} style={{ color: '#E8E2D6' }} />
                        <p className="text-sm italic" style={{ color: '#6F6863' }}>
                            You have no current clients
                        </p>
                    </div>
                )}
            </div>

            {/* Add / Edit Client Dialog */}
            <Dialog
                open={open}
                onOpenChange={v => {
                    if (!v) resetForm()
                }}
            >
                <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] sm:max-w-md" style={{ borderColor: '#E8E2D6' }}>
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818', fontSize: '1.1rem' }}>
                            {editing ? 'Edit Client' : 'Add New Client'}
                        </DialogTitle>
                        <DialogDescription style={{ color: '#6F6863' }}>
                            {editing
                                ? 'Update the client information below.'
                                : 'Enter the client details below to add them to your list.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <FieldLabel>First Name</FieldLabel>
                                <BrandInput
                                    value={clientInfo.firstName}
                                    onChange={e => setClientInfo(p => ({ ...p, firstName: e.target.value }))}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <FieldLabel>Last Name</FieldLabel>
                                <BrandInput
                                    value={clientInfo.lastName}
                                    onChange={e => setClientInfo(p => ({ ...p, lastName: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>Email</FieldLabel>
                            <BrandInput
                                type="email"
                                value={clientInfo.email}
                                onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <FieldLabel>Phone Number</FieldLabel>
                            <BrandInput
                                type="tel"
                                value={clientInfo.phoneNumber}
                                onChange={e => setClientInfo(p => ({ ...p, phoneNumber: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={busy}
                                className="w-full rounded-xl"
                                style={{ backgroundColor: '#0F0E0E', color: '#FFFFFF', fontSize: '13px' }}
                            >
                                {saving ? (
                                    <Loader2 size={14} className="animate-spin mr-1.5" />
                                ) : null}
                                {editing ? 'Save Changes' : 'Add Client'}
                            </Button>

                            {editing && (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy}
                                        className="w-full rounded-xl"
                                        style={{ borderColor: '#FC6161', color: '#FC6161', fontSize: '13px' }}
                                        onClick={handleDelete}
                                    >
                                        {deleting ? (
                                            <Loader2 size={14} className="animate-spin mr-1.5" />
                                        ) : null}
                                        Delete Client
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={busy}
                                        className="w-full rounded-xl"
                                        style={{ backgroundColor: '#FC6161', color: '#FFFFFF', fontSize: '13px' }}
                                        onClick={handleBan}
                                    >
                                        {banning ? (
                                            <Loader2 size={14} className="animate-spin mr-1.5" />
                                        ) : (
                                            <Ban size={14} className="mr-1.5" />
                                        )}
                                        Ban Client
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Banned Client List Dialog */}
            <Dialog open={openBanList} onOpenChange={setOpenBanList}>
                <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] sm:max-w-md" style={{ borderColor: '#E8E2D6' }}>
                    <DialogHeader>
                        <DialogTitle style={{ fontFamily: SERIF, color: '#1A1818', fontSize: '1.1rem' }}>
                            Banned Clients
                        </DialogTitle>
                        <DialogDescription style={{ color: '#6F6863' }}>
                            Clients on this list are blocked from booking with you.
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="rounded-xl overflow-hidden mt-1"
                        style={{ border: '1px solid #E8E2D6', maxHeight: 340, overflowY: 'auto' }}
                    >
                        {banned.length > 0 ? (
                            <ul>
                                {banned.map((client, i) => (
                                    <li
                                        key={client.id}
                                        className="flex items-center justify-between gap-3 px-4 py-3"
                                        style={{
                                            borderBottom: i < banned.length - 1 ? '1px solid #F0EBE3' : undefined,
                                        }}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium" style={{ color: '#1A1818' }}>
                                                {client.first_name} {client.last_name}
                                            </p>
                                            <p className="text-xs truncate" style={{ color: '#6F6863' }}>
                                                {client.email}
                                            </p>
                                            <p className="text-xs" style={{ color: '#6F6863' }}>
                                                {client.phone_number}
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={unbanning === client.id}
                                            className="rounded-lg shrink-0"
                                            style={{ borderColor: '#E8E2D6', color: '#6F6863', fontSize: '12px' }}
                                            onClick={() => handleUnban(client)}
                                        >
                                            {unbanning === client.id ? (
                                                <Loader2 size={12} className="animate-spin" />
                                            ) : (
                                                'Unban'
                                            )}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex justify-center py-10">
                                <p className="text-sm italic" style={{ color: '#6F6863' }}>
                                    No banned clients
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ClientsTable
