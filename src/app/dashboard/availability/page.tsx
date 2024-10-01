'use client'


import Checkbox from '@components/Checkbox'
import Label from '@components/Label'
import Card from '@tailus-ui/Card'
import { Text } from '@tailus-ui/typography'
import { CheckIcon } from 'lucide-react'
import React from 'react'
import Select from "@components/Select";


export default function page() {
    const countries = [
        { flag: "🇨🇩", name: "DR Congo" },
        { flag: "🇨🇬", name: "Congo Braza" },
        { flag: "🇦🇴", name: "Angola" },
        { flag: "🇫🇷", name: "France" },
        { flag: "🇬🇧", name: "United Kingdom" },
        { flag: "🇪🇸", name: "Spain" },
    ];
    return (
        <div className='px-6'>
            <Card variant='outlined'>
                <div className='flex items-center gap-3'>
                    <Checkbox.Root id="monday">
                        <Checkbox.Indicator asChild>
                            <CheckIcon />
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                    <Label htmlFor='monday'>Monday</Label>
                </div>
                <Select.Root defaultValue="DR Congo">
                    <Select.Trigger size="md" className="w-40 flex justify-between my-2 ml-10">

                        <Select.Value placeholder="Role" />
                        <Select.Icon />
                    </Select.Trigger>

                    <Select.Portal>
                        <Select.Content mixed className="z-50">
                            <Select.Viewport>
                                {
                                    countries.map((country) => (
                                        <SelectItem entry={country} key={country.name} />
                                    ))
                                }
                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>

            </Card>
        </div>
    )
}

type Entry = {
    flag: string;
    name: string;
}

const SelectItem = ({ entry }: { entry: Entry }) => {
    return (
        <Select.Item value={entry.name} className="pl-7 items-center">
            <Select.ItemIndicator />
            <Select.ItemText>
                <span role="img" aria-label={entry.name} className="mr-2">
                    {entry.flag}
                </span>
                {entry.name}
            </Select.ItemText>
        </Select.Item>
    );
};

