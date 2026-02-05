'use client'

import { ColorInput, ColorPicker, Input, Select, TextInput } from '@mantine/core';
import { Button, DialogActions, DialogContent, IconButton, Modal, ModalClose, ModalDialog, Tab, TabList, TabPanel, Tabs, Tooltip } from '@mui/joy';
import { Caption, Title } from '@tailus-ui/typography';
import { Info, Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Database, Json } from '../../../../../lib/database.types';
import { isURLNameAvailable, updateBookingTheme, updateBusinessURL } from './actions';
import { fetchGoogleFonts, GoogleFont } from 'useGoogleFonts';

interface PageProps {
    urlName: string,
    editorData: {
        business_id: string | null;
        created_at: string;
        editor_data: string | null;
        id: string;
        image_objects: Json[] | null;
        section_data: Json[] | null;
        theme_data: {
            primaryColor: string
            secondaryColor: string
            fontFamily: string
        }
        type: Database["public"]["Enums"]["web_editor"] | null;
        updated_at: string | null;
    }
}

interface ThemeSettings {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
}


const ManageBookingSite = ({ urlName, editorData }: PageProps) => {
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        primaryColor: editorData.theme_data.primaryColor,
        secondaryColor: editorData.theme_data.secondaryColor,
        fontFamily: editorData.theme_data.fontFamily
    })
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [updatingTheme, setUpdatingTheme] = useState<boolean>(false)
    const updateTheme = async () => {
        setUpdatingTheme(true)
        try {
            const data = await updateBookingTheme(themeSettings, editorData.business_id!)
        } catch (error) {
            console.log(error)
        } finally {
            setUpdatingTheme(false)
        }
    }

    const handleUpdateUrl = async () => {
        setLoading(true);
        try {
            const available = await isURLNameAvailable(editedUrlName);
            if (!available) {
                setError("This URL name is already taken");
                return;
            }
            console.log(editorData);

            const updateError = await updateBusinessURL(editorData.business_id!, editedUrlName)

            if (updateError) {
                throw updateError
            } else {
                setEditUrlName(false)
                setNewUrlName(editedUrlName)
            };
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);

        }
    };
    const [fonts, setFonts] = useState<GoogleFont[]>([])
    const [editUrlName, setEditUrlName] = useState<boolean>(false)
    const [newUrlName, setNewUrlName] = useState<string>(urlName)
    const [editedUrlName, setEditedUrlName] = useState<string>(newUrlName)
    const editPageLink = editorData.type === 'CUSTOM' ? `https://beta.afroallure.co/${newUrlName}/edit` : "https://beta.afroallure.co/dashboard/booking-site/upload-sections"
    const isInvalid = editedUrlName.length > 0 && !/^[a-z]+$/.test(editedUrlName);
    useEffect(() => {

        (async () => {
            const fnt = await fetchGoogleFonts()
            setFonts(fnt)
        })()
    }, []);
    return (
        <div className='w-full'>
            <Modal open={editUrlName} onClose={() => {
                setEditUrlName(false)
                setEditedUrlName(newUrlName)
                setError(null)
            }}>
                <ModalDialog size='lg' className="w-[500px]">
                    <ModalClose />
                    <DialogContent>
                        <Input.Wrapper label='Edit Booking Page URL' description={<div className='mb-2'>
                            {/* <p>URL name requirements:</p> */}
                            <ul className='list-disc list-inside'>
                                <li>Lowercase letters only (a–z)</li>
                                <li>No spaces</li>
                                <li>No numbers or special characters</li>
                            </ul>
                        </div>}>
                            <Caption className='text-red-600'>{error}</Caption>
                            <span className='flex items-center gap-1'><p className='text-sm'>https://beta.afroallure.co/</p><TextInput error={
                                isInvalid ? "Only lowercase letters (a–z) allowed" : null} value={editedUrlName} radius={'md'} size='xs' onChange={(e) => setEditedUrlName(e.target.value)} />
                            </span>

                        </Input.Wrapper>
                    </DialogContent>
                    <div className='flex flex-col gap-2'>
                        <Button disabled={isInvalid || editedUrlName === newUrlName} loading={loading} onClick={async () => await handleUpdateUrl()}>Update</Button>
                        <Button variant='outlined' onClick={() => {
                            setEditUrlName(false)
                            setEditedUrlName(newUrlName)
                            setError(null)
                        }}>Cancel</Button>
                    </div>
                </ModalDialog>
            </Modal>
            <div className='w-full flex flex-col items-center justify-center'>
                <div className='flex w-full justify-start flex-col mb-3 gap-1 pl-6'>
                    <Title>Manage Booking Site</Title>
                    <Caption>Below, you can update and manage your booking site. You're also able to switch between editors if you choose to do so</Caption>
                </div>
                <div className='w-full p-6 flex gap-5 h-[300px]'>
                    <div className='flex flex-col gap-2 w-full'>
                        <div className='flex w-full justify-end gap-2'>
                            <Button variant='outlined' component='a' href={`https://beta.afroallure.co/${newUrlName}`} target='_blank'>Visit Booking Page</Button>
                            <Button component='a' href={editPageLink} target='_blank'>Edit Booking Page</Button>
                        </div>
                        <div className='p-5 border border-[#ECECEC] rounded-lg w-full'>
                            <div className='flex gap-2 items-center'>
                                <span>{`Booking Page URL: `}<a className='underline' href={`https://beta.afroallure.co/${newUrlName}`}>{`${`https://beta.afroallure.co/${newUrlName}`}`}</a></span>
                                <Tooltip title='Edit URL' size='sm' placement='top'>
                                    <IconButton onClick={() => {
                                        setEditUrlName(true)
                                    }}>
                                        <Pencil color='#674502' size={16} className='cursor-pointer' />

                                    </IconButton>
                                </Tooltip>
                            </div>
                            <div className='flex gap-2 items-center'>
                                <p>Page Editor Type:</p>
                                <p>{`${editorData.type === 'CUSTOM' ? 'Drag & Drop Editor' : 'Sections Editor'}`}</p>
                            </div>
                            <div className='flex items-center gap-2 pt-5 pb-2 '>
                                <Caption className='text-xs'>THEME</Caption>
                                <Tooltip title={<div className='text-center'>
                                    <p>The styles selected here will be for the booking process page the client</p>
                                    <p>will see when they book their appointment</p>
                                </div>} size='sm' placement='right'>
                                    <Info color='#353535' size={12} className='cursor-pointer' />
                                </Tooltip>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='flex gap-2 items-center'>
                                    <p>Primary Color: </p>
                                    <ColorInput size='xs' value={themeSettings.primaryColor} onChange={(value) => {
                                        setThemeSettings({
                                            ...themeSettings,
                                            primaryColor: value
                                        })
                                    }} />

                                </div>
                                <div className='flex gap-2 items-center'>
                                    <p>Secondary Color: </p>
                                    <ColorInput size='xs' value={themeSettings.secondaryColor} onChange={(value) => {
                                        setThemeSettings({
                                            ...themeSettings,
                                            secondaryColor: value
                                        })
                                    }} />

                                </div>
                                <div className='flex gap-2 items-center'>
                                    <p>Font Family: </p>
                                    <Select
                                        className="col-span-3"
                                        size="xs"
                                        searchable
                                        value={themeSettings.fontFamily}
                                        onChange={(value) => {
                                            setThemeSettings({
                                                ...themeSettings,
                                                fontFamily: value!
                                            })
                                        }}
                                        data={fonts?.map((font: GoogleFont, index: number) => {
                                            return font.family
                                        })}
                                    />
                                </div>
                            </div>
                            <div className='mt-5 flex gap-2'>
                                <Button component='a' className='text-center' href='http://localhost:3000/dashboard/booking-site?switch-editor=true' variant='outlined' size='sm'>Switch Page Editor Type</Button>
                                <Button loading={updatingTheme} variant='solid' size='sm' className='text-center' onClick={async () => {
                                    await updateTheme()
                                }}>Save Changes</Button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageBookingSite;
