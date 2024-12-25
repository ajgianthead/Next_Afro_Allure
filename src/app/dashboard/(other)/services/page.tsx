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
import { EllipsisVertical, Pencil, Plus, Trash, X } from 'lucide-react'
import DropdownMenu from '@components/DropdownMenu'
import AlertDialog from '@components/AlertDialog'
import CircularProgress from '@mui/joy/CircularProgress'

export default function page() {
    // Get services from business
    const { user } = useUserContext();
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        const getServices = async () => {
            const { business_id } = user
            const res = await fetch(`http://localhost:3000/api/${business_id}/services`)
            const services = await res.json()
            console.log(services);
            setServices(services.result)
        }
        console.log(user);
        if (user.business_id) {
            setBusinessID(user.business_id)
            getServices()
            setLoading(false)
        }
    }, [user]);
    const [services, setServices] = useState<any[]>([])
    const [businessID, setBusinessID] = useState<string>("")
    const [createOpen, setCreateOpen] = useState<boolean>(false)
    const handleDelete = async (serviceID: string, index: number) => {
        // Delete in supabase, then component state
        const result = await fetch(`http://localhost:3000/api/${user.business_id}/services/${serviceID}`, {
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
        business: user,
        categories: []
    })
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);
    return (
        <div className='px-6'>
            <CreateServiceDialog services={services} setServices={setServices} open={createOpen} setIsOpen={setCreateOpen} user={user.business_id} />
            <EditServiceDialog setDeleteOpen={setOpen} services={services} setServices={setServices} open={isEditing} setIsOpen={setIsEditing} oldService={service} user={user} index={currIndex} />
            <div className="flex justify-between items-center mt-3">
                <Title>Services</Title>
                <Button.Root>
                    <Button.Label onClick={() => {
                        setCreateOpen(true)
                    }}>Create Service</Button.Label>
                </Button.Root>
            </div>
            <Separator className="my-4 w-full" />
            <div className='w-full h-full flex flex-wrap'>

                {loading ? <div className='w-full h-[calc(100vh-200px)] flex justify-center items-center'><CircularProgress size={'sm'} /></div> : services.map((service: Service, index: number) => {
                    return (

                        <div key={index}>
                            <div>
                                <ServiceCard setService={setService} service={service} index={index} setIndex={setCurrIndex} setIsEditing={setIsEditing} open={open} setOpen={setOpen} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const CreateServiceDialog = ({ services, setServices, open, setIsOpen, user }: any) => {
    const supabase = createClient<Database>();
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
        business: user,
        categories: []
    });
    useEffect(() => {
        setService({
            ...service,
            business: user
        })
        console.log(user);

        if (services.length) {
            let newArr: Array<string> = [];
            services.forEach((service: any, index: number) => {
                if (!newArr.includes(service)) {
                    newArr.push(service)
                }
            })
            setCategories(newArr)
        }
    }, [user, services]);
    const [categories, setCategories] = useState<Array<string>>([])
    const uploadImage = async () => {
        const id = crypto.randomUUID();
        const path = `images/${user}/services/${id}`
        try {
            const { data, error } = await supabase.storage.from('Service Photos').upload(path, image.imageBlob!, {
                contentType: 'image/*'
            })
            if (error) {
                console.log(error)
            }
            return { url: supabase.storage.from("Service Photos").getPublicUrl(path).data.publicUrl, path: path }
        } catch (error) {
            console.log(error);

        }

    }
    const [dataSending, setDataSending] = useState<boolean>(false)
    const handleSubmit = async () => {
        setDataSending(true)
        let imageURL;
        let clone;
        if (image.imageURL) {
            let res = await uploadImage()
            console.log("hit")
            imageURL = res?.url
            clone = { ...service }
            clone.photo_url = imageURL!;
            clone.imagePath = res?.path!;
            clone.addons = [...addOns]

        }
        const res = await fetch(`http://localhost:3000/api/${user}/services`, {
            method: 'POST',
            body: JSON.stringify(image.imageBlob ? clone : service)
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
            id: "",
            description: "",
            price: 0,
            length: 0,
            addons: [],
            imagePath: "",
            photo_url: "",
            business: user,
            categories: []
        })
        setAddOns([])
        setDataSending(false)
        setIsOpen(false)
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
    const [addOns, setAddOns] = useState<{
        name: string;
        price: number;
    }[]>([]);
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50 overflow-y-scroll">
                        <Dialog.Title className='flex flex-col mb-5'>
                            <Title>Create Service</Title>
                            <Caption>Enter the details of your service below</Caption>
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
                                <Button.Root onClick={() => {
                                    setAddOns([
                                        ...addOns, {
                                            name: "",
                                            price: 0
                                        }
                                    ])
                                }} className='w-full' variant='soft'>
                                    <Button.Label className='font-medium'>+ Create a service add-on</Button.Label>
                                </Button.Root>
                            </div>
                            <div>
                                {addOns.map((addOn, index) => {
                                    return (
                                        <div key={index} className='flex justify-between'>
                                            <div>
                                                <Caption>Name</Caption>
                                                <Input placeholder='ex. Wash' className='w-1/2' value={addOn.name} onChange={(e) => {
                                                    let clone = [...addOns]
                                                    clone[index].name = e.target.value
                                                    setAddOns(clone)
                                                }} />
                                            </div>
                                            <div>
                                                <div className='flex flex-col items-end text-left'>
                                                    <Caption>Price</Caption>
                                                    <div className='flex justify-end gap-2'>
                                                        <Input placeholder='ex. 20' className='w-1/2' value={addOn.price.toString()} onChange={(e) => {
                                                            if (!Number.isNaN(e.target.value)) {
                                                                let clone = [...addOns]
                                                                clone[index].price = Number(e.target.value)
                                                                setAddOns(clone)
                                                            }
                                                        }} />
                                                        <Button.Root variant='outlined' intent='gray' onClick={() => {
                                                            let clone = [...addOns]
                                                            clone.splice(index, 1)
                                                            setAddOns(clone)
                                                        }}>
                                                            <Button.Icon>
                                                                <X size={"xs"} />
                                                            </Button.Icon>
                                                        </Button.Root>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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
                                        categories: []
                                    })
                                    setAddOns([])
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
const EditServiceDialog = ({ services, setServices, open, setIsOpen, user, oldService, index }: any) => {
    const supabase = createClient<Database>();
    const [service, setService] = useState<any>(oldService);
    const [dataSending, setDataSending] = useState<boolean>(false)
    const [image, setImage] = useState<{
        imageURL: string | null
        imageBlob: Blob | null
    }>({
        imageURL: oldService.photo_url,
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
    const [addOns, setAddOns] = useState<{
        name: string,
        price: number
    }[]>([])
    useEffect(() => {
        if (oldService) {
            setService(oldService)
            setImage({
                ...image,
                imageURL: oldService.photo_url
            })
            setAddOns([...oldService.addons])
        }
    }, [oldService]);
    const editImage = async () => {
        const { data, error } = await supabase.storage.from('Service Photos').upload(service.imagePath!, image.imageBlob!, {
            upsert: true
        })
        if (data?.path) {
            const res = supabase.storage.from("Service Photos").getPublicUrl(data?.path)
            return res.data.publicUrl
        }
        return "";
    }
    const handleSubmit = async () => {
        setDataSending(true)
        let imageURL;
        let clone;
        if (image.imageBlob) {
            imageURL = await editImage()
            clone = { ...service }
            clone.photo_url = imageURL;
        }
        const res = await fetch(`http://localhost:3000/api/${user.business_id}/services`, {
            method: 'PUT',
            body: JSON.stringify(image.imageBlob ? clone : service)
        })
        const dataBack = await res.json();

        // Update my component state
        let newServices = [...services];
        newServices.splice(index, 1, image.imageBlob ? clone : service)

        setServices(newServices)
        setDataSending(false)
        setIsOpen(false)
    }
    // Delete Service
    const handleDelete = async () => {
        // Delete in supabase
        setDataSending(true)
        const id = services[index].id
        const res = await fetch(`http://localhost:3000/api/${user.business_id}/services/${id}`, {
            method: 'DELETE'
        })
        const result = await res.json();
        const response = result.result;
        // Delete in local state
        let clone = [...services]
        clone.splice(index, 1)
        setServices(clone)
        setDataSending(false)
        setIsOpen(false)
    }
    const [deleteOpen, setDeleteOpen] = useState(false)
    return (
        <div>
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
                <Dialog.Root open={open} onOpenChange={setIsOpen}>
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
                                    <Button.Root onClick={() => {
                                        setAddOns([
                                            ...addOns, {
                                                name: "",
                                                price: 0
                                            }
                                        ])
                                    }} className='w-full' variant='soft'>
                                        <Button.Label className='font-medium'>+ Create a service add-on</Button.Label>
                                    </Button.Root>
                                </div>
                                <div>
                                    {addOns.map((addOn, index) => {
                                        return (
                                            <div key={index} className='flex justify-between'>
                                                <div>
                                                    <Caption>Name</Caption>
                                                    <Input placeholder='ex. Wash' className='w-1/2' value={addOn.name} onChange={(e) => {
                                                        let clone = [...addOns]
                                                        clone[index].name = e.target.value
                                                        setAddOns(clone)
                                                    }} />
                                                </div>
                                                <div>
                                                    <div className='flex flex-col items-end text-left'>
                                                        <Caption>Price</Caption>
                                                        <div className='flex justify-end gap-2'>
                                                            <Input placeholder='ex. 20' className='w-1/2' value={addOn.price.toString()} onChange={(e) => {
                                                                if (!Number.isNaN(e.target.value)) {
                                                                    let clone = [...addOns]
                                                                    clone[index].price = Number(e.target.value)
                                                                    setAddOns(clone)
                                                                }
                                                            }} />
                                                            <Button.Root variant='outlined' intent='gray' onClick={() => {
                                                                let clone = [...addOns]
                                                                clone.splice(index, 1)
                                                                setAddOns(clone)
                                                            }}>
                                                                <Button.Icon>
                                                                    <X size={"xs"} />
                                                                </Button.Icon>
                                                            </Button.Root>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </Dialog.Description>

                            <Dialog.Actions>
                                <Dialog.Close asChild>
                                    <Button.Root onClick={() => {
                                        setService(oldService)
                                        setImage({
                                            imageBlob: null,
                                            imageURL: oldService.photo_url
                                        })
                                        setAddOns([])
                                    }} variant="outlined" disabled={dataSending} size="sm" intent="gray">
                                        <Button.Label>Cancel</Button.Label>
                                    </Button.Root>
                                </Dialog.Close>


                                <Button.Root onClick={() => {
                                    setDeleteOpen(true)
                                }} variant="soft" disabled={dataSending} size="sm" intent="danger">
                                    <Button.Label>Delete Service</Button.Label>
                                </Button.Root>


                                <Button.Root disabled={dataSending} onClick={handleSubmit} size="sm">
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
const ServiceCard = ({ service, index, setIsEditing, open, setOpen, setService, setIndex }: any) => {

    return (
        <div className='w-[250px]' key={index}>
            <Card variant="outlined" className='py-4 flex flex-col gap-1 cursor-pointer' onClick={() => {
                setIsEditing(true)
                setIndex(index)
                setService(service)
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
                    {/* <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button.Root variant='ghost'>
                                <Button.Icon>
                                    <EllipsisVertical size={16} />
                                </Button.Icon>
                            </Button.Root>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content mixed sideOffset={5}>
                                <DropdownMenu.Item onClick={() => {

                                }}>
                                    <DropdownMenu.Icon>
                                        <Pencil />
                                    </DropdownMenu.Icon>
                                    Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item intent="danger" onClick={() => {
                                    setOpen(true)
                                }}>
                                    <DropdownMenu.Icon>
                                        <Trash />
                                    </DropdownMenu.Icon>
                                    Delete
                                </DropdownMenu.Item>

                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root> */}
                </div>
                <div>
                    <Title>{service.name}</Title>
                    <Text>${service.price}</Text>
                    <Caption>{service.description}</Caption>
                </div>
            </Card>
        </div>
    )
}
