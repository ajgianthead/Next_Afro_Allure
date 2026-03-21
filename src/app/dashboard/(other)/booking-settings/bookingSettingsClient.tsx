'use client'

import Input from '@components/Input'
import Label from '@components/Label'
import Textarea from '@components/TextArea'
import { CircularProgress, Input as JoyInput, Checkbox as JoyCheckbox, Button, Switch, CssVarsProvider, Sheet, Modal, ModalDialog, DialogTitle, DialogActions, Divider, Select, Option, FormControl, FormHelperText } from '@mui/joy'
import { Caption, Text, Title } from '@tailus-ui/typography'
import { useUserContext } from '@utils/context/UserContext'
import { Info } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { handleBookingSettings } from './actions'
import { theme } from 'app/for-businesses/forBusinessesClient'
import Stripe from 'stripe'

enum Level {
    LIGHT = "light",
    MODERATE = "moderate",
    STRICT = 'strict'
}
enum Type {
    FLAT = "flat",
    PERCENT = "percent"
}

export interface BookingSettings {
    deposit: {
        enabled: boolean;
        settings: {
            type: Type,
            value: number,
            subtraction: boolean
        }
    };
    lateFee: {
        enabled: boolean,
        fee?: number
    };
    noShowPolicy: {
        enabled: boolean
        level?: Level
    }
    rescheduleLimit: string;
    rescheduleDayLimit: string;
    cancelDayLimit: string;
    importantInfo: string;
    readBeforeBooking: string;
    refundPolicy: string;
    bookAheadValue: string

}

interface PageProps {
    businessUser: Business,
    policyData: {
        book_ahead_value: string;
        business: string;
        cancel_day_limit: number | null;
        created_at: string;
        deposit: any;
        id: string;
        important_info: string | null;
        late_fee: any;
        no_show: any;
        read_before_booking: string | null;
        reschedule_day_limit: number | null;
        reschedule_limit: number | null;
        updated_at: string;
    },
    paymentConfigId?: string,
    paymentConfig?: any
}
export interface PaymentConfig {
    card: {
        display_preference: {
            preference: Stripe.PaymentMethodConfiguration.Card.DisplayPreference.Preference
        }
    },
    google_pay: {
        display_preference: {
            preference: Stripe.PaymentMethodConfiguration.GooglePay.DisplayPreference.Preference
        }
    },
    apple_pay: {
        display_preference: {
            preference: Stripe.PaymentMethodConfiguration.ApplePay.DisplayPreference.Preference
        }
    },
    amazon_pay: {
        display_preference: {
            preference: Stripe.PaymentMethodConfiguration.AmazonPay.DisplayPreference.Preference
        }
    },
    cashapp: {
        display_preference: {
            preference: Stripe.PaymentMethodConfiguration.Cashapp.DisplayPreference.Preference
        }
    }
}

export default function BookingSettingsClient({ businessUser, policyData, paymentConfig, paymentConfigId }: PageProps) {
    const { user } = useUserContext()
    const [loading, setLoading] = useState<boolean>(true);
    const [bookingPolicy, setBookingPolicy] = useState<BookingSettings>({
        deposit: policyData.deposit,
        lateFee: policyData.late_fee,
        noShowPolicy: policyData.no_show,
        rescheduleLimit: policyData.reschedule_limit!.toString(),
        rescheduleDayLimit: policyData.reschedule_day_limit!.toString(),
        cancelDayLimit: policyData.cancel_day_limit!.toString(),
        importantInfo: policyData.important_info!,
        readBeforeBooking: policyData.read_before_booking!,
        refundPolicy: "",
        bookAheadValue: policyData.book_ahead_value
    });
    enum PaymentValue {
        GooglePay = "GOOGLE_PAY",
        ApplePay = "APPLE_PAY",
        AmazonPay = "AMAZON_PAY",
        CashApp = "CASH_APP"
    }

    const [paymentMethodConfig, setPaymentMethodConfig] = useState<PaymentConfig | null>(paymentConfig !== undefined ? {
        card: {
            display_preference: {
                preference: paymentConfig.card?.display_preference.preference!
            }
        },
        google_pay: {
            display_preference: {
                preference: paymentConfig.google_pay?.display_preference.preference!
            }
        },
        apple_pay: {
            display_preference: {
                preference: paymentConfig.apple_pay?.display_preference.preference!
            }
        },
        amazon_pay: {
            display_preference: {
                preference: paymentConfig.amazon_pay?.display_preference.preference!
            }
        },
        cashapp: {
            display_preference: {
                preference: paymentConfig.cashapp?.display_preference.preference!
            }
        }
    } : null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const handlePaymentMethodConfig = (value: PaymentValue, checked: boolean) => {
        if (value === PaymentValue.GooglePay) {
            setPaymentMethodConfig({
                ...paymentMethodConfig!,
                google_pay: {
                    display_preference: {
                        preference: checked ? 'on' : 'off'
                    }
                }
            })
        } else if (value === PaymentValue.ApplePay) {
            setPaymentMethodConfig({
                ...paymentMethodConfig!,
                apple_pay: {
                    display_preference: {
                        preference: checked ? 'on' : 'off'
                    }
                }
            })
        } else if (value === PaymentValue.AmazonPay) {
            setPaymentMethodConfig({
                ...paymentMethodConfig!,
                amazon_pay: {
                    display_preference: {
                        preference: checked ? 'on' : 'off'
                    }
                }
            })
        } else if (value === PaymentValue.CashApp) {
            setPaymentMethodConfig({
                ...paymentMethodConfig!,
                cashapp: {
                    display_preference: {
                        preference: checked ? 'on' : 'off'
                    }
                }
            })
        }
        console.log(paymentMethodConfig);

    }
    const [open, setOpen] = useState<boolean>(false)
    console.log(bookingPolicy)

    const [unitOfTime, setUnitOfTime] = useState<string>(policyData.book_ahead_value.split(' ')[1])
    const [bookingAdvanceValue, setBookingAdvanceValue] = useState<number>(Number(policyData.book_ahead_value.split(' ')[0]))
    const [bookingAdvanceError, setBookingAdvanceError] = useState<boolean>(false)
    return (
        <CssVarsProvider theme={theme}>
            <Modal open={open} onClose={() => setOpen(false)}>
                <ModalDialog className="w-full md:w-[500px]">
                    <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', textAlign: 'center', width: '100%' }}>
                        Accept Express Payments
                    </DialogTitle>

                    <p style={{ marginTop: 8, lineHeight: 1.6 }}>
                        Give clients a faster, one-tap checkout experience.
                        Stylists using express payments see fewer abandoned bookings
                        and a more premium brand feel.
                    </p>

                    <div style={{
                        background: '#f6f6f6',
                        padding: '12px 16px',
                        borderRadius: 8,
                        marginTop: 16,
                        fontSize: 14
                    }}>
                        ✨ Included with <strong>AfroAllure Growth</strong>:
                        <ul style={{ marginTop: 8, paddingLeft: 18, listStyleType: 'disc' }}>
                            <li>Unlimited bookings</li>
                            <li>Express Pay (Apple Pay, Google Pay, Cash App Pay, etc.)</li>
                            <li>Advanced analytics</li>
                            <li>Automated appointment reminders</li>
                            <li>Drag & drop website builder</li>
                        </ul>
                    </div>

                    <DialogActions sx={{ marginTop: 2 }}>
                        <Button
                            variant="solid"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                        >
                            Upgrade to Growth
                        </Button>
                        <Button
                            variant="plain"
                            color="neutral"
                            onClick={() => setOpen(false)}
                        >
                            Maybe later
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
            <div>
                <div className='px-10 md:w-3/4 w-full'>
                    <div>
                        <Title>Booking Settings</Title>
                        <Caption>Customize your booking settings to control how clients book with you</Caption>
                    </div>
                    {/* Policy Options */}
                    <Text className='font-semibold mt-5 mb-2 text-gray-300'>General</Text>
                    <div className='flex flex-col gap-2'>
                        <div className="flex flex-col gap-2 items-start">
                            {!businessUser.completed_stripe_onboarding ? <Caption className='flex gap-1 items-center font-semibold'><Info size={16} />Finish <a className='underline' href={businessUser.current_onboarding_link!} target='_blank'>Monetization Onboarding</a> to enable deposits</Caption> : <></>}
                            <JoyCheckbox checked={bookingPolicy.deposit.enabled} disabled={!businessUser.completed_stripe_onboarding} onChange={(e) => {
                                setBookingPolicy({
                                    ...bookingPolicy,
                                    deposit: {
                                        enabled: e.target.checked,
                                        settings: bookingPolicy.deposit.settings
                                    }
                                })
                            }} label="Require a deposit during booking" />

                        </div>
                        {bookingPolicy.deposit.enabled && <div className='ml-5 mt-3 flex flex-col gap-2 font-medium'>
                            <div className="flex gap-2 items-center">
                                <div>
                                    <div className='flex gap-2 items-center mb-2'>
                                        <JoyCheckbox checked={bookingPolicy.deposit.settings?.type === Type.PERCENT} onChange={(e) => {
                                            let clone = { ...bookingPolicy }
                                            if (bookingPolicy.deposit.settings?.type === Type.PERCENT) {
                                                clone.deposit.settings.type = Type.FLAT
                                            } else {
                                                clone.deposit.settings.type = Type.PERCENT
                                            }
                                            setBookingPolicy(clone)
                                        }} />
                                        <Caption>Percent Rate</Caption>
                                    </div>
                                    <JoyInput className='w-1/2' onChange={(e) => {
                                        setBookingPolicy({
                                            ...bookingPolicy,
                                            deposit: {
                                                enabled: true,
                                                settings: {
                                                    value: parseInt(e.target.value),
                                                    type: bookingPolicy.deposit.settings.type,
                                                    subtraction: bookingPolicy.deposit.settings.subtraction
                                                }
                                            }
                                        })
                                    }} value={bookingPolicy.deposit.settings?.value} disabled={bookingPolicy.deposit.settings?.type !== Type.PERCENT} endDecorator={'%'} />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div>
                                    <div className='flex gap-2 items-center mb-2'>
                                        <JoyCheckbox checked={bookingPolicy.deposit.settings?.type === Type.FLAT} onChange={(e) => {
                                            let clone = { ...bookingPolicy };
                                            if (bookingPolicy.deposit.settings?.type === Type.PERCENT) {
                                                clone.deposit.settings.type = Type.FLAT
                                            } else {
                                                clone.deposit.settings.type = Type.PERCENT
                                            }
                                            setBookingPolicy(clone)
                                        }} />
                                        <Caption>Flat Rate</Caption>
                                    </div>
                                    <JoyInput className='w-1/2' disabled={bookingPolicy.deposit.settings?.type !== Type.FLAT} startDecorator={'$'} />
                                </div>
                            </div>

                        </div>}
                        <Text className='font-semibold mt-5 mb-2 text-gray-300'>Payment Processing Method Settings</Text>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <JoyCheckbox checked={true} disabled />
                                <p>Allow clients to pay with debit/credit card</p>
                            </div>
                            <div className='mt-3'>
                                {!businessUser.completed_stripe_onboarding ? <Caption>Complete <a className="underline font-medium" href={businessUser.current_onboarding_link!} target='_blank'>Monetization Onboarding</a> to select payment processing methods</Caption> : <Caption>Check the box(es) below to enable a payment processing method</Caption>
                                }

                            </div>
                            <div className='flex items-center gap-2'>
                                <JoyCheckbox disabled={!businessUser.completed_stripe_onboarding} checked={paymentMethodConfig !== null ? paymentMethodConfig!.google_pay.display_preference.preference === 'on' : false} onChange={(event) => {
                                    if (businessUser.plan_type === 'STARTER') {
                                        setOpen(true)
                                        setPaymentMethodConfig({
                                            ...paymentMethodConfig!,
                                            google_pay: {
                                                display_preference: {
                                                    preference: 'off'
                                                }
                                            }
                                        })
                                    } else {
                                        const checked = event.target.checked;
                                        const value = event.target.value as PaymentValue
                                        handlePaymentMethodConfig(value, checked)
                                    }

                                }} value={PaymentValue.GooglePay} />
                                <Sheet variant='soft' sx={{ paddingX: 1 }}><img width="30" height="30" src="https://img.icons8.com/external-tal-revivo-color-tal-revivo/96/external-google-pay-is-the-fast-simple-way-to-pay-online-in-stores-and-more-logo-color-tal-revivo.png" alt="external-google-pay-is-the-fast-simple-way-to-pay-online-in-stores-and-more-logo-color-tal-revivo" /></Sheet>
                                <p>Google Pay </p>

                            </div>
                            <div className='flex items-center gap-2'>
                                <JoyCheckbox disabled={!businessUser.completed_stripe_onboarding} checked={paymentMethodConfig !== null ? paymentMethodConfig!.apple_pay.display_preference.preference === 'on' : false} onChange={(event) => {
                                    if (businessUser.plan_type === 'STARTER') {
                                        setOpen(true)
                                        setPaymentMethodConfig({
                                            ...paymentMethodConfig!,
                                            apple_pay: {
                                                display_preference: {
                                                    preference: 'off'
                                                }
                                            }
                                        })
                                    } else {
                                        const checked = event.target.checked;
                                        const value = event.target.value as PaymentValue
                                        handlePaymentMethodConfig(value, checked)
                                    }
                                }} value={PaymentValue.ApplePay} />
                                <Sheet variant='soft' sx={{ paddingX: 1 }}><img width="30" height="30" src="https://img.icons8.com/ios-glyphs/90/apple-pay.png" alt="apple-pay" /></Sheet>                                <p>Apple Pay</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <JoyCheckbox disabled={!businessUser.completed_stripe_onboarding} checked={paymentMethodConfig !== null ? paymentMethodConfig!.amazon_pay.display_preference.preference === 'on' : false} onChange={(event) => {
                                    if (businessUser.plan_type === 'STARTER') {
                                        setOpen(true)
                                        setPaymentMethodConfig({
                                            ...paymentMethodConfig!,
                                            amazon_pay: {
                                                display_preference: {
                                                    preference: 'off'
                                                }
                                            }
                                        })
                                    } else {
                                        const checked = event.target.checked;
                                        const value = event.target.value as PaymentValue
                                        handlePaymentMethodConfig(value, checked)
                                    }
                                }} value={PaymentValue.AmazonPay} />
                                <Sheet variant='soft' sx={{ paddingX: 1 }}><img width="30" height="30" src="https://img.icons8.com/windows/32/amazon-pay.png" alt="amazon-pay" /></Sheet>
                                <p>Amazon Pay</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <JoyCheckbox disabled={!businessUser.completed_stripe_onboarding} checked={paymentMethodConfig !== null ? paymentMethodConfig!.cashapp.display_preference.preference === 'on' : false} value={PaymentValue.CashApp} onChange={(event) => {
                                    if (businessUser.plan_type === 'STARTER') {
                                        setOpen(true)
                                        setPaymentMethodConfig({
                                            ...paymentMethodConfig!,
                                            cashapp: {
                                                display_preference: {
                                                    preference: 'off'
                                                }
                                            }
                                        })
                                    } else {
                                        const checked = event.target.checked;
                                        const value = event.target.value as PaymentValue
                                        handlePaymentMethodConfig(value, checked)
                                    }
                                }} />
                                <Sheet variant='soft' sx={{ paddingX: 1 }}><img width="30" height="30" src="https://img.icons8.com/fluency/48/cash-app--v1.png" alt="cash-app--v1" /></Sheet>
                                <p>Cash App Pay</p>
                            </div>
                        </div>

                        <div>
                            <Text className='font-semibold mt-5 mb-2 text-gray-300'>Appointments</Text>
                            <div className='flex items-center gap-5'>
                                <Text>Clients can <span className='font-bold'>reschedule</span></Text>
                                <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.rescheduleLimit} onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        rescheduleLimit: e.target.value
                                    })
                                }} />
                                <Text>times before having to repay their deposit</Text>
                            </div>
                            <div className='flex items-center gap-5'>
                                <Text>Clients can't <span className='font-bold'>reschedule</span></Text>
                                <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.rescheduleDayLimit} onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        rescheduleDayLimit: e.target.value
                                    })
                                }} />
                                <Text>days before their appointment</Text>
                            </div>
                            <div className='flex items-center gap-5'>
                                <Text>Clients can't <span className='font-bold'>cancel</span></Text>
                                <Input variant='bottomOutlined' className='w-[20px]' value={bookingPolicy.cancelDayLimit} onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        cancelDayLimit: e.target.value
                                    })
                                }} />
                                <Text>days before their appointment</Text>
                            </div>
                        </div>
                        <div>
                            <Text className='font-semibold mt-5 mb-2 text-gray-300'>Booking Site</Text>
                            <div className='mb-5'>
                                <Label>Booking Ahead</Label>
                                <Caption>Determine how far out clients can book from the beginning of the month</Caption>
                                <FormControl error={bookingAdvanceError}>
                                    <JoyInput
                                        value={bookingAdvanceValue}
                                        type='number'
                                        onChange={(e) => {
                                            if (unitOfTime === 'month') {
                                                if (Number(e.target.value) < 1) {
                                                    setBookingAdvanceError(true)
                                                } else {
                                                    setBookingAdvanceError(false)
                                                }
                                            } else if (unitOfTime === 'week') {
                                                if (Number(e.target.value) < 4) {
                                                    setBookingAdvanceError(true)
                                                } else {
                                                    setBookingAdvanceError(false)
                                                }
                                            } else {
                                                if (Number(e.target.value) < 28) {
                                                    setBookingAdvanceError(true)
                                                } else {
                                                    setBookingAdvanceError(false)
                                                }
                                            }
                                            setBookingAdvanceValue(Number(e.target.value))
                                        }}
                                        endDecorator={
                                            <React.Fragment>
                                                <Divider orientation="vertical" />
                                                <Select
                                                    variant="plain"
                                                    value={unitOfTime}
                                                    onChange={(_, value) => {
                                                        setUnitOfTime(value!)
                                                        if (value === 'month') {
                                                            setBookingAdvanceValue(1)
                                                        } else if (value === 'day') {
                                                            setBookingAdvanceValue(28)
                                                        } else {
                                                            setBookingAdvanceValue(4)
                                                        }
                                                        setBookingAdvanceError(false)
                                                    }}
                                                    slotProps={{
                                                        listbox: {
                                                            variant: 'outlined',
                                                        },
                                                    }}
                                                    sx={{ mr: -1.5, '&:hover': { bgcolor: 'transparent' } }}
                                                >
                                                    <Option value="month">month(s)</Option>
                                                    <Option value="day">days</Option>
                                                    <Option value="week">weeks</Option>
                                                </Select>
                                            </React.Fragment>
                                        }
                                        sx={{ width: 300 }}
                                    />
                                    {bookingAdvanceError ? <FormHelperText>
                                        <Info size={16} />
                                        You <b>MUST</b> allow clients to book at least one month, four weeks, or 28 days in advance
                                    </FormHelperText> : <></>}
                                </FormControl>
                            </div>
                            <div className='mb-5'>
                                <Label>Read before booking</Label>
                                <Caption>Let clients know anything else they need to know before beginning to book with you</Caption>
                                <Textarea className="lg:w-1/2 w-full mt-2" value={bookingPolicy.readBeforeBooking} onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        readBeforeBooking: e.target.value
                                    })
                                }} />
                            </div>

                            <div className='mb-5'>
                                <Label>Refund/Cancellation Policy</Label>
                                <Caption>Business's refund and cancellation policy, if any</Caption>
                                <Textarea className="lg:w-1/2 w-full mt-2" value={bookingPolicy.refundPolicy} onChange={(e) => {
                                    setBookingPolicy({
                                        ...bookingPolicy,
                                        refundPolicy: e.target.value
                                    })
                                }} />
                            </div>

                        </div>

                    </div>
                    <Button loading={isLoading} sx={{
                        marginBottom: 5
                    }} onClick={async () => {
                        setIsLoading(true)
                        let clone = { ...bookingPolicy }
                        clone.bookAheadValue = bookingAdvanceValue.toString() + " " + unitOfTime
                        const res = await handleBookingSettings(clone, businessUser.business_id, paymentConfigId!, paymentMethodConfig!, { ...paymentConfig })
                        if (res === false) {
                            console.log('Error: Stripe onboarding must be completed before enabling deposits');
                        }
                        setIsLoading(false)
                    }}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </CssVarsProvider>
    )
}
