import ClientsTable from '@components/clients/ClientsTable';
import React from 'react';
import { fetchBusinessUser, fetchUser } from '../actions';
import { getBannedClients, getBusinessClients } from './actions';
import { PostgrestError } from '@supabase/supabase-js';

export const metadata = {
    title: 'Clientele | AfroAllure',
};

const Clients = async () => {
    const user = await fetchUser()
    const business = await fetchBusinessUser(user?.id!)
    const clients = await getBusinessClients(business.business_id)
    const bannedClients = await getBannedClients(business.business_id)

    if (!(clients instanceof PostgrestError || bannedClients instanceof PostgrestError)) {
        return (
            <div>
                <ClientsTable bannedClients={bannedClients} clientData={clients} businessId={business.business_id} />
            </div>
        );
    }
}

export default Clients;
