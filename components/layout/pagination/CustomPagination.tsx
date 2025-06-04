import { getTotalPages } from '@/helpers/helpers';
import { Pagination } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { use } from 'react'

interface Props {
    resPerPage: number;
    filteredCount: number;
}

const CustomPagination = ({ resPerPage, filteredCount }: Props) => {
    const router = useRouter();

    const totalPages = getTotalPages(filteredCount, resPerPage);
    const searchParams = useSearchParams();
    let page = searchParams.get('page') || 1;
    page = Number(page);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString()); 
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex justify-center items-center mt-10">
            <Pagination
                isCompact showControls showShadow initialPage={1} 
                total={totalPages} page={page}
                onChange={handlePageChange}
             />
        </div>
    )
}

export default CustomPagination;
