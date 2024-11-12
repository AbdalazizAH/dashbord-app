"use client";
import { useQuery } from "@tanstack/react-query";
import { FaBox, FaSpinner } from "react-icons/fa";

export default function CategoryStats() {
  // جلب إحصائيات الأصناف
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["categories-stats"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/categories/product-count/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب الإحصائيات");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FaSpinner className="animate-spin text-blue-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      {stats.map((category) => (
        <div
          key={category.CategoryID}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.CategoryName}
              </h3>
              <p className="text-sm text-gray-500">عدد المنتجات</p>
              <p className="text-2xl font-bold text-blue-600">
                {category.ProductCount}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FaBox className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
