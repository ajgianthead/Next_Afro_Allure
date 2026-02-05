import { Divider } from '@mui/joy';
import React from 'react';

interface SettingsProps {
    fields: (string | number | bigint | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode>)[]
}



const TextSettings = ({ fields }: SettingsProps) => {
    console.log(fields);

    return (
        <div className='p-5'>
            {fields.map((field, index) => {
                if (index === 1) {
                    return (
                        <div key={index} className='p-0 flex flex-col gap-2'>
                            {fields[index - 1]}
                            {field}
                            {fields[index + 1]}
                            <div className='grid grid-cols-4 gap-2'>
                                <div className="col-span-3 col-start-2 grid grid-cols-2 grid-rows-2 items-start gap-2">
                                    {fields[index + 2]}
                                    {fields[index + 3]}
                                    {fields[index + 4]}
                                    {fields[index + 5]}
                                </div>
                            </div>
                            {fields[index + 6]}
                            {fields[index + 7]}
                            {fields[index + 8]}
                            {fields[index + 9]}
                            {fields[index + 10]}
                            {fields[index + 11]}

                        </div>
                    )
                }


            })}
        </div>
    )
}
const ImageSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div key={index} className='space-y-2'>
                            {fields[index]}
                            {fields[index + 1]}
                            {/* Border */}
                            <div className='mt-2'>
                                {fields[index + 2]}
                            </div>
                            {fields[index + 3]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 4]}
                                    {fields[index + 5]}
                                    {fields[index + 6]}
                                    {fields[index + 7]}
                                </div>
                            </div>
                            {fields[index + 8]}
                            {fields[index + 9]}
                            {/* Border Radius */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 10]}
                                {fields[index + 11]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 12]}
                                    {fields[index + 13]}
                                    {fields[index + 14]}
                                    {fields[index + 15]}
                                </div>
                            </div>
                            {/* Position */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 16]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 17]}
                                    {fields[index + 18]}
                                    {fields[index + 19]}
                                    {fields[index + 20]}
                                </div>
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}
const VideoSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div key={index} className='space-y-2'>
                            {fields[index]}

                            {/* Checkboxes */}
                            <div className='grid grid-cols-4'>
                                <div className='py-2 flex col-span-3 col-start-2 flex-col gap-2'>
                                    {fields[index + 1]}
                                    {fields[index + 2]}
                                    {fields[index + 3]}
                                </div>
                            </div>

                            {fields[index + 4]}
                            {fields[index + 5]}
                            {fields[index + 6]}

                            {/* Border */}
                            <div className='mt-2'>
                                {fields[index + 7]}
                            </div>
                            {fields[index + 8]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 9]}
                                    {fields[index + 10]}
                                    {fields[index + 11]}
                                    {fields[index + 12]}
                                </div>
                            </div>
                            {fields[index + 13]}
                            {fields[index + 14]}
                            {/* Border Radius */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 15]}
                                {fields[index + 16]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 17]}
                                    {fields[index + 18]}
                                    {fields[index + 19]}
                                    {fields[index + 20]}
                                </div>
                            </div>
                            {/* Position */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 21]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 22]}
                                    {fields[index + 23]}
                                    {fields[index + 24]}
                                    {fields[index + 25]}
                                </div>
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}
const ContainerSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 1) {
                    return (
                        <div key={index} className='p-0 flex flex-col gap-2'>
                            {fields[index + 39]}
                            {field}

                            <div className='grid grid-cols-4 items-center'>
                                <p className="text-sm font-medium text-slate-400">Gap</p>
                                <div className='col-span-3 grid grid-cols-2 gap-2 items-center'>
                                    {fields[index + 1]}
                                    {fields[index + 2]}
                                </div>
                            </div>
                            {fields[index + 3]}
                            {fields[index + 4]}
                            {fields[index + 5]}

                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 6]}
                                    {fields[index + 7]}
                                    {fields[index + 8]}
                                    {fields[index + 9]}

                                </div>
                            </div>
                            {fields[index + 10]}
                            {fields[index + 11]}

                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 12]}
                                    {fields[index + 13]}
                                    {fields[index + 14]}
                                    {fields[index + 15]}


                                </div>
                            </div>
                            {fields[index + 16]}
                            {/* TODO: Responsive Field */}
                            {fields[index + 18]}
                            <div className='mt-5 space-y-2'>
                                {fields[index + 19]}
                                {fields[index + 20]}
                            </div>
                            {/* Border */}
                            {/* <div className='mt-2'>
                                {fields[index + 21]}
                            </div> */}
                            {/* {fields[index + 22]} */}
                            {fields[index + 21]}

                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 22]}
                                    {fields[index + 23]}
                                    {fields[index + 24]}
                                    {fields[index + 25]}

                                </div>
                            </div>
                            {fields[index + 26]}
                            {/* Border Radius */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 27]}
                                {fields[index + 28]}
                            </div>
                            {fields[index + 29]}

                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 30]}
                                    {fields[index + 31]}
                                    {fields[index + 32]}
                                    {fields[index + 33]}

                                </div>
                            </div>
                            {/* Position */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 34]}

                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 35]}
                                    {fields[index + 36]}
                                    {fields[index + 37]}
                                    {fields[index + 38]}

                                </div>
                            </div>

                        </div>
                    )
                }


            })}
        </div>
    )
}
const ButtonSettings = ({ fields }: SettingsProps) => {
    console.log(fields.slice(44));

    return (
        <div className=' mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div>
                            <div className='mb-5 p-5 space-y-2'>
                                {field}
                                {fields[index + 2]}

                            </div>
                            {/* <div className='mb-8'>
                                <p className='text-medium font-semibold pb-5 text-slate-600'>Typography</p>
                                <TextSettings fields={fields.splice(39, 9)} />
                            </div> */}
                            <div className='flex flex-col gap-5'>
                                <div className=''>
                                    <p className='text-medium font-semibold pl-5 text-slate-600'>Typography</p>
                                    <TextSettings fields={fields.slice(44)} />
                                </div>
                                <div className='mb-8'>
                                    <p className='text-medium font-semibold pl-5 text-slate-600'>Layout</p>
                                    <ContainerSettings fields={fields.slice(2, 44)} />
                                </div>
                            </div>
                        </div>
                    )
                }


            })}
        </div>
    )
}
const RowSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-2'>
                            {fields[index + 2]}
                            {fields[index]}
                            {fields[index + 1]}
                        </div>
                    )
                }

            })}
        </div>
    )
}

const ColumnSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-2'>
                            {fields[index + 2]}
                            {fields[index]}
                            {fields[index + 1]}
                        </div>
                    )
                }

            })}
        </div>
    )
}

const GridSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-2'>
                            {fields[index + 7]}
                            {fields[index + 3]}
                            {fields[index + 5]}
                            {fields[index + 6]}
                            {fields[index + 1]}
                            {fields[index + 2]}
                        </div>
                    )
                }

            })}
        </div>
    )
}
const TextPreset = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-2'>
                            {fields[index]}
                            {fields[index + 1]}
                            <div className='grid grid-cols-4 gap-2'>
                                <div className='col-span-3 col-start-2'>{fields[index + 2]}</div>
                            </div>
                            <div className='grid grid-cols-4 gap-2'>
                                <div className="col-span-3 col-start-2 grid grid-cols-2 items-start gap-2">

                                    {fields[index + 3]}
                                    {fields[index + 4]}
                                </div>
                            </div>
                            {fields[index + 5]}

                            {fields[index + 6]}
                            {fields[index + 7]}
                            {fields[index + 8]}
                            {fields[index + 9]}
                            {fields[index + 10]}
                        </div>
                    )
                }

            })}
        </div>
    )
}

const CardSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-3'>
                            {fields[index + 1]}
                            {fields[index + 2]}
                            {fields[index + 3]}
                            {fields[index + 4]}
                            {fields[index + 5]}
                            {fields[index + 6]}
                        </div>
                    )
                }

            })}
        </div>
    )
}

const SectionSettings = ({ fields }: SettingsProps) => {
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div className='space-y-2'>
                            {fields[index + 1]}


                        </div>
                    )
                }

            })}
        </div>
    )
}

const Settings = ({ fields, componentName }: { fields: SettingsProps['fields'], componentName: string }) => {
    if (componentName) {
        if (componentName === 'CustomizableText') {
            return <TextSettings fields={fields} />
        }
        if (componentName === 'Container') {
            return <ContainerSettings fields={fields} />
        }
        if (componentName === 'Image') {
            return <ImageSettings fields={fields} />
        }
        if (componentName === 'Video') {
            return <VideoSettings fields={fields} />
        }
        if (componentName === 'Button') {
            return <ButtonSettings fields={fields} />
        }
        if (componentName === 'Row') {
            return <RowSettings fields={fields} />
        }
        if (componentName === 'Column') {
            return <ColumnSettings fields={fields} />
        }
        if (componentName === 'Grid') {
            return <GridSettings fields={fields} />
        }
        if (componentName.startsWith('Heading') || componentName.startsWith('Title') || componentName.startsWith('Body')) {
            return <TextPreset fields={fields} />
        }
        if (componentName === 'Card') {
            return <CardSettings fields={fields} />
        }
        if (componentName === 'Section') {
            return <SectionSettings fields={fields} />
        }
    }
    return
}

export default Settings;
