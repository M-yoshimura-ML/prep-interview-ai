
import AdminDashboard from '@/components/admin/dashboard/AdminDashboard';
import { getAuthHeader } from '@/helpers/auth';
import { cookies } from 'next/headers';
import React from 'react';


async function getDashboardStats(searchParams: string) {
    try {
        const urlParams = new URLSearchParams(searchParams);
        const queryStr = urlParams.toString();
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/admin/stats?${queryStr}`, {
            headers: authHeader.headers,
            method: 'GET',
        });
        
        if (!res.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await res.json();
        
        return data;
    } catch (error: any) {
        throw new Error(`Error fetching dashboard stats: ${error?.message}`);
    }
}

const AdminDashboardPage = async ({ searchParams }: { searchParams: Promise<string> }) => {
    const searchParamsValue = await searchParams;
    const data = await getDashboardStats(searchParamsValue);

    return (
        <AdminDashboard data={data?.data} />
    )
}

export default AdminDashboardPage