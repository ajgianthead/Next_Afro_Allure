import { redirect } from 'next/navigation'
import ClientsTable from '@components/clients/ClientsTable'
import { fetchBusinessUser, fetchUser } from '../actions'
import { getBannedClients, getBusinessClients } from './actions'
import { PostgrestError } from '@supabase/supabase-js'

export const metadata = {
    title: 'Clientele | AfroAllure',
}

const Clients = async () => {
    const user = await fetchUser()
    if (!user) redirect('/login')

    const business = await fetchBusinessUser(user.id)

    const [clients, bannedClients] = await Promise.all([
        getBusinessClients(business.business_id),
        getBannedClients(business.business_id),
    ])

    if (clients instanceof PostgrestError || bannedClients instanceof PostgrestError) {
        return (
            <div className="p-5">
                <p className="text-sm" style={{ color: '#FC6161' }}>
                    Failed to load client data. Please refresh the page.
                </p>
            </div>
        )
    }

    return (
        <ClientsTable
            clientData={clients}
            businessId={business.business_id}
            bannedClients={bannedClients}
        />
    )
}

export default Clients
