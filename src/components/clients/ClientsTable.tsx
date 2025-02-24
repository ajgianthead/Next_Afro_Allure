'use client';
import { faker } from '@faker-js/faker';
import { Archive, EllipsisVertical, Pencil, Plus, Trash, User } from 'lucide-react';
import Avatar from '@tailus-ui/Avatar';
import Button from '@tailus-ui/Button';
import DropdownMenu from '@tailus-ui/Dropdown';
import { Badge } from '@tailus-ui/Badge';
import { Text, Title } from '@tailus-ui/typography';
import Card from '@tailus-ui/Card';
import Dialog from '@components/Dialog';
import Input from '@components/Input';
import Textarea from '@components/TextArea';
import { useEffect, useState } from 'react';
import { createClient } from '@utils/supabase/server';
import { Database } from '../../../lib/database.types';
import { useUserContext } from '@utils/context/UserContext';



const clients: any[] = Array.from({ length: 50 }, (_, i) => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone_number: faker.phone.number("754-###-####"),
}));

const CreateClientDialog = ({ clients, setClients, open, setIsOpen, user }: { clients: Client[], setClients: any, open: boolean, setIsOpen: any, user: any }) => {
    const supabase = createClient<Database>();
    const [client, setClient] = useState<any>({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: ""
    });
    const handleSubmit = async () => {
        const res = await fetch(`http://127.0.0.1:3000/api/${user.business_id}/clients`, {
            method: 'POST',
            body: JSON.stringify(client)
        })
        const dataBack = await res.json();
        setClients([
            ...clients,
            dataBack
        ])
    }
    return (
        <div>
            <Dialog.Root open={open} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className='z-40' />
                    <Dialog.Content className="max-w-lg z-50">
                        <Dialog.Title>Create a new client</Dialog.Title>
                        <Dialog.Description>
                            <Input value={client.first_name} placeholder='First Name' onChange={(e) => {
                                setClient({
                                    ...client,
                                    first_name: e.target.value
                                })
                            }} />
                            <Input value={client.last_name} placeholder='Last Name' onChange={(e) => {
                                setClient({
                                    ...client,
                                    last_name: e.target.value
                                })
                            }} />
                            <Input value={client.email} placeholder='Email' onChange={(e) => {
                                setClient({
                                    ...client,
                                    email: e.target.value
                                })
                            }} />
                            <Input value={client.phone_number} placeholder='Phone Number' onChange={(e) => {
                                setClient({
                                    ...client,
                                    phone_number: e.target.value
                                })
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
                                    <Button.Label>Create Client</Button.Label>
                                </Button.Root>
                            </Dialog.Close>
                        </Dialog.Actions>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    )
}


export const ClientsTable = () => {
    // Create a client form dialog

    // Open dialog to edit client
    // Handle deleting a client
    const { user } = useUserContext();
    const [clients, setClients] = useState<any[]>([])
    useEffect(() => {
        // Recieve clients from supabase
        const getClients = async () => {
            const { business_id } = user
            const res = await fetch(`http://127.0.0.1:3000/api/${business_id}/clients`, {
                method: "GET"
            })
            const clients = await res.json()
            return clients
        }
        const clients: Client[] = getClients() as unknown as Client[];
        setClients(clients)
    }, []);
    return (
        <div>
            <div className='flex justify-end px-6 my-2'>
                <Button.Root variant='soft'><Plus size={16} />Add Client</Button.Root>
            </div>
            <Card className='px-6 py-6 overflow-x-auto lg:overflow-clip mx-6'>
                <table className="min-w-max table-auto border-collapse space-y-1 sm:min-w-full">
                    <thead>
                        <tr className="text-sm text-[--title-text-color] *:bg-[--ui-soft-bg] *:p-3 *:text-left *:font-medium">
                            <th className="rounded-l-[--card-radius]">Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th className="rounded-r-[--card-radius]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client, index) => (
                            <tr
                                className="group items-center border-b text-sm text-[--body-text-color] *:p-3 hover:bg-gray-50 has-[[data-state='checked']]:bg-[--ui-soft-bg] has-[[data-state='open']]:bg-gray-50 dark:hover:bg-gray-500/5 dark:has-[[data-state='open']]:bg-gray-500/5"

                            >
                                <td>
                                    <div className="flex items-center gap-3">
                                        {client.first_name + " " + client.last_name}
                                    </div>
                                </td>

                                <td>
                                    <div className="flex items-center gap-3">
                                        {client.email}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {client.phone_number}
                                    </div>
                                </td>

                                <td>
                                    <DropdownMenu.Root modal={false}>
                                        <DropdownMenu.Trigger asChild>
                                            <Button.Root variant="ghost" size="xs" intent="gray" className="ml-auto">
                                                <Button.Icon size="xs" type="only">
                                                    <EllipsisVertical />
                                                </Button.Icon>
                                            </Button.Root>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Portal>
                                            <DropdownMenu.Content data-shade="glassy" intent="gray" mixed variant="soft" side="bottom" sideOffset={6} align="end">
                                                <DropdownMenu.Item intent="warning">
                                                    <DropdownMenu.Icon>
                                                        <Pencil className="size-4" />
                                                    </DropdownMenu.Icon>
                                                    Edit
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item intent="danger">
                                                    <DropdownMenu.Icon>
                                                        <Trash className="size-4" />
                                                    </DropdownMenu.Icon>
                                                    Delete
                                                </DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Portal>
                                    </DropdownMenu.Root>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>

    );
};

export default ClientsTable;
