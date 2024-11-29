import { useState } from "react";

export function usePagination(items, itemsPerPage = 4) {
    const [currentPage, setCurrentPage] = useState(1);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
        currentPage,
        setCurrentPage,
        currentItems,
        totalPages,
    };
} 