import { Fields } from "@puckeditor/core"
import { ImageComponent } from "../types"
import { useEffect, useRef, useState } from "react"
import { fetchBusinessUser, fetchUser } from "app/dashboard/(other)/actions"
import { getImages, uploadImage } from "@/app/utils/upload_editor_images"
import { CircularProgress, DialogActions, DialogContent, Divider, Modal, ModalClose, ModalDialog } from "@mui/joy"
import { Button } from "@mantine/core"
import { ImageIcon, Upload } from "lucide-react"
import Image from "next/image"
import { ColorInput, Input, NumberInput, SegmentedControl, Select } from "@mantine/core"
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUp, ArrowUpIcon, LocateFixed, Square } from "lucide-react"
import { BorderAllIcon, BorderBottomIcon, BorderLeftIcon, BorderRightIcon, BorderTopIcon, CornerBottomLeftIcon, CornerBottomRightIcon, CornersIcon, CornerTopLeftIcon, CornerTopRightIcon } from "@radix-ui/react-icons"
import { Caption } from "@tailus-ui/typography"


export const imageModal = (open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>>, onChange: (value: string | null) => void, value: string | null) => {
    const fileInput = useRef<any>(null)
    const [images, setImages] = useState<{
        path: string
        url: string
    }[]>([])

    const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const user = await fetchUser()
        if (user) {
            const business = await fetchBusinessUser(user?.id!)
            const result = await uploadImage(e.target.files!, business.business_id)

            setImages([
                ...images,
                result!
            ])
        }
        else {
            console.log("WTF")
        }

    }
    const [loading, setLoading] = useState<boolean>(true)
    useEffect(() => {
        (async () => {
            const user = await fetchUser()
            if (user) {
                const business = await fetchBusinessUser(user?.id!)
                const result = await getImages(business.business_id)
                setImages(result)
            }
            else {
                console.log("WTF")
            }
            setLoading(false)
        })()
    }, []);
    const [selected, setSelected] = useState<string>(value ? value : "");
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog size="lg" sx={{
                width: '50%'
            }}>
                <ModalClose />
                <p className="font-medium text-lg">Select Image</p>
                <DialogContent>
                    <Button onClick={() => fileInput.current.click()} variant='outlined' className='w-full'>
                        <div className='flex justify-center items-center gap-2'>
                            <Upload size={16} />
                            Upload Image
                        </div>
                    </Button>
                    <input multiple={false} accept='image/*' onChange={async (e) => {
                        await uploadFiles(e)
                    }} ref={fileInput} style={{ display: 'none' }} type='file' />
                    <div className="py-2">
                        <Divider orientation="horizontal" />
                    </div>
                    <div>
                        {images.length ? images.map((image, index) => {
                            return (
                                <div onClick={() => {
                                    if (selected.length) {
                                        setSelected("")
                                    } else {
                                        setSelected(image.url)
                                    }
                                }} key={index} className={`cursor-pointer max-w-max rounded ${selected.length && selected === image.url ? "border-5 border-blue-400" : ""} `}>
                                    <Image width={100} height={100} src={image.url} alt="image" />
                                </div>
                            )
                        }) : loading ? <div className="w-full flex justify-center items-center"> <CircularProgress size="sm" /></div> : <Caption className="italic">No images to select. Please upload an image.</Caption>}
                    </div>
                    <DialogActions>
                        <Button disabled={!selected.length} onClick={() => {
                            onChange(selected)
                            setOpen(false)
                        }}>Select Image</Button>
                        <Button color="danger" variant="outlined" onClick={() => {
                            setSelected(value ? value : "")
                            setOpen(false)
                        }}> Cancel</Button>
                    </DialogActions>
                </DialogContent>

            </ModalDialog>

        </Modal>
    )
}

export const imageResolvedFields: (data: any, params: any) => {} = (data, params) => {
    let fields: Fields<ImageComponent, {}> = {
        url: {
            type: 'custom',
            label: 'Source',
            labelIcon: <ImageIcon size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => {
                const [open, setOpen] = useState<boolean>(false)
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        {imageModal(open, setOpen, onChange, value)}
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Button size="xs" onClick={() => setOpen(true)} variant='solid' className='w-full col-span-3'>
                            Select Image
                        </Button>
                    </div>
                )
            }
        },
        width: {
            type: 'custom',
            label: 'Width',
            labelIcon: <ImageIcon size={16} className="mr-1" />,
            render: ({ value, onChange, field }) => {
                const [open, setOpen] = useState<boolean>(false)
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <Input size="xs" value={value} radius={'md'} onChange={(e) => onChange(Number(e.target.value))} className='w-full col-span-3' rightSection={<p className="text-sm">px</p>}

                        />
                    </div>
                )
            }
        },

        borderExpanded: {
            type: 'custom',
            label: 'Border',
            labelIcon: <Square size={16} className="mr-1" />,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">All</div>,
                                value: "false"
                            }, {
                                label: <div className="flex justify-center">Various</div>,
                                value: 'true'
                            },

                            ]} />
                    </div>
                )
            })
        },
        borderWidth: {
            label: undefined,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput step={1} leftSection={<BorderAllIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                    </div>

                )
            })
        },
        borderTop: {
            visible: false,
            type: 'number'
        },
        borderBottom: {
            visible: false,
            type: 'number'
        },
        borderLeft: {
            visible: false,
            type: 'number'
        },
        borderRight: {
            visible: false,
            type: 'number'
        },
        borderColor: {
            type: 'custom',
            label: undefined,
            render: ({ onChange, value, field }) => (
                <div className="grid grid-cols-4 items-center gap-2">
                    <p className="text-sm font-medium text-slate-400">{field.label}</p>
                    <ColorInput
                        className="col-span-3"
                        placeholder="Choose a color"
                        value={value}
                        onChangeEnd={(e) => onChange(e)}
                        format="hexa"
                    />
                </div>
            )
        },


        borderType: {
            type: 'custom',
            label: undefined,
            render: (({ field, onChange, value }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className=" text-sm font-medium text-slate-400">{field.label}</p>
                        <Select
                            checkIconPosition="right"
                            onChange={(e: any) => { onChange(e) }}
                            className="col-span-3 col-start-2"
                            size="xs"
                            value={value}
                            radius={'md'}
                            data={['solid', 'dashed', 'dotted']}
                        />
                    </div>
                )
            })

        },
        borderRadiusExpanded: {
            type: 'custom',
            label: 'Radius',
            labelIcon: <Square size={16} className="mr-1" />,
            render: (({ value, onChange, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">All</div>,
                                value: "false"
                            }, {
                                label: <div className="flex justify-center">Various</div>,
                                value: 'true'
                            },

                            ]} />
                    </div>
                )
            })
        },
        borderRadius: {
            label: undefined,
            type: 'custom',
            render: (({ field, value, onChange }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <NumberInput step={1} leftSection={<CornersIcon />} radius={'md'} className="w-full col-span-3" size="xs" value={value} onChange={(e) => onChange(Number(e))} />

                    </div>

                )
            })
        },
        borderRadiusTopLeft: {
            visible: false,
            type: 'number'
        },
        borderRadiusTopRight: {
            visible: false,
            type: 'number'
        },
        borderRadiusBottomLeft: {
            visible: false,
            type: 'number'
        },
        borderRadiusBottomRight: {
            visible: false,
            type: 'number'
        },

        positionType: {
            type: 'custom',
            label: 'Position',
            labelIcon: <LocateFixed size={16} className="mr-1" />,
            render: (({ onChange, value, field }) => {
                return (
                    <div className="grid grid-cols-4 items-center gap-2">
                        <p className="text-sm font-medium text-slate-400">{field.label}</p>
                        <SegmentedControl value={value} size="xs" radius={'md'} onChange={(e: any) => { onChange(e) }} className=" col-span-3"
                            data={[{
                                label: <div className="flex justify-center">Relative</div>,
                                value: "relative"
                            }, {
                                label: <div className="flex justify-center">Absolute</div>,
                                value: 'absolute'
                            },

                            ]} />
                    </div>
                )
            })
        },
        top: {
            type: 'number',
            visible: false
        },
        bottom: {
            type: 'number',
            visible: false
        },
        left: {
            type: 'number',
            visible: false,
        },
        right: {
            type: 'number',
            visible: false,
        },
    }
    if (data.props.borderExpanded === 'true') {
        fields.borderWidth = {
            visible: false,
            type: 'text'
        }
        fields.borderTop = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderTopIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderBottom = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderBottomIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRight = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<BorderRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }

    }
    if (data.props.borderRadiusExpanded === 'true') {
        fields.borderRadius = {
            visible: false,
            type: 'text'
        }
        fields.borderRadiusTopLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerTopLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusBottomLeft = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerBottomLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusBottomRight = {
            type: 'custom',

            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerBottomRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.borderRadiusTopRight = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<CornerTopRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }

    }
    if (data.props.positionType === 'absolute') {
        fields.top = {
            type: 'custom',
            label: 'Top',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowUpIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.bottom = {
            type: 'custom',
            label: 'Bottom',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowDownIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.left = {
            type: 'custom',
            label: 'Left',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowLeftIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
        fields.right = {
            type: 'custom',
            label: 'Right',
            labelIcon: <ArrowUp size={16} className="mr-1" />,
            visible: true,
            render: ({ onChange, value, field }: any) => (
                <NumberInput leftSection={<ArrowRightIcon />} step={1} className="col-span-3  col-start-2" size="xs" radius={'md'} value={value} onChange={(e) => onChange(Number(e))} />
            )
        }
    }
    return fields
}
