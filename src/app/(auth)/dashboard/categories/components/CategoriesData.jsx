"use client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/utils/api/categories";
import CategoryTable from "./CategoryTable";

export default function CategoriesData({ searchTerm, onEdit, onDelete }) {
  // جلب الأصناف
  const { data: categories = [] } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getCategories,
  });

  // جلب عدد المنتجات
  const { data: categoriesCount = [] } = useSuspenseQuery({
    queryKey: ["categories-count"],
    queryFn: categoriesApi.getCategoriesCount,
  });

  // دمج المعلومات
  const categoriesWithCount = categories.map((category) => {
    const countInfo = categoriesCount.find(
      (c) => c.CategoryID === category.CategoryID
    );
    return {
      ...category,
      ProductCount: countInfo?.ProductCount || 0,
    };
  });

  // تصفية الأصناف حسب البحث
  const filteredCategories = categoriesWithCount.filter((category) =>
    category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CategoryTable
      categories={filteredCategories}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
