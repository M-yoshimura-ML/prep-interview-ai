import React from 'react';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';
import ListInvoices from '@/components/invoice/ListInvoices';


async function getInvoices() {
    try {
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/invoices`, {
            headers: authHeader.headers,
            method: 'GET',
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch invoices');
        }

        const data = await res.json();
        
        return data;
    } catch (error: any) {
        throw new Error(`Error fetching invoices: ${error?.message}`);
    }
}

const InvoicesPage = async () => {

    const data = await getInvoices();

    return (
        <ListInvoices invoices={data?.invoices} />
    )
}

export default InvoicesPage;
