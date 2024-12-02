"use client";
import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productApi } from "@/utils/api/product";
import { categoriesApi } from "@/utils/api/categories";
import ProductGrid from "./ProductGrid";
import ProductTable from "./ProductTable";
import Pagination from "./Pagination";

export default function ProductData({
  viewMode,
  searchTerm,
  onEdit,
  onDelete,
  currentPage,
  setCurrentPage,
  setCategories,
}) {
  // جلب المنتجات
  const { data: products = [] } = useSuspenseQuery({
    queryKey: ["products"],
    queryFn: productApi.getProducts,
    select: (data) => {
      return [...data].sort((a, b) => {
        if (a.IsActive === b.IsActive) return 0;
        return a.IsActive ? -1 : 1;
      });
    },
  });

  // جلب الأصناف
  const { data: categories = [] } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });

  // تحديث الأصناف في الصفحة الرئيسية
  useEffect(() => {
    setCategories(categories);
  }, [categories, setCategories]);

  // تصفية المنتجات حسب البحث
  const filteredProducts = products.filter((product) =>
    product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الصفحات
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <>
      {viewMode === "grid" ? (
        <ProductGrid
          products={currentProducts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        <ProductTable
          products={currentProducts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
