
import React from 'react';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';
import Dashboard from '@/components/dashboard/Dashboard';

// const data = {
//     totalInterviews: 0,
//     completionRate: 0,
//     stats: [{
//       date: "2023-10-01",
//       totalInterviews: 5,
//       completedQuestion: 3,
//       unasweredQuestion: 0,
//       completionRate: 60,
//     }]
// };


async function getDashboardStats(searchParams: string) {
    try {
        const urlParams = new URLSearchParams(searchParams);
        const queryStr = urlParams.toString();
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/dashboard/stats?${queryStr}`, {
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

const DashboardPage = async ({ searchParams }: { searchParams: Promise<string> }) => {
    const searchParamsValue = await searchParams;
    const data = await getDashboardStats(searchParamsValue);

    return (
        <Dashboard data={data?.data} />
    )
}

export default DashboardPage;
