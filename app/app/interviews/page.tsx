import React from 'react';
import ListInterviews from '@/components/interview/ListInterviews';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';


async function getInterviews(searchParams: string) {
    try {
        const urlParams = new URLSearchParams(searchParams);
        const queryStr = urlParams.toString();
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/interviews?${queryStr}`, {
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

const InterviewPage = async ({ searchParams }: { searchParams: string }) => {
    const searchParamsValue = await searchParams;
    const data = await getInterviews(searchParamsValue);

    return (
        <ListInterviews data={data} />
    )
}

export default InterviewPage;
