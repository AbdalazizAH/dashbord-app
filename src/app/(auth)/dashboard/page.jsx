"use client";
import { useQuery } from "@tanstack/react-query";
import {
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaLayerGroup,
  FaChartLine,
} from "react-icons/fa";
import QueryWrapper from "@/components/shared/QueryWrapper";

export default function Dashboard() {
  // جلب إحصائيات الأصناف
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-count"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/categories/product-count/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب إحصائيات الأصناف");
      return response.json();
    },
  });

  // جلب المنتجات
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/product/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب المنتجات");
      return response.json();
    },
  });

  // جلب الموردين
  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetch(
        "https://backend-v1-psi.vercel.app/suppliers/",
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("فشل في جلب الموردين");
      return response.json();
    },
  });

  // حساب الإحصائيات
  const stats = {
    categories: categories.length,
    products: products.length,
    suppliers: suppliers.length,
    totalValue: products.reduce(
      (sum, product) => sum + (product.SellPrice || 0),
      0
    ),
  };

  return (
    <QueryWrapper
      loading={categoriesLoading || productsLoading || suppliersLoading}
    >
      <div className="p-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">الأصناف</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.categories}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaLayerGroup className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">المنتجات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.products}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaBox className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">الموردين</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.suppliers}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">إجمالي القيمة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalValue.toLocaleString("ar-LY")} د.ل
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <FaChartLine className="text-orange-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* الأصناف الأكثر منتجات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              الأصناف الأكثر منتجات
            </h2>
            <div className="space-y-4">
              {categories
                .sort((a, b) => b.ProductCount - a.ProductCount)
                .slice(0, 5)
                .map((category) => (
                  <div
                    key={category.CategoryID}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FaLayerGroup className="text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {category.CategoryName}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {category.ProductCount} منتج
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* المنتجات الأعلى سعراً */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              المنتجات الأعلى سعراً
            </h2>
            <div className="space-y-4">
              {products
                .sort((a, b) => (b.SellPrice || 0) - (a.SellPrice || 0))
                .slice(0, 5)
                .map((product) => (
                  <div
                    key={product.ProductID}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FaBox className="text-green-600" />
                      <span className="font-medium text-gray-900">
                        {product.ProductName}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {product.SellPrice?.toLocaleString("ar-LY")} د.ل
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </QueryWrapper>
  );
}
