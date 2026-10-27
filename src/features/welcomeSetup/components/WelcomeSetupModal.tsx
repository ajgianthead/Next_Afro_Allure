'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { AddressErrors, BusinessAddress, EMPTY_ADDRESS, validateBusinessAddress } from '@/lib/businessAddress'
import { browserTimezone } from '@/lib/timezone'
import type { PlanType } from '@/lib/beta'
import { createDefaultAvailability, type AvailabilityData } from '@/features/availability/utils'
import type { ServiceData } from '@/features/services/types'
import {
    finishWelcomeAction,
    getWelcomeSetupAction,
    saveWelcomeHoursAction,
    saveWelcomeLocationAction,
    saveWelcomePoliciesAction,
    saveWelcomeServicesAction,
    markWelcomeWebsiteAction,
    type WelcomePolicy,
} from '../server/actions'
import { defaultSiteData, type SiteData, type SiteInfo } from '@/features/siteBuilder/siteData'
import { deleteSiteMediaAction, getSitePreviewInfoAction, saveTemplateSiteAction } from '@/features/siteBuilder/server/actions'
import { useSiteUploads } from '@/features/siteBuilder/components/MediaPanel'
import { WebsiteSetupStep } from '@/features/siteBuilder/components/WebsiteSetupStep'
import { firstUnfinishedStep, isUntouchedExampleService, scheduleProblem, WELCOME_STEPS, type WelcomeStep as Step } from '../progress'
import { blankDraft, draftFromService, draftPayload, draftProblem, type ServiceDraft } from '../serviceDrafts'
import { BRAND } from './shared'
import { WelcomeStep } from './steps/WelcomeStep'
import { LocationStep } from './steps/LocationStep'
import { HoursStep } from './steps/HoursStep'
import { ServicesStep } from './steps/ServicesStep'
import { PoliciesStep } from './steps/PoliciesStep'
import { FirstAppointmentStep, type BookedAppointment } from './steps/FirstAppointmentStep'
import { DoneStep } from './steps/DoneStep'

const realServices = (services: ServiceData[]) => services.filter(s => !isUntouchedExampleService(s))

/**
 * First-run setup for a new business: location, hours, services (with Smart
 * Pricing), booking policies, an optional website and, optionally, a first appointment. Each step
 * saves when they continue, so leaving halfway resumes where they stopped.
 */
export function WelcomeSetupModal({ open, onComplete }: { open: boolean; onComplete: () => void }) {
    const router = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [step, setStep] = useState<Step>('welcome')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [businessId, setBusinessId] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [urlName, setUrlName] = useState('')
    const [planType, setPlanType] = useState<PlanType>('STARTER')

    const [address, setAddress] = useState<BusinessAddress>(EMPTY_ADDRESS)
    const [addressTouched, setAddressTouched] = useState(false)
    const [addressErrors, setAddressErrors] = useState<AddressErrors>({})

    const [schedules, setSchedules] = useState<AvailabilityData[]>([])
    const savedScheduleIds = useRef<string[]>([])

    const [drafts, setDrafts] = useState<ServiceDraft[]>([])
    const [openServiceId, setOpenServiceId] = useState<string | null>(null)
    const [showServiceProblems, setShowServiceProblems] = useState(false)
    const knownServiceIds = useRef<string[]>([])
    const [savedServices, setSavedServices] = useState<ServiceData[]>([])

    const [policy, setPolicy] = useState<WelcomePolicy>({ cancelDayLimit: 0, rescheduleDayLimit: 0, rescheduleLimit: 0, bookAheadValue: '1 month', readBeforeBooking: '' })
    const [siteDraft, setSiteDraft] = useState<SiteData>(() => defaultSiteData())
    const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
    const [siteCreated, setSiteCreated] = useState(false)
    const removedSitePaths = useRef<Set<string>>(new Set())
    const uploads = useSiteUploads(businessId, update => setSiteDraft(prev => update(prev)), paths => paths.forEach(p => removedSitePaths.current.add(p)))
    const siteUploading = Object.keys(uploads.progress).length > 0

    const [booked, setBooked] = useState<BookedAppointment | null>(null)
    const [finished, setFinished] = useState(false)

    const load = async () => {
        setLoadError(null)
        const res = await getWelcomeSetupAction().catch(() => null)
        if (!res?.ok) {
            setLoadError(res?.error ?? 'Could not load your account. Please try again.')
            return
        }
        const data = res.data
        setBusinessId(data.businessId)
        setBusinessName(data.businessName)
        if (data.site) setSiteDraft(data.site)
        setUrlName(data.urlName)
        setPlanType(data.planType)
        setAddress({ ...EMPTY_ADDRESS, ...(data.address ?? {}) })

        const loadedSchedules = data.schedules.length ? data.schedules : [{ ...createDefaultAvailability(), name: 'Regular hours' }]
        setSchedules(loadedSchedules)
        savedScheduleIds.current = data.schedules.map(s => s.id)

        const services = realServices(data.services)
        knownServiceIds.current = services.map(s => s.id)
        setSavedServices(services)
        if (services.length) {
            setDrafts(services.map(draftFromService))
        } else {
            const first = blankDraft(loadedSchedules[0].id)
            setDrafts([first])
            setOpenServiceId(first.form.id)
        }

        setPolicy(data.policy)
        setStep(firstUnfinishedStep(data.toursCompleted))
        setLoaded(true)
    }

    useEffect(() => {
        if (open && !loaded) load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Reaching the end marks the setup finished, so it isn't shown again.
    const finish = async () => {
        setSaving(true)
        setError(null)
        try {
            const res = await finishWelcomeAction()
            if (res.ok) setFinished(true)
            else setError(res.error)
        } catch {
            setError('Could not finish setup. Please try again.')
        } finally {
            setSaving(false)
        }
    }
    // The website step previews templates with the business's own services, hours and reviews.
    useEffect(() => {
        if (step !== 'website' || siteInfo) return
        getSitePreviewInfoAction().then(res => { if (res.ok) setSiteInfo(res.data) }).catch(() => { })
    }, [step, siteInfo])

    useEffect(() => {
        if (step === 'done' && !finished) finish()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step])

    const index = WELCOME_STEPS.indexOf(step)
    const go = (next: Step) => {
        setError(null)
        setStep(next)
    }

    const run = async (save: () => Promise<string | null>, next: Step) => {
        setSaving(true)
        setError(null)
        try {
            const problem = await save()
            if (problem) setError(problem)
            else go(next)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const saveLocation = () => run(async () => {
        setAddressTouched(true)
        const fieldErrors = validateBusinessAddress(address, { required: true })
        setAddressErrors(fieldErrors)
        if (Object.keys(fieldErrors).length > 0) return 'Please fix the highlighted fields.'
        const res = await saveWelcomeLocationAction(address, browserTimezone())
        if (!res.ok) {
            setAddressErrors(res.fieldErrors ?? {})
            return res.error
        }
        return null
    }, 'hours')

    const saveHours = () => run(async () => {
        for (const schedule of schedules) {
            const problem = scheduleProblem(schedule)
            if (problem) return schedules.length > 1 ? `${schedule.name || 'A schedule'}: ${problem}` : problem
        }
        const removed = savedScheduleIds.current.filter(id => !schedules.some(s => s.id === id))
        const res = await saveWelcomeHoursAction(schedules, removed)
        if (!res.ok) return res.error
        setSchedules(res.data)
        savedScheduleIds.current = res.data.map(s => s.id)
        // Services on a schedule that was removed move to the first one.
        const ids = new Set(res.data.map(s => s.id))
        setDrafts(prev => prev.map(d => (ids.has(d.form.availability) ? d : { ...d, form: { ...d.form, availability: res.data[0].id } })))
        return null
    }, 'services')

    const saveServices = () => run(async () => {
        setShowServiceProblems(true)
        if (!drafts.length) return 'Add at least one service.'
        const withProblem = drafts.find(d => draftProblem(d))
        if (withProblem) {
            setOpenServiceId(withProblem.form.id)
            return `${withProblem.form.name.trim() || 'A service'}: ${draftProblem(withProblem)}`
        }
        const res = await saveWelcomeServicesAction(drafts.map(draftPayload), knownServiceIds.current)
        if (!res.ok) return res.error
        const services = realServices(res.data)
        knownServiceIds.current = services.map(s => s.id)
        setSavedServices(services)
        setOpenServiceId(null)
        return null
    }, 'policies')

    const savePolicies = () => run(async () => {
        const res = await saveWelcomePoliciesAction(policy)
        return res.ok ? null : res.error
    }, 'website')

    // First photo or video becomes the cover; the rest go in the gallery.
    const addSiteMedia = (files: File[]) => {
        const needsCover = !siteDraft.media.cover && uploads.progress.cover === undefined
        if (needsCover && files[0]) uploads.setSingle('cover', files[0])
        const rest = needsCover ? files.slice(1) : files
        if (rest.length) uploads.addToGallery(rest, rest.length)
    }

    const saveWebsite = () => run(async () => {
        if (siteUploading) return 'Wait for your uploads to finish.'
        const res = await saveTemplateSiteAction(siteDraft, { publish: true })
        if (!res.ok) return res.error
        setSiteDraft(res.data)
        setSiteCreated(true)
        const stale = [...removedSitePaths.current]
        removedSitePaths.current.clear()
        if (stale.length) deleteSiteMediaAction(stale).catch(() => { })
        await markWelcomeWebsiteAction()
        return null
    }, 'appointment')

    const skipWebsite = () => run(async () => {
        // Nothing was saved, so files uploaded on this step aren't needed.
        const uploaded = [siteDraft.media.logo, siteDraft.media.cover, siteDraft.media.about, ...siteDraft.media.gallery]
            .map(m => m?.path).filter((p): p is string => !!p)
        const paths = [...new Set([...removedSitePaths.current, ...(siteCreated ? [] : uploaded)])]
        removedSitePaths.current.clear()
        if (paths.length) deleteSiteMediaAction(paths).catch(() => { })
        await markWelcomeWebsiteAction()
        return null
    }, 'appointment')

    const primary: Record<Step, { label: string; action: () => void } | null> = {
        welcome: { label: "Let's go", action: () => go('location') },
        location: { label: 'Save and continue', action: saveLocation },
        hours: { label: 'Save and continue', action: saveHours },
        services: { label: 'Save and continue', action: saveServices },
        policies: { label: 'Save and continue', action: savePolicies },
        website: { label: siteCreated ? 'Update my site' : 'Create my site', action: saveWebsite },
        appointment: { label: 'Skip for now', action: () => go('done') },
        done: finished ? { label: 'Go to dashboard', action: () => { router.refresh(); onComplete() } } : { label: saving ? 'Finishing' : 'Try again', action: finish },
    }
    const current = primary[step]
    const canGoBack = index > 0 && step !== 'done'
    const wide = step === 'services' || step === 'hours' || step === 'website'
    const shownAddressErrors = addressTouched ? validateBusinessAddress(address, { required: true }) : addressErrors

    return (
        // Can't be dismissed: no close button, Escape and outside clicks are
        // ignored. Required steps save as they go; the last step closes it.
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={e => e.preventDefault()}
                onPointerDownOutside={e => e.preventDefault()}
                onInteractOutside={e => e.preventDefault()}
                className={`w-[calc(100vw-2rem)] ${wide ? 'max-w-2xl' : 'max-w-xl'} p-0 overflow-hidden gap-0 rounded-2xl`}
                style={{ border: `1px solid ${BRAND.border}`, backgroundColor: '#FFFFFF' }}
            >
                <div className="max-h-[80dvh] overflow-y-auto">
                    <div className="p-5 sm:p-7">
                        {!loaded ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                <DialogTitle className="sr-only">Setting up your account</DialogTitle>
                                <DialogDescription className="sr-only">Loading your account details</DialogDescription>
                                {loadError ? (
                                    <>
                                        <p className="text-sm" style={{ color: BRAND.error }}>{loadError}</p>
                                        <button
                                            type="button"
                                            onClick={load}
                                            className="h-9 rounded-full px-4 text-sm font-medium"
                                            style={{ backgroundColor: BRAND.dark, color: '#FFFFFF' }}
                                        >
                                            Try again
                                        </button>
                                    </>
                                ) : (
                                    <Loader2 size={22} className="animate-spin" color={BRAND.warm} />
                                )}
                            </div>
                        ) : (
                            <>
                                {step === 'welcome' && <WelcomeStep businessName={businessName} />}
                                {step === 'location' && (
                                    <LocationStep
                                        address={address}
                                        errors={shownAddressErrors}
                                        onChange={(key, value) => {
                                            setAddress(prev => ({ ...prev, [key]: value }))
                                            setError(null)
                                        }}
                                    />
                                )}
                                {step === 'hours' && <HoursStep schedules={schedules} planType={planType} onChange={setSchedules} />}
                                {step === 'services' && (
                                    <ServicesStep
                                        drafts={drafts}
                                        schedules={schedules}
                                        openId={openServiceId}
                                        showProblems={showServiceProblems}
                                        onOpen={setOpenServiceId}
                                        onChange={next => {
                                            setDrafts(next)
                                            setError(null)
                                        }}
                                    />
                                )}
                                {step === 'policies' && <PoliciesStep policy={policy} onChange={setPolicy} />}
                                {step === 'website' && (
                                    <WebsiteSetupStep
                                        info={siteInfo}
                                        site={siteDraft}
                                        onChange={p => {
                                            setSiteDraft(prev => ({ ...prev, ...p }))
                                            setError(null)
                                        }}
                                        uploads={uploads}
                                        addMedia={addSiteMedia}
                                    />
                                )}
                                {step === 'appointment' && (
                                    <FirstAppointmentStep
                                        services={savedServices}
                                        onBooked={appointment => {
                                            setBooked(appointment)
                                            go('done')
                                        }}
                                    />
                                )}
                                {step === 'done' && <DoneStep urlName={urlName} booked={booked} siteCreated={siteCreated} />}
                            </>
                        )}
                    </div>
                </div>

                {loaded && (
                    <div
                        className="flex flex-col gap-3 px-5 sm:px-7 py-4"
                        style={{ borderTop: `1px solid ${BRAND.border}`, backgroundColor: BRAND.cream }}
                    >
                        {error && <p role="alert" className="text-xs" style={{ color: BRAND.error }}>{error}</p>}
                        {step === 'website' && !siteCreated && (
                            <button
                                type="button"
                                onClick={skipWebsite}
                                disabled={saving}
                                className="self-end min-h-9 text-xs underline disabled:opacity-50"
                                style={{ color: BRAND.warm }}
                            >
                                Skip for now, I&apos;ll make it later
                            </button>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5" aria-label={`Step ${index + 1} of ${WELCOME_STEPS.length}`}>
                                {WELCOME_STEPS.map((s, i) => (
                                    <span
                                        key={s}
                                        className="h-1.5 rounded-full transition-all"
                                        style={{ width: i === index ? 18 : 6, backgroundColor: i <= index ? BRAND.dark : BRAND.border }}
                                    />
                                ))}
                            </div>
                            <div className="ml-auto flex items-center gap-2 shrink-0">
                                {canGoBack && (
                                    <button
                                        type="button"
                                        onClick={() => go(WELCOME_STEPS[index - 1])}
                                        disabled={saving}
                                        className="flex items-center gap-1 rounded-full h-9 px-3 text-sm font-medium disabled:opacity-50"
                                        style={{ border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }}
                                    >
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                )}
                                {current && (
                                    <button
                                        type="button"
                                        onClick={current.action}
                                        disabled={saving || (step === 'website' && siteUploading)}
                                        className="flex items-center gap-1.5 rounded-full h-9 px-4 text-sm font-medium disabled:opacity-50"
                                        style={step === 'appointment'
                                            ? { border: `1px solid ${BRAND.border}`, color: BRAND.ink, backgroundColor: '#FFFFFF' }
                                            : { backgroundColor: step === 'welcome' || step === 'done' ? BRAND.coral : BRAND.dark, color: '#FFFFFF' }}
                                    >
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        {current.label}
                                        {!saving && (step === 'done' ? <Check size={14} /> : step !== 'appointment' && <ArrowRight size={14} />)}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
