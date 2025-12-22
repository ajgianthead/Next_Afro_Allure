import { Divider } from '@mui/joy';
import React from 'react';

interface SettingsProps {
    fields: (string | number | bigint | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode>)[]
}



const TextSettings = ({ fields }: SettingsProps) => {
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
                            {fields[index + 1]}
                            {fields[index + 2]}
                            {fields[index + 3]}
                            {fields[index + 4]}
                            {fields[index + 5]}
                            {/* Border */}
                            <div className='mt-2'>
                                {fields[index + 6]}
                            </div>
                            {fields[index + 7]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 8]}
                                    {fields[index + 9]}
                                    {fields[index + 10]}
                                    {fields[index + 11]}
                                </div>
                            </div>
                            {fields[index + 12]}
                            {fields[index + 13]}
                            {/* Border Radius */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 14]}
                                {fields[index + 15]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 16]}
                                    {fields[index + 17]}
                                    {fields[index + 18]}
                                    {fields[index + 19]}
                                </div>
                            </div>
                            {/* Position */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 20]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 21]}
                                    {fields[index + 22]}
                                    {fields[index + 23]}
                                    {fields[index + 24]}
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
                            {field}
                            {fields[index + 1]}
                            {fields[index + 2]}
                            <div className='grid grid-cols-4 items-center'>
                                <p className="text-sm font-medium text-slate-400">Gap</p>
                                <div className='col-span-3 grid grid-cols-2 gap-2 items-center'>
                                    {fields[index + 3]}
                                    {fields[index + 4]}
                                </div>
                            </div>
                            {fields[index + 5]}
                            {fields[index + 6]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 7]}
                                    {fields[index + 8]}
                                    {fields[index + 9]}
                                    {fields[index + 10]}
                                </div>
                            </div>
                            {fields[index + 11]}
                            {fields[index + 12]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 13]}
                                    {fields[index + 14]}
                                    {fields[index + 15]}
                                    {fields[index + 16]}
                                </div>
                            </div>

                            {fields[index + 17]}
                            {/* TODO: Responsive Field */}
                            {/* {fields[index + 18]} */}
                            <div className='my-5 space-y-2'>
                                {fields[index + 19]}
                                {fields[index + 20]}
                            </div>
                            {/* Border */}
                            <div className='mt-2'>
                                {fields[index + 21]}
                            </div>
                            {fields[index + 22]}
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 23]}
                                    {fields[index + 24]}
                                    {fields[index + 25]}
                                    {fields[index + 26]}
                                </div>
                            </div>
                            {fields[index + 27]}
                            {fields[index + 28]}
                            {/* Border Radius */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 29]}
                                {fields[index + 30]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 31]}
                                    {fields[index + 32]}
                                    {fields[index + 33]}
                                    {fields[index + 34]}
                                </div>
                            </div>
                            {/* Position */}
                            <div className='mt-2 space-y-2'>
                                {fields[index + 35]}
                            </div>
                            <div className='grid grid-cols-4'>
                                <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                    {fields[index + 36]}
                                    {fields[index + 37]}
                                    {fields[index + 38]}
                                    {fields[index + 39]}
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
    return (
        <div className='p-5 mb-10'>
            {fields.map((field, index) => {
                if (index === 0) {
                    return (
                        <div>
                            <div className='mb-5 space-y-2'>
                                {field}
                                {fields[index + 2]}

                            </div>
                            <div className='mb-8'>
                                <p className='text-medium font-semibold pb-5 text-slate-600'>Typography</p>
                                <div key={index} className='p-0 flex flex-col gap-2'>
                                    {fields[index + 43]}
                                    {fields[index + 44]}
                                    {fields[index + 45]}
                                    <div className='grid grid-cols-4 gap-2'>
                                        <div className="col-span-3 col-start-2 grid grid-cols-2 grid-rows-2 items-start gap-2">
                                            {fields[index + 46]}
                                            {fields[index + 47]}
                                            {fields[index + 48]}
                                            {fields[index + 49]}
                                        </div>
                                    </div>
                                    {fields[index + 50]}
                                    {fields[index + 51]}
                                </div>
                            </div>
                            <p className='text-medium font-semibold pb-5 text-slate-600'>Layout</p>
                            <div key={index} className='p-0 flex flex-col gap-2'>
                                {/* {fields[index + 1]}
                                {fields[index + 2]}

                                {fields[index + 3]} */}
                                {/* {fields[index + 4]} */}
                                {/* {fields[index + 5]}
                                <div className='grid grid-cols-4 items-center'>
                                    <p className="text-sm font-medium text-slate-400">Gap</p>
                                    <div className='col-span-3 grid grid-cols-2 gap-2 items-center'>
                                        {fields[index + 6]}
                                        {fields[index + 7]}
                                    </div>
                                </div> */}
                                {fields[index + 8]}
                                {fields[index + 9]}
                                <div className='grid grid-cols-4'>
                                    <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                        {fields[index + 10]}
                                        {fields[index + 11]}
                                        {fields[index + 12]}
                                        {fields[index + 13]}
                                    </div>
                                </div>
                                {fields[index + 14]}
                                {fields[index + 15]}
                                <div className='grid grid-cols-4'>
                                    <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                        {fields[index + 16]}
                                        {fields[index + 17]}
                                        {fields[index + 18]}
                                        {fields[index + 19]}
                                    </div>
                                </div>

                                {fields[index + 20]}

                                <div className='my-2'>
                                    {/* {fields[index + 21]} */}
                                    {/* {fields[index + 22]}
                                    {fields[index + 23]} */}
                                </div>

                                {/* Border */}
                                {fields[index + 24]}
                                {fields[index + 25]}
                                <div className='grid grid-cols-4'>
                                    <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                        {fields[index + 26]}
                                        {fields[index + 27]}
                                        {fields[index + 28]}
                                        {fields[index + 29]}
                                    </div>
                                </div>
                                {fields[index + 30]}
                                {fields[index + 31]}
                                {/* Border Radius */}
                                <div className='mt-2 space-y-2'>
                                    {fields[index + 32]}
                                    {fields[index + 33]}
                                </div>
                                <div className='grid grid-cols-4'>
                                    <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                        {fields[index + 34]}
                                        {fields[index + 35]}
                                        {fields[index + 36]}
                                        {fields[index + 37]}
                                    </div>
                                </div>
                                {/* Position */}
                                <div className='mt-2 space-y-2'>
                                    {fields[index + 38]}
                                </div>
                                <div className='grid grid-cols-4'>
                                    <div className='grid col-start-2 gap-2 col-span-3 grid-cols-2 grid-rows-2'>
                                        {fields[index + 39]}
                                        {fields[index + 40]}
                                        {fields[index + 41]}
                                        {fields[index + 42]}
                                    </div>
                                </div>

                            </div>

                        </div>
                    )
                }


            })}
        </div>
    )
}

const Settings = ({ fields, componentName }: { fields: SettingsProps['fields'], componentName: string }) => {
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
    return (
        <div>
            <div className="p-4 space-y-4">

                {fields.map((field, index) => {
                    if (React.isValidElement(field)) {
                        const fieldName: string = field.props.fieldName
                        if (fieldName === 'paddingTop') {
                            return (
                                <div key={index} className="border p-2 rounded shadow-sm bg-white">
                                    {fields[index - 1]}
                                    {fields[index - 2]}
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index]}</div>
                                        <div className="w-1/2">{fields[index + 1]}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index + 2]}</div>
                                        <div className="w-1/2">{fields[index + 3]}</div>
                                    </div>

                                </div>
                            )
                        }
                        if (fieldName === 'marginTop') {
                            return (
                                <div key={index} className="border p-2 rounded shadow-sm bg-white">
                                    {fields[index - 1]}
                                    {fields[index - 2]}
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index]}</div>
                                        <div className="w-1/2">{fields[index + 1]}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index + 2]}</div>
                                        <div className="w-1/2">{fields[index + 3]}</div>
                                    </div>

                                </div>
                            )
                        }
                        if (fieldName === 'flexDirection') {
                            return (
                                <div key={index} className="border p-2 rounded shadow-sm bg-white">
                                    {fields[index]}
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index + 1]}</div>
                                        <div className="w-1/2">{fields[index + 2]}</div>
                                    </div>
                                    <div className="flex">
                                        {fields[index + 3]}

                                    </div>

                                </div>
                            )
                        }
                        if (fieldName === 'positionType') {
                            return (
                                <div key={index} className="border p-2 rounded shadow-sm bg-white">
                                    {fields[index]}

                                    <div className="flex">
                                        <div className="w-1/2">{fields[index + 1]}</div>
                                        <div className="w-1/2">{fields[index + 2]}</div>
                                    </div>
                                    <div className="flex">
                                        <div className="w-1/2">{fields[index + 3]}</div>
                                        <div className="w-1/2">{fields[index + 4]}</div>
                                    </div>

                                </div>
                            )
                        }
                        if (!fieldName.startsWith('margin') && !fieldName.startsWith('padding') && fieldName !== 'content' && fieldName !== 'flexDirection' && !fieldName.startsWith('main') && !fieldName.startsWith('alt') && fieldName !== 'gap' && fieldName !== 'top' && fieldName !== 'bottom' && fieldName !== 'right' && fieldName !== 'left') {
                            return <div className=" shadow-sm bg-white">{fields[index]}</div>

                        }
                    }
                })}
                {/* {children} */}
            </div>
        </div>
    );
}

export default Settings;
