import React from 'react';
import { cookies } from 'next/headers';
import { getAuthHeader } from '@/helpers/auth';
import ListResults from '@/components/result/ListResults';


async function getInterviews() {
    try {
        const nextCookies = await cookies();
        const authHeader = getAuthHeader(nextCookies);

        const res = await fetch(`${process.env?.API_URL}/api/interviews`, {
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

const ResultsPage = async () => {
    const data = await getInterviews();

    return (
        <ListResults data={data} />
    )
}

export default ResultsPage;
