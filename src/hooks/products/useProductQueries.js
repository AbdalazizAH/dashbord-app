import { useQueries } from "@tanstack/react-query";
import { productApi } from "@/utils/api/product";

export function useProductQueries() {
    const [productsQuery, categoriesQuery] = useQueries({
        queries: [
            {
                queryKey: ["products"],
                queryFn: productApi.getProducts,
                select: (data) => {
                    return [...data].sort((a, b) => {
                        if (a.IsActive === b.IsActive) return 0;
                        return a.IsActive ? -1 : 1;
                    });
                }
            },
            {
                queryKey: ["categories"],
                queryFn: async () => {
                    const response = await fetch(
                        "https://backend-v1-psi.vercel.app/categories/",
                        {
                            headers: { accept: "application/json" },
                        }
                    );
                    if (!response.ok) throw new Error("فشل في جلب الأصناف");
                    return response.json();
                },
            },
        ],
    });

    return {
        productsQuery,
        categoriesQuery,
        products: productsQuery.data || [],
        categories: categoriesQuery.data || [],
        isLoading: productsQuery.isLoading || categoriesQuery.isLoading,
        error: productsQuery.error || categoriesQuery.error,
    };
} 