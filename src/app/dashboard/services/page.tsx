'use client'
import Dialog from '@components/Dialog'
import Input from '@components/Input'
import Textarea from '@components/TextArea'
import Button from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Title } from '@tailus-ui/typography'
import { useUserContext } from '@utils/context/UserContext'
import { createClient } from '@utils/supabase/client'
import { AddOn } from '@utils/types/service'
import { randomUUID } from 'crypto'
import React, { useCallback, useEffect, useState } from 'react'
import { v4 } from 'uuid';
import { Database } from '../../../../lib/database.types'
import { useDropzone } from 'react-dropzone'
import Label from '@components/Label'
import Image from 'next/image'

export default function page() {
    // Get services from business
    const { user } = useUserContext();
    useEffect(() => {
        const getServices = async () => {
            const { business_id } = user
            const res = await fetch(`http://localhost:3000/api/${business_id}/services`)
            const services = await res.json()
            console.log(services);
            setServices(services)
        }
        console.log(user);
        if (user.business_id) {
            getServices()
        }
    }, [user]);
    const [services, setServices] = useState<any>([])
    const [addOn, setAddOn] = useState<AddOn>({
        id: crypto.randomUUID(),
        name: "",
        price: "",
    });
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const [editOpen, setEditOpen] = useState<boolean>(false)
    const handleDelete = async (serviceID: string, index: number) => {
        // Delete in supabase, then component state
        const result = await fetch(`http://127.0.0.1:3000/api/${user.business_id}/services/${serviceID}`, {
            method: 'DELETE',
        });
        let clone = [...services];
        clone.splice(index, 1)
        setServices(clone)
        return await result.json();
    }
    return (
        <div className='px-6'>
            <CreateServiceDialog services={services} setServices={setServices} open={createOpen} setIsOpen={setCreateOpen} user={user} />
            <Title>Services</Title>
            <Button.Root>
                <Button.Label onClick={() => {
                    setCreateOpen(true)
                }}>Create Service</Button.Label>
            </Button.Root>
        </div>
    )
}

const CreateServiceDialog = ({ services, setServices, open, setIsOpen, user }: any) => {
    const supabase = createClient<Database>();
    const [service, setService] = useState<Service>({
        name: "",
        description: "",
        price: 0,
        length: 0,
        addons: null,
        imagePath: "",
        photo_url: "",
        business: user.business_id,
        categories: ""
    });
    const uploadImage = async () => {
        const id = crypto.randomUUID();
        const path = `images/${user.business_id}/services/${id}`
        setService({
            ...service,
            imagePath: path
        })
        const { data } = await supabase.storage.from('Service Photos').upload(path, image.imageBlob!, {
            contentType: 'image/*'
        }).then(async () => {
            return supabase.storage.from("Service Photos").getPublicUrl(path)
        })
        return data.publicUrl
    }
    const handleSubmit = async () => {
        let imageURL;
        let clone;
        if (image) {
            imageURL = await uploadImage()
            clone = { ...service }
            clone.photo_url = imageURL;

        }
        const res = await fetch(`http://127.0.0.1:3000/api/${user.business_id}/services`, {
            method: 'POST',
            body: JSON.stringify(image.imageBlob ? clone : service)
        })
        const dataBack = await res.json();
        setServices([
            ...services,
            dataBack
        ])
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
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title>Create New Service</Dialog.Title>
                        <Dialog.Description className='flex gap-2 flex-col'>
                            <div {...getRootProps()} className='border border-dashed rounded-md p-2 cursor-pointer text-center flex justify-center'>
                                <input {...getInputProps()} accept='image/*' />
                                {
                                    image.imageURL ?
                                        <Image src={image.imageURL} alt="Service Image" width={100} height={100} /> :
                                        <p>Drag 'n' drop or click to select a photo the best represents your service</p>
                                }
                            </div>
                            <div>
                                <Label>Service Name</Label>
                                <Input value={service.name} placeholder='ex. Loc Retwist' onChange={(e) => {
                                    setService({
                                        ...service,
                                        name: e.target.value
                                    })
                                }} />
                            </div>
                            <div>
                                <Label>Base Price</Label>
                                <Input value={service.price} onChange={(e) => {
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
                                <Label>Description</Label>
                                <Textarea value={service.description} onChange={(e) => {
                                    setService({
                                        ...service,
                                        description: e.target.value
                                    })
                                }} />
                            </div>
                            <div>
                                <Label>Duration</Label>
                                <Caption>Enter in minutes</Caption>
                                <Input value={service.length} placeholder='ex. 180' onChange={(e) => {
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
                        </Dialog.Description>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root onClick={() => { }} variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            <Dialog.Close asChild >
                                <Button.Root onClick={() => { }} size="sm">
                                    <Button.Label>Create Service</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}
const EditServiceDialog = ({ services, setServices, open, setIsOpen, user, oldService, index }: { services: Service[], setServices: any, open: boolean, setIsOpen: any, user: any, oldService: Service, index: number }) => {
    const supabase = createClient<Database>();
    const [service, setService] = useState<Service>({ ...oldService });

    const editImage = async () => {
        const { data, error } = await supabase.storage.from('Service Photos').upload(service.imagePath!, image, {
            upsert: true
        })
        if (data?.path) {
            const res = supabase.storage.from("Service Photos").getPublicUrl(data?.path)
            return res.data.publicUrl
        }
        return "";
    }
    const handleSubmit = async () => {
        let imageURL;
        let clone;
        if (image) {
            imageURL = await editImage()
            clone = { ...service }
            clone.photo_url = imageURL;
        }
        const res = await fetch(`http://127.0.0.1:3000/api/${user.business_id}/services`, {
            method: 'PUT',
            body: JSON.stringify(image ? clone : service)
        })
        const dataBack = await res.json();

        // Update my component state
        let newServices = [...services];
        newServices[index] = dataBack.updatedData
        setServices(newServices)
    }
    const [image, setImage] = useState<any>(null);
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title>Create New Service</Dialog.Title>
                        <Dialog.Description>
                            <Input type='file' onChange={(e) => {
                                if (e.target.files?.length) {
                                    setImage(e.target.files[0])
                                    // console.log(e.target.files[0]);
                                }
                            }} />
                            <Input value={service.name} placeholder='Name' onChange={(e) => {
                                setService({
                                    ...service,
                                    name: e.target.value
                                })
                            }} />
                            <Input value={service.price} placeholder='Price' onChange={(e) => {
                                let temp;
                                if (!Number.isNaN(e.target.value)) {
                                    temp = Number(e.target.value)
                                    setService({
                                        ...service,
                                        price: temp
                                    })
                                }
                            }} />
                            <Textarea placeholder='Description' value={service.description} onChange={(e) => {
                                setService({
                                    ...service,
                                    description: e.target.value
                                })
                            }} />
                            <Input value={service.length} placeholder='Duration' onChange={(e) => {
                                let temp;
                                if (!Number.isNaN(e.target.value)) {
                                    temp = Number(e.target.value)
                                    setService({
                                        ...service,
                                        length: temp
                                    })
                                }
                            }} />
                        </Dialog.Description>

                        <Dialog.Actions>
                            <Dialog.Close asChild>
                                <Button.Root onClick={() => { }} variant="outlined" size="sm" intent="gray">
                                    <Button.Label>Cancel</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                            <Dialog.Close asChild >
                                <Button.Root onClick={() => { }} size="sm">
                                    <Button.Label>Save Service</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}

// Individual Service Dialog + Edit and Delete Functionality
const ServiceCard = ({ service, index }: any) => {
    return (
        <div>
            <Card>

            </Card>
        </div>
    )
}
