'use client';
import { faker } from '@faker-js/faker';
import { Archive, Ban, EllipsisVertical, Pencil, Plus, Trash, User } from 'lucide-react';
import Avatar from '@tailus-ui/Avatar';
import DropdownMenu from '@tailus-ui/Dropdown';
import { Badge } from '@tailus-ui/Badge';
import { Caption, Text, Title } from '@tailus-ui/typography';
import Card from '@tailus-ui/Card';
import Dialog from '@components/Dialog';
import Input from '@components/Input';
import Textarea from '@components/TextArea';
import { useEffect, useState } from 'react';
import { createClient } from '@utils/supabase/client';
import { Database } from '../../../lib/database.types';
import { useUserContext } from '@utils/context/UserContext';
import { Button, CircularProgress, DialogContent, DialogTitle, Dropdown, FormControl, FormLabel, List, ListItem, ListItemButton, ListItemContent, Menu, MenuButton, MenuItem, Modal, ModalClose, ModalDialog, Snackbar, Stack, Table, Typography } from '@mui/joy';
import { addCreateNewClient, banClientFromList, deleteClient, unbanClient, updateClientInfo } from 'app/dashboard/(other)/clients/actions';
import { PostgrestError } from '@supabase/supabase-js';



const clients: any[] = Array.from({ length: 50 }, (_, i) => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.number("754-###-####"),
}));



export const ClientsTable = ({ clientData, businessId, bannedClients }: {
    clientData: Client[], businessId: string, bannedClients: {
        business_id: string | null;
        created_at: string;
        email: string | null;
        id: string;
        phone_number: string | null;
    }[]
}) => {
    const [open, setOpen] = useState<boolean>(false);
    const [banned, setBanned] = useState<typeof bannedClients>([...bannedClients])
    const [clientInfo, setClientInfo] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    }>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    })
    const [clients, setClients] = useState<Client[]>([...clientData])
    const [sendingClientData, setSendingClientData] = useState<boolean>(false)
    const [editing, setEditing] = useState<boolean>(false)
    const [index, setIndex] = useState<number>()
    const [deletingClient, setDeletingClient] = useState<boolean>(false)
    const handleDeletingClient = async (clientId: string) => {
        setDeletingClient(true)
        const res = await deleteClient(clientId)
        let clone = [...clients]
        clone.splice(index!, 1)
        setClients(clone)
        setDeletingClient(false)
    }
    const [openBanList, setOpenBanList] = useState<boolean>(false)
    const [banningClient, setBanningClient] = useState<boolean>(false)
    const [unbanning, setUnbanning] = useState<boolean>(false)
    const [error, setError] = useState<"Client is banned from this business" | "Client already exists for this business" | PostgrestError>()
    const [openErrorPrompt, setOpenErrorPrompt] = useState<boolean>(false)
    return (
        <div>
            <Snackbar
                variant='soft'
                color='danger'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={openErrorPrompt}
                onClose={() => {
                    setOpenErrorPrompt(false)
                }}
            >
                {error instanceof PostgrestError ? error.message : error}
            </Snackbar>
            <div className='mx-6'>
                <Title>Manage Clientele</Title>
                <Caption>Add, edit, and delete clients that booked or have yet to book with you. You can also ban current and/or potential clientele. No two clients can share the same email or phone number</Caption>
            </div>
            <Modal open={openBanList} onClose={() => {
                setOpenBanList(false)
            }}>
                <ModalDialog sx={{
                    width: 500,
                    padding: 3
                }} size='sm'>
                    <ModalClose />
                    <DialogTitle>Banned Clients</DialogTitle>
                    <DialogContent>List of clients that are banned from booking with you</DialogContent>
                    <div>
                        <List sx={{
                            maxHeight: 300,
                            overflowY: banned.length > 0 ? 'scroll' : 'none'
                        }}>
                            {banned.length > 0 ? banned.map((client, index) => {
                                return (
                                    <ListItem >
                                        <ListItemButton sx={{
                                            borderRadius: 8,
                                            padding: 1.5
                                        }}>
                                            <ListItemContent >
                                                <div>
                                                    <Typography>{client.email}</Typography>
                                                    <Caption>{client.phone_number}</Caption>
                                                </div>
                                            </ListItemContent>
                                            <Dropdown sx={{
                                                zIndex: 50
                                            }}>
                                                <MenuButton
                                                    variant='plain'
                                                    slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}
                                                >
                                                    <EllipsisVertical size={16} />  </MenuButton>
                                                <Menu disablePortal >
                                                    <MenuItem disabled={unbanning} variant='plain' color='danger' onClick={async () => {
                                                        setUnbanning(true)
                                                        const res = await unbanClient(client)
                                                        if (res instanceof PostgrestError) {

                                                        } else {
                                                            let clone = [...banned]
                                                            clone.splice(index, 1)
                                                            setBanned(clone)
                                                        }
                                                        setUnbanning(false)
                                                        setOpenBanList(false)
                                                    }}><Ban size={16} />Unban</MenuItem>
                                                </Menu>
                                            </Dropdown>

                                        </ListItemButton>
                                    </ListItem>

                                )
                            }) : <div className='flex justify-center w-full py-5'>
                                <Caption className='italic'>You have no banned clients</Caption>
                            </div>}

                        </List>
                    </div>
                </ModalDialog>
            </Modal>
            <Modal open={open} onClose={() => {
                setOpen(false)
                setEditing(false)
                setClientInfo({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phoneNumber: ""
                })
            }}>
                <ModalDialog sx={{
                    width: 500,
                    padding: 3
                }} size='sm'>
                    <ModalClose />
                    <DialogTitle>{editing ? "Update Client Info" : "Create New Client"}</DialogTitle>
                    <DialogContent>{editing ? "Edit and save client info below" : "Enter the client info below to add new client"}</DialogContent>
                    <form
                        onSubmit={async (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            setSendingClientData(true)
                            if (editing) {
                                const client = await updateClientInfo({
                                    first_name: clientInfo.firstName,
                                    last_name: clientInfo.lastName,
                                    email: clientInfo.email,
                                    phone_number: clientInfo.phoneNumber,
                                    business_id: businessId,
                                    client_id: clients[index!].client_id
                                })
                                if (client === "Client already exists for this business" || client instanceof PostgrestError) {
                                    setError(client)
                                    setOpenErrorPrompt(true)

                                } else {
                                    let clone = [...clients]
                                    let index = clone.findIndex((person) => person.client_id === client.client_id)
                                    clone.splice(index, 1, client)
                                    setClients(clone)

                                }
                            } else {
                                const client = await addCreateNewClient({
                                    first_name: clientInfo.firstName,
                                    last_name: clientInfo.lastName,
                                    email: clientInfo.email,
                                    phone_number: clientInfo.phoneNumber,
                                    business_id: businessId
                                })
                                if (client === "Client is banned from this business" || client === "Client already exists for this business" || client instanceof PostgrestError) {
                                    setError(client)
                                    setOpenErrorPrompt(true)
                                } else {

                                    setClients([
                                        ...clients,
                                        client
                                    ])

                                }
                            }

                            setSendingClientData(false)
                            setOpen(false);
                            setClientInfo({
                                firstName: "",
                                lastName: "",
                                email: "",
                                phoneNumber: ""
                            })
                            setIndex(undefined)
                        }}
                    >
                        <Stack spacing={2}>
                            <FormControl>
                                <FormLabel>First Name</FormLabel>
                                <Input value={clientInfo.firstName} onChange={(e) => {
                                    setClientInfo({
                                        ...clientInfo,
                                        firstName: e.target.value
                                    })
                                }} size='sm' autoFocus required />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Last Name</FormLabel>
                                <Input onChange={(e) => {
                                    setClientInfo({
                                        ...clientInfo,
                                        lastName: e.target.value
                                    })
                                }} value={clientInfo.lastName} required size='sm' />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Email</FormLabel>
                                <Input onChange={(e) => {
                                    setClientInfo({
                                        ...clientInfo,
                                        email: e.target.value
                                    })
                                }} value={clientInfo.email} required size='sm' />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Phone Number</FormLabel>
                                <Input onChange={(e) => {
                                    setClientInfo({
                                        ...clientInfo,
                                        phoneNumber: e.target.value
                                    })
                                }} value={clientInfo.phoneNumber} required size='sm' />
                            </FormControl>
                            <div className='flex flex-col gap-1 w-full'>
                                <Button disabled={sendingClientData || deletingClient || banningClient} type="submit">{sendingClientData ? <CircularProgress size='sm' /> : editing ? "Save Client Info" : "Create Client"}</Button>
                                {editing ? <div className="flex flex-col w-full gap-1">
                                    <Button variant='outlined' onClick={async () => {
                                        await handleDeletingClient(clients[index!].client_id)
                                        setOpen(false);
                                        setClientInfo({
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            phoneNumber: ""
                                        })
                                        setEditing(false)
                                        setIndex(undefined)

                                    }} color='danger' disabled={sendingClientData || deletingClient || banningClient}>{deletingClient ? <CircularProgress size='sm' /> : <div className='flex items-center gap-2'>
                                        <Trash size={16} /> Delete Client</div>}</Button>
                                    <Button variant='solid' onClick={async () => {
                                        setBanningClient(true)
                                        const res = await banClientFromList(clients[index!].client_id)
                                        if (!(res instanceof PostgrestError)) {
                                            setBanned([
                                                ...banned,
                                                res
                                            ])
                                            let clone = [...clients]
                                            clone.splice(index!, 1)
                                            setClients(clone)
                                        }
                                        setOpen(false);
                                        setClientInfo({
                                            firstName: "",
                                            lastName: "",
                                            email: "",
                                            phoneNumber: ""
                                        })
                                        setEditing(false)
                                        setIndex(undefined)
                                        setBanningClient(false)
                                    }} color='danger' disabled={sendingClientData || deletingClient || banningClient}>{banningClient ? <CircularProgress size='sm' /> : <div className='flex items-center gap-2'>
                                        <Ban size={16} />Ban Client</div>}</Button>
                                </div> : <></>}
                            </div>

                        </Stack>
                    </form>
                </ModalDialog>
            </Modal>
            <div className='flex justify-end px-6 my-2 gap-2'>
                <Button variant='outlined' color='danger' onClick={() => {
                    setOpenBanList(true)
                }}>Banned Client List</Button>
                <Button onClick={() => {
                    setOpen(true)
                }} className='flex gap-2 items-center'><Plus size={16} />Add Client</Button>
            </div>
            <Card className='px-6 py-6 overflow-x-auto lg:overflow-clip mx-6'>
                {clients.length ? <Table hoverRow>
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client, index) => (
                            <tr className=' cursor-pointer' key={client.client_id} onClick={() => {
                                setClientInfo({
                                    firstName: client.first_name,
                                    lastName: client.last_name,
                                    email: client.email,
                                    phoneNumber: client.phone_number
                                })
                                setEditing(true)
                                setIndex(index)
                                setOpen(true)
                            }}>
                                <td>{client.first_name}</td>
                                <td>{client.last_name}</td>
                                <td>{client.email}</td>
                                <td>{client.phone_number}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table> : <div className='flex w-full justify-center py-2 italic'>
                    <Caption>You have no current clients</Caption></div>}

            </Card>
        </div>

    );
};

export default ClientsTable;
