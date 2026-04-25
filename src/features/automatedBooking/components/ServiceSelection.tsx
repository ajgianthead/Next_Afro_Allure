'use client'

import { BookingData } from "@/features/automatedBooking/context/BookingDataContext";
import { Caption, Text, Title } from "@/components/tailus-ui/typography";
import { ServiceType } from "@/lib/service/Service";
import { Button, DialogActions, DialogContent, Modal, ModalClose, ModalDialog } from "@mui/joy";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useBooking } from "../hooks/useBookingData";


export const ServiceSelection = () => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    return (
        <div className=''>
            <div className='mb-5'>
                <Title>Select Service</Title>
                <Caption>Pick a service to start the booking process</Caption>
            </div>
            <div className='mt-8 overflow-y-scroll'>
                <div className='grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-2 mr-5 h-87.5'>
                    {data.services.map((service, index: number) => {
                        return (
                            <div key={service.id} className="w-full col-span-1">
                                <ServiceCard service={service} />
                            </div>
                        )
                    })}
                </div>


            </div>
        </div>
    )
}

const ServiceCard = ({ service }: { service: ServiceType }) => {
    const { data, setData }: { data: BookingData, setData: Dispatch<SetStateAction<BookingData>> } = useBooking();
    const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set<string>([...data.selectedAddons]))
    const [openModal, setOpenModal] = useState<boolean>(false)

    return (
        <div>
            <Modal open={openModal} onClose={() => {
                setOpenModal(false)
            }}>
                <ModalDialog className="w-md rounded-2xl">
                    <ModalClose />

                    <DialogContent className="p-0 overflow-hidden">
                        {/* Image */}
                        {service?.photo_url && (
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
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">{service.name}</h2>
                                    <p className="text-sm text-gray-500">
                                        {service.description}
                                    </p>
                                </div>

                                <span className="text-lg font-bold text-indigo-600">
                                    ${service.price / 100}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="border-t" />

                            {/* Add-ons */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold">Add-ons</h3>

                                {service.addons?.length ? (
                                    service.addons.map((addon) => (
                                        <label
                                            key={addon.id}
                                            className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    className="accent-indigo-600"
                                                    checked={selectedAddons.has(addon.id)}
                                                    onChange={(e) => {
                                                        const next = new Set(selectedAddons)
                                                        if (e.target.checked) next.add(addon.id)
                                                        else next.delete(addon.id)
                                                        setSelectedAddons(next)
                                                        setData((prev) => ({ ...prev, selectedAddons: Array.from(next) }))
                                                    }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{addon.name}</p>
                                                    {/* <p className="text-xs text-gray-500">
                                                        {addon.description}
                                                    </p> */}
                                                </div>
                                            </div>

                                            <span className="text-sm font-semibold">
                                                +${addon.price / 100}
                                            </span>
                                        </label>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400">No add-ons available</p>
                                )}
                            </div>
                        </div>
                    </DialogContent>

                    {/* Footer */}
                    <DialogActions className="p-4 border-t flex items-center justify-between">
                        <div className="text-sm">
                            <span className="text-gray-500">Total</span>
                            <span className="ml-2 font-bold text-lg text-indigo-600">
                                ${(service.price + Array.from(selectedAddons).reduce((sum, id) => {
                                    const a = service.addons?.find((a: any) => a.id === id)
                                    return sum + (a?.price ?? 0)
                                }, 0)) / 100}
                            </span>
                        </div>

                        <Button onClick={() => {
                            setData((prev) => ({ ...prev, selectedService: service.id }))
                            setOpenModal(false)
                        }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            Continue
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
            <div
                onClick={() => { setOpenModal(true) }}
                className={`group cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden
    ${service.id === data.selectedService
                        ? "border-indigo-500 shadow-md ring-2 ring-indigo-100"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}
  `}
            >
                {/* Image */}
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
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No Image
                    </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <Title className="text-sm font-semibold">
                            {service.name}
                        </Title>

                        <span className="text-sm font-bold text-indigo-600">
                            ${service.price / 100}
                        </span>
                    </div>

                    <Caption className="text-xs text-gray-500 line-clamp-2">
                        {service.description}
                    </Caption>
                </div>
            </div>
        </div>

    )
}
