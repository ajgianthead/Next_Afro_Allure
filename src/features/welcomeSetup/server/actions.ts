'use server'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/utils/supabase/server'
import type { Database } from '../../../../lib/database.types'
import { effectivePlanType, type PlanType } from '@/lib/beta'
import { AddressErrors, BusinessAddress, normalizeBusinessAddress, validateBusinessAddress } from '@/lib/businessAddress'
import { isValidTimezone } from '@/lib/timezone'
import { STARTER_LIMITS } from '@/features/billing/plans'
import type { AvailabilityData, TimeRange, WeekDay } from '@/features/availability/utils'
import { createAvailabilityAction, deleteAvailabilityAction, updateAvailabilityAction } from '@/features/availability/server/actions'
import { createServiceAction, deleteServiceAction, updateServiceAction } from '@/features/services/server/actions'
import { parseStyleOptions, type StyleOptions } from '@/features/services/pricing'
import { serviceFormProblem } from '@/features/services/serviceForm'
import type { ServiceData } from '@/features/services/types'
import { isUntouchedExampleService, isValidBookAhead, progressKey, scheduleProblem, type SavedWelcomeStep } from '../progress'

type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string }
type Supabase = SupabaseClient<Database>

export interface WelcomePolicy {
    cancelDayLimit: number
    rescheduleDayLimit: number
    rescheduleLimit: number
    bookAheadValue: string
    readBeforeBooking: string
}

export interface WelcomeSetupData {
    businessName: string
    urlName: string
    planType: PlanType
    address: Partial<BusinessAddress> | null
    toursCompleted: Record<string, boolean>
    schedules: AvailabilityData[]
    services: ServiceData[]
    policy: WelcomePolicy
}

const SIGNED_OUT = 'You are signed out. Please sign in again.'
const STYLE_OPTIONS_OFF: StyleOptions = { enabled: false, sizes: [], lengths: [], grid: {}, hair: { mode: 'none', price: 0, note: '' } }

async function ownBusiness(supabase: Supabase) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('business_users')
        .select('business_id, business_name, url_name, plan_type, account_settings, tours_completed, default_availability, booking_policies')
        .eq('user_id', user.id)
        .single()
    return data
}

/** Records finished steps in tours_completed (read fresh so nothing else is lost). */
async function markDone(supabase: Supabase, businessId: string, keys: string[]) {
    const { data } = await supabase.from('business_users').select('tours_completed').eq('business_id', businessId).single()
    const existing = (data?.tours_completed as Record<string, boolean>) ?? {}
    const merged = { ...existing, ...Object.fromEntries(keys.map(k => [k, true])) }
    await supabase.from('business_users').update({ tours_completed: merged }).eq('business_id', businessId)
}
const markStep = (supabase: Supabase, businessId: string, step: SavedWelcomeStep) => markDone(supabase, businessId, [progressKey(step)])

/** The active policy row (business_users.booking_policies), else the newest. */
async function activePolicyRow(supabase: Supabase, businessId: string, activeId: string | null) {
    if (activeId) {
        const { data } = await supabase.from('business_policies').select('*').eq('id', activeId).eq('business', businessId).maybeSingle()
        if (data) return data
    }
    const { data } = await supabase.from('business_policies').select('*').eq('business', businessId).order('created_at', { ascending: false }).limit(1)
    return data?.[0] ?? null
}

const toTimePoint = (t: any) => (t && Number.isFinite(Number(t.hour)) ? { hour: Number(t.hour), minute: Number(t.minute ?? 0) } : null)

function normalizeWeek(week: unknown): WeekDay[] {
    const days = Array.isArray(week) ? week : []
    return Array.from({ length: 7 }, (_, i) => {
        const day: any = days[i] ?? {}
        const ranges: TimeRange[] = Array.isArray(day.timeRanges) && day.timeRanges.length
            ? day.timeRanges.map((r: any) => ({ start: toTimePoint(r?.start), end: toTimePoint(r?.end) }))
            : [{ start: { hour: 9, minute: 0 }, end: { hour: 17, minute: 0 } }]
        return { isChecked: !!day.isChecked, timeRanges: ranges }
    })
}

function toSchedule(row: { id: string; availability_data: unknown }): AvailabilityData {
    const data = (row.availability_data ?? {}) as any
    return {
        id: row.id,
        name: String(data.name ?? ''),
        week: normalizeWeek(data.week),
        specificDates: data.specificDates && typeof data.specificDates === 'object' ? data.specificDates : {},
    }
}

async function loadSchedules(supabase: Supabase, businessId: string) {
    const { data } = await supabase.from('availabilities').select('id, availability_data').eq('business_id', businessId).order('created_at', { ascending: true })
    return (data ?? []).map(toSchedule)
}

async function loadServices(supabase: Supabase, businessId: string) {
    const { data } = await supabase.from('services').select('*').eq('business', businessId).order('created_at', { ascending: true })
    return (data ?? []) as unknown as ServiceData[]
}

const toInt = (v: unknown) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0)

export async function getWelcomeSetupAction(): Promise<Result<WelcomeSetupData>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }

    const [schedules, services, policyRow] = await Promise.all([
        loadSchedules(supabase, business.business_id),
        loadServices(supabase, business.business_id),
        activePolicyRow(supabase, business.business_id, business.booking_policies),
    ])
    const settings = (business.account_settings ?? {}) as Record<string, any>
    return {
        ok: true,
        data: {
            businessName: business.business_name ?? '',
            urlName: business.url_name ?? '',
            planType: effectivePlanType(business.plan_type),
            address: settings.business_address ?? null,
            toursCompleted: (business.tours_completed as Record<string, boolean>) ?? {},
            schedules,
            services,
            policy: {
                cancelDayLimit: toInt(policyRow?.cancel_day_limit),
                rescheduleDayLimit: toInt(policyRow?.reschedule_day_limit),
                rescheduleLimit: toInt(policyRow?.reschedule_limit),
                bookAheadValue: policyRow?.book_ahead_value && isValidBookAhead(policyRow.book_ahead_value) ? policyRow.book_ahead_value : '1 month',
                readBeforeBooking: policyRow?.read_before_booking ?? '',
            },
        },
    }
}

export type SaveLocationResult = { ok: true } | { ok: false; error: string; fieldErrors?: AddressErrors }

/** Saves the business address (or "no fixed location") and the browser's timezone. */
export async function saveWelcomeLocationAction(address: BusinessAddress, timezone: string): Promise<SaveLocationResult> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }

    const fieldErrors = validateBusinessAddress(address, { required: true })
    if (Object.keys(fieldErrors).length > 0) {
        return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
    }

    const settings = (business.account_settings ?? {}) as Record<string, any>
    const { error } = await supabase
        .from('business_users')
        .update({
            account_settings: {
                ...settings,
                business_address: normalizeBusinessAddress(address),
                ...(isValidTimezone(timezone) ? { timezone } : {}),
            } as any,
        })
        .eq('business_id', business.business_id)
    if (error) return { ok: false, error: 'Could not save your address. Please try again.' }
    await markStep(supabase, business.business_id, 'location')
    return { ok: true }
}

/**
 * Saves the weekly schedules: edits existing ones, adds new ones (more than
 * one needs Growth) and removes the ones taken out in the modal.
 */
export async function saveWelcomeHoursAction(schedules: AvailabilityData[], removedIds: string[]): Promise<Result<AvailabilityData[]>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const businessId = business.business_id

    if (!schedules.length) return { ok: false, error: 'Add your working hours.' }
    for (const schedule of schedules) {
        const problem = scheduleProblem(schedule)
        if (problem) return { ok: false, error: schedules.length > 1 ? `${schedule.name || 'A schedule'}: ${problem}` : problem }
    }
    const isStarter = effectivePlanType(business.plan_type) === 'STARTER'
    if (isStarter && schedules.length > STARTER_LIMITS.availabilitySchedules) {
        return { ok: false, error: 'Starter includes one schedule. Upgrade to Growth to add more.' }
    }

    const existingIds = new Set((await loadSchedules(supabase, businessId)).map(s => s.id))
    const keptIds = new Set(schedules.map(s => s.id))
    const defaultId = business.default_availability && keptIds.has(business.default_availability)
        ? business.default_availability
        : schedules[0].id

    try {
        for (const schedule of schedules) {
            const data = { id: schedule.id, name: schedule.name.trim(), week: normalizeWeek(schedule.week), specificDates: schedule.specificDates ?? {} }
            if (existingIds.has(schedule.id)) {
                await updateAvailabilityAction(businessId, data, schedule.id, defaultId)
            } else {
                await createAvailabilityAction(businessId, data)
            }
        }
        if (defaultId !== business.default_availability) {
            await supabase.from('business_users').update({ default_availability: defaultId }).eq('business_id', businessId)
        }
        // Removed last, once the default points at a schedule that's staying.
        for (const id of removedIds) {
            if (existingIds.has(id) && !keptIds.has(id)) await deleteAvailabilityAction(businessId, id)
        }
    } catch (error: any) {
        const message = String(error?.message ?? '')
        if (message === 'AVAILABILITY_LIMIT_REACHED') return { ok: false, error: 'Starter includes one schedule. Upgrade to Growth to add more.' }
        if (message.includes('attached services')) return { ok: false, error: 'A schedule you removed still has services on it. Move those services first.' }
        console.error('Welcome hours save failed:', error)
        return { ok: false, error: 'Could not save your hours. Please try again.' }
    }

    await markStep(supabase, businessId, 'hours')
    return { ok: true, data: await loadSchedules(supabase, businessId) }
}

/**
 * Saves the services from the welcome setup. `knownIds` are the saved
 * services the modal showed; any of those no longer in the list are deleted.
 * The signup example service is removed while it's still untouched.
 */
export async function saveWelcomeServicesAction(services: ServiceData[], knownIds: string[]): Promise<Result<ServiceData[]>> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const businessId = business.business_id

    if (!services.length) return { ok: false, error: 'Add at least one service.' }
    for (const service of services) {
        const problem = serviceFormProblem(service, parseStyleOptions(service.style_options) ?? STYLE_OPTIONS_OFF)
            ?? (service.length > 0 ? null : 'Set how long this service takes.')
        if (problem) return { ok: false, error: `${service.name.trim() || 'A service'}: ${problem}` }
    }

    const [schedules, existing] = await Promise.all([loadSchedules(supabase, businessId), loadServices(supabase, businessId)])
    if (!schedules.length) return { ok: false, error: 'Add your working hours first.' }
    const scheduleIds = new Set(schedules.map(s => s.id))
    const fallbackSchedule = business.default_availability && scheduleIds.has(business.default_availability) ? business.default_availability : schedules[0].id
    const existingById = new Map(existing.map(s => [s.id, s]))
    const listedIds = new Set(services.map(s => s.id))

    try {
        for (const service of services) {
            const payload: ServiceData = {
                ...service,
                name: service.name.trim(),
                description: service.description ?? '',
                business: businessId,
                addons: Array.isArray(service.addons) ? service.addons : [],
                categories: Array.isArray(service.categories) ? service.categories : [],
                availability: scheduleIds.has(service.availability) ? service.availability : fallbackSchedule,
            }
            if (existingById.has(service.id)) await updateServiceAction(businessId, payload)
            else await createServiceAction(businessId, payload)
        }
        const toRemove = existing.filter(s => !listedIds.has(s.id) && (knownIds.includes(s.id) || isUntouchedExampleService(s)))
        for (const service of toRemove) await deleteServiceAction(businessId, service.id)
    } catch (error: any) {
        console.error('Welcome services save failed:', error)
        return { ok: false, error: 'Could not save your services. Please try again.' }
    }

    await markStep(supabase, businessId, 'services')
    return { ok: true, data: await loadServices(supabase, businessId) }
}

/**
 * Saves the cancellation, rescheduling and booking-window rules. Like the
 * Booking Settings page, it adds a new policy row and makes it the active
 * one; deposit, late-fee and no-show settings are carried over unchanged.
 */
export async function saveWelcomePoliciesAction(policy: WelcomePolicy): Promise<Result> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    const businessId = business.business_id

    const days = (v: number) => Number.isInteger(v) && v >= 0 && v <= 60
    if (!days(policy.cancelDayLimit) || !days(policy.rescheduleDayLimit)) return { ok: false, error: 'Use a number of days between 0 and 60.' }
    if (!Number.isInteger(policy.rescheduleLimit) || policy.rescheduleLimit < 0 || policy.rescheduleLimit > 20) {
        return { ok: false, error: 'Use a number of reschedules between 0 and 20.' }
    }
    if (!isValidBookAhead(policy.bookAheadValue)) return { ok: false, error: 'Pick how far ahead clients can book.' }

    const current = await activePolicyRow(supabase, businessId, business.booking_policies)
    const { id: _id, created_at: _created, updated_at: _updated, ...carried } = (current ?? {}) as Partial<Database['public']['Tables']['business_policies']['Row']>
    const { data: inserted, error } = await supabase
        .from('business_policies')
        .insert({
            deposit: { enabled: false, settings: { type: 'percent', value: 20 } },
            late_fee: { enabled: false },
            no_show: { enabled: false, level: 'strict' },
            ...carried,
            business: businessId,
            cancel_day_limit: policy.cancelDayLimit,
            reschedule_day_limit: policy.rescheduleDayLimit,
            reschedule_limit: policy.rescheduleLimit,
            book_ahead_value: policy.bookAheadValue,
            read_before_booking: policy.readBeforeBooking.slice(0, 5000),
        })
        .select('id')
        .single()
    if (error || !inserted) {
        console.error('Welcome policy save failed:', error)
        return { ok: false, error: 'Could not save your policies. Please try again.' }
    }
    await supabase.from('business_users').update({ booking_policies: inserted.id }).eq('business_id', businessId)
    await markStep(supabase, businessId, 'policies')
    return { ok: true, data: undefined }
}

/** Marks the welcome setup as finished, so the dashboard tour can start. */
export async function finishWelcomeAction(): Promise<Result> {
    const supabase = await createClient()
    const business = await ownBusiness(supabase)
    if (!business) return { ok: false, error: SIGNED_OUT }
    await markDone(supabase, business.business_id, ['welcome'])
    return { ok: true, data: undefined }
}
