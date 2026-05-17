'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DateTime } from 'luxon'
import { TrendingDown, TrendingUp, Copy, Check, Plus, CreditCard, AlertCircle, X, ChevronRight } from 'lucide-react'

import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { sendPaymentLink } from 'app/dashboard/(other)/actions'
import QRCode from 'react-qr-code'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createSubscriptionCheckout, createSubscriptionForExistingCustomer } from 'app/for-businesses/actions'
import { DashboardTour } from '@/features/tour/tours/DashboardTour'

const SERIF = 'var(--font-fraunces, "Fraunces", "Times New Roman", serif)'

const BRAND = {
  black: '#0F0E0E',
  cream: '#FAF7F2',
  red: '#FC6161',
  gold: '#C9974A',
  dark: '#1A1818',
  warm: '#6F6863',
  sand: '#E8E2D6',
}

interface PageProps {
  weekAppointments: Appointment[]
  upcomingAppointments: Appointment[]
  businessData: Business
  dashboardAnalytics: {
    revenue: PostgrestSingleResponse<number>
    bookings: PostgrestSingleResponse<number>
    newClients: PostgrestSingleResponse<number>
    returningRate: PostgrestSingleResponse<number>
  }
  growth: {
    clients_growth: number
    clients_last_month: number
    clients_this_month: number
    revenue_growth: number
    revenue_last_month: number
    revenue_this_month: number
  } | null
  monthlyBookingCount: number
  planType: 'STARTER' | 'GROWTH'
}

export const StackedCards = ({ weekAppointments, upcomingAppointments, businessData, dashboardAnalytics, growth, monthlyBookingCount, planType }: PageProps) => {
  const params = useSearchParams()
  const subscriptionSuccess = params.get('success')
  const [successDismissed, setSuccessDismissed] = useState(false)
  const today = DateTime.now()
  const todayAppointments = weekAppointments.filter(a =>
    DateTime.fromISO(a.start).hasSame(today, 'day')
  )
  const pendingAppointments = weekAppointments.filter(a => a.status === 'PENDING')
  const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/business/${businessData.url_name}`

  return (
    <div className="space-y-6 max-w-5xl">
      <DashboardTour />
      {subscriptionSuccess === 'true' && !successDismissed && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
          <span>Subscribed successfully.</span>
          <button onClick={() => setSuccessDismissed(true)}><X size={14} /></button>
        </div>
      )}
      {subscriptionSuccess === 'false' && !successDismissed && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
          <span>Something went wrong with your subscription.</span>
          <button onClick={() => setSuccessDismissed(true)}><X size={14} /></button>
        </div>
      )}

      <Greeting businessData={businessData} />
      <BookingLinkBar url={bookingUrl} />
      <QuickActions />
      <BookingLimitBanner monthlyBookingCount={monthlyBookingCount} planType={planType} businessData={businessData} />
      <StatRow dashboardAnalytics={dashboardAnalytics} growth={growth} />
      <StarterUpgradeCard monthlyBookingCount={monthlyBookingCount} planType={planType} businessData={businessData} />
      <WeekStrip weekAppointments={weekAppointments} />
      {pendingAppointments.length > 0 && <PendingAlert count={pendingAppointments.length} />}
      <TodaySchedule appointments={todayAppointments} businessData={businessData} />
      <UpcomingList appointments={upcomingAppointments} businessData={businessData} />
    </div>
  )
}

function Greeting({ businessData }: { businessData: Business }) {
  const hour = DateTime.now().hour
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return (
    <div>
      <p className="text-sm" style={{ color: BRAND.warm }}>{greeting}</p>
      <h1 className="text-2xl font-semibold" style={{ color: BRAND.black }}>{businessData.business_name}</h1>
    </div>
  )
}

function BookingLinkBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div data-tour="dashboard-booking-link" className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: BRAND.sand, backgroundColor: BRAND.cream }}>
      <span className="flex-1 truncate" style={{ color: BRAND.warm }}>{url}</span>
      <button
        onClick={copy}
        className="flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-1 rounded-lg transition-colors"
        style={{ color: copied ? '#16a34a' : BRAND.dark, backgroundColor: copied ? 'rgba(22,163,74,0.08)' : BRAND.sand }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}

function QuickActions() {
  const [sendPaymentOpen, setSendPaymentOpen] = useState(false)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PillButton href="/dashboard/appointments" icon={<Plus size={13} />} label="New appointment" />
        <PillButton onClick={() => setSendPaymentOpen(true)} icon={<CreditCard size={13} />} label="Send payment link" />
      </div>
      <SendPaymentModal open={sendPaymentOpen} onClose={() => setSendPaymentOpen(false)} />
    </>
  )
}

function PillButton({ onClick, href, icon, label, small }: { onClick?: () => void; href?: string; icon: React.ReactNode; label: string; small?: boolean }) {
  const cls = "flex items-center gap-1.5 px-3 py-2 rounded-full font-medium transition-colors border cursor-pointer"
  const style = { borderColor: BRAND.sand, backgroundColor: 'white', color: BRAND.dark, fontSize: small ? '10px' : '0.75rem' }
  if (href) {
    return <a href={href} className={cls} style={style}>{icon}{label}</a>
  }
  return <button onClick={onClick} className={cls} style={style}>{icon}{label}</button>
}

type Trend = { label: string; positive: boolean | null }

function calcTrend(current: number, previous: number): Trend {
  if (previous === 0 && current > 0) return { label: 'New', positive: true }
  if (previous === 0 && current === 0) return { label: '—', positive: null }
  const pct = ((current - previous) / previous) * 100
  return { label: `${Math.abs(pct).toFixed(1)}%`, positive: pct >= 0 }
}

function TrendBadge({ trend, light }: { trend: Trend; light?: boolean }) {
  const color = trend.positive === null
    ? (light ? 'rgba(255,255,255,0.4)' : BRAND.warm)
    : trend.positive ? '#16a34a' : '#dc2626'
  const Icon = trend.positive === true ? TrendingUp : trend.positive === false ? TrendingDown : null
  return (
    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color }}>
      {Icon && <Icon size={12} />}
      <span>{trend.label} vs last month</span>
    </div>
  )
}

function StatRow({ dashboardAnalytics, growth }: Pick<PageProps, 'dashboardAnalytics' | 'growth'>) {
  const revTrend = calcTrend(growth?.revenue_this_month ?? 0, growth?.revenue_last_month ?? 0)
  const clientTrend = calcTrend(growth?.clients_this_month ?? 0, growth?.clients_last_month ?? 0)
  const revenue = (dashboardAnalytics.revenue.data ?? 0) / 100
  const bookings = dashboardAnalytics.bookings.data ?? 0
  const newClients = dashboardAnalytics.newClients.data ?? 0

  return (
    <div data-tour="dashboard-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="col-span-2 rounded-2xl p-5 my-first-step" style={{ backgroundColor: BRAND.black, color: 'white' }}>
        <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Revenue this month</p>
        <p className="text-4xl font-bold" style={{ fontFamily: SERIF }}>${revenue.toLocaleString()}</p>
        <TrendBadge trend={revTrend} light />
      </div>
      <div className="rounded-2xl p-5 border" style={{ borderColor: BRAND.sand, backgroundColor: 'white' }}>
        <p className="text-xs mb-1" style={{ color: BRAND.warm }}>Bookings this month</p>
        <p className="text-3xl font-semibold" style={{ fontFamily: SERIF, color: BRAND.dark }}>{bookings}</p>
      </div>
      <div className="rounded-2xl p-5 border" style={{ borderColor: BRAND.sand, backgroundColor: 'white' }}>
        <p className="text-xs mb-1" style={{ color: BRAND.warm }}>New clients</p>
        <p className="text-3xl font-semibold" style={{ fontFamily: SERIF, color: BRAND.dark }}>{newClients}</p>
        <TrendBadge trend={clientTrend} />
      </div>
    </div>
  )
}

function BookingLimitBanner({ monthlyBookingCount, planType, businessData }: { monthlyBookingCount: number; planType: 'STARTER' | 'GROWTH'; businessData: Business }) {
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('booking_warning_dismissed')
    if (stored) {
      try {
        const { ts } = JSON.parse(stored)
        if (Date.now() - ts < 24 * 60 * 60 * 1000) setDismissed(true)
      } catch { /* ignore */ }
    }
  }, [])

  if (planType === 'GROWTH') return null

  const isAtLimit = monthlyBookingCount >= 10
  const isNearLimit = monthlyBookingCount >= 7 && monthlyBookingCount < 10

  if (!isAtLimit && !isNearLimit) return null
  if (isNearLimit && dismissed) return null

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const bd = businessData as any
      const session = bd.stripe_customer_id
        ? await createSubscriptionForExistingCustomer(bd.stripe_customer_id)
        : await createSubscriptionCheckout(bd.had_trial, bd.business_id)
      if (session.url) router.push(session.url)
    } catch {
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('booking_warning_dismissed', JSON.stringify({ ts: Date.now() }))
    setDismissed(true)
  }

  if (isAtLimit) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
        style={{ backgroundColor: 'rgba(252,97,97,0.08)', border: '1px solid rgba(252,97,97,0.3)', color: '#FC6161' }}>
        <div>
          <span className="font-medium">You've reached your monthly booking limit.</span>
          <span className="ml-1" style={{ opacity: 0.75 }}>New clients can't book until next month.</span>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="shrink-0 ml-4 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#FC6161', color: 'white' }}
        >
          {loading ? '…' : 'Upgrade Now →'}
        </button>
      </div>
    )
  }

  const remaining = 10 - monthlyBookingCount
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
      style={{ backgroundColor: 'rgba(201,151,74,0.1)', border: '1px solid rgba(201,151,74,0.3)', color: '#C9974A' }}>
      <div>
        <span className="font-medium">You have {remaining} booking{remaining === 1 ? '' : 's'} left this month.</span>
        <span className="ml-1" style={{ opacity: 0.75 }}>Upgrade to Growth for unlimited bookings.</span>
      </div>
      <div className="flex items-center gap-2 ml-4 shrink-0">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50"
          style={{ backgroundColor: '#C9974A', color: 'white' }}
        >
          {loading ? '…' : 'Start Free Trial →'}
        </button>
        <button onClick={handleDismiss} style={{ opacity: 0.6 }}><X size={14} /></button>
      </div>
    </div>
  )
}

function StarterUpgradeCard({ monthlyBookingCount, planType, businessData }: { monthlyBookingCount: number; planType: 'STARTER' | 'GROWTH'; businessData: Business }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  if (planType !== 'STARTER') return null

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const bd = businessData as any
      const session = bd.stripe_customer_id
        ? await createSubscriptionForExistingCustomer(bd.stripe_customer_id)
        : await createSubscriptionCheckout(bd.had_trial, bd.business_id)
      if (session.url) router.push(session.url)
    } catch {
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pct = Math.min((monthlyBookingCount / 10) * 100, 100)

  return (
    <div className="rounded-2xl p-5 border" style={{ backgroundColor: BRAND.cream, borderColor: BRAND.sand }}>
      <span className="text-xs font-mono font-semibold tracking-widest" style={{ color: BRAND.gold }}>STARTER PLAN</span>
      <div className="mt-3 mb-4">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: BRAND.warm }}>
          <span>Monthly bookings</span>
          <span>{monthlyBookingCount} / 10 used</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: BRAND.sand }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? BRAND.red : BRAND.gold }}
          />
        </div>
      </div>
      <div className="space-y-1.5 mb-4">
        {['Unlimited bookings', 'Drag & drop page builder', 'Apple Pay, Google Pay, Cash App'].map(f => (
          <div key={f} className="flex items-center gap-2 text-sm" style={{ color: BRAND.dark }}>
            <Check size={13} style={{ color: BRAND.gold }} />
            <span>{f}</span>
          </div>
        ))}
      </div>
      <div className="mb-3">
        <p className="text-sm font-semibold" style={{ color: BRAND.dark }}>$25/month</p>
        <p className="text-xs" style={{ color: BRAND.warm }}>14-day free trial · no credit card required</p>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50"
        style={{ backgroundColor: BRAND.red, color: 'white' }}
      >
        {loading ? 'Loading…' : 'Upgrade to Growth →'}
      </button>
    </div>
  )
}

function WeekStrip({ weekAppointments }: { weekAppointments: Appointment[] }) {
  const today = DateTime.now()
  const weekStart = today.startOf('week')
  const days = Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i }))

  return (
    <div data-tour="dashboard-week-strip">
      <p className="text-xs font-medium mb-2" style={{ color: BRAND.warm }}>This week</p>
      <div className="flex gap-1">
        {days.map(day => {
          const isToday = day.hasSame(today, 'day')
          const count = weekAppointments.filter(a => DateTime.fromISO(a.start).hasSame(day, 'day')).length
          return (
            <div
              key={day.toISODate()}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
              style={{ backgroundColor: isToday ? BRAND.black : BRAND.cream }}
            >
              <span className="text-xs" style={{ color: isToday ? 'rgba(255,255,255,0.6)' : BRAND.warm }}>
                {day.toFormat('ccc')[0]}
              </span>
              <span className="text-sm font-semibold" style={{ fontFamily: SERIF, color: isToday ? 'white' : BRAND.dark }}>
                {day.toFormat('d')}
              </span>
              {count > 0 ? (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isToday ? BRAND.red : BRAND.gold }} />
              ) : (
                <span className="w-1.5 h-1.5" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PendingAlert({ count }: { count: number }) {
  return (
    <a
      href="/dashboard/appointments"
      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
      style={{ backgroundColor: 'rgba(201,151,74,0.08)', color: BRAND.gold }}
    >
      <div className="flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{count} pending {count === 1 ? 'appointment' : 'appointments'} awaiting confirmation</span>
      </div>
      <ChevronRight size={16} />
    </a>
  )
}

const STATUS_ACCENT: Record<string, string> = {
  CONFIRMED: '#FC6161',
  PENDING: '#C9974A',
  COMPLETED: '#16a34a',
  CANCELLED: '#6F6863',
  DENIED: '#6F6863',
  NO_SHOW: '#ef4444',
}

function TodaySchedule({ appointments, businessData }: { appointments: Appointment[]; businessData: Business }) {
  const [selected, setSelected] = useState<Appointment | null>(null)

  return (
    <div data-tour="dashboard-today">
      <p className="text-xs font-medium mb-3" style={{ color: BRAND.warm }}>Today's schedule</p>
      {appointments.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: BRAND.warm }}>Nothing scheduled for today</p>
      ) : (
        <div className="space-y-2">
          {appointments.map((apt, i) => {
            const accent = STATUS_ACCENT[apt.status] ?? BRAND.sand
            return (
              <button
                key={i}
                onClick={() => setSelected(apt)}
                className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors hover:bg-gray-50"
                style={{ borderColor: BRAND.sand }}
              >
                <div className="w-1 self-stretch rounded-full shrink-0 mt-0.5" style={{ backgroundColor: accent }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: BRAND.dark }}>
                    {(apt as any).service_data?.name} with {(apt as any).client_metadata?.firstName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: BRAND.warm }}>
                    {DateTime.fromISO(apt.start).toFormat('h:mm a')} – {DateTime.fromISO(apt.end).toFormat('h:mm a')}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: `${accent}18`, color: accent }}
                >
                  {apt.status}
                </span>
              </button>
            )
          })}
        </div>
      )}
      <AppointmentDetailsModal appointment={selected} businessData={businessData} onClose={() => setSelected(null)} />
    </div>
  )
}

function UpcomingList({ appointments, businessData }: { appointments: Appointment[]; businessData: Business }) {
  const [selected, setSelected] = useState<Appointment | null>(null)

  if (appointments.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium mb-3" style={{ color: BRAND.warm }}>Upcoming confirmed</p>
      <div className="space-y-1">
        {appointments.map((apt, i) => {
          const start = DateTime.fromISO(apt.start)
          return (
            <button
              key={i}
              onClick={() => setSelected(apt)}
              className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND.sand }}
            >
              <div className="text-center shrink-0 w-10">
                <p className="text-xs" style={{ color: BRAND.warm }}>{start.toFormat('MMM')}</p>
                <p className="text-lg font-bold leading-none" style={{ fontFamily: SERIF, color: BRAND.dark }}>{start.toFormat('d')}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: BRAND.dark }}>
                  {(apt as any).service_data?.name} with {(apt as any).client_metadata?.firstName}
                </p>
                <p className="text-xs" style={{ color: BRAND.warm }}>{start.toFormat('h:mm a')}</p>
              </div>
              <ChevronRight size={14} style={{ color: BRAND.warm }} />
            </button>
          )
        })}
      </div>
      <AppointmentDetailsModal appointment={selected} businessData={businessData} onClose={() => setSelected(null)} />
    </div>
  )
}

function AppointmentDetailsModal({ appointment, businessData, onClose }: { appointment: Appointment | null; businessData: Business; onClose: () => void }) {
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!appointment) return
    const apt = appointment as any
    setSending(true)
    await sendPaymentLink({
      clientData: {
        firstName: apt.client_metadata.firstName,
        lastName: apt.client_metadata.lastName,
        email: apt.client_metadata.email,
        phoneNumber: apt.client_metadata.phoneNumber,
      },
      businessData: {
        id: apt.business,
        name: businessData.business_name,
        email: businessData.email,
      },
      appointmentID: apt.id,
      serviceName: apt.service_data.name,
    })
    setSending(false)
    setEmailSent(true)
  }

  return (
    <Dialog open={!!appointment} onOpenChange={open => { if (!open) { onClose(); setEmailSent(false) } }}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <p className="text-xs" style={{ color: BRAND.warm }}>Details and payment options for this appointment</p>
        </DialogHeader>
        {appointment && (() => {
          const apt = appointment as any
          return (
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Date" value={DateTime.fromISO(apt.start).toFormat('DDDD')} />
                <DetailField label="Time" value={`${DateTime.fromISO(apt.start).toFormat('t')} – ${DateTime.fromISO(apt.end).toFormat('t')}`} />
                <DetailField label="Service" value={apt.service_data.name} />
                <DetailField label="Price" value={`$${apt.service_data.price / 100}`} />
                <DetailField label="Client" value={`${apt.client_metadata.firstName} ${apt.client_metadata.lastName}`} />
                <DetailField label="Email" value={apt.client_metadata.email} />
                <DetailField label="Phone" value={formatPhone(apt.client_metadata.phoneNumber)} />
                <DetailField label="Status" value={apt.status} />
              </div>
              {businessData.completed_stripe_onboarding && (
                <div className="pt-3 border-t" style={{ borderColor: BRAND.sand }}>
                  <p className="text-xs mb-3" style={{ color: BRAND.warm }}>QR code for payment</p>
                  <div style={{ height: 160, width: '100%' }}>
                    <QRCode
                      size={256}
                      style={{ height: '100%', maxWidth: '100%', width: '100%' }}
                      value={`/appointments/${apt.id}/business/${apt.business}/eoa-payment`}
                      viewBox="0 0 256 256"
                    />
                  </div>
                  <button
                    disabled={sending || emailSent}
                    onClick={handleSend}
                    className="mt-3 w-full py-2 px-4 rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: BRAND.black, color: 'white' }}
                  >
                    {emailSent ? 'Link sent!' : sending ? 'Sending…' : 'Send payment link to client'}
                  </button>
                </div>
              )}
            </div>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}

function SendPaymentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Payment Link</DialogTitle>
          <p className="text-xs" style={{ color: BRAND.warm }}>Open an appointment to send a payment link to the client</p>
        </DialogHeader>
        <a
          href="/dashboard/appointments"
          className="mt-2 flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: BRAND.cream, color: BRAND.dark }}
        >
          View all appointments <ChevronRight size={16} />
        </a>
      </DialogContent>
    </Dialog>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium" style={{ color: BRAND.warm }}>{label}</p>
      <p className="text-sm mt-0.5" style={{ color: BRAND.dark }}>{value}</p>
    </div>
  )
}

function formatPhone(raw: string): string {
  if (!raw || raw.length < 10) return raw
  return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`
}
