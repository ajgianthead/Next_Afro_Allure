'use client'

import Aligner from '@components/Aligner'
import Checkbox from '@components/Checkbox'
import Textarea from '@components/TextArea'
import Button, { Label } from '@tailus-ui/Button'
import Card from '@tailus-ui/Card'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { CheckIcon } from 'lucide-react'
import React, { useState } from 'react'

export default function page() {
    const [isChecked, setIsChecked] = useState<boolean>(false)
    return (
        <div className='w-full flex flex-col justify-center items-center'>
            <Card className='flex items-start flex-col gap-5 mt-5'>
                <div>
                    <Title>Cancel Appointment</Title>
                    <Caption>Sorry that you're canceling your appointment. Below select why you want to cancel.</Caption>
                </div>
                <div className='flex flex-col gap-2 text-slate-950'>
                    <Aligner>
                        <Checkbox.Root>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Scheduling Conflict</Label>
                    </Aligner>
                    <Aligner>
                        <Checkbox.Root>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Found Another Service</Label>
                    </Aligner>
                    <Aligner>
                        <Checkbox.Root>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Too Expensive</Label>
                    </Aligner>
                    <Aligner>
                        <Checkbox.Root>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Service No Longer Needed</Label>
                    </Aligner>
                    <Aligner>
                        <Checkbox.Root>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Personal Reasons</Label>
                    </Aligner>
                    <Aligner>
                        <Checkbox.Root intent='primary' checked={isChecked} onClick={() => { setIsChecked(!isChecked) }}>
                            <Checkbox.Indicator asChild>
                                <CheckIcon className="size-3.5" strokeWidth={3} />
                            </Checkbox.Indicator>
                        </Checkbox.Root>
                        <Label>Other</Label>
                    </Aligner>
                    <Textarea className='w-full' rows={4} disabled={!isChecked}></Textarea>
                </div>
                <div className='flex w-full justify-end'>
                    <div>
                        <Button.Root intent='danger'>
                            <Button.Label>Cancel Appointment</Button.Label>
                        </Button.Root>
                    </div>
                </div>
            </Card>
        </div>
    )
}
