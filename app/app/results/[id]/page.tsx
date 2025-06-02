import React from 'react';
import Interview from '@/components/interview/Interview';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';
import ResultDetails from '@/components/result/ResultDetails';

async function getInterview(id: string) {
    try {
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/interviews/${id}`, {
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


const ResultDetailsPage = async ({params}: { params: { id: string }}) => {
    const {id} = await params;
    const data = await getInterview(id);

    if(!data?.interview) {
        throw new Error("Interview not found.");
    }

    return (
        <ResultDetails interview={data?.interview} />
    )
}

export default ResultDetailsPage;