'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    CalendarPlus, CheckCircle2, XCircle, RefreshCw, DollarSign,
    AlertTriangle, Clock, ChevronLeft, Trash2, Bell,
} from 'lucide-react'
import { DateTime } from 'luxon'
import { deleteNotification, markAllAsRead, updateNotificationState } from './actions'

interface AppointmentNotification extends BusinessNotification {
    appointments: any
}

interface PageProps {
    notifications: AppointmentNotification[]
    businessId: string
}

const BOOKING_TYPES = ['new-booking', 'booking-confirmed', 'cancelled-booking', 'rescheduled-booking']
const PAYMENT_TYPES = ['payment-received', 'payment-incomplete', 'no-show']

function getTypeConfig(type: string): { icon: React.ReactNode; accent: string } {
    switch (type) {
        case 'new-booking':         return { icon: <CalendarPlus size={15} />, accent: '#22C55E' }
        case 'booking-confirmed':   return { icon: <CheckCircle2 size={15} />, accent: '#22C55E' }
        case 'cancelled-booking':   return { icon: <XCircle size={15} />, accent: '#FC6161' }
        case 'rescheduled-booking': return { icon: <RefreshCw size={15} />, accent: '#3B82F6' }
        case 'payment-received':    return { icon: <DollarSign size={15} />, accent: '#22C55E' }
        case 'payment-incomplete':  return { icon: <Clock size={15} />, accent: '#C9974A' }
        case 'no-show':             return { icon: <AlertTriangle size={15} />, accent: '#C9974A' }
        default:                    return { icon: <Bell size={15} />, accent: '#C9974A' }
    }
}

function relativeTime(iso: string): string {
    const dt = DateTime.fromISO(iso)
    const now = DateTime.now()
    const mins = now.diff(dt, 'minutes').minutes
    const hours = now.diff(dt, 'hours').hours
    const days = now.diff(dt, 'days').days
    if (days >= 7)  return dt.toLocaleString(DateTime.DATE_MED)
    if (days >= 1)  return `${Math.floor(days)}d ago`
    if (hours >= 1) return `${Math.floor(hours)}h ago`
    if (mins >= 1)  return `${Math.floor(mins)}m ago`
    return 'Just now'
}

const NotificationsClient = ({ notifications: initial, businessId }: PageProps) => {
    const [notifications, setNotifications] = useState<AppointmentNotification[]>(initial ?? [])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [detail, setDetail] = useState<AppointmentNotification | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [markingAll, setMarkingAll] = useState(false)
    const supabase = useRef(createClient()).current

    useEffect(() => {
        const channel = supabase
            .channel(`notifications:${businessId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `business_id=eq.${businessId}` },
                async (payload) => {
                    // Fetch full row with joins so appointment details are available in detail view
                    const { data } = await supabase
                        .from('notifications')
                        .select('*, appointments(*, business_users(*))')
                        .eq('id', (payload.new as any).id)
                        .single()
                    if (data) {
                        setNotifications(prev => [data as AppointmentNotification, ...prev])
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `business_id=eq.${businessId}` },
                (payload) => {
                    const updated = payload.new as any
                    setNotifications(prev => prev.map(n =>
                        n.id === updated.id ? { ...n, read: updated.read } : n
                    ))
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'notifications', filter: `business_id=eq.${businessId}` },
                (payload) => {
                    const deleted = payload.old as any
                    setNotifications(prev => prev.filter(n => n.id !== deleted.id))
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [businessId, supabase])

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

    const filtered = useMemo(() => ({
        all:      notifications,
        unread:   notifications.filter(n => !n.read),
        bookings: notifications.filter(n => BOOKING_TYPES.includes(n.type)),
        payments: notifications.filter(n => PAYMENT_TYPES.includes(n.type)),
    }), [notifications])

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id); else next.add(id)
            return next
        })
    }

    const toggleSelectAll = (items: AppointmentNotification[]) => {
        const allSel = items.every(n => selected.has(n.id))
        setSelected(allSel ? new Set() : new Set(items.map(n => n.id)))
    }

    const handleMarkRead = async (noti: AppointmentNotification) => {
        if (!noti.read) {
            setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, read: true } : n))
            updateNotificationState(noti.id).catch(err =>
                console.error('Failed to mark notification as read:', err)
            )
        }
        setDetail({ ...noti, read: true })
    }

    const handleMarkAllRead = async () => {
        if (unreadCount === 0) return
        setMarkingAll(true)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        try {
            await markAllAsRead()
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        } finally {
            setMarkingAll(false)
        }
    }

    const handleDelete = async () => {
        if (selected.size === 0) return
        setDeleting(true)
        try {
            await deleteNotification(selected)
            setNotifications(prev => prev.filter(n => !selected.has(n.id)))
            setSelected(new Set())
        } catch (err) {
            console.error('Failed to delete notifications:', err)
        } finally {
            setDeleting(false)
        }
    }

    if (detail) {
        return <DetailView noti={detail} onBack={() => setDetail(null)} />
    }

    return (
        <div className="p-5" style={{ maxWidth: 680 }}>
            <div className="flex items-center justify-between mb-5">
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1818' }}>Notifications</h1>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            disabled={markingAll}
                            style={{ fontSize: 13, color: '#C9974A' }}
                        >
                            {markingAll ? 'Marking…' : 'Mark all as read'}
                        </Button>
                    )}
                    {selected.size > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{ fontSize: 13, color: '#FC6161', borderColor: '#FC6161' }}
                        >
                            <Trash2 size={14} className="mr-1" />
                            {deleting ? 'Deleting…' : `Delete (${selected.size})`}
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="all">
                <TabsList className="mb-4" style={{ background: '#FAF7F2', border: '1px solid #E8E2D6' }}>
                    {([
                        { value: 'all',      label: 'All',      count: filtered.all.length },
                        { value: 'unread',   label: 'Unread',   count: filtered.unread.length },
                        { value: 'bookings', label: 'Bookings', count: filtered.bookings.length },
                        { value: 'payments', label: 'Payments', count: filtered.payments.length },
                    ] as const).map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value} style={{ fontSize: 13 }}>
                            {tab.label}
                            {tab.count > 0 && (
                                <span style={{ marginLeft: 5, color: '#6F6863', fontSize: 12 }}>
                                    {tab.count}
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {(['all', 'unread', 'bookings', 'payments'] as const).map(tab => (
                    <TabsContent key={tab} value={tab}>
                        <NotiList
                            items={filtered[tab]}
                            selected={selected}
                            onToggleSelect={toggleSelect}
                            onToggleSelectAll={() => toggleSelectAll(filtered[tab])}
                            onMarkRead={handleMarkRead}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

interface NotiListProps {
    items: AppointmentNotification[]
    selected: Set<string>
    onToggleSelect: (id: string) => void
    onToggleSelectAll: () => void
    onMarkRead: (noti: AppointmentNotification) => void
}

const NotiList = ({ items, selected, onToggleSelect, onToggleSelectAll, onMarkRead }: NotiListProps) => {
    if (items.length === 0) {
        return (
            <div style={{ padding: '56px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Bell size={28} style={{ color: '#C9BD9E' }} />
                <p style={{ fontSize: 14, color: '#6F6863', fontStyle: 'italic' }}>No notifications here</p>
            </div>
        )
    }

    const allSelected = items.every(n => selected.has(n.id))

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 6 }}>
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => onToggleSelectAll()}
                    id="select-all"
                    aria-label="Select all"
                />
                <label htmlFor="select-all" style={{ fontSize: 12, color: '#6F6863', cursor: 'pointer', userSelect: 'none' }}>
                    Select all
                </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(noti => (
                    <NotiCard
                        key={noti.id}
                        noti={noti}
                        isSelected={selected.has(noti.id)}
                        onToggleSelect={() => onToggleSelect(noti.id)}
                        onMarkRead={() => onMarkRead(noti)}
                    />
                ))}
            </div>
        </div>
    )
}

interface NotiCardProps {
    noti: AppointmentNotification
    isSelected: boolean
    onToggleSelect: () => void
    onMarkRead: () => void
}

const NotiCard = ({ noti, isSelected, onToggleSelect, onMarkRead }: NotiCardProps) => {
    const { icon, accent } = getTypeConfig(noti.type)
    return (
        <div style={{
            display: 'flex',
            alignItems: 'stretch',
            background: noti.read ? '#FFFFFF' : '#FAF7F2',
            border: '1px solid #E8E2D6',
            borderRadius: 12,
            overflow: 'hidden',
        }}>
            <div style={{ width: 4, background: accent, flexShrink: 0 }} />

            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 0 12px' }}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect()}
                    aria-label={`Select notification: ${noti.title}`}
                />
            </div>

            <button
                onClick={onMarkRead}
                style={{
                    flex: 1,
                    textAlign: 'left',
                    padding: '13px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    minWidth: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', minWidth: 0 }}>
                        <span style={{ color: accent, flexShrink: 0 }}>{icon}</span>
                        <span style={{ fontSize: 14, fontWeight: noti.read ? 500 : 700, color: '#1A1818' }}>
                            {noti.title}
                        </span>
                        {!noti.read && (
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#FC6161', display: 'inline-block', flexShrink: 0,
                            }} />
                        )}
                    </div>
                    <span style={{ fontSize: 12, color: '#9E9896', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {relativeTime(noti.created_at)}
                    </span>
                </div>
                <p className="line-clamp-2" style={{ fontSize: 13, color: '#6F6863', marginTop: 4, marginLeft: 22 }}>
                    {noti.body}
                </p>
            </button>
        </div>
    )
}

const DetailView = ({ noti, onBack }: { noti: AppointmentNotification; onBack: () => void }) => {
    const { icon, accent } = getTypeConfig(noti.type)
    const appt = noti.appointments as any
    const createdAt = DateTime.fromISO(noti.created_at).toLocaleString(DateTime.DATETIME_MED)
    const serviceName = appt?.service_data?.name
    const clientName = appt?.client_metadata
        ? `${appt.client_metadata.firstName ?? ''} ${appt.client_metadata.lastName ?? ''}`.trim() || null
        : null
    const apptStart = appt?.start
        ? DateTime.fromISO(appt.start).toLocaleString(DateTime.DATETIME_MED)
        : null

    return (
        <div className="p-5" style={{ maxWidth: 680 }}>
            <button
                onClick={onBack}
                style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 13, color: '#6F6863', background: 'none',
                    border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0,
                }}
            >
                <ChevronLeft size={16} /> Back
            </button>

            <div style={{ border: '1px solid #E8E2D6', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ height: 4, background: accent }} />
                <div style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <span style={{ color: accent }}>{icon}</span>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1818' }}>{noti.title}</h2>
                    </div>
                    <div style={{ borderTop: '1px solid #E8E2D6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <p style={{ fontSize: 14, color: '#1A1818', lineHeight: 1.6 }}>{noti.body}</p>
                        {clientName && (
                            <p style={{ fontSize: 13, color: '#6F6863' }}>
                                <span style={{ fontWeight: 600 }}>Client: </span>{clientName}
                            </p>
                        )}
                        {serviceName && (
                            <p style={{ fontSize: 13, color: '#6F6863' }}>
                                <span style={{ fontWeight: 600 }}>Service: </span>{serviceName}
                            </p>
                        )}
                        {apptStart && (
                            <p style={{ fontSize: 13, color: '#6F6863' }}>
                                <span style={{ fontWeight: 600 }}>Appointment: </span>{apptStart}
                            </p>
                        )}
                        <p style={{ fontSize: 12, color: '#9E9896' }}>{createdAt}</p>
                        {noti.appointment_id && (
                            <a
                                href="/dashboard/appointments"
                                style={{ fontSize: 13, fontWeight: 600, color: '#C9974A', display: 'inline-block' }}
                            >
                                View appointment →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationsClient
