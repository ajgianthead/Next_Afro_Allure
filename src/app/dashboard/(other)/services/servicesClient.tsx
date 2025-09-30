'use client'
import Dialog from '@components/Dialog'
import Input from '@components/Input'
import Textarea from '@components/TextArea'
import Button from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { useUserContext } from '@utils/context/UserContext'
import { createClient } from '@utils/supabase/client'
import { randomUUID } from 'crypto'
import React, { useCallback, useEffect, useState } from 'react'
import { v4 } from 'uuid';
import { Database } from '../../../../../lib/database.types'
import { useDropzone } from 'react-dropzone'
import Label from '@components/Label'
import Image from 'next/image'
import { TagsInput } from "react-tag-input-component";
import Separator from '@tailus-ui/Separator'
import Chip from '@mui/joy/Chip';
import { CircleCheck, Edit2, EllipsisVertical, Pencil, Plus, Trash, X } from 'lucide-react'
import DropdownMenu from '@components/DropdownMenu'
import AlertDialog from '@components/AlertDialog'
import CircularProgress from '@mui/joy/CircularProgress'
import Tooltip from '@tailus-ui/Tooltip'
import Toast from '@components/Toast'
import Select from '@components/Select'
import Checkbox from '@components/Checkbox'
import { CheckedState } from '@radix-ui/react-checkbox'
import { fetchUser } from '../actions'
import { createPublicImgURL, updateImg, uploadImg } from './actions'

interface PageProps {
    servicesData: Service[];
    serviceAddonsData: any[];
    availabilitiesData: any[];
    defaultAvail: string;
    businessId: string;
}

export default function ServicesClient({ servicesData, serviceAddonsData, availabilitiesData, defaultAvail, businessId }: PageProps) {
    // Get services from business
    const [availabilities, setAvailabilities] = useState<any>(availabilitiesData)
    const [defaultAvailability, setDefaultAvailability] = useState<string>(defaultAvail)
    const [serviceAddons, setServiceAddons] = useState<any>(serviceAddonsData)
    const [services, setServices] = useState<any[]>(servicesData)
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const handleDelete = async (serviceID: string, index: number) => {
        // Delete in supabase, then component state
        const result = await fetch(`/api/${businessId}/services/${serviceID}`, {
            method: 'DELETE',
        });
        let clone = [...services];
        clone.splice(index, 1)
        setServices(clone)
        return await result.json();
    }
    const [currIndex, setCurrIndex] = useState<number>()
    const [service, setService] = useState<Service>({
        name: "",
        created_at: "",
        updated_at: "",
        id: "",
        description: "",
        price: 0,
        length: 0,
        addons: [],
        imagePath: "",
        photo_url: "",
        business: businessId,
        categories: [],
        availability: ""
    })
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<boolean>(false)
    const [confirmationData, setConfirmationData] = useState<{
        title: string;
        description: string;
    }>({
        title: "",
        description: "",
    })
    const [openAddon, setOpenAddon] = useState<boolean>(false)
    const [addon, setAddon] = useState<{
        name: string;
        price: number;
    }>({
        name: "",
        price: 0
    })
    const createAddon = async () => {
        const res = await fetch(`/api/${businessId}/services/addon`, {
            method: 'POST',
            body: JSON.stringify(addon)
        })
        const result = await res.json()
        if (result.message === "Service Addon created!") {
            setServiceAddons([
                ...serviceAddons,
                result.data
            ])
            setOpenAddon(false)
            setConfirmation(true)
            setConfirmationData({
                title: "Success",
                description: result.message
            })
            setAddon({
                name: "",
                price: 0
            })
        }
        else { // If error

        }
    }
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [isEditingAddon, setIsEditingAddon] = useState<boolean>(false)
    const [currAddon, setCurrAddon] = useState<any>()
    const [addonIndex, setAddonIndex] = useState<number>(0)
    const editAddon = async (index: number) => {
        const res = await fetch(`/api/${businessId}/services/addon`, {
            method: 'PUT',
            body: JSON.stringify(currAddon)
        })
        const result = await res.json()
        if (result.message === "Service Addon updated!") {
            let temp = [...serviceAddons]
            temp[addonIndex] = currAddon
            setServiceAddons(temp)
            setIsEditingAddon(false)
            setOpenAddon(false)
            setConfirmation(true)
            setConfirmationData({
                title: "Success",
                description: result.message
            })
            setCurrAddon({})
        }
        else { // If error

        }
    }
    const deleteAddon = async () => {
        const res = await fetch(`/api/${businessId}/services/addon/${currAddon.id}`, {
            method: 'DELETE',
        })
        const result = await res.json()
        if (result.message === "Service Addon deleted!") {
            let temp = [...serviceAddons]
            temp.splice(addonIndex, 1)
            setServiceAddons(temp)
            setIsEditingAddon(false)
            setOpenAddon(false)
            setConfirmation(true)
            setConfirmationData({
                title: "Success",
                description: result.message
            })
            setCurrAddon({})
        }
        else { // If error

        }
    }
    return (
        <div className='px-6'>
            <Dialog.Root open={openAddon} onOpenChange={(open) => setOpenAddon(open)}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title className='flex flex-col mb-5'>
                            <Title>{!isEditingAddon ? "Create " : "Edit "}Addon</Title>
                            <Caption>Service Addons are additional sub-services you offer with your main service. Ex. Hair Wash, Complex Hairstyle, etc.</Caption>
                        </Dialog.Title>
                        <Dialog.Description className='flex gap-5 flex-col'></Dialog.Description>
                        <div className='flex flex-col gap-3'>
                            <div>
                                <Label htmlFor='addon-name'>Name</Label>
                                <Input onChange={(e) => {
                                    if (isEditingAddon) {
                                        setCurrAddon({
                                            ...currAddon,
                                            name: e.target.value
                                        })
                                    } else {
                                        setAddon({
                                            ...addon,
                                            name: e.target.value,
                                        })
                                    }

                                }} value={isEditingAddon ? currAddon.name : addon.name} id='addon-name' placeholder='ex. Wash' />
                            </div>
                            <div>
                                <Label htmlFor='addon-price'>Price</Label>
                                <Input value={isEditingAddon ? currAddon.price / 100 : addon.price / 100} onChange={(e) => {
                                    if (isEditingAddon) {
                                        setCurrAddon({
                                            ...currAddon,
                                            price: parseInt(e.target.value) * 100
                                        })
                                    } else {
                                        setAddon({
                                            ...addon,
                                            price: parseInt(e.target.value) * 100
                                        })
                                    }
                                }} id='addon-price' placeholder='ex. 10' />
                            </div>
                        </div>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            {isEditingAddon && <Button.Root intent='danger' variant='soft' onClick={async () => {
                                if (isEditingAddon) {
                                    await deleteAddon()
                                } else {
                                    await createAddon()
                                }
                            }} size="sm">
                                <Button.Label>Delete Addon</Button.Label>
                            </Button.Root>}
                            <Button.Root disabled={isEditingAddon && (serviceAddons[addonIndex].name == currAddon.name && serviceAddons[addonIndex].price == currAddon.price)} onClick={async () => {
                                if (isEditingAddon) {
                                    await editAddon(addonIndex)
                                } else {
                                    await createAddon()
                                }
                            }} size="sm">
                                <Button.Label>{isEditingAddon ? "Save Changes" : "Create Addon"}</Button.Label>
                            </Button.Root>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>

            </Dialog.Root>
            <CreateServiceDialog serviceAddons={serviceAddons} availabilities={availabilities} defaultAvailability={defaultAvailability} confimation={confirmation} setConfirmation={setConfirmation} setConfirmationData={setConfirmationData} services={services} setServices={setServices} open={createOpen} setIsOpen={setCreateOpen} user={businessId} />
            <div className="flex md:flex-row flex-col justify-between items-center mt-3">
                <Title className='text-left w-full mb-2'>Services</Title>
                <div className='flex gap-2 w-full md:flex-row flex-col justify-end'>
                    <Button.Root onClick={() => {
                        setCreateOpen(true)
                    }}>
                        <Button.Label >Create Service</Button.Label>
                    </Button.Root>
                    <DropdownMenu.Root open={dropdownOpen} onOpenChange={(open: boolean) => {
                        setDropdownOpen(open)
                    }}>
                        <DropdownMenu.Trigger>
                            <Button.Root intent='neutral' variant='outlined' className='w-full'>
                                <Button.Label>Service Add-Ons</Button.Label>
                            </Button.Root>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content data-shade="900"
                                side="bottom"
                                mixed
                                align="end"
                                sideOffset={6}
                                intent="gray"
                                variant="soft"
                                className="z-50 w-60 dark:[--caption-text-color:theme(colors.gray.400)]">
                                <div className='w-full p-2'>
                                    <Button.Root intent='gray' variant='soft' className='w-full' onClick={() => {
                                        setDropdownOpen(false)
                                        setIsEditingAddon(false)
                                        setOpenAddon(true)
                                    }}>
                                        <Button.Label>
                                            Create Add-on
                                        </Button.Label>
                                    </Button.Root>
                                </div>
                                <DropdownMenu.Separator />
                                <div className='flex flex-col'>
                                    {serviceAddons.length ? serviceAddons.map((addon: any, index: number) => {
                                        return (
                                            <div key={index}>
                                                <DropdownMenu.Item onClick={() => {
                                                    setIsEditingAddon(true)
                                                    setCurrAddon({ ...addon })
                                                    setAddonIndex(index)

                                                    setDropdownOpen(false)
                                                    setOpenAddon(true)
                                                }} className='py-5 px-5 cursor-pointer'>
                                                    <div className='flex w-full items-center'>
                                                        <div className='flex justify-between items-center w-full gap-1'>
                                                            <Text>{addon.name}</Text>
                                                            <Caption>${addon.price / 100}</Caption>
                                                        </div>

                                                    </div>
                                                </DropdownMenu.Item>
                                            </div>
                                        )
                                    }) : <div className='w-full text-center'>
                                        <Caption>No add-ons</Caption></div>}
                                </div>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                </div>
            </div>
            <Separator className="my-4 w-full" />
            <div className='w-full h-full flex  gap-2 flex-wrap'>
                {services.map((service: Service, index: number) => {
                    return (
                        <div key={index}>
                            <div>
                                <ServiceCard isEditing={isEditing} availabilities={availabilities} serviceAddons={serviceAddons} services={services} setServices={setServices} setService={setService} service={service} index={index} setIndex={setCurrIndex} setIsEditing={setIsEditing} open={open} setOpen={setOpen} setConfirmationData={setConfirmationData} setConfirmation={setConfirmation} />
                            </div>
                        </div>
                    )
                })}
            </div>
            <Toast.Provider>
                <Toast.Root open={confirmation} onOpenChange={setConfirmation} mixed>
                    <div className='flex justify-between items-center'>
                        <Toast.Title className='flex gap-2 items-center'><CircleCheck color='green' size={16} />{confirmationData.title}</Toast.Title>
                        <Toast.Close aria-label="Close">
                            <span aria-hidden><X size={16} /></span>
                        </Toast.Close>
                    </div>
                    <Toast.Description>{confirmationData.description}</Toast.Description>
                </Toast.Root>

                <Toast.Viewport />
            </Toast.Provider>
        </div>
    )
}

const CreateServiceDialog = ({ serviceAddons, services, setServices, open, setIsOpen, user, setConfirmationData, setConfirmation, defaultAvailability, availabilities }: any) => {
    const [service, setService] = useState<Service>({
        name: "",
        created_at: "",
        updated_at: "",
        id: crypto.randomUUID(),
        description: "",
        price: 0,
        length: 0,
        addons: [],
        imagePath: "",
        photo_url: "",
        business: user,
        categories: [],
        availability: defaultAvailability
    });
    const uploadImage = async () => {

        const session = await fetchUser()
        if (!session) {
            console.error("User not authenticated");
            return;
        }
        if (!(image.imageBlob instanceof Blob)) {
            console.error("Invalid imageBlob", image.imageBlob);
            return;
        }
        const path = `private/images/${service.business}/services/${service.id}`;
        let url;
        try {

            url = await uploadImg(path, image).then(async () => {

                return (await createPublicImgURL(path)).url
            })
        } catch (err) {
            console.error("Upload threw error:", err);
        }

        return { url, path }
    };
    const [dataSending, setDataSending] = useState<boolean>(false)
    const handleSubmit = async () => {
        setDataSending(true)
        let clone;
        if (image.imageURL?.length) {

            let res = await uploadImage()
            clone = { ...service }
            clone.photo_url = res?.url!;
            clone.price = clone.price * 100
            clone.imagePath = res?.path!;
            clone.addons = [...Array.from(checkedAddons)]
        }


        const res = await fetch(`/api/${user}/services`, {
            method: 'POST',
            body: JSON.stringify(image.imageBlob ? clone : { ...service, price: service.price * 100 })
        })
        const dataBack = await res.json();


        setServices([
            ...services,
            dataBack.data
        ])
        setImage({
            imageURL: null,
            imageBlob: null
        })
        setService({
            name: "",
            created_at: "",
            updated_at: "",
            id: crypto.randomUUID(),
            description: "",
            price: 0,
            length: 0,
            addons: [],
            imagePath: "",
            photo_url: "",
            business: user,
            categories: [],
            availability: defaultAvailability
        })
        setDataSending(false)
        setIsOpen(false)
        setConfirmationData({
            title: "Success",
            description: "Service Created"
        })
        setConfirmation(true)
    }
    const [image, setImage] = useState<{
        imageURL: string | null
        imageBlob: Blob | null
    }>({
        imageURL: null,
        imageBlob: null
    });
    const onDrop = useCallback((acceptedFiles: any) => {
        acceptedFiles.forEach((file: Blob) => {
            setImage({
                imageURL: URL.createObjectURL(file),
                imageBlob: file
            })
        })
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    const [checkedAddons, setCheckedAddons] = useState(new Set<string>());
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={(open) => {
                setIsOpen(open);
                setService({
                    name: "",
                    created_at: "",
                    updated_at: "",
                    id: crypto.randomUUID(),
                    description: "",
                    price: 0,
                    length: 0,
                    addons: [],
                    imagePath: "",
                    photo_url: "",
                    business: user,
                    categories: [],
                    availability: defaultAvailability
                })
                setDataSending(false)
                setImage({
                    imageURL: null,
                    imageBlob: null
                })
            }}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50 overflow-y-scroll">
                        <Dialog.Title className='flex flex-col mb-5'>
                            <Title>Create Service</Title>
                            <Caption>Enter the details of your service below</Caption>
                        </Dialog.Title>
                        <Dialog.Description className='flex gap-5 flex-col'>
                            <div>
                                <Label className='font-medium'>Upload Photo</Label>
                                <div {...getRootProps()} className='border border-dashed rounded-md p-2 cursor-pointer text-center flex justify-center'>
                                    <input {...getInputProps()} accept='image/*' />
                                    {
                                        image.imageURL ?
                                            <Image src={image.imageURL} alt="Service Image" width={100} height={100} /> :
                                            <Caption>Drag 'n' drop or click to select a photo the best represents your service</Caption>
                                    }
                                </div>
                            </div>
                            <div>
                                <Label className='font-medium'>Availability</Label>
                                <Caption className='mb-2'>Choose the availability you want use when clients book this service on your booking site</Caption>
                                <Select.Root defaultValue={defaultAvailability}>
                                    <Select.Trigger size="md" className="w-full flex justify-between">
                                        <Select.Value placeholder="Choose availability" />
                                        <Select.Icon />
                                    </Select.Trigger>

                                    <Select.Portal>
                                        <Select.Content mixed className="z-50">
                                            <Select.Viewport>
                                                {
                                                    availabilities.map((availability: any, index: number) => {
                                                        return (
                                                            <div key={index}>
                                                                <Select.Item value={availability.id}>
                                                                    <Select.ItemIndicator />
                                                                    <Select.ItemText>
                                                                        {availability.availability_data?.name}
                                                                    </Select.ItemText>
                                                                </Select.Item>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                            <div>
                                <Label className='font-medium'>Service Name</Label>
                                <Input value={service.name} placeholder='ex. Loc Retwist' onChange={(e) => {
                                    setService({
                                        ...service,
                                        name: e.target.value
                                    })
                                }} />
                            </div>
                            <div>
                                <Label className='font-medium'>Base Price</Label>
                                <Input value={service.price.toString()} onChange={(e) => {
                                    let temp;
                                    if (!Number.isNaN(e.target.value)) {
                                        temp = Number(e.target.value)
                                        setService({
                                            ...service,
                                            price: temp
                                        })
                                    }
                                }} />
                            </div>
                            <div>
                                <div>
                                    <Label className='font-medium'>Category</Label>
                                    <Caption>Enter <span className='font-bold'>one or more</span> category that identifies with your service. Then hit <span className='font-bold'>Enter</span></Caption>
                                </div>
                                <TagsInput
                                    value={service.categories!}
                                    onChange={(tags: string[]) => {
                                        setService({
                                            ...service,
                                            categories: tags
                                        })
                                    }}
                                    name="categories"
                                    placeHolder="Enter Category"
                                />
                            </div>
                            <div>
                                <Label className='font-medium'>Description</Label>
                                <Textarea value={service.description} onChange={(e) => {
                                    setService({
                                        ...service,
                                        description: e.target.value
                                    })
                                }} />
                            </div>
                            <div>
                                <Label className='font-medium'>Duration</Label>
                                <Caption>Enter in minutes</Caption>
                                <Input value={service.length.toString()} placeholder='ex. 180' onChange={(e) => {
                                    let temp;
                                    if (!Number.isNaN(e.target.value)) {
                                        temp = Number(e.target.value)
                                        setService({
                                            ...service,
                                            length: temp
                                        })
                                    }
                                }} />
                            </div>
                            <div>
                                <Label className='font-medium'>Service Addons</Label>
                                <Caption className='mb-2'>Choose any addons you want available for this service</Caption>
                                <div className='flex flex-col gap-1'>
                                    {serviceAddons.map((addon: any, index: number) => {
                                        return (
                                            <div key={index} className='flex gap-2 items-center'>
                                                <Checkbox.Root onCheckedChange={(e: CheckedState) => {
                                                    if (e) {
                                                        if (checkedAddons.has(addon.id)) {
                                                            let temp = checkedAddons;
                                                            temp.delete(addon.id)
                                                            setCheckedAddons(temp)
                                                            setService({
                                                                ...service,
                                                                addons: Array.from(temp)
                                                            })
                                                        }
                                                        else {
                                                            let temp = checkedAddons;
                                                            temp.add(addon.id)
                                                            setCheckedAddons(temp)
                                                        }
                                                    }
                                                }} value={addon.id}>
                                                    <Checkbox.Indicator />
                                                </Checkbox.Root>
                                                <Label>{addon.name}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                        </Dialog.Description>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root onClick={() => {
                                    setService({
                                        name: "",
                                        created_at: "",
                                        updated_at: "",
                                        id: "",
                                        description: "",
                                        price: 0,
                                        length: 0,
                                        addons: [],
                                        imagePath: "",
                                        photo_url: "",
                                        business: user,
                                        categories: [],
                                        availability: defaultAvailability
                                    })
                                }} variant="outlined" disabled={dataSending} size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>

                            <Button.Root disabled={dataSending} onClick={handleSubmit} size="sm">
                                <Button.Label>{dataSending ? <CircularProgress size='sm' /> : "Create Service"}</Button.Label>
                            </Button.Root>

                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
const EditServiceDialog = ({ serviceAddons, availabilities, open, setIsOpen, services, setServices, oldService, index, setConfirmation, setConfirmationData }: any) => {
    const [tooltip, setTooltip] = useState<boolean>(false);
    const supabase = createClient<Database>();
    const [service, setService] = useState<any>(oldService);
    const [dataSending, setDataSending] = useState<boolean>(false)
    const [image, setImage] = useState<{
        imageURL: string | null
        imageBlob: Blob | null
    }>({
        imageURL: null,
        imageBlob: null
    });
    const onDrop = useCallback((acceptedFiles: any) => {
        acceptedFiles.forEach((file: Blob) => {
            setImage({
                imageURL: URL.createObjectURL(file),
                imageBlob: file
            })
        })
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    const [checkedAddons, setCheckedAddons] = useState<any>(new Set<string>([...oldService.addons]))
    useEffect(() => {
        (async () => {
            setService(oldService)
            setImage({
                ...image,
                imageURL: oldService.imageURL
            })
        })()
    }, [open]);
    const editImage = async () => {
        let url;
        try {
            const path = `private/images/${service.business}/services/${service.id}`
            url = await updateImg(path, image)
        } catch (error: any) {
            console.error(error.message)
            return error
        }
        return url
    }
    const handleSubmit = async () => {
        setDataSending(true)
        let clone = { ...service, addons: Array.from(checkedAddons) }
        const hasImage = Object.values(image.imageBlob ? image.imageBlob : {})
        if (hasImage.length) {
            let imageURL = await editImage()
            clone.photo_url = imageURL;
        }
        await fetch(`/api/${service.business}/services`, {
            method: 'PUT',
            body: JSON.stringify(hasImage.length ? clone : { ...service, addons: Array.from(checkedAddons) })
        })

        // Update my component state
        let newServices = [...services];
        newServices.splice(index, 1, hasImage.length ? clone : { ...service, addons: Array.from(checkedAddons) })
        setServices(newServices)
        setDataSending(false)
        setIsOpen(false)
        setConfirmationData({
            title: "Success",
            description: "Service Updated"
        })
        setConfirmation(true)
    }
    // Delete Service
    const handleDelete = async () => {
        // Delete in supabase
        setDataSending(true)
        const id = services[index].id
        const res = await fetch(`/api/${service.business}/services/${id}`, {
            method: 'DELETE'
        })
        const updatedServices = await res.json()
        // Delete in local state
        setServices(updatedServices.result)
        setDataSending(false)
        setIsOpen(false)
        setConfirmationData({
            title: "Success",
            description: "Service Deleted"
        })
        setConfirmation(true)
    }
    const [deleteOpen, setDeleteOpen] = useState(false)
    const handleClose = async () => {
        setDataSending(false)
        setService(oldService)
        const url = await supabase
            .storage
            .from('service-photos')
            .createSignedUrl(oldService.imagePath, 60 * 60 * 24)
        if (Object.values(service).length === 0) {
            setService(oldService)
        }
        setImage({
            ...image,
            imageURL: url.data?.signedUrl!
        })
    }

    return (
        <div key={index}>
            <AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialog.Portal>
                    <AlertDialog.Overlay className='z-50' />
                    <AlertDialog.Content className="max-w-lg z-50" data-shade="800">
                        <AlertDialog.Title>
                            Are you absolutely sure you want to delete this service?
                        </AlertDialog.Title>
                        <AlertDialog.Description className="mt-2">
                            Clients will not longer be able to book you for this service once it's deleted.
                        </AlertDialog.Description>
                        <AlertDialog.Actions>
                            <AlertDialog.Cancel asChild>
                                <Button.Root
                                    variant="outlined"
                                    intent="gray"
                                    size="sm"
                                >
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action asChild>
                                <Button.Root
                                    variant="solid"
                                    intent="danger"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    <Button.Label>Yes, Delete</Button.Label>
                                </Button.Root>
                            </AlertDialog.Action>
                        </AlertDialog.Actions>
                    </AlertDialog.Content>
                </AlertDialog.Portal>
            </AlertDialog.Root>
            <div>
                <Dialog.Root open={open} onOpenChange={(open: boolean) => {
                    setIsOpen(open)
                    if (!open) {
                        handleClose()
                    } else {
                        setImage
                    }
                }}>
                    <Dialog.Portal>
                        <Dialog.Overlay className='z-40' />
                        <Dialog.Content className="max-w-lg z-50 overflow-y-scroll">
                            <Dialog.Title className='flex flex-col mb-5'>
                                <Title>Service Details</Title>
                                <Caption>Below are the details on the selected service</Caption>
                            </Dialog.Title>
                            <Dialog.Description className='flex gap-2 flex-col'>
                                <div>
                                    <Label className='font-medium'>Upload Photo</Label>
                                    <div {...getRootProps()} className='border border-dashed rounded-md p-2 cursor-pointer text-center flex justify-center'>
                                        <input {...getInputProps()} accept='image/*' />
                                        {
                                            image.imageURL ?
                                                <Image src={image.imageURL} alt="Service Image" width={100} height={100} /> :
                                                <Caption>Drag 'n' drop or click to select a photo the best represents your service</Caption>
                                        }
                                    </div>
                                </div>
                                <div>
                                    <Label className='font-medium'>Availability</Label>
                                    <Caption className='mb-2'>Choose the availability you want use when clients book this service on your booking site</Caption>
                                    <Select.Root defaultValue={service.availability} onValueChange={(value) => {
                                        setService({
                                            ...service,
                                            availability: value
                                        })
                                    }}>
                                        <Select.Trigger size="md" className="w-full flex justify-between">
                                            <Select.Value />
                                            <Select.Icon />
                                        </Select.Trigger>

                                        <Select.Portal>
                                            <Select.Content mixed className="z-50">
                                                <Select.Viewport>
                                                    {
                                                        availabilities.map((availability: any, index: number) => {
                                                            return (
                                                                <div key={index}>
                                                                    <Select.Item value={availability.id}>
                                                                        <Select.ItemIndicator />
                                                                        <Select.ItemText>
                                                                            {availability.availability_data.name}
                                                                        </Select.ItemText>
                                                                    </Select.Item>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                </div>
                                <div>
                                    <Label className='font-medium'>Service Name</Label>
                                    <Input value={service.name} placeholder='ex. Loc Retwist' onChange={(e) => {
                                        setService({
                                            ...service,
                                            name: e.target.value
                                        })
                                    }} />
                                </div>
                                <div>
                                    <Label className='font-medium'>Base Price</Label>
                                    <Input value={(service.price / 100).toString()} onChange={(e) => {
                                        let temp;
                                        if (!Number.isNaN(e.target.value)) {
                                            temp = Number(e.target.value) * 100
                                            setService({
                                                ...service,
                                                price: temp
                                            })
                                        }
                                    }} />
                                </div>
                                <div>
                                    <div>
                                        <Label className='font-medium'>Category</Label>
                                        <Caption>Enter <span className='font-bold'>one or more</span> category that identifies with your service. Then hit <span className='font-bold'>Enter</span></Caption>
                                    </div>
                                    <TagsInput
                                        value={service.categories!}
                                        onChange={(tags: string[]) => {
                                            setService({
                                                ...service,
                                                categories: tags
                                            })
                                        }}
                                        name="categories"
                                        placeHolder="Enter Category"
                                    />
                                </div>
                                <div>
                                    <Label className='font-medium'>Description</Label>
                                    <Textarea value={service.description} onChange={(e) => {
                                        setService({
                                            ...service,
                                            description: e.target.value
                                        })
                                    }} />
                                </div>
                                <div>
                                    <Label className='font-medium'>Duration</Label>
                                    <Caption>Enter in minutes</Caption>
                                    <Input value={service.length.toString()} placeholder='ex. 180' onChange={(e) => {
                                        let temp;
                                        if (!Number.isNaN(e.target.value)) {
                                            temp = Number(e.target.value)
                                            setService({
                                                ...service,
                                                length: temp
                                            })
                                        }
                                    }} />
                                </div>
                                <div>
                                    <Label className='font-medium'>Service Addons</Label>
                                    <Caption className='mb-2'>Choose any addons you want available for this service</Caption>
                                    <div className='flex flex-col gap-1'>
                                        {serviceAddons.map((addon: any, index: number) => {
                                            return (
                                                <div key={index} className='flex gap-2 items-center'>
                                                    <Checkbox.Root defaultChecked={checkedAddons.has(addon.id)} onCheckedChange={(e: CheckedState) => {
                                                        if (e) {
                                                            if (checkedAddons.has(addon.id)) {
                                                                let temp = checkedAddons;
                                                                temp.delete(addon.id)
                                                                setCheckedAddons(temp)
                                                                setService({
                                                                    ...service,
                                                                    addons: Array.from(temp)
                                                                })
                                                            }
                                                            else {
                                                                let temp = checkedAddons;
                                                                temp.add(addon.id)
                                                                setCheckedAddons(temp)
                                                            }
                                                        }
                                                    }} value={addon.id}>
                                                        <Checkbox.Indicator />
                                                    </Checkbox.Root>
                                                    <Label>{addon.name}</Label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Dialog.Description>

                            <Dialog.Actions>
                                <Dialog.Close asChild>
                                    <Button.Root onClick={() => {
                                        handleClose()
                                    }} variant="outlined" disabled={dataSending} size="sm" intent="gray">
                                        <Button.Label>Cancel</Button.Label>
                                    </Button.Root>
                                </Dialog.Close>



                                <Tooltip.Provider>
                                    <Tooltip.Root open={tooltip} onOpenChange={services.length > 1 ? () => { } : () => { setTooltip(!tooltip) }} delayDuration={100}>
                                        <Tooltip.Trigger asChild>
                                            <Button.Root disabled={services.length === 1 || dataSending} onClick={() => {
                                                setDeleteOpen(true)
                                            }} variant="soft" size="sm" intent="danger">
                                                <Button.Label>Delete Service</Button.Label>
                                            </Button.Root>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content className='z-50'>
                                                Can't delete your only service
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </Tooltip.Provider>


                                <Button.Root disabled={dataSending} onClick={async () => {
                                    await handleSubmit()
                                }} size="sm">
                                    <Button.Label>{dataSending ? <CircularProgress size='sm' /> : "Save Changes"}</Button.Label>
                                </Button.Root>

                            </Dialog.Actions>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
        </div>

    )
}

// Individual Service Dialog + Edit and Delete Functionality
const ServiceCard = ({ service, index, setIsEditing, isEditing, setOpen, setService, setIndex, services, setServices, serviceAddons, availabilities, confirmation, setConfirmation, setConfirmationData }: any) => {
    const [open, setIsOpen] = useState<boolean>(false)

    return (
        <div className='w-[250px]' key={index}>
            <EditServiceDialog serviceAddons={serviceAddons} availabilities={availabilities} confimation={confirmation} setConfirmation={setConfirmation} setConfirmationData={setConfirmationData} setDeleteOpen={setOpen} services={services} setServices={setServices} open={open} setIsOpen={setIsOpen} oldService={service} index={index} />
            <Card variant="outlined" className='py-4 flex flex-col gap-1 min-h-[120px] justify-center cursor-pointer' onClick={() => {
                setIsOpen(true)
            }}>
                <div className='flex justify-between items-center'>
                    <div className="w-full flex flex-wrap">
                        {service.categories.map((category: string, index: number) => {
                            return (
                                <div key={index}>
                                    <Chip size="sm" className="mr-1">{category}</Chip>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div>
                    <Title>{service.name}</Title>
                    <Text>${service.price / 100}</Text>
                    <Caption>{service.description}</Caption>
                </div>
            </Card>
        </div>
    )
}
