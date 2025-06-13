import React from 'react';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';
import ListUsers from '@/components/admin/user/ListUsers';


async function getUsers(searchParams: string) {
    try {
        const urlParams = new URLSearchParams(searchParams);
        const queryStr = urlParams.toString();
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/admin/users?${queryStr}`, {
            headers: authHeader.headers,
            method: 'GET',
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch interviews');
        }

        const data = await res.json();
        
        return data;
    } catch (error: any) {
        throw new Error(`Error fetching interviews: ${error?.message}`);
    }
}

const AdminUsersPage = async ({ searchParams }: { searchParams: Promise<string> }) => {
    const searchParamsValue = await searchParams;
    const data = await getUsers(searchParamsValue);

    return (
        <ListUsers data={data} />
    )
}

export default AdminUsersPage;
