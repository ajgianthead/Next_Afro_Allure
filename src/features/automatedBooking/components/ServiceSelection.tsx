'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { ServiceType } from "@/lib/service/Service";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useBooking } from "../hooks/useBookingData";


export const ServiceSelection = () => {
    const { data }: { data: BookingData } = useBooking();
    return (
        <div>
            <div className="mb-5">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--t-text)', fontFamily: 'var(--t-font)' }}>Select Service</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--t-muted)' }}>Pick a service to start the booking process</p>
            </div>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                {data.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    )
}

const ServiceCard = ({ service }: { service: ServiceType }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set<string>([...data.selectedAddons]))
    const [openModal, setOpenModal] = useState<boolean>(false)
    const selected = service.id === data.selectedService

    const totalCents = service.price + Array.from(selectedAddons).reduce((sum, id) => {
        const a = (service.addons as any[])?.find((a: any) => a.id === id)
        return sum + (a?.price ?? 0)
    }, 0)

    return (
        <>
            {/* Service detail modal */}
            {openModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    onClick={() => setOpenModal(false)}
                >
                    <div
                        className="w-full max-w-md overflow-hidden"
                        style={{
                            backgroundColor: 'var(--t-card)',
                            border: '1px solid var(--t-border)',
                            borderRadius: 'var(--t-card-r)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--t-border)' }}>
                            <h3 className="text-base font-semibold" style={{ color: 'var(--t-text)' }}>{service.name}</h3>
                            <button onClick={() => setOpenModal(false)} style={{ color: 'var(--t-muted)' }} className="hover:opacity-70 transition-opacity">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Image */}
                        {service.photo_url && (
                            <div className="w-full h-48 overflow-hidden">
                                <Image
                                    src={service.photo_url}
                                    alt={service.name}
                                    width={500}
                                    height={300}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--t-muted)' }}>{service.description}</p>
                                <span className="text-base font-bold shrink-0" style={{ color: 'var(--t-primary)', fontFamily: 'var(--t-font)' }}>
                                    ${service.price / 100}
                                </span>
                            </div>

                            <div style={{ height: 1, backgroundColor: 'var(--t-border)' }} />

                            {/* Add-ons */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--t-muted)' }}>Add-ons</p>
                                {(service.addons as any[])?.length ? (
                                    (service.addons as any[]).map((addon: any) => (
                                        <label
                                            key={addon.id}
                                            className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                                            style={{
                                                border: `1px solid ${selectedAddons.has(addon.id) ? 'var(--t-primary)' : 'var(--t-border)'}`,
                                                backgroundColor: selectedAddons.has(addon.id) ? 'rgba(var(--t-primary), 0.04)' : 'transparent',
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Custom checkbox */}
                                                <div
                                                    className="flex items-center justify-center rounded-md shrink-0 transition-colors"
                                                    style={{
                                                        width: 18, height: 18,
                                                        border: selectedAddons.has(addon.id) ? 'none' : '1.5px solid var(--t-border)',
                                                        backgroundColor: selectedAddons.has(addon.id) ? 'var(--t-primary)' : 'transparent',
                                                    }}
                                                    onClick={() => {
                                                        const next = new Set(selectedAddons)
                                                        if (selectedAddons.has(addon.id)) next.delete(addon.id)
                                                        else next.add(addon.id)
                                                        setSelectedAddons(next)
                                                        setData((prev) => ({ ...prev, selectedAddons: Array.from(next) }))
                                                    }}
                                                >
                                                    {selectedAddons.has(addon.id) && <Check size={11} color="var(--t-primary-text)" strokeWidth={3} />}
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--t-text)' }}>{addon.name}</p>
                                            </div>
                                            <span className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>+${addon.price / 100}</span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-sm" style={{ color: 'var(--t-muted)' }}>No add-ons available</p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex items-center justify-between" style={{ borderTop: '1px solid var(--t-border)', paddingTop: 16 }}>
                            <div>
                                <span className="text-xs" style={{ color: 'var(--t-muted)' }}>Total</span>
                                <span className="ml-2 text-lg font-bold" style={{ color: 'var(--t-primary)', fontFamily: 'var(--t-font)' }}>
                                    ${totalCents / 100}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setData((prev) => ({ ...prev, selectedService: service.id }))
                                    setOpenModal(false)
                                }}
                                className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-90"
                                style={{
                                    backgroundColor: 'var(--t-primary)',
                                    color: 'var(--t-primary-text)',
                                    borderRadius: 'var(--t-btn-r)',
                                    border: 'none',
                                }}
                            >
                                Select Service
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Service card */}
            <div
                onClick={() => setOpenModal(true)}
                className="cursor-pointer overflow-hidden transition-all duration-200"
                style={{
                    border: `${selected ? 2 : 1}px solid ${selected ? 'var(--t-primary)' : 'var(--t-border)'}`,
                    borderRadius: 'var(--t-card-r)',
                    backgroundColor: 'var(--t-card)',
                    boxShadow: selected ? '0 0 0 3px rgba(252,97,97,0.12)' : undefined,
                }}
            >
                {service.photo_url?.length ? (
                    <div className="w-full h-32 overflow-hidden">
                        <Image
                            src={service.photo_url}
                            alt={service.name}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                ) : (
                    <div
                        className="w-full h-32 flex items-center justify-center text-sm"
                        style={{ backgroundColor: 'var(--t-bg)', color: 'var(--t-muted)' }}
                    >
                        No Image
                    </div>
                )}
                <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--t-text)' }}>{service.name}</p>
                        <span className="text-sm font-bold shrink-0" style={{ color: 'var(--t-primary)' }}>${service.price / 100}</span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--t-muted)' }}>{service.description}</p>
                </div>
            </div>
        </>
    )
}
